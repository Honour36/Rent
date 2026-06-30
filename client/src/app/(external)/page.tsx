import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Home, MessageSquare, PieChart, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">RentManager</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="container mx-auto px-4 text-center lg:px-8">
            <div className="mx-auto max-w-3xl space-y-8">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Property management built for <span className="text-primary">Zimbabwe</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Replace your spreadsheets and WhatsApp chaos. Manage units, track ZiG/USD payments, generate owner statements, and stay organized—all in one secure platform.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Start Managing Today <ArrowRight className="ml-2 size-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                    See Features
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted/30 py-24 border-y">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to run your portfolio</h2>
              <p className="mt-4 text-lg text-muted-foreground">Designed specifically for the way property managers operate locally.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Home className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Centralized Dashboard</h3>
                <p className="text-muted-foreground">Track all your properties, units, and tenants in one secure system. Say goodbye to lost data and endless spreadsheets.</p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Receipt className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Dual-Currency Payments</h3>
                <p className="text-muted-foreground">Record rent in both USD and ZiG. Instantly generate and send professional PDF receipts via WhatsApp or email.</p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Integrated Comms</h3>
                <p className="text-muted-foreground">Send bulk WhatsApp reminders directly from the app. Keep a logged history of all communication with your tenants.</p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <PieChart className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Owner Statements</h3>
                <p className="text-muted-foreground">Automate month-end reporting. Generate accurate statements calculating rent collected, fees, and maintenance deductions instantly.</p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Tenant Vetting</h3>
                <p className="text-muted-foreground">Share public application links via WhatsApp. Review applications, vet tenants, and approve them seamlessly into the system.</p>
              </div>
              
              <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">PWA Offline Support</h3>
                <p className="text-muted-foreground">Continue to record payments even during load shedding. Your data syncs automatically as soon as your connection is restored.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 lg:px-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            <span className="font-semibold tracking-tight">RentManager</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RentManager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
