"use client";
import { toast } from "sonner";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "@/components/icons";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { type User, useAuthStore } from "@/stores/auth.store";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  const inviteToken = searchParams.get("token");
  const isInviteFlow = Boolean(inviteToken);

  const [accountName, setAccountName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");

    if (isInviteFlow) {
      const res = await apiClient<{ user: User }>("/auth/accept-invite", {
        data: { token: inviteToken, fullName, password },
      });
      if (res.success) { setUser(res.data.user); router.push("/dashboard/overview"); }
      else { const msg = (res as any).error || 'Registration failed.'; setError(msg); toast.error(msg); }
    } else {
      const res = await apiClient<any>("/auth/register", {
        data: { accountName, fullName, email, password },
      });
      if (res.success) { router.push(`/verify-email?email=${encodeURIComponent(email)}`); }
      else { const msg = (res as any).error || 'Registration failed.'; setError(msg); toast.error(msg); }
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isInviteFlow ? "Set Up Your Account" : "Register"}
          </CardTitle>
          <CardDescription>
            {isInviteFlow
              ? "You've been invited to join the team. Set your name and password to get started."
              : "Create an account to manage your properties."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {error && <div className="text-sm font-medium text-destructive">{error}</div>}

            {!isInviteFlow && (
              <div className="grid gap-2">
                <Label htmlFor="accountName">Company / Account Name</Label>
                <Input id="accountName" required value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="fullName">Your Full Name</Label>
              <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            {!isInviteFlow && (
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button" variant="ghost" size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button" variant="ghost" size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading
                ? (isInviteFlow ? "Setting up..." : "Creating account...")
                : (isInviteFlow ? "Activate Account" : "Register")}
            </Button>
            {!isInviteFlow && (
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">Login</Link>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
