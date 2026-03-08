import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Volume2, Mic, Play, CheckCircle2, ArrowRight, Lightbulb } from "lucide-react";
import { toast } from "sonner";

// Mock data for the lesson
const LESSON_DATA = {
  title: "Business Introductions",
  totalSteps: 4,
  steps: [
    {
      type: "intro",
      aiMessage: "Hi Alex! Today we're going to practice introducing yourself in a business meeting. Let's start with a warm-up. Listen carefully and repeat after me.",
      targetSentence: "Hello everyone, my name is Alex and I'm the lead designer.",
    },
    {
      type: "vocabulary",
      aiMessage: "Great job! Now let's look at some key vocabulary for meetings. Click on the cards to hear the pronunciation.",
      words: [
        { word: "Agenda", meaning: "A list of items to be discussed at a formal meeting." },
        { word: "Objective", meaning: "A goal or purpose." },
        { word: "Colleague", meaning: "A person with whom one works." }
      ]
    },
    {
      type: "fill-blank",
      aiMessage: "Let's test your understanding. Fill in the blank with the correct word.",
      question: "Before we begin, let's quickly review the _______ for today's meeting.",
      options: ["Colleague", "Agenda", "Objective"],
      answer: "Agenda"
    }
  ]
};

export default function Lesson() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const step = LESSON_DATA.steps[currentStep];
  const progress = ((currentStep + 1) / LESSON_DATA.totalSteps) * 100;

  // Simulate AI "speaking" when step changes
  useEffect(() => {
    if (step) {
      setIsPlaying(true);
      setShowHint(false);
      setSelectedOption(null);
      
      const timer = setTimeout(() => {
        setIsPlaying(false);
      }, 3000); // Mock 3 seconds of speaking
      
      // Proactive hint simulation: If on question and wait 10s
      let hintTimer: NodeJS.Timeout;
      if (step.type === 'fill-blank') {
         hintTimer = setTimeout(() => {
           setShowHint(true);
           toast("AI Hint: It means a list of items to discuss!", {
             icon: <Lightbulb className="w-4 h-4 text-accent" />
           });
         }, 10000);
      }

      return () => {
        clearTimeout(timer);
        if(hintTimer) clearTimeout(hintTimer);
      };
    }
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < LESSON_DATA.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finished
      toast.success("Lesson Complete! +50 XP");
      // Could route back to dashboard here
    }
  };

  const handleRecord = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      toast.success("Excellent pronunciation!", {
        icon: <CheckCircle2 className="w-5 h-5 text-green-500"/>
      });
    }, 2000);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    if (option === step.answer) {
      toast.success("Correct!", {
        description: "Great job. Agenda is the right word.",
      });
    } else {
      toast.error("Not quite.", {
        description: "Remember, we are looking for a word that means a list of items to discuss.",
      });
    }
  };

  if (!step) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Lesson Complete!</h1>
        <p className="text-xl text-muted-foreground mb-8">You earned 50 XP and maintained your streak.</p>
        <Link href="/dashboard">
          <Button size="lg" className="rounded-full px-8">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-muted-foreground" />
          </Button>
        </Link>
        <div className="flex-1 max-w-2xl mx-auto">
          <Progress value={progress} className="h-3" />
        </div>
      </header>

      {/* Main Lesson Canvas */}
      <main className="flex-1 container mx-auto px-4 max-w-3xl flex flex-col pt-4 pb-24">
        
        {/* AI Tutor Bubble */}
        <div className="flex gap-4 mb-12 animate-in slide-in-from-top-4 duration-500">
          <div className="relative shrink-0 mt-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors ${isPlaying ? 'bg-primary text-white shadow-primary/30 shadow-lg' : 'bg-white border-2 text-primary'}`}>
              <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
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
              <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in">
                <Lightbulb className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-accent-foreground">Need a hint? Think about what you usually read at the start of a meeting.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Content based on step type */}
        <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-700 delay-200">
          
          {step.type === 'intro' && (
            <Card className="glass border-primary/20 shadow-lg w-full max-w-xl mx-auto">
              <CardContent className="p-8 text-center space-y-8">
                <div className="text-2xl sm:text-3xl font-bold leading-tight">
                  "{step.targetSentence}"
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    size="icon" 
                    className={`w-24 h-24 rounded-full shadow-xl transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/50' : 'bg-white text-primary border-2 hover:bg-gray-50'}`}
                    onClick={handleRecord}
                  >
                    <Mic className={`w-10 h-10 ${isRecording ? 'text-white animate-pulse' : ''}`} />
                  </Button>
                </div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                  {isRecording ? "Listening..." : "Tap to Speak"}
                </p>
              </CardContent>
            </Card>
          )}

          {step.type === 'vocabulary' && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {step.words?.map((item, i) => (
                <Card key={i} className="cursor-pointer hover:border-primary/50 transition-colors group">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-bold text-primary">{item.word}</h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-primary rounded-full group-hover:bg-primary/10">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.meaning}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step.type === 'fill-blank' && (
            <div className="w-full max-w-2xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border text-2xl sm:text-3xl font-medium leading-relaxed text-center">
                Before we begin, let's quickly review the <span className={`inline-block border-b-4 mx-2 px-4 pb-1 min-w-[120px] transition-colors ${selectedOption === step.answer ? 'border-green-500 text-green-600' : selectedOption ? 'border-red-500 text-red-500' : 'border-gray-300'}`}>{selectedOption || ''}</span> for today's meeting.
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                {step.options?.map((opt, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    className={`h-16 text-lg rounded-2xl border-2 transition-all ${selectedOption === opt ? (opt === step.answer ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700') : 'hover:border-primary hover:bg-primary/5'}`}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={selectedOption === step.answer}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer / Controls */}
      <footer className="fixed bottom-0 w-full bg-white border-t p-4 z-20">
        <div className="container mx-auto max-w-3xl flex justify-between items-center">
          <Button variant="ghost" className="text-muted-foreground rounded-full hidden sm:flex">
            Skip
          </Button>
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-12 rounded-full font-bold shadow-md hover:shadow-lg transition-shadow"
            onClick={handleNext}
            disabled={step.type === 'fill-blank' && selectedOption !== step.answer}
          >
            {currentStep < LESSON_DATA.steps.length - 1 ? 'Continue' : 'Finish Lesson'}
          </Button>
        </div>
      </footer>
    </div>
  );
}