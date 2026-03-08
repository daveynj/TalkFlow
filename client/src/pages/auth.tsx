import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { login, register, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login.mutateAsync({ username, password });
      } else {
        await register.mutateAsync({ username, password, displayName });
      }
      setLocation("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl">
              T
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight text-primary">TalkFlow</span>
          </div>
          <p className="text-muted-foreground">Your AI English Tutor</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to continue learning" : "Start your English learning journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    data-testid="input-display-name"
                    placeholder="What should we call you?"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                data-testid="button-submit-auth"
                className="w-full rounded-full h-12 text-base font-semibold"
                disabled={login.isPending || register.isPending}
              >
                {login.isPending || register.isPending ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                data-testid="button-toggle-auth"
                className="text-sm text-primary hover:underline font-medium"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
