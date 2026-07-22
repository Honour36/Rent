"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Check, ChevronDown } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options, value, onChange, placeholder = "Select…",
  searchPlaceholder = "Search…", disabled, className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = query.trim()
    ? options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        o.sublabel?.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
          "hover:border-ring focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <div className="flex flex-col items-start min-w-0">
          {selected ? (
            <>
              <span className="truncate font-medium">{selected.label}</span>
              {selected.sublabel && <span className="text-xs text-muted-foreground truncate">{selected.sublabel}</span>}
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 ml-2 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
          <div className="flex items-center border-b px-3 py-2 gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">No results</li>
            )}
            {filtered.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); setQuery(""); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                    opt.value === value && "bg-accent/50",
                  )}
                >
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="font-medium truncate">{opt.label}</span>
                    {opt.sublabel && <span className="text-xs text-muted-foreground truncate">{opt.sublabel}</span>}
                  </div>
                  {opt.value === value && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
