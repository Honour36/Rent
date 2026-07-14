"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [countdown]);

  const handleDigit = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
    // Auto-submit when all filled
    if (next.every(d => d) && i === 5) submit(next.join(""));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) { inputRefs.current[i - 1]?.focus(); }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
      submit(pasted);
    }
  };

  const submit = async (code: string) => {
    if (!email) { toast.error("Email missing — go back and try again."); return; }
    setLoading(true);
    const res = await apiClient<any>("/auth/verify-email", { data: { email, code } });
    setLoading(false);
    if (res.success) {
      const d = (res as any).data ?? res;
      setUser(d.user);
      toast.success("Email verified! Welcome to Rental 🎉");
      router.push("/dashboard/overview");
    } else {
      toast.error((res as any).error || "Invalid code — please check and try again.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const resend = async () => {
    if (countdown > 0) return;
    setResending(true);
    await apiClient("/auth/resend-verification", { data: { email } });
    setResending(false);
    setCountdown(60);
    toast.success("New code sent — check your inbox.");
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <MailCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Check your inbox</h1>
        <p className="text-sm text-muted-foreground mt-1">
          We sent a 6-digit code to <strong>{email || "your email"}</strong>
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <Input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-12 text-center text-2xl font-bold tracking-widest"
              />
            ))}
            </div>

            <Button className="w-full" onClick={() => submit(digits.join(""))} disabled={loading || digits.some(d => !d)}>
              {loading ? "Verifying…" : "Verify Email"}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="ghost" size="sm" onClick={resend} disabled={resending || countdown > 0} className="text-muted-foreground">
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
            </Button>
          </CardFooter>
        </Card>
      </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailForm /></Suspense>;
}
