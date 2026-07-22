"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "@/components/icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDigit = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) setDigits(pasted.split(""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) { toast.warning("Enter all 6 digits of the reset code."); return; }
    if (password !== confirmPassword) { toast.warning("Passwords do not match."); return; }
    if (password.length < 8) { toast.warning("Password must be at least 8 characters."); return; }

    setLoading(true);
    const res = await apiClient("/auth/reset-password", { data: { email, code, password } });
    setLoading(false);

    if (res.success) {
      toast.success("Password reset! You can now log in.");
      router.push("/login");
    } else {
      toast.error((res as any).error || "Could not reset password.");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950">
            <ShieldCheck className="h-6 w-6 text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create new password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit code sent to <strong>{email}</strong></p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label>Reset code</Label>
                <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <Input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handleDigit(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="h-12 w-10 text-center text-xl font-bold" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input id="password" type={showPw ? "text" : "password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={loading}>{loading ? "Resetting…" : "Reset password"}</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
