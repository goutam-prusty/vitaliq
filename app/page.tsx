import Link from "next/link";
import {
  ArrowRight,
  Activity,
  Code,
  Database,
  Layout,
  Shield,
  Cpu,
  RefreshCw,
  Layers,
} from "lucide-react";
import { Button, SecondaryButton } from "@/components/ui";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))] overflow-x-hidden relative">
      {/* Subtle background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-[rgb(var(--accent-soft))]/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[40%] aspect-square rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[rgb(var(--bg))]/80 border-b border-[rgb(var(--border))]/50">
        <div className="flex items-center justify-between p-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgb(var(--accent-soft))] flex items-center justify-center border border-[rgb(var(--accent))/15]">
              <Activity className="h-5 w-5 text-[rgb(var(--accent))]" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Vitaliq
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
            >
              Sign In
            </Link>
            <Link href="/api/auth/demo">
              <Button className="h-9 px-4 text-sm font-medium shadow-sm">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-36 relative z-10">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-8 pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] text-xs text-[rgb(var(--muted))] font-medium select-none shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent))] animate-pulse" />
            V1.0 Live Demo
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl leading-[1.1] text-balance">
            Health analytics for the <br />
            <span className="bg-gradient-to-r from-[rgb(var(--text))] via-[rgb(var(--accent))] to-[rgb(var(--accent))] bg-clip-text text-transparent">
              long term.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[rgb(var(--muted))] max-w-2xl mx-auto leading-relaxed text-balance">
            Vitaliq is a modern, privacy-focused dashboard designed to track
            your metabolic and cardiovascular health journeys without the noise.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/api/auth/demo" className="w-full sm:w-auto">
              <Button className="h-12 px-8 text-base font-medium shadow-md shadow-[rgb(var(--accent))]/10 w-full justify-center">
                Try Interactive Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-up" className="w-full sm:w-auto">
              <SecondaryButton className="h-12 px-8 text-base font-medium w-full justify-center">
                Create Account
              </SecondaryButton>
            </Link>
          </div>
        </section>

        {/* Dashboard Preview Mockup */}
        <section className="mx-auto w-full max-w-5xl transition-all duration-500 hover:scale-[1.005]">
          {/* Browser Container with border glow and high elevation */}
          <div className="relative rounded-2xl border border-[rgb(var(--border))]/80 bg-[rgb(var(--panel))] overflow-hidden shadow-2xl shadow-[rgb(var(--accent))]/5 transition-all duration-300 hover:border-[rgb(var(--border))]">
            {/* Browser Header Window Controls */}
            <div className="flex items-center justify-between h-12 px-4 border-b border-[rgb(var(--border))]/60 bg-[rgb(var(--panel-soft))]/60 backdrop-blur-sm select-none">
              {/* Colored Dots */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/20" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dfa123]/20" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/20" />
              </div>

              {/* URL Address Bar */}
              <div className="flex-1 max-w-md mx-auto h-7 px-4 flex items-center justify-center rounded bg-[rgb(var(--bg))]/90 text-xs font-mono text-[rgb(var(--muted))] border border-[rgb(var(--border))]/50 shadow-inner">
                <span className="opacity-50 mr-1 select-none">https://</span>
                vitaliq.app/dashboard
              </div>

              {/* Connection Status indicator */}
              <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted))] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected
              </div>
            </div>

            {/* Screenshot Frame with responsive height limitation */}
            <div className="relative bg-[rgb(var(--bg))] aspect-[16/10] sm:aspect-video overflow-hidden">
              <img
                src="/dashboard-preview.png"
                alt="Vitaliq Analytics Dashboard Preview"
                className="w-full h-full object-cover object-top select-none hover:scale-[1.01] transition-transform duration-[2000ms] ease-out"
              />
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
              Built for Performance
            </h2>
            <p className="text-[rgb(var(--muted))] text-base sm:text-lg leading-relaxed">
              A modern, robust stack designed for minimal latency, secure
              authentication, and developer experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-[rgb(var(--border))]/85 bg-[rgb(var(--panel))] hover:bg-[rgb(var(--panel-soft))]/40 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--accent-soft))] hover:shadow-lg hover:shadow-black/5 group">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layout className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl tracking-tight">
                Next.js 15 & React 19
              </h3>
              <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                App Router architecture utilizing React Server Components (RSC)
                for minimal client-side Javascript bundle sizes and instant load
                times.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-[rgb(var(--border))]/85 bg-[rgb(var(--panel))] hover:bg-[rgb(var(--panel-soft))]/40 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--accent-soft))] hover:shadow-lg hover:shadow-black/5 group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl tracking-tight">
                Drizzle ORM & Postgres
              </h3>
              <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                Type-safe SQL queries compiled at build time using Neon
                serverless Postgres. Custom database connection pooling for
                sub-50ms query speeds.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-[rgb(var(--border))]/85 bg-[rgb(var(--panel))] hover:bg-[rgb(var(--panel-soft))]/40 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--accent-soft))] hover:shadow-lg hover:shadow-black/5 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl tracking-tight">
                Clerk Authentication
              </h3>
              <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                Enterprise-grade security protecting sensitive health
                credentials. Seamless instant-login demo generation utilizing
                custom signed JWT tokens.
              </p>
            </div>
          </div>
        </section>

        {/* Recruiter / Architecture Narrative */}
        <section className="max-w-4xl mx-auto p-10 rounded-3xl bg-[rgb(var(--panel-soft))]/50 border border-[rgb(var(--border))]/60 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--accent-soft))]/5 blur-2xl rounded-full" />

          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))] flex items-center justify-center border border-[rgb(var(--accent))/10]">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Project Architecture Note
              </h2>
              <p className="text-xs text-[rgb(var(--muted))]">
                Engineered with Clean Architecture Principles
              </p>
            </div>
          </div>

          <div className="space-y-6 text-[rgb(var(--muted))] text-sm sm:text-base leading-relaxed">
            <p>
              Vitaliq was engineered as a comprehensive portfolio application
              demonstrating production-ready frontend and backend patterns in
              the modern Next.js ecosystem.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 my-8 pt-4 border-t border-[rgb(var(--border))]/30">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[rgb(var(--text))] font-semibold">
                  <Layers className="h-4 w-4 text-[rgb(var(--accent))]" />
                  Domain-Driven Design (DDD)
                </div>
                <p className="text-xs leading-relaxed">
                  Data access is encapsulated in isolated Repository layers. All
                  core logic stays decoupled inside domain classes like{" "}
                  <code className="text-xs font-mono text-[rgb(var(--accent))] bg-[rgb(var(--panel))] px-1 py-0.5 rounded border border-[rgb(var(--border))]/50">
                    HealthDomain
                  </code>
                  , making the core math testable without framework wrappers.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[rgb(var(--text))] font-semibold">
                  <Cpu className="h-4 w-4 text-[rgb(var(--accent))]" />
                  Deterministic Analytics
                </div>
                <p className="text-xs leading-relaxed">
                  Calculations, trends, and target tracking are derived
                  algorithmically. Dynamic visualizations utilize customized{" "}
                  <code className="text-xs font-mono text-[rgb(var(--accent))] bg-[rgb(var(--panel))] px-1 py-0.5 rounded border border-[rgb(var(--border))]/50">
                    Recharts
                  </code>{" "}
                  layouts optimized for critical clinical values.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[rgb(var(--text))] font-semibold">
                  <RefreshCw className="h-4 w-4 text-[rgb(var(--accent))]" />
                  Token-based UI Tokens
                </div>
                <p className="text-xs leading-relaxed">
                  Built entirely on Tailwind CSS tokens with smooth spring
                  transitions, fluid light/dark mode compliance, and strict
                  typography rules. Zero third-party boilerplate.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[rgb(var(--text))] font-semibold">
                  <Activity className="h-4 w-4 text-[rgb(var(--accent))]" />
                  Instant Authentication
                </div>
                <p className="text-xs leading-relaxed">
                  Clerk is configured with a fully mockable environment and
                  custom JWT token bypass, allowing developers and recruiters to
                  review real-time database state instantly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgb(var(--border))]/40 py-12 text-center text-sm text-[rgb(var(--muted))] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[rgb(var(--accent))]" />
            <span className="font-semibold text-xs tracking-wider uppercase text-[rgb(var(--text))]">
              Vitaliq
            </span>
          </div>
          <p className="text-xs">
            Built as a production-grade portfolio demonstration.
          </p>
        </div>
      </footer>
    </div>
  );
}
