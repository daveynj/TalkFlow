import { useState, useRef, useCallback, useEffect } from "react";

type VoiceState = "idle" | "connecting" | "connected" | "speaking" | "listening" | "error";

interface UseInworldVoiceOptions {
  context?: string;
  cefrLevel?: string;
  onTranscript?: (text: string, role: "user" | "agent") => void;
  onStateChange?: (state: VoiceState) => void;
}

export function useInworldVoice(options: UseInworldVoiceOptions = {}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [agentSpeaking, setAgentSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const playingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const agentTextRef = useRef("");

  const updateState = useCallback((newState: VoiceState) => {
    setState(newState);
    options.onStateChange?.(newState);
  }, [options]);

  const b64Encode = useCallback((buf: ArrayBuffer): string => {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }, []);

  const stopAudio = useCallback(() => {
    audioQueueRef.current.length = 0;
    playingRef.current = false;
    nextPlayTimeRef.current = 0;
    try {
      currentSourceRef.current?.stop();
    } catch { }
    currentSourceRef.current = null;
    setAgentSpeaking(false);
  }, []);

  const playNext = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !audioQueueRef.current.length) {
      playingRef.current = false;
      setAgentSpeaking(false);
      return;
    }
    playingRef.current = true;
    setAgentSpeaking(true);

    const pcm16 = new Int16Array(audioQueueRef.current.shift()!);
    const len = pcm16.length;
    const fade = 48;
    const f32 = new Float32Array(len);
    for (let i = 0; i < len; i++) f32[i] = pcm16[i] / 32768;
    for (let i = 0; i < fade && i < len; i++) {
      f32[i] *= i / fade;
      f32[len - 1 - i] *= i / fade;
    }

    const buf = ctx.createBuffer(1, len, 24000);
    buf.getChannelData(0).set(f32);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);

    const t = Math.max(ctx.currentTime, nextPlayTimeRef.current);
    nextPlayTimeRef.current = t + buf.duration;
    src.onended = playNext;
    src.start(t);
    currentSourceRef.current = src;
  }, []);

  const connect = useCallback(async () => {
    if (state === "connected" || state === "connecting") return;
    updateState("connecting");

    try {
      audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const params = new URLSearchParams();
      if (options.context) params.set("context", options.context);
      if (options.cefrLevel) params.set("level", options.cefrLevel);

      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/inworld?${params.toString()}`);
      wsRef.current = ws;

      ws.onopen = () => {
        updateState("connected");

        const ctx = audioCtxRef.current!;
        const stream = streamRef.current!;
        sourceRef.current = ctx.createMediaStreamSource(stream);
        processorRef.current = ctx.createScriptProcessor(2048, 1, 1);

        processorRef.current.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }
          ws.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: b64Encode(pcm.buffer),
          }));
        };

        sourceRef.current.connect(processorRef.current);
        const silentGain = ctx.createGain();
        silentGain.gain.value = 0;
        processorRef.current.connect(silentGain);
        silentGain.connect(ctx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Debug logging (remove in production)
          if (msg.type && !msg.type.includes("audio")) {
            console.log("[Inworld] Event:", msg.type);
          }

          // Audio output - handle both Inworld and OpenAI event names
          if (msg.type === "response.output_audio.delta" || msg.type === "response.output_audio") {
            const audioB64 = msg.delta || msg.audio;
            if (audioB64) {
              const binary = atob(audioB64);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              audioQueueRef.current.push(bytes.buffer);
              if (!playingRef.current) playNext();
            }
          }

          // Agent text transcript - streaming delta
          if ((msg.type === "response.output_text.delta" || msg.type === "response.text.delta") && msg.delta) {
            agentTextRef.current += msg.delta;
          }

          // Agent text transcript - done (handle multiple event name variants)
          if (msg.type === "response.output_text.done" || msg.type === "response.audio_transcript.done" || msg.type === "response.text.done") {
            const fullText = agentTextRef.current || msg.text || msg.transcript || "";
            if (fullText) {
              setTranscript(prev => [...prev, { role: "agent", text: fullText }]);
              options.onTranscript?.(fullText, "agent");
            }
            agentTextRef.current = "";
          }

          // User speech transcription completed
          if (msg.type === "conversation.item.input_audio_transcription.completed" && msg.transcript) {
            setTranscript(prev => [...prev, { role: "user", text: msg.transcript }]);
            options.onTranscript?.(msg.transcript, "user");
          }

          // Speech detection events (with semantic_vad, responses are auto-created)
          if (msg.type === "input_audio_buffer.speech_started") {
            stopAudio();
            updateState("listening");
          }

          if (msg.type === "input_audio_buffer.speech_stopped") {
            // With semantic_vad (create_response: true), no need to manually
            // send commit + response.create — the server handles it
            updateState("connected");
          }

          // Response lifecycle
          if (msg.type === "response.done") {
            // Extract transcript from completed response if we haven't got it yet
            if (msg.response?.output) {
              for (const output of msg.response.output) {
                if (output.content) {
                  for (const item of output.content) {
                    if (item.transcript && !agentTextRef.current) {
                      setTranscript(prev => [...prev, { role: "agent", text: item.transcript }]);
                      options.onTranscript?.(item.transcript, "agent");
                    }
                  }
                }
              }
            }
          }

          if (msg.type === "error") {
            console.error("Inworld error:", msg);
            updateState("error");
          }
        } catch (e) {
          console.error("[Inworld] Failed to parse message:", e);
        }
      };

      ws.onclose = () => {
        updateState("idle");
        cleanup();
      };

      ws.onerror = () => {
        updateState("error");
        cleanup();
      };
    } catch (err) {
      console.error("Voice connection error:", err);
      updateState("error");
    }
  }, [state, options.context, options.cefrLevel, updateState, b64Encode, playNext, stopAudio]);

  const cleanup = useCallback(() => {
    stopAudio();
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close().catch(() => { });
    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
  }, [stopAudio]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    cleanup();
    updateState("idle");
  }, [cleanup, updateState]);

  const sendTextMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        },
      }));
      wsRef.current.send(JSON.stringify({ type: "response.create" }));
      setTranscript(prev => [...prev, { role: "user", text }]);
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    state,
    transcript,
    agentSpeaking,
    connect,
    disconnect,
    sendTextMessage,
    isConnected: state === "connected" || state === "listening" || state === "speaking",
  };
}
