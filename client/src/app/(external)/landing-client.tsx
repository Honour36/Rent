"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { CheckCircle2, ArrowRight, ChevronDown } from "lucide-react";
import type { SubscriptionTier } from "@/config/subscription-tiers";

const LiquidEther = dynamic(() => import("@/components/landing/LiquidEther"), { ssr: false });

const FONT = "var(--font-montserrat), Montserrat, sans-serif";

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
];

function RotatingTagline() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % TAGLINES.length); setVisible(true); }, 380);
    }, 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="text-lg md:text-2xl font-light text-white/55" style={{
      transition: "opacity 0.38s ease, filter 0.38s ease",
      opacity: visible ? 1 : 0,
      filter: visible ? "blur(0px)" : "blur(10px)",
      fontFamily: FONT,
    }}>
      {TAGLINES[idx]}
    </p>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
      background: scrolled ? "rgba(8,8,8,0.9)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
    }}>
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <span className="text-white font-black text-xl tracking-tight" style={{ fontFamily: FONT }}>Rental</span>
        <nav className="hidden md:flex items-center gap-8">
          {[["Features","features"],["How it works","how-it-works"],["Pricing","pricing"]].map(([l,id]) => (
            <button key={id} onClick={() => go(id)} className="text-sm text-white/50 hover:text-white transition-colors" style={{ fontFamily: FONT }}>{l}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block" style={{ fontFamily: FONT }}>Sign in</Link>
          <Link href="/register" className="h-9 px-5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors inline-flex items-center" style={{ fontFamily: FONT }}>Get started</Link>
        </div>
      </div>
    </header>
  );
}

/* ─── HERO ───────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative h-screen min-h-[620px] flex flex-col overflow-hidden bg-[#050505]">
      <div className="absolute inset-0">
        <LiquidEther colors={["#1a1a6e","#3b2fa0","#6366f1","#a78bfa","#0ea5e9"]}
          mouseForce={25} cursorSize={120} resolution={0.5}
          autoDemo autoSpeed={0.4} autoIntensity={2.5} autoResumeDelay={2000} autoRampDuration={0.8} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none" />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-black text-white leading-[0.85] tracking-tighter select-none"
          style={{ fontSize: "clamp(90px, 20vw, 240px)", fontFamily: FONT, textShadow: "0 0 140px rgba(99,102,241,0.5)" }}>
          Rental
        </h1>
        <div className="mt-8 h-10 flex items-center justify-center">
          <RotatingTagline />
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="h-12 px-8 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 transition-all inline-flex items-center gap-2 shadow-2xl shadow-white/10" style={{ fontFamily: FONT }}>
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="h-12 px-8 rounded-full border border-white/15 text-white/70 font-medium text-sm hover:border-white/30 hover:text-white transition-all inline-flex items-center backdrop-blur-sm" style={{ fontFamily: FONT }}>
            Sign in
          </Link>
        </div>
        <p className="mt-5 text-xs text-white/25" style={{ fontFamily: FONT }}>Free tier available · No credit card required</p>
      </div>
      <div className="relative z-10 flex justify-center pb-8 animate-bounce">
        <ChevronDown className="h-5 w-5 text-white/25" />
      </div>
    </section>
  );
}

/* ─── FEATURES (Pexels images + hover reveal) ────────────────── */
const FEATURE_CARDS = [
  {
    title: "Property Portfolio",
    desc: "Track every property, unit, and owner in one place. Vacant units highlighted instantly. Application links generated and shared in seconds.",
    img: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Instant Receipts",
    desc: "Professional PDF receipts with your VAT number, lease ID, and bank details — emailed or WhatsApp'd with one click.",
    img: "https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    span: "",
  },
  {
    title: "Tenant Applications",
    desc: "Full Zimbabwean tenancy form online — ID upload, guarantor, employment history. Link auto-expires after submission.",
    img: "https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    span: "",
  },
  {
    title: "ZiG + USD Payments",
    desc: "Record rent in both currencies. System flags overdue tenants in red after the due date automatically.",
    img: "https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    span: "",
  },
  {
    title: "Owner Statements",
    desc: "Generate monthly owner statements and dispatch by email or WhatsApp the moment rent is received.",
    img: "https://images.pexels.com/photos/7235675/pexels-photo-7235675.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    span: "",
  },
];

function FeatureCard({ card }: { card: typeof FEATURE_CARDS[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl cursor-default ${card.span} min-h-[220px]`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <img
        src={card.img}
        alt={card.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
        style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
      />
      {/* Default overlay — title only */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-400"
        style={{ opacity: hovered ? 0 : 1 }} />
      <div className="absolute bottom-0 left-0 right-0 p-5 transition-all duration-400"
        style={{ opacity: hovered ? 0 : 1, transform: hovered ? "translateY(8px)" : "translateY(0)" }}>
        <h3 className="text-white font-bold text-base" style={{ fontFamily: FONT }}>{card.title}</h3>
      </div>
      {/* Hover overlay — description */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm transition-opacity duration-400 p-6"
        style={{ opacity: hovered ? 1 : 0 }}>
        <div className="text-center">
          <h3 className="text-white font-black text-lg mb-3" style={{ fontFamily: FONT }}>{card.title}</h3>
          <p className="text-white/75 text-sm leading-relaxed" style={{ fontFamily: FONT }}>{card.desc}</p>
        </div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="bg-[#050505] py-28 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase mb-4" style={{ fontFamily: FONT }}>What Rental does</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-xl" style={{ fontFamily: FONT }}>
            Every tool a property<br />agent needs.
          </h2>
          <p className="mt-4 text-white/40 text-lg max-w-xl leading-relaxed" style={{ fontFamily: FONT }}>
            Hover each card to see how Rental solves real problems for property managers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[260px] gap-3">
          {FEATURE_CARDS.map(card => <FeatureCard key={card.title} card={card} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────────── */
const STEPS = [
  { n: "01", title: "Register your agency", body: "Sign up, verify your email, fill in your company details. Address, VAT number, bank account — these print on every receipt. Under 5 minutes." },
  { n: "02", title: "Add properties & owners", body: "Add each property and assign it to an owner. For single-unit properties, one toggle auto-creates the unit — no extra step needed." },
  { n: "03", title: "Share application links", body: "Each unit gets a unique link. Prospective tenants fill the Zimbabwean tenancy form online — ID, guarantor, employment. Link expires after submission." },
  { n: "04", title: "Approve & activate lease", body: "Review applications in the dashboard. Approve and activate. Lease PDF generated automatically. Tenant is live in the system." },
  { n: "05", title: "Collect rent & notify owners", body: "Record payments in ZiG or USD. Receipt generated instantly. One click emails or WhatsApps the tenant and owner." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#080808] py-28 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase mb-4" style={{ fontFamily: FONT }}>How it works</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight" style={{ fontFamily: FONT }}>
            From zero to<br /><span className="text-blue-400">first receipt</span> today.
          </h2>
        </div>

        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="group flex gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all duration-300">
              {/* Number badge */}
              <div className="shrink-0 flex items-start pt-0.5">
                <span className="text-3xl font-black text-white/10 group-hover:text-indigo-400/60 transition-colors duration-300 leading-none" style={{ fontFamily: FONT, fontVariantNumeric: "tabular-nums" }}>{s.n}</span>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-white transition-colors" style={{ fontFamily: FONT }}>{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/60 transition-colors" style={{ fontFamily: FONT }}>{s.body}</p>
              </div>
              {/* Arrow that appears on hover */}
              <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING ────────────────────────────────────────────────── */
function Pricing({ tiers }: { tiers: readonly SubscriptionTier[] }) {
  return (
    <section id="pricing" className="bg-[#050505] py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-violet-400 uppercase mb-4" style={{ fontFamily: FONT }}>Pricing</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: FONT }}>Start free. Scale when ready.</h2>
          <p className="mt-4 text-white/40 max-w-lg mx-auto" style={{ fontFamily: FONT }}>
            Every plan includes receipts, payments, and tenant management. From $0 to $250/mo.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map(tier => (
            <div key={tier.key} className={`relative rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 ${
              tier.highlighted
                ? "bg-indigo-600 border border-indigo-400/50 shadow-2xl shadow-indigo-500/25 scale-[1.02]"
                : "bg-white/[0.03] border border-white/8 hover:border-white/15 hover:bg-white/[0.05]"
            }`}>
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase" style={{ fontFamily: FONT }}>
                  Most Popular
                </div>
              )}
              <div>
                <div className={`text-xs font-bold mb-3 uppercase tracking-widest ${tier.highlighted ? "text-indigo-200" : "text-white/30"}`} style={{ fontFamily: FONT }}>{tier.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white" style={{ fontFamily: FONT }}>${tier.priceUsd}</span>
                  <span className={`text-sm ml-0.5 ${tier.highlighted ? "text-indigo-200" : "text-white/30"}`} style={{ fontFamily: FONT }}>/mo</span>
                </div>
                <p className={`text-xs mt-2 leading-relaxed ${tier.highlighted ? "text-indigo-200" : "text-white/30"}`} style={{ fontFamily: FONT }}>{tier.tagline}</p>
              </div>
              <ul className="space-y-2.5 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${tier.highlighted ? "text-white" : "text-indigo-400"}`} />
                    <span className={tier.highlighted ? "text-indigo-100" : "text-white/50"} style={{ fontFamily: FONT }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`mt-2 h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                tier.highlighted ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
              }`} style={{ fontFamily: FONT }}>
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
    <section className="bg-[#080808] py-32 px-6 border-t border-white/5">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-black text-white tracking-tighter leading-tight" style={{ fontSize: "clamp(44px, 7vw, 88px)", fontFamily: FONT }}>
          Ready to modernise<br /><span className="text-indigo-400">your portfolio?</span>
        </h2>
        <p className="mt-6 text-lg text-white/40 leading-relaxed" style={{ fontFamily: FONT }}>
          Join property managers across Zimbabwe who run their books on Rental. Sign up in under 5 minutes — no credit card needed.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/register" className="h-14 px-10 rounded-full bg-indigo-600 text-white font-bold text-base hover:bg-indigo-500 transition-colors inline-flex items-center gap-2 shadow-lg shadow-indigo-500/25" style={{ fontFamily: FONT }}>
            Create free account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="h-14 px-10 rounded-full border border-white/10 text-white/50 font-medium text-base hover:border-white/25 hover:text-white transition-all inline-flex items-center" style={{ fontFamily: FONT }}>
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────── */
function Footer() {
  const year = new Date().getFullYear();
  const columns = [
    { heading: "Product", links: [["Features","#features"],["Pricing","#pricing"],["How it works","#how-it-works"]] },
    { heading: "Platform", links: [["Dashboard","/dashboard/overview"],["Applications","/dashboard/applications"],["Payments","/dashboard/payments"],["Reports","/dashboard/reports"]] },
    { heading: "Account", links: [["Sign in","/login"],["Register","/register"],["Settings","/dashboard/settings"],["Billing","/dashboard/settings?tab=subscription"]] },
  ];
  return (
    <footer className="bg-[#050505] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 mb-16">
          <div className="md:w-64 shrink-0">
            <span className="block text-white font-black text-xl mb-4" style={{ fontFamily: FONT }}>Rental</span>
            <p className="text-sm text-white/30 leading-relaxed" style={{ fontFamily: FONT }}>
              Property management built for Zimbabwean agents. Manage tenants, collect rent, generate receipts.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
            {columns.map(col => (
              <div key={col.heading}>
                <h4 className="text-xs font-bold tracking-[0.15em] text-white/25 uppercase mb-5" style={{ fontFamily: FONT }}>{col.heading}</h4>
                <ul className="space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-white/40 hover:text-white transition-colors" style={{ fontFamily: FONT }}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-xs text-white/20" style={{ fontFamily: FONT }}>© {year} Rental. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="text-xs text-white/20" style={{ fontFamily: FONT }}>🇿🇼 Zimbabwe</span>
            <span className="h-3 w-px bg-white/10" />
            <span className="text-xs text-white/20" style={{ fontFamily: FONT }}>ZiG + USD</span>
            <span className="h-3 w-px bg-white/10" />
            <span className="text-xs text-white/20" style={{ fontFamily: FONT }}>Built for agents</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────── */
export default function RentalLandingClient({ tiers }: { tiers: readonly SubscriptionTier[] }) {
  return (
    <div style={{ fontFamily: FONT, overflowX: "hidden" }}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing tiers={tiers} />
      <CTA />
      <Footer />
    </div>
  );
}
