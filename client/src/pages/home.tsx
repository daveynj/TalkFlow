import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Mic, Play, Sparkles, Star, Trophy, Volume2 } from "lucide-react";
import heroAi from "@/assets/images/hero-ai.png";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-primary">TalkFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex">Log in</Button>
            <Link href="/dashboard">
              <Button className="rounded-full shadow-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Your personal AI English Tutor</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-foreground">
              Master English with your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">AI Tutor</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Available 24/7. TalkFlow guides, speaks, corrects, and scaffolds your learning experience just like a seasoned human teacher would.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto rounded-full text-lg px-8 h-14 shadow-md hover:shadow-lg transition-all animate-in fade-in zoom-in duration-500">
                  Take Placement Test <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-lg px-8 h-14 bg-white/50 backdrop-blur-sm border-2">
                Try 30-Sec Demo
              </Button>
            </div>
            
            <div className="flex items-center gap-4 pt-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-background overflow-hidden flex items-center justify-center">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p>Join 10,000+ students mastering English</p>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-3xl rounded-full scale-110 -z-10"></div>
            <img 
              src={heroAi} 
              alt="TalkFlow AI Mascot" 
              className="w-full max-w-lg mx-auto drop-shadow-2xl animate-in fade-in slide-in-from-right-8 duration-1000 delay-200" 
            />
            
            {/* Floating UI Elements representing features */}
            <Card className="absolute top-10 -left-10 glass border-none shadow-xl animate-in slide-in-from-bottom-4 duration-700 delay-500 w-48">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Perfect accent</p>
                  <p className="text-sm font-bold">"Excellent!"</p>
                </div>
              </CardContent>
            </Card>

            <Card className="absolute bottom-20 -right-4 glass border-none shadow-xl animate-in slide-in-from-bottom-4 duration-700 delay-700 w-56">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Daily Streak</p>
                  <p className="text-sm font-bold">7 Days in a row!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Demo Teaser */}
        <section className="bg-white py-24">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Experience the magic instantly</h2>
              <p className="text-muted-foreground text-lg">Click the mic and read the sentence out loud to see how TalkFlow gives real-time feedback.</p>
            </div>
            
            <Card className="glass shadow-lg border-2 border-primary/10 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>
              <CardContent className="p-8 sm:p-12 space-y-8 flex flex-col items-center">
                <div className="bg-primary/5 px-6 py-4 rounded-2xl w-full text-left flex gap-4">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <Volume2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-primary font-semibold mb-1">TalkFlow AI</p>
                    <p className="text-xl font-medium">"The quick brown fox jumps over the lazy dog."</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground font-medium">Your turn. Press the mic to speak.</p>
                
                <Button size="icon" className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 group transition-all hover:scale-105">
                  <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}