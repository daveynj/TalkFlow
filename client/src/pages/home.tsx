import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Mic, Sparkles, Trophy, Volume2, BookOpen, Brain, Target } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-primary">TalkFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="rounded-full shadow-sm" data-testid="button-dashboard">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="hidden sm:inline-flex" data-testid="button-login">Log in</Button>
                </Link>
                <Link href="/auth">
                  <Button className="rounded-full shadow-sm" data-testid="button-get-started">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm">
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
              <Link href={isAuthenticated ? "/dashboard" : "/auth"}>
                <Button size="lg" className="w-full sm:w-auto rounded-full text-lg px-8 h-14 shadow-md hover:shadow-lg transition-all" data-testid="button-cta-hero">
                  Start Learning Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
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

            <div className="w-full max-w-lg mx-auto space-y-6 p-8">
              <Card className="border-none shadow-xl animate-in slide-in-from-bottom-4 duration-700 delay-200">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Brain className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">CEFR-Aligned Lessons</p>
                    <p className="text-sm text-muted-foreground">A1 to C2, personalized for you</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl animate-in slide-in-from-bottom-4 duration-700 delay-400">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Volume2 className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">AI Voice Tutor</p>
                    <p className="text-sm text-muted-foreground">Speaks, corrects, and coaches you</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl animate-in slide-in-from-bottom-4 duration-700 delay-500">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Gamified Learning</p>
                    <p className="text-sm text-muted-foreground">Streaks, XP, and spaced repetition</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">How TalkFlow Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Interactive, CEFR-aligned lessons that adapt to your level with a proactive AI tutor guiding every step.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Mic className="w-6 h-6" />, title: "Speak & Listen", desc: "Practice pronunciation with real-time speech recognition and natural AI voice feedback.", color: "bg-red-100 text-red-500" },
                { icon: <BookOpen className="w-6 h-6" />, title: "Interactive Exercises", desc: "Fill-in-the-blanks, sentence unscramble, multiple choice, and vocabulary flashcards.", color: "bg-blue-100 text-blue-500" },
                { icon: <Target className="w-6 h-6" />, title: "Smart Review", desc: "Spaced repetition remembers words you struggled with and re-introduces them at the right time.", color: "bg-purple-100 text-purple-500" },
              ].map((f, i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mx-auto`}>{f.icon}</div>
                    <h3 className="text-xl font-bold">{f.title}</h3>
                    <p className="text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Simple Pricing</h2>
              <p className="text-muted-foreground text-lg">Start free. Upgrade when you're ready.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Free Basic</h3>
                    <p className="text-3xl font-black">$0<span className="text-base font-normal text-muted-foreground">/month</span></p>
                  </div>
                  <ul className="space-y-3 text-sm">
                    {["Placement Test", "2 free lessons per level", "Standard AI voice"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>{f}</li>
                    ))}
                  </ul>
                  <Link href="/auth">
                    <Button variant="outline" className="w-full rounded-full" data-testid="button-pricing-free">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary shadow-lg relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-1">TalkFlow Pro</h3>
                    <p className="text-3xl font-black">$14<span className="text-base font-normal text-muted-foreground">/month</span></p>
                  </div>
                  <ul className="space-y-3 text-sm">
                    {["Unlimited lessons", "Proactive AI voice", "All interactive exercises", "Progress dashboard"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>{f}</li>
                    ))}
                  </ul>
                  <Link href="/auth">
                    <Button className="w-full rounded-full" data-testid="button-pricing-pro">Start Pro Trial</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Premium</h3>
                    <p className="text-3xl font-black">$49<span className="text-base font-normal text-muted-foreground">/month</span></p>
                  </div>
                  <ul className="space-y-3 text-sm">
                    {["Everything in Pro", "Advanced pronunciation", "1x live tutor session/month", "Priority support"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>{f}</li>
                    ))}
                  </ul>
                  <Link href="/auth">
                    <Button variant="outline" className="w-full rounded-full" data-testid="button-pricing-premium">Contact Us</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>TalkFlow AI - Your Personal English Tutor. Built with love for language learners everywhere.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
