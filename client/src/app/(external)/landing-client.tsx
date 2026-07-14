"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CheckCircle2, ArrowRight, Building2, FileText, Users, CreditCard, Bell, Shield, ChevronDown } from "lucide-react";
import type { SubscriptionTier } from "@/config/subscription-tiers";

// Dynamically import LiquidEther so it never SSR's (it uses WebGL)
const LiquidEther = dynamic(() => import("@/components/landing/LiquidEther"), { ssr: false });

/* ─── ROTATING TAGLINES ──────────────────────────────────────── */
const TAGLINES = [
  "Collect rent. Generate receipts. Done.",
  "Your tenants, properties and owners — one place.",
  "From vacant unit to signed lease in minutes.",
  "ZiG or USD — we handle both.",
  "PDF receipts that look like the real thing.",
  "Share an application link. Get qualified tenants.",
  "Owner statements dispatched with one click.",
  "Maintenance logged. Resolved. Documented.",
  "Know who's paid and who hasn't — instantly.",
  "Built for Zimbabwean property managers.",
];

function RotatingTagline() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % TAGLINES.length); setVisible(true); }, 400);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      className="text-xl md:text-2xl font-light tracking-wide text-white/60"
      style={{
        transition: "opacity 0.4s ease, filter 0.4s ease",
        opacity: visible ? 1 : 0,
        filter: visible ? "blur(0px)" : "blur(8px)",
      }}
    >
      {TAGLINES[idx]}
    </p>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn] = useState(false); // In real app, check cookie

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,10,10,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-black font-black text-sm select-none">R</span>
          <span className="text-white font-semibold text-lg tracking-tight">Rental</span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Features", id: "features" },
            { label: "How it works", id: "how-it-works" },
            { label: "Pricing", id: "pricing" },
            { label: "About", id: "about" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link href="/dashboard/overview"
              className="h-9 px-5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors inline-flex items-center gap-1.5">
              Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
                Sign in
              </Link>
              <Link href="/register"
                className="h-9 px-5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors inline-flex items-center">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── HERO ───────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex flex-col overflow-hidden bg-[#050505]">
      {/* LiquidEther fills the entire hero */}
      <div className="absolute inset-0">
        <LiquidEther
          colors={["#1a1a6e", "#3b2fa0", "#6366f1", "#a78bfa", "#0ea5e9"]}
          mouseForce={25}
          cursorSize={120}
          resolution={0.5}
          autoDemo={true}
          autoSpeed={0.4}
          autoIntensity={2.5}
          autoResumeDelay={2000}
          autoRampDuration={0.8}
        />
      </div>

      {/* Dark gradient overlay so text is legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60 pointer-events-none" />

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        {/* Eyebrow pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          Property management for Zimbabwe
        </div>

        {/* Giant wordmark */}
        <h1
          className="font-black text-white leading-[0.85] tracking-tighter select-none"
          style={{
            fontSize: "clamp(80px, 18vw, 220px)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            textShadow: "0 0 120px rgba(99,102,241,0.4)",
          }}
        >
          Rental
        </h1>

        {/* Rotating blur tagline */}
        <div className="mt-8 h-10 flex items-center justify-center">
          <RotatingTagline />
        </div>

        {/* CTA row */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register"
            className="h-12 px-8 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-white/10">
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login"
            className="h-12 px-8 rounded-full border border-white/15 text-white/80 font-medium text-sm hover:border-white/30 hover:text-white transition-all duration-200 inline-flex items-center backdrop-blur-sm">
            Sign in
          </Link>
        </div>

        <p className="mt-5 text-xs text-white/30">Free tier available · No credit card required</p>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-8 animate-bounce">
        <ChevronDown className="h-5 w-5 text-white/30" />
      </div>
    </section>
  );
}

/* ─── BENTO FEATURES ─────────────────────────────────────────── */
function Features() {
  const cards = [
    {
      size: "col-span-2 row-span-2",
      icon: Building2,
      color: "#6366f1",
      title: "Full property portfolio",
      body: "Manage unlimited properties and units. Track which units are vacant, occupied, or under maintenance. Generate application links in one click and share with prospective tenants instantly. The link expires once the form is submitted — no double applications.",
      tag: "Core",
    },
    {
      size: "col-span-1 row-span-1",
      icon: CreditCard,
      color: "#10b981",
      title: "USD & ZiG payments",
      body: "Record payments in both currencies. Dual-currency receipts with your VAT number, bank account, and company address — exactly like the physical receipt.",
      tag: "Payments",
    },
    {
      size: "col-span-1 row-span-1",
      icon: FileText,
      color: "#f59e0b",
      title: "PDF receipts",
      body: "Professional receipts stored in the cloud. Print, email, or WhatsApp to tenant with one click.",
      tag: "Documents",
    },
    {
      size: "col-span-1 row-span-1",
      icon: Users,
      color: "#3b82f6",
      title: "Tenant applications",
      body: "Full Zimbabwean tenancy application form online — ID upload, guarantor, employment history and trade references.",
      tag: "Applications",
    },
    {
      size: "col-span-1 row-span-2",
      icon: Bell,
      color: "#ec4899",
      title: "Automated reminders",
      body: "Rent due on the 7th? The system flags overdue tenants in red and can fire reminder emails automatically. Owners get notified the moment rent is paid.",
      tag: "Automation",
    },
    {
      size: "col-span-1 row-span-1",
      icon: Shield,
      color: "#8b5cf6",
      title: "Roles & access",
      body: "Admin, senior agent, junior agent — each with the right level of access. Invite by email.",
      tag: "Security",
    },
  ];

  return (
    <section id="features" className="bg-[#050505] py-28 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase mb-4">What Rental does</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Every tool a property<br />agent needs.
          </h2>
          <p className="mt-4 text-lg text-white/40 leading-relaxed">
            Built specifically for how Zimbabwean agencies actually operate — dual currency, WhatsApp notifications, and receipts that match what tenants expect.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className={`${c.size} rounded-2xl border border-white/5 bg-white/[0.03] p-6 flex flex-col justify-between hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 group`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${c.color}1a`, border: `1px solid ${c.color}33` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: c.color }} />
                  </div>
                  <span
                    className="text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
                    style={{ background: `${c.color}15`, color: c.color }}
                  >
                    {c.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-2">{c.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{c.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── PROBLEM/SOLUTION ───────────────────────────────────────── */
function ProblemSolution() {
  const problems = [
    { before: "Handwritten receipts that get lost", after: "Cloud PDF receipts — stored, searchable, printable" },
    { before: "WhatsApp screenshots as proof of payment", after: "Numbered receipts with VAT, lease ID, and bank account" },
    { before: "Excel sheets to track who's paid", after: "Overdue tenants flagged in red automatically" },
    { before: "Chasing application forms via email", after: "Share a link — form submits, link expires" },
    { before: "Calling owners to report payments", after: "One click notifies the owner by email or WhatsApp" },
  ];

  return (
    <section id="about" className="bg-[#080808] py-28 px-6 border-y border-white/5">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-4">The shift</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-xl">
            From manual to<br />
            <span className="text-emerald-400">modern</span>.
          </h2>
        </div>

        <div className="space-y-4">
          {problems.map((p, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-3">
              {/* Before */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] px-6 py-4 flex items-center gap-4">
                <span className="text-2xl">❌</span>
                <p className="text-white/40 text-sm">{p.before}</p>
              </div>
              {/* After */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-4 flex items-center gap-4">
                <span className="text-2xl">✅</span>
                <p className="text-white/80 text-sm font-medium">{p.after}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Register your agency",
      body: "Sign up, verify your email in 30 seconds. Fill in your company details — address, VAT number, bank account. These print on every receipt.",
      detail: "Takes under 5 minutes",
    },
    {
      n: "02",
      title: "Add properties & owners",
      body: "Add each property and assign it to an owner. For single-unit properties, one toggle auto-creates the unit — no extra step.",
      detail: "Single-unit shortcut included",
    },
    {
      n: "03",
      title: "Share an application link",
      body: "Each unit gets a unique application link. Send it to prospective tenants. They fill the standard Zimbabwean tenancy form — with ID upload, guarantor, and employment details. The link auto-expires after submission.",
      detail: "Link works once, then expires",
    },
    {
      n: "04",
      title: "Approve & activate lease",
      body: "Review the application in the dashboard. Approve and activate the lease. The tenant is now live in the system.",
      detail: "Lease PDF generated automatically",
    },
    {
      n: "05",
      title: "Record payments & notify owners",
      body: "Record rent payments in ZiG or USD. Receipt generated instantly. One click emails or WhatsApps the tenant and owner.",
      detail: "Owner notified automatically",
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#050505] py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase mb-4">How it works</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-xl">
            From zero to<br />
            <span className="text-blue-400">first receipt</span> today.
          </h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[30px] top-0 bottom-0 w-px bg-white/5 hidden md:block" />

          <div className="space-y-0">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-8 group">
                {/* Step number + dot */}
                <div className="relative flex flex-col items-center">
                  <div className="h-[60px] w-[60px] rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/5 transition-all">
                    <span className="text-xs font-black text-white/30 group-hover:text-indigo-400 transition-colors">{s.n}</span>
                  </div>
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-white/5 my-2 min-h-[40px]" />}
                </div>

                {/* Content */}
                <div className="pb-10">
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed max-w-lg">{s.body}</p>
                  <p className="mt-3 text-xs text-indigo-400/70 font-medium">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── STATS STRIP ────────────────────────────────────────────── */
function StatsStrip() {
  const stats = [
    { value: "$0", label: "to get started" },
    { value: "< 5 min", label: "setup time" },
    { value: "ZiG + USD", label: "dual currency" },
    { value: "1-click", label: "receipt dispatch" },
    { value: "100%", label: "your data" },
    { value: "∞", label: "units on Pro" },
  ];
  return (
    <div className="bg-indigo-600/10 border-y border-indigo-500/20 py-6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-indigo-400">{s.value}</div>
              <div className="text-xs text-white/30 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── PRICING ────────────────────────────────────────────────── */
function Pricing({ tiers }: { tiers: readonly SubscriptionTier[] }) {
  return (
    <section id="pricing" className="bg-[#080808] py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-violet-400 uppercase mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Start free. Scale when ready.
          </h2>
          <p className="mt-4 text-white/40 max-w-lg mx-auto">
            Every plan includes receipts, payments, and tenant management. Upgrade as your portfolio grows.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map(tier => (
            <div
              key={tier.key}
              className={`relative rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 ${
                tier.highlighted
                  ? "bg-indigo-600 border border-indigo-500 shadow-2xl shadow-indigo-500/20"
                  : "bg-white/[0.03] border border-white/8 hover:border-white/15 hover:bg-white/[0.05]"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                  Most Popular
                </div>
              )}
              <div>
                <div className={`text-sm font-semibold mb-3 ${tier.highlighted ? "text-indigo-200" : "text-white/40"}`}>
                  {tier.name}
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white">${tier.priceUsd}</span>
                  <span className={`mb-1 text-sm ${tier.highlighted ? "text-indigo-200" : "text-white/30"}`}>/mo</span>
                </div>
                <p className={`text-xs mt-1.5 ${tier.highlighted ? "text-indigo-200" : "text-white/30"}`}>{tier.tagline}</p>
              </div>

              <ul className="space-y-2.5 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${tier.highlighted ? "text-white" : "text-indigo-400"}`} />
                    <span className={tier.highlighted ? "text-indigo-100" : "text-white/50"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`mt-2 h-10 rounded-xl text-sm font-semibold flex items-center justify-center transition-all ${
                  tier.highlighted
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {tier.priceUsd === 0 ? "Start free" : `Choose ${tier.name}`}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="bg-[#050505] py-32 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className="font-black text-white tracking-tighter leading-tight"
          style={{ fontSize: "clamp(48px, 8vw, 96px)", fontFamily: "var(--font-inter), Inter, sans-serif" }}
        >
          Ready to modernise<br />
          <span className="text-indigo-400">your portfolio?</span>
        </h2>
        <p className="mt-6 text-lg text-white/40 leading-relaxed">
          Join property managers across Zimbabwe who run their books on Rental.
          Sign up in under 5 minutes — no credit card needed.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/register"
            className="h-14 px-10 rounded-full bg-indigo-600 text-white font-bold text-base hover:bg-indigo-500 transition-colors inline-flex items-center gap-2 shadow-lg shadow-indigo-500/25">
            Create free account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login"
            className="h-14 px-10 rounded-full border border-white/10 text-white/60 font-medium text-base hover:border-white/20 hover:text-white transition-all inline-flex items-center">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER (Frontio-style) ─────────────────────────────────── */
function Footer() {
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Security", href: "#about" },
      ],
    },
    {
      heading: "Platform",
      links: [
        { label: "Dashboard", href: "/dashboard/overview" },
        { label: "Applications", href: "/dashboard/applications" },
        { label: "Payments", href: "/dashboard/payments" },
        { label: "Reports", href: "/dashboard/reports" },
      ],
    },
    {
      heading: "Account",
      links: [
        { label: "Sign in", href: "/login" },
        { label: "Register", href: "/register" },
        { label: "Settings", href: "/dashboard/settings" },
        { label: "Billing", href: "/dashboard/settings?tab=subscription" },
      ],
    },
  ];

  return (
    <footer className="bg-[#080808] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        {/* Top row */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 mb-16">
          {/* Brand */}
          <div className="md:w-64 shrink-0">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="h-9 w-9 rounded-lg bg-white flex items-center justify-center text-black font-black text-sm">R</span>
              <span className="text-white font-bold text-lg">Rental</span>
            </div>
            <p className="text-sm text-white/30 leading-relaxed">
              Property management built for Zimbabwean agents. Manage tenants, collect rent, generate receipts.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
            {columns.map(col => (
              <div key={col.heading}>
                <h4 className="text-xs font-semibold tracking-[0.15em] text-white/30 uppercase mb-4">{col.heading}</h4>
                <ul className="space-y-3">
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-xs text-white/20">© {year} Rental. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-white/20">Zimbabwe 🇿🇼</span>
            <span className="h-3 w-px bg-white/10" />
            <span className="text-xs text-white/20">ZiG + USD</span>
            <span className="h-3 w-px bg-white/10" />
            <span className="text-xs text-white/20">Built for agents</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────── */
export default function RentalLandingClient({ tiers }: { tiers: readonly SubscriptionTier[] }) {
  return (
    <div style={{ fontFamily: "var(--font-inter), Inter, -apple-system, sans-serif" }}>
      <Navbar />
      <Hero />
      <StatsStrip />
      <Features />
      <ProblemSolution />
      <HowItWorks />
      <Pricing tiers={tiers} />
      <CTA />
      <Footer />
    </div>
  );
}
