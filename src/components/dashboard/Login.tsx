import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Coffee, Lock, Mail, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import SignUpForm from "../auth/SignUpForm";

interface LoginProps {
  onLogin?: () => void;
  systemName?: string;
}

const Login = ({
  onLogin = () => {},
  systemName = "Xuan Tea POS",
}: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;

      // Check if user exists in the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (userError && userError.code !== "PGRST116") {
        throw userError;
      }

      // Store user info in localStorage
      localStorage.setItem("userEmail", data.user.email || "");
      localStorage.setItem("userId", data.user.id || "");
      localStorage.setItem("userName", userData?.name || email.split("@")[0]);

      // Successfully logged in
      console.log("Logged in user:", data.user);
      onLogin();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user record in public.users table
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: userName || email.split("@")[0],
            created_at: new Date().toISOString(),
          },
        ]);

        if (insertError) throw insertError;

        // Show success message
        alert(
          "Sign up successful! Please check your email for verification link.",
        );
        // Switch back to login form
        setShowSignUp(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setShowSignUp(!showSignUp);
    setError(null);
  };

  if (showSignUp) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary p-2">
                <Coffee className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">{systemName}</CardTitle>
            <CardDescription>
              Create a new account to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    className="pl-10"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing up..." : "Sign up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <p>
                Already have an account?{" "}
                <Button variant="link" className="p-0" onClick={toggleForm}>
                  Sign in
                </Button>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary p-2">
              <Coffee className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{systemName}</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            <p>
              Don't have an account?{" "}
              <Button variant="link" className="p-0" onClick={toggleForm}>
                Sign up
              </Button>
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => navigate("/landing")}
          >
            Back to Landing Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
