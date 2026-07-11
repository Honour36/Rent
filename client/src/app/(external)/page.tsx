import Link from "next/link";
import { APP_CONFIG } from "@/config/app-config";
import { SUBSCRIPTION_TIERS } from "@/config/subscription-tiers";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

/* ─── HERO ─────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* top rule */}
      <div className="h-px w-full bg-[#1a56db]" />

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        {/* logo row */}
        <div className="flex items-center gap-3 mb-14">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a56db] text-white font-black text-xl leading-none">Hi</span>
          <span className="text-sm font-semibold tracking-[0.15em] text-slate-400 uppercase">Property Manager</span>
        </div>

        {/* headline */}
        <h1
          className="font-black text-[#0f172a] leading-[0.9] tracking-tighter"
          style={{ fontSize: "clamp(64px, 10vw, 128px)" }}
        >
          Hi.<br />
          <span className="text-[#1a56db]">Your properties</span><br />
          are waiting.
        </h1>

        <p className="mt-8 max-w-xl text-lg text-slate-500 leading-relaxed">
          The modern property management platform built for Zimbabwean agents.
          Collect rent, generate receipts, manage tenants and send owner statements
          — without the spreadsheets.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/register"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#1a56db] px-8 text-sm font-semibold text-white hover:bg-[#1648c8] transition-colors"
          >
            Get started free →
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-200 px-8 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-5 text-xs text-slate-400">
          No credit card required · Free tier available · Set up in 5 minutes
        </p>
      </div>

      {/* decorative rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100" />
    </section>
  );
}

/* ─── STATS ─────────────────────────────────────────────────── */
function Stats() {
  const items = [
    { value: "5 min", label: "to set up your first property" },
    { value: "$0", label: "to start — no card needed" },
    { value: "100%", label: "data stays in your account" },
    { value: "ZiG + USD", label: "dual currency support" },
  ];
  return (
    <section className="border-y border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-2 gap-8 md:grid-cols-4">
        {items.map((s) => (
          <div key={s.label}>
            <div className="text-3xl font-black text-[#1a56db] tracking-tight">{s.value}</div>
            <div className="mt-1 text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── FEATURES ──────────────────────────────────────────────── */
function Features() {
  const features = [
    {
      tag: "Properties",
      title: "Everything in one place",
      body: "Add properties, units, and owners. Track vacant and occupied units at a glance. Generate application links to share with prospective tenants instantly.",
      detail: ["Multi-unit properties", "Vacancy tracking", "Owner profiles", "Application links"],
    },
    {
      tag: "Payments",
      title: "Receipts that look professional",
      body: "Record payments in USD or ZiG. Print receipts that include your company details, tenant name, lease ID, and property address — just like the physical receipt from your old system.",
      detail: ["Cash, EcoCash, InnBucks", "Dual currency", "PDF receipts", "Owner notifications"],
    },
    {
      tag: "Applications",
      title: "Tenant applications, handled",
      body: "Share a link, collect applications online. The form covers every field from the standard Zimbabwean tenancy form — ID upload, guarantor, employment, trade references.",
      detail: ["Custom application form", "ID document upload", "Link auto-expires", "Review & approve"],
    },
    {
      tag: "Reports",
      title: "Statements that keep owners happy",
      body: "Generate owner statements, arrears reports, lease expiry alerts, and trust ledger summaries. Dispatch directly via email or WhatsApp.",
      detail: ["Owner statements", "Arrears report", "Lease expiry", "Trust ledger"],
    },
    {
      tag: "Communications",
      title: "Reach tenants where they are",
      body: "Send rent reminders, payment notifications, and maintenance updates by email or WhatsApp. Templates included — customise to match your agency voice.",
      detail: ["Email via Resend", "WhatsApp (wa.me)", "Bulk reminders", "Communication log"],
    },
    {
      tag: "Compliance",
      title: "Audit-ready from day one",
      body: "Every action is logged. Receipts stored in the cloud. VAT numbers on every document. Your account details printed on every receipt exactly as regulators expect.",
      detail: ["Cloud document storage", "VAT-compliant receipts", "Signed URLs", "Role-based access"],
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-[0.15em] text-[#1a56db] uppercase mb-3">What Hi does</p>
          <h2 className="text-4xl font-black text-[#0f172a] tracking-tight leading-tight max-w-lg">
            Every tool a property agent needs. Nothing they don't.
          </h2>
        </div>

        <div className="grid gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.tag} className="bg-white p-8 flex flex-col gap-4">
              <span className="inline-flex w-fit rounded-full bg-[#e8f0fe] px-3 py-0.5 text-xs font-semibold text-[#1a56db]">{f.tag}</span>
              <h3 className="text-lg font-bold text-[#0f172a]">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">{f.body}</p>
              <ul className="mt-2 space-y-1.5">
                {f.detail.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1a56db] shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ──────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n: "1", title: "Register your agency", body: "Sign up, verify your email, and fill in your company details. It takes under 5 minutes." },
    { n: "2", title: "Add your properties", body: "Add properties and units. Assign owners. For single-unit properties, one click creates the unit automatically." },
    { n: "3", title: "Share application links", body: "Each unit gets a shareable link. Prospective tenants fill in the standard Zimbabwean tenancy application form online. The link expires after submission." },
    { n: "4", title: "Move in and collect rent", body: "Approve applications, activate leases, and record rent payments. Generate and email receipts instantly. Notify owners with one click." },
  ];

  return (
    <section className="bg-[#0f172a] text-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-semibold tracking-[0.15em] text-[#60a5fa] uppercase mb-3">How it works</p>
        <h2 className="text-4xl font-black tracking-tight leading-tight mb-16 max-w-lg">
          From zero to<br />
          <span className="text-[#60a5fa]">first receipt</span> in a day.
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(100%+8px)] right-[-8px] h-px bg-white/10" />
              )}
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a56db] text-white font-black text-sm">{s.n}</div>
              <h3 className="font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING ───────────────────────────────────────────────── */
function Pricing() {
  return (
    <section className="bg-slate-50 py-24 border-t border-slate-100">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-semibold tracking-[0.15em] text-[#1a56db] uppercase mb-3">Pricing</p>
        <h2 className="text-4xl font-black text-[#0f172a] tracking-tight mb-4">
          Start free. Grow when ready.
        </h2>
        <p className="text-slate-500 mb-14 max-w-lg">Every plan includes the core — receipts, payments, and tenant management. Upgrade when your portfolio grows.</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {SUBSCRIPTION_TIERS.map((tier) => (
            <div
              key={tier.key}
              className={`rounded-xl border bg-white p-6 flex flex-col gap-4 ${tier.highlighted ? "border-[#1a56db] shadow-lg shadow-blue-100" : "border-slate-200"}`}
            >
              {tier.highlighted && (
                <span className="inline-flex w-fit rounded-full bg-[#1a56db] px-3 py-0.5 text-xs font-semibold text-white">Most Popular</span>
              )}
              <div>
                <div className="text-sm font-semibold text-slate-500">{tier.name}</div>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-4xl font-black text-[#0f172a]">${tier.priceUsd}</span>
                  <span className="mb-1 text-slate-400 text-sm">/mo</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{tier.tagline}</p>
              </div>
              <ul className="space-y-2 flex-1">
                {tier.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#1a56db] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-2 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors ${
                  tier.highlighted
                    ? "bg-[#1a56db] text-white hover:bg-[#1648c8]"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tier.priceUsd === 0 ? "Start for free" : `Choose ${tier.name}`}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ───────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="bg-[#1a56db] py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-5xl font-black text-white tracking-tight leading-tight mb-5">
          Ready to say Hi?
        </h2>
        <p className="text-blue-200 text-lg mb-10 leading-relaxed">
          Join property managers across Zimbabwe who run their portfolios on Hi.
          Sign up free — no credit card, no setup fee.
        </p>
        <Link
          href="/register"
          className="inline-flex h-14 items-center gap-2 rounded-xl bg-white px-10 text-base font-bold text-[#1a56db] hover:bg-blue-50 transition-colors shadow-lg"
        >
          Create your free account →
        </Link>
        <p className="mt-5 text-sm text-blue-300">
          Already have an account? <Link href="/login" className="text-white underline underline-offset-2">Sign in</Link>
        </p>
      </div>
    </section>
  );
}

/* ─── FOOTER ────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-400 py-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#1a56db] text-white font-black text-sm">Hi</span>
          <span className="text-sm font-medium text-slate-300">Hi Property Manager</span>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
          <Link href="/dashboard/settings?tab=subscription" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <p className="text-xs">{APP_CONFIG.copyright}</p>
      </div>
    </footer>
  );
}

/* ─── PAGE ──────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
