import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Flame, ArrowRight, BookOpen, Star, Trophy, Clock, Target, CalendarDays, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-primary hidden sm:block">TalkFlow</span>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span className="font-bold text-orange-700">12</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <Star className="w-5 h-5 text-blue-500 fill-blue-500" />
              <span className="font-bold text-blue-700">850 XP</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center cursor-pointer">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="user" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        
        {/* Welcome & Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-sm bg-gradient-to-br from-primary to-blue-600 text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10 scale-150 transform translate-x-1/4 -translate-y-1/4">
              <Brain className="w-64 h-64" />
            </div>
            <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, Alex!</h2>
                <p className="text-blue-100 mb-6 text-lg">You're doing great. Keep up the momentum!</p>
              </div>
              
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm font-medium text-blue-100 mb-1">Current Level</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black">B1</span>
                      <span className="px-2 py-1 rounded bg-white/20 text-xs font-semibold">Intermediate</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-100 mb-1">Next Level: B2</p>
                    <p className="font-bold">65%</p>
                  </div>
                </div>
                <Progress value={65} className="h-2 bg-black/30 [&>div]:bg-white" />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Daily Streak</p>
                  <p className="text-2xl font-bold">12 Days</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Daily Goal</p>
                  <p className="text-2xl font-bold">2 / 3 <span className="text-sm font-normal text-muted-foreground">lessons</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Learning */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Continue Learning</h3>
            <Button variant="ghost" className="text-primary font-medium">View Path</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/lesson">
              <Card className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all border-2 border-transparent relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">UP NEXT</span>
                  </div>
                  <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Business Meetings: Part 1</h4>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2">Learn essential vocabulary for introducing yourself and presenting ideas in a professional setting.</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <Clock className="w-4 h-4" /> 15 mins
                    </div>
                    <Button size="sm" className="rounded-full rounded-tr-sm group-hover:bg-primary/90">
                      Start <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="opacity-75 relative bg-white border-dashed">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-gray-700">Grammar: Present Perfect</h4>
                  <p className="text-gray-500 text-sm mb-6">Master the usage of "have been" and "has done" in conversational contexts.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                   Complete previous lesson to unlock
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Review & SRS */}
        <div>
          <h3 className="text-2xl font-bold mb-6">Needs Review</h3>
          <Card className="border-none shadow-sm bg-accent/5 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10">
              <CalendarDays className="w-48 h-48 -mb-8 -mr-8" />
            </div>
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="text-xl font-bold text-accent-foreground">Spaced Repetition Review</h4>
                <p className="text-muted-foreground">You have 14 vocabulary words ready for review today.</p>
              </div>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full w-full sm:w-auto shadow-sm">
                Start Review Session
              </Button>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}