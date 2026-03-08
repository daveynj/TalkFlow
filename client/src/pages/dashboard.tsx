import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Flame, ArrowRight, BookOpen, Star, Trophy, Clock, Target, CalendarDays, LogOut } from "lucide-react";

const CEFR_PROGRESS: Record<string, number> = {
  A1: 10, A2: 25, B1: 45, B2: 65, C1: 85, C2: 100,
};
const CEFR_LABELS: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Intermediate", C1: "Advanced", C2: "Proficient",
};
const CEFR_NEXT: Record<string, string> = {
  A1: "A2", A2: "B1", B1: "B2", B2: "C1", C1: "C2", C2: "C2",
};

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery<any[]>({
    queryKey: ["/api/lessons"],
    enabled: isAuthenticated,
  });

  const { data: progress = [] } = useQuery<any[]>({
    queryKey: ["/api/progress"],
    enabled: isAuthenticated,
  });

  const { data: reviewData } = useQuery<{ count: number }>({
    queryKey: ["/api/vocabulary/review/count"],
    enabled: isAuthenticated,
  });

  const streakMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/streak");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      streakMutation.mutate();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

  const completedLessonIds = new Set(progress.filter((p: any) => p.status === "completed").map((p: any) => p.lessonId));
  const userLessons = lessons.filter((l: any) => l.cefrLevel === user!.cefrLevel || l.cefrLevel <= user!.cefrLevel);
  const nextLesson = lessons.find((l: any) => !completedLessonIds.has(l.id));
  const lockedLesson = lessons.find((l: any) => !completedLessonIds.has(l.id) && l.id !== nextLesson?.id);
  const completedCount = completedLessonIds.size;
  const dailyGoalTarget = 3;
  const reviewCount = reviewData?.count || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span className="font-bold text-orange-700" data-testid="text-streak">{user!.currentStreak}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <Star className="w-5 h-5 text-blue-500 fill-blue-500" />
              <span className="font-bold text-blue-700" data-testid="text-xp">{user!.xp} XP</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-logout"
              className="rounded-full"
              onClick={() => {
                logout.mutate();
                setLocation("/");
              }}
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-sm bg-gradient-to-br from-primary to-blue-600 text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10 scale-150 transform translate-x-1/4 -translate-y-1/4">
              <Brain className="w-64 h-64" />
            </div>
            <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full">
              <div>
                <h2 className="text-3xl font-bold mb-2" data-testid="text-welcome">Welcome back, {user!.displayName}!</h2>
                <p className="text-blue-100 mb-6 text-lg">You're doing great. Keep up the momentum!</p>
              </div>
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm font-medium text-blue-100 mb-1">Current Level</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black" data-testid="text-cefr-level">{user!.cefrLevel}</span>
                      <span className="px-2 py-1 rounded bg-white/20 text-xs font-semibold">{CEFR_LABELS[user!.cefrLevel] || "Beginner"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-100 mb-1">Next Level: {CEFR_NEXT[user!.cefrLevel]}</p>
                    <p className="font-bold">{CEFR_PROGRESS[user!.cefrLevel] || 10}%</p>
                  </div>
                </div>
                <Progress value={CEFR_PROGRESS[user!.cefrLevel] || 10} className="h-2 bg-black/30 [&>div]:bg-white" />
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
                  <p className="text-2xl font-bold">{user!.currentStreak} {user!.currentStreak === 1 ? "Day" : "Days"}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Lessons Done</p>
                  <p className="text-2xl font-bold">{completedCount} <span className="text-sm font-normal text-muted-foreground">completed</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Continue Learning</h3>
          </div>

          {lessonsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {nextLesson && (
                <Link href={`/lesson/${nextLesson.id}`}>
                  <Card className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all border-2 border-transparent relative overflow-hidden" data-testid={`card-lesson-${nextLesson.id}`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">UP NEXT</span>
                      </div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{nextLesson.title}</h4>
                      <p className="text-muted-foreground text-sm mb-6 line-clamp-2">{nextLesson.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                          <Clock className="w-4 h-4" /> {nextLesson.durationMinutes} mins
                        </div>
                        <Button size="sm" className="rounded-full rounded-tr-sm group-hover:bg-primary/90" data-testid="button-start-lesson">
                          Start <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {lockedLesson && (
                <Card className="opacity-75 relative bg-white border-dashed">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                        <Brain className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-bold mb-2 text-gray-700">{lockedLesson.title}</h4>
                      <p className="text-gray-500 text-sm mb-6">{lockedLesson.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      Complete previous lesson to unlock
                    </div>
                  </CardContent>
                </Card>
              )}

              {!nextLesson && lessons.length > 0 && (
                <Card className="border-none shadow-sm bg-green-50">
                  <CardContent className="p-8 text-center">
                    <Trophy className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-green-700">All lessons completed!</h4>
                    <p className="text-green-600 mt-2">Great work! More lessons are coming soon.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {reviewCount > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Needs Review</h3>
            <Card className="border-none shadow-sm bg-accent/5 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10">
                <CalendarDays className="w-48 h-48 -mb-8 -mr-8" />
              </div>
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-xl font-bold text-accent-foreground">Spaced Repetition Review</h4>
                  <p className="text-muted-foreground">You have {reviewCount} vocabulary word{reviewCount !== 1 ? 's' : ''} ready for review today.</p>
                </div>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full w-full sm:w-auto shadow-sm" data-testid="button-start-review">
                  Start Review Session
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
