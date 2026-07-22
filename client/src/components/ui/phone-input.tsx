"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle } from "@/components/icons";
import { Input } from "./input";
import { validatePhone } from "@/lib/phone-validation";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  required?: boolean;
}

export function PhoneInput({ value, onChange, placeholder = "+263 77 000 0000", className, name, required }: PhoneInputProps) {
  const [touched, setTouched] = useState(false);

  const result = touched && value ? validatePhone(value) : null;
  const isValid = result?.valid === true;
  const isInvalid = result?.valid === false;

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          name={name}
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          required={required}
          className={cn(
            "pr-8",
            isValid && "border-green-500 focus-visible:ring-green-500/20",
            isInvalid && "border-destructive focus-visible:ring-destructive/20",
            className,
          )}
        />
        {touched && value && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {isValid
              ? <CheckCircle2 className="h-4 w-4 text-green-600" />
              : <AlertCircle className="h-4 w-4 text-destructive" />}
          </span>
        )}
      </div>
      {isValid && result?.formatted && result.formatted !== value && (
        <p className="text-xs text-green-600">✓ {result.formatted}</p>
      )}
      {isInvalid && result?.message && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />{result.message}
        </p>
      )}
    </div>
  );
}
