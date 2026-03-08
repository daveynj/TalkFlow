import { useState } from "react";
import { useInworldVoice } from "@/hooks/use-inworld-voice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Phone, PhoneOff, Send, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceAgentProps {
  context?: string;
  cefrLevel?: string;
  compact?: boolean;
}

export function VoiceAgent({ context, cefrLevel, compact = false }: VoiceAgentProps) {
  const [textInput, setTextInput] = useState("");
  const { state, transcript, agentSpeaking, connect, disconnect, sendTextMessage, isConnected } = useInworldVoice({
    context,
    cefrLevel,
  });

  const handleSendText = () => {
    if (textInput.trim()) {
      sendTextMessage(textInput.trim());
      setTextInput("");
    }
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          data-testid="button-voice-toggle"
          onClick={isConnected ? disconnect : connect}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
            isConnected
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30"
              : "bg-primary hover:bg-primary/90 text-white shadow-primary/30",
            agentSpeaking && "animate-pulse ring-4 ring-primary/30"
          )}
        >
          {isConnected ? <PhoneOff className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
        </button>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {state === "idle" && "Tap to talk with AI"}
          {state === "connecting" && "Connecting..."}
          {state === "connected" && (agentSpeaking ? "AI is speaking..." : "Listening...")}
          {state === "listening" && "Hearing you..."}
          {state === "error" && "Connection error"}
        </p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-lg overflow-hidden">
      <CardContent className="p-0">
        {/* Status Header */}
        <div className={cn(
          "px-6 py-4 flex items-center justify-between transition-colors",
          isConnected ? "bg-primary text-white" : "bg-gray-50"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isConnected ? "bg-white/20" : "bg-primary/10",
              agentSpeaking && "animate-pulse"
            )}>
              {agentSpeaking ? (
                <Volume2 className={cn("w-5 h-5", isConnected ? "text-white" : "text-primary")} />
              ) : (
                <Mic className={cn("w-5 h-5", isConnected ? "text-white" : "text-primary")} />
              )}
            </div>
            <div>
              <p className={cn("font-semibold text-sm", isConnected ? "text-white" : "text-foreground")}>
                TalkFlow AI Tutor
              </p>
              <p className={cn("text-xs", isConnected ? "text-white/70" : "text-muted-foreground")}>
                {state === "idle" && "Ready to chat"}
                {state === "connecting" && "Connecting..."}
                {state === "connected" && (agentSpeaking ? "Speaking..." : "Listening...")}
                {state === "listening" && "Hearing you..."}
                {state === "error" && "Connection error"}
              </p>
            </div>
          </div>
          <Button
            data-testid="button-voice-call"
            variant={isConnected ? "destructive" : "default"}
            size="sm"
            className="rounded-full"
            onClick={isConnected ? disconnect : connect}
            disabled={state === "connecting"}
          >
            {isConnected ? (
              <><PhoneOff className="w-4 h-4 mr-1" /> End</>
            ) : (
              <><Phone className="w-4 h-4 mr-1" /> Start Call</>
            )}
          </Button>
        </div>

        {/* Transcript */}
        <div className="h-64 overflow-y-auto p-4 space-y-3 bg-white">
          {transcript.length === 0 && (
            <div className="h-full flex items-center justify-center text-center">
              <div className="space-y-2">
                <Volume2 className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {isConnected ? "Say something to start the conversation..." : "Press Start Call to begin speaking with your AI tutor"}
                </p>
              </div>
            </div>
          )}
          {transcript.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-gray-100 text-foreground rounded-bl-sm"
                )}
                data-testid={`text-transcript-${msg.role}-${i}`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {agentSpeaking && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text Input (alternative to voice) */}
        {isConnected && (
          <div className="p-3 border-t flex gap-2">
            <Input
              data-testid="input-voice-text"
              placeholder="Or type a message..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendText()}
              className="rounded-full"
            />
            <Button
              data-testid="button-send-text"
              size="icon"
              className="rounded-full shrink-0"
              onClick={handleSendText}
              disabled={!textInput.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
