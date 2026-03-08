import { Link, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { VoiceAgent } from "@/components/voice-agent";
import { ArrowLeft } from "lucide-react";

export default function Talk() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-lg">Talk with TalkFlow AI</h1>
            <p className="text-xs text-muted-foreground">Speech-to-speech conversation practice</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6 text-center space-y-2">
          <p className="text-muted-foreground">
            Practice speaking English with your AI tutor. The AI will speak to you and listen to your responses
            in real-time. Your current level is <span className="font-bold text-primary">{user?.cefrLevel || "B1"}</span>.
          </p>
        </div>

        <VoiceAgent
          context="Free conversation practice. Help the student practice speaking naturally. Ask follow-up questions about their interests, work, or daily life. Correct any grammar mistakes gently."
          cefrLevel={user?.cefrLevel || "B1"}
        />

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Talk about your day", prompt: "Ask me about my day and help me describe it in English" },
            { label: "Job interview practice", prompt: "Let's practice a job interview. Ask me common interview questions" },
            { label: "Describe a picture", prompt: "Describe an imaginary scene and ask me to describe what I see" },
          ].map((topic, i) => (
            <Button
              key={i}
              variant="outline"
              className="h-auto py-4 px-4 text-left rounded-xl border-2 hover:border-primary/50"
              data-testid={`button-topic-${i}`}
            >
              <span className="text-sm font-medium">{topic.label}</span>
            </Button>
          ))}
        </div>
      </main>
    </div>
  );
}
