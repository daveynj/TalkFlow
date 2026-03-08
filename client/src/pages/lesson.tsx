import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Volume2, Mic, CheckCircle2, ArrowRight, Lightbulb, GripVertical, Phone } from "lucide-react";
import { toast } from "sonner";
import { VoiceAgent } from "@/components/voice-agent";

export default function Lesson() {
  const params = useParams<{ id: string }>();
  const lessonId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [unscrambleOrder, setUnscrambleOrder] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  const { data: lesson, isLoading } = useQuery<any>({
    queryKey: ["/api/lessons", lessonId.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch lesson");
      return res.json();
    },
    enabled: isAuthenticated && lessonId > 0,
  });

  const progressMutation = useMutation({
    mutationFn: async (data: { lessonId: number; status: string; score?: number }) => {
      const res = await apiRequest("POST", "/api/progress", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const steps = lesson?.content?.steps || [];
  const step = steps[currentStep];
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  useEffect(() => {
    if (step) {
      setIsPlaying(true);
      setShowHint(false);
      setSelectedOption(null);

      if (step.type === "unscramble" && step.scrambledWords) {
        setAvailableWords([...step.scrambledWords]);
        setUnscrambleOrder([]);
      }

      const timer = setTimeout(() => setIsPlaying(false), 2500);

      let hintTimer: NodeJS.Timeout;
      if (step.type === "fill-blank" || step.type === "multiple-choice") {
        hintTimer = setTimeout(() => {
          setShowHint(true);
        }, 15000);
      }

      if (step.aiMessage && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(step.aiMessage);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }

      return () => {
        clearTimeout(timer);
        if (hintTimer) clearTimeout(hintTimer);
        speechSynthesis.cancel();
      };
    }
  }, [currentStep, step]);

  useEffect(() => {
    if (isAuthenticated && lessonId > 0) {
      progressMutation.mutate({ lessonId, status: "in_progress" });
    }
  }, [isAuthenticated, lessonId]);

  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
        <Link href="/dashboard">
          <Button className="rounded-full">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      progressMutation.mutate({ lessonId, status: "completed", score: 100 });
      setLessonComplete(true);
      toast.success("Lesson Complete! +50 XP");
    }
  };

  const handleRecord = () => {
    setIsRecording(true);
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        toast.success(`You said: "${transcript}"`, {
          description: "Nice pronunciation!",
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        });
      };
      recognition.onerror = () => {
        setIsRecording(false);
        toast.info("Could not hear you clearly. Try again!");
      };
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } else {
      setTimeout(() => {
        setIsRecording(false);
        toast.success("Great pronunciation!", {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        });
      }, 2000);
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    if (option === step.answer) {
      toast.success("Correct!");
    } else {
      toast.error("Not quite. Try again!");
    }
  };

  const handleWordTap = (word: string) => {
    setAvailableWords((prev) => prev.filter((w, i) => {
      const idx = prev.indexOf(word);
      return i !== idx;
    }));
    setUnscrambleOrder((prev) => [...prev, word]);
  };

  const handleRemoveWord = (index: number) => {
    const word = unscrambleOrder[index];
    setUnscrambleOrder((prev) => prev.filter((_, i) => i !== index));
    setAvailableWords((prev) => [...prev, word]);
  };

  const isUnscrambleCorrect = step?.correctOrder && JSON.stringify(unscrambleOrder) === JSON.stringify(step.correctOrder);

  const canProceed = () => {
    if (!step) return false;
    if (step.type === "intro") return true;
    if (step.type === "vocabulary") return true;
    if (step.type === "fill-blank" || step.type === "multiple-choice") return selectedOption === step.answer;
    if (step.type === "unscramble") return isUnscrambleCorrect;
    return true;
  };

  if (lessonComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Lesson Complete!</h1>
        <p className="text-xl text-muted-foreground mb-2">{lesson.title}</p>
        <p className="text-lg text-green-600 font-semibold mb-8">+50 XP earned</p>
        <Link href="/dashboard">
          <Button size="lg" className="rounded-full px-8" data-testid="button-back-dashboard">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (!step) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 py-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100" data-testid="button-close-lesson">
            <X className="w-6 h-6 text-muted-foreground" />
          </Button>
        </Link>
        <div className="flex-1 max-w-2xl mx-auto">
          <Progress value={progress} className="h-3" />
        </div>
        <span className="text-sm text-muted-foreground font-medium">{currentStep + 1}/{totalSteps}</span>
      </header>

      <main className="flex-1 container mx-auto px-4 max-w-3xl flex flex-col pt-4 pb-24">
        <div className="flex gap-4 mb-12 animate-in slide-in-from-top-4 duration-500">
          <div className="relative shrink-0 mt-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors ${isPlaying ? "bg-primary text-white shadow-primary/30 shadow-lg" : "bg-white border-2 text-primary"}`}>
              <Volume2 className={`w-6 h-6 ${isPlaying ? "animate-pulse" : ""}`} />
            </div>
            {isPlaying && (
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </div>
          <div className="bg-white border shadow-sm rounded-2xl rounded-tl-sm p-4 sm:p-6 flex-1 relative">
            <p className="text-lg sm:text-xl font-medium leading-relaxed">{step.aiMessage}</p>
            {showHint && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-amber-800">Take your time! Think about the words you learned.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-700 delay-200">
          {step.type === "intro" && (
            <Card className="border-primary/20 shadow-lg w-full max-w-xl mx-auto">
              <CardContent className="p-8 text-center space-y-8">
                <div className="text-2xl sm:text-3xl font-bold leading-tight">"{step.targetSentence}"</div>
                <div className="flex justify-center">
                  <Button
                    size="icon"
                    data-testid="button-record"
                    className={`w-24 h-24 rounded-full shadow-xl transition-all ${isRecording ? "bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/50" : "bg-white text-primary border-2 hover:bg-gray-50"}`}
                    onClick={handleRecord}
                  >
                    <Mic className={`w-10 h-10 ${isRecording ? "text-white animate-pulse" : ""}`} />
                  </Button>
                </div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                  {isRecording ? "Listening..." : "Tap to Speak"}
                </p>
              </CardContent>
            </Card>
          )}

          {step.type === "vocabulary" && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {step.words?.map((item: any, i: number) => (
                <Card
                  key={i}
                  className="cursor-pointer hover:border-primary/50 transition-colors group"
                  data-testid={`card-vocab-${i}`}
                  onClick={() => {
                    if ("speechSynthesis" in window) {
                      const u = new SpeechSynthesisUtterance(item.word);
                      u.rate = 0.8;
                      speechSynthesis.speak(u);
                    }
                  }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-bold text-primary">{item.word}</h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-primary rounded-full group-hover:bg-primary/10">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.meaning}</p>
                    {item.example && (
                      <p className="text-xs text-primary/70 italic">"{item.example}"</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {(step.type === "fill-blank") && (
            <div className="w-full max-w-2xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border text-2xl sm:text-3xl font-medium leading-relaxed text-center">
                {step.question?.split("_______").map((part: string, i: number, arr: string[]) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className={`inline-block border-b-4 mx-2 px-4 pb-1 min-w-[120px] transition-colors ${selectedOption === step.answer ? "border-green-500 text-green-600" : selectedOption ? "border-red-500 text-red-500" : "border-gray-300"}`}>
                        {selectedOption || ""}
                      </span>
                    )}
                  </span>
                ))}
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {step.options?.map((opt: string, i: number) => (
                  <Button
                    key={i}
                    variant="outline"
                    data-testid={`button-option-${i}`}
                    className={`h-16 text-lg rounded-2xl border-2 transition-all ${selectedOption === opt ? (opt === step.answer ? "bg-green-50 border-green-500 text-green-700" : "bg-red-50 border-red-500 text-red-700") : "hover:border-primary hover:bg-primary/5"}`}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={selectedOption === step.answer}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step.type === "multiple-choice" && (
            <div className="w-full max-w-2xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border text-xl sm:text-2xl font-medium leading-relaxed text-center">
                {step.question}
              </div>
              <div className="grid gap-3">
                {step.options?.map((opt: string, i: number) => (
                  <Button
                    key={i}
                    variant="outline"
                    data-testid={`button-mc-${i}`}
                    className={`h-14 text-base rounded-2xl border-2 transition-all justify-start px-6 ${selectedOption === opt ? (opt === step.answer ? "bg-green-50 border-green-500 text-green-700" : "bg-red-50 border-red-500 text-red-700") : "hover:border-primary hover:bg-primary/5"}`}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={selectedOption === step.answer}
                  >
                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold mr-3 shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step.type === "unscramble" && (
            <div className="w-full max-w-2xl mx-auto space-y-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border min-h-[80px] flex flex-wrap gap-2 items-center justify-center">
                {unscrambleOrder.length === 0 && (
                  <p className="text-muted-foreground text-lg">Tap words below to build the sentence</p>
                )}
                {unscrambleOrder.map((word, i) => (
                  <Button
                    key={`placed-${i}`}
                    variant="secondary"
                    className={`h-12 text-base rounded-xl ${isUnscrambleCorrect ? "bg-green-100 text-green-700 border-green-300" : ""}`}
                    onClick={() => handleRemoveWord(i)}
                    data-testid={`button-placed-${i}`}
                  >
                    {word}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {availableWords.map((word, i) => (
                  <Button
                    key={`avail-${i}`}
                    variant="outline"
                    className="h-12 text-base rounded-xl border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleWordTap(word)}
                    data-testid={`button-word-${i}`}
                  >
                    {word}
                  </Button>
                ))}
              </div>
              {isUnscrambleCorrect && (
                <div className="text-center animate-in fade-in">
                  <p className="text-green-600 font-bold text-lg flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Perfect!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Voice Chat Button */}
      <button
        data-testid="button-open-voice"
        onClick={() => setShowVoiceChat(!showVoiceChat)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform z-30"
      >
        <Phone className="w-6 h-6" />
      </button>

      {/* Voice Chat Panel */}
      {showVoiceChat && (
        <div className="fixed bottom-40 right-6 w-80 sm:w-96 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <VoiceAgent
            context={lesson?.title ? `Teaching lesson: ${lesson.title}. ${lesson.description}` : undefined}
            cefrLevel={user?.cefrLevel || "B1"}
          />
        </div>
      )}

      <footer className="fixed bottom-0 w-full bg-white border-t p-4 z-20">
        <div className="container mx-auto max-w-3xl flex justify-between items-center">
          <Button variant="ghost" className="text-muted-foreground rounded-full hidden sm:flex" onClick={handleNext}>
            Skip
          </Button>
          <Button
            size="lg"
            className="w-full sm:w-auto px-12 rounded-full font-bold shadow-md hover:shadow-lg transition-shadow"
            onClick={handleNext}
            disabled={!canProceed()}
            data-testid="button-continue"
          >
            {currentStep < totalSteps - 1 ? "Continue" : "Finish Lesson"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
