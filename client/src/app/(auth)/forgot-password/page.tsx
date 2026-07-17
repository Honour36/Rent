"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await apiClient("/auth/forgot-password", { data: { email } });
    setLoading(false);
    setSent(true);
    toast.success("Reset code sent - check your inbox.");
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            {sent ? <MailCheck className="h-6 w-6 text-green-600" /> : <KeyRound className="h-6 w-6 text-primary" />}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{sent ? "Code sent!" : "Forgot password?"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sent
              ? `We sent a reset code to ${email}. Enter it below to create a new password.`
              : "Enter your email and we'll send you a reset code."}
          </p>
        </div>

        {!sent ? (
          <Card>
            <form onSubmit={handleSubmit}>
              <CardContent className="grid gap-4 pt-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button className="w-full" type="submit" disabled={loading}>{loading ? "Sending…" : "Send reset code"}</Button>
                <Link href="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to login
                </Link>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}>
              Enter reset code
            </Button>
            <Button variant="ghost" onClick={() => setSent(false)}>Use a different email</Button>
          </div>
        )}
      </div>
    </div>
  );
}
