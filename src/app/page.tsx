"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Target, BrainCircuit, Star, TrendingUp, FileText, Users } from "lucide-react";
import * as motion from "framer-motion/client";
import { CareerHealthRing } from "@/components/career-health-ring";

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: BrainCircuit,
    title: "AI Career Intelligence",
    description:
      "Forge AI analyzes your resume, maps skill gaps, and generates personalized career strategies in real time.",
    accent: "#818cf8",
  },
  {
    icon: Target,
    title: "Precision Job Matching",
    description:
      "Semantic matching connects you to roles where your probability of success is highest — not just keyword matches.",
    accent: "#22d3ee",
  },
  {
    icon: Zap,
    title: "Interview Command Center",
    description:
      "Role-specific mock interviews with AI feedback. Practice, improve, and enter every interview prepared.",
    accent: "#a78bfa",
  },
];




const briefingItems = [
  { icon: TrendingUp, color: "#22c55e", text: "Senior Frontend Engineer at Vercel — 94% match", tag: "New Match" },
  { icon: FileText, color: "#818cf8", text: "ATS Score improved by +12 pts after resume tweak", tag: "Progress" },
  { icon: Users, color: "#a78bfa", text: "3 recruiters viewed your profile this week", tag: "Visibility" },
  { icon: Target, color: "#f59e0b", text: "Docker skill gap: 78% of target roles require it", tag: "Gap Alert" },
];

const terminalLines = [
  { delay: 0,   text: "$ forge analyze resume.pdf",          color: "#71717a" },
  { delay: 0.8, text: "✓ Parsing document...   done",          color: "#22c55e" },
  { delay: 1.4, text: "✓ Running ATS analysis... done",        color: "#22c55e" },
  { delay: 2.0, text: "✓ Matching 847 live roles... done",     color: "#22c55e" },
  { delay: 2.6, text: "→ ATS Score: 82/100  (+14 from last)", color: "#818cf8" },
  { delay: 3.0, text: "→ Top Match: Sr. Frontend @ Vercel (94%)", color: "#818cf8" },
  { delay: 3.4, text: "→ Skill Gap: Docker, CI/CD, AWS",      color: "#f59e0b" },
  { delay: 3.8, text: "Roadmap generated. Ready.",             color: "#22c55e" },
];

// ─── Components ──────────────────────────────────────────────────────────────

function TerminalWidget() {
  return (
    <div
      className="rounded-xl border overflow-hidden font-mono text-sm flex-1"
      style={{
        background: "#0d0d0f",
        borderColor: "#27272a",
        boxShadow: "0 0 40px rgba(99,102,241,0.1)",
      }}
    >
      {/* Window bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "#1e1e21", background: "#111113" }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs" style={{ color: "#3f3f46" }}>
          forge — career-os
        </span>
      </div>
      {/* Terminal content */}
      <div className="p-5 space-y-1.5" style={{ minHeight: 230 }}>
        {terminalLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: line.delay, duration: 0.25 }}
            className="text-xs leading-relaxed"
            style={{ color: line.color }}
          >
            {line.text}
          </motion.div>
        ))}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.2 }}
          className="terminal-cursor text-xs"
          style={{ color: "#818cf8" }}
        >
          &nbsp;
        </motion.span>
      </div>
    </div>
  );
}

function ForgeAvatar() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="flex flex-col items-center gap-3"
    >
      {/* Avatar with pulse ring */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full overflow-hidden border-2 forge-ring-pulse"
          style={{ borderColor: "rgba(129,140,248,0.5)" }}
        >
          <Image src="/forge.png" alt="Forge AI" fill className="object-cover" />
        </div>
        {/* Online indicator */}
        <span
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
          style={{ background: "#09090b", borderColor: "#09090b" }}
        >
          <span className="ai-pulse" />
        </span>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold" style={{ color: "#818cf8" }}>
          Forge
        </p>
        <p className="text-[10px]" style={{ color: "#3f3f46" }}>
          AI Advisor
        </p>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex h-14 items-center justify-between px-6"
        style={{
          background: "rgba(9,9,11,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo-icon.png"
            alt="CareerForge AI"
            width={26}
            height={26}
            className="rounded-md"
          />
          <span className="font-bold tracking-tight text-sm text-white">
            CareerForge
            <sup className="ml-0.5 text-[10px] font-semibold" style={{ color: "#818cf8" }}>
              OS
            </sup>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-500">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>

          <Link href="#briefing" className="hover:text-white transition-colors">Today</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/upload"
            className="text-xs font-semibold px-4 py-2 rounded-md text-white transition-all hover:opacity-90"
            style={{ background: "#6366f1" }}
          >
            Analyze My Resume
          </Link>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────── */}
        <section className="relative overflow-hidden px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          {/* Background ambient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.13) 0%, transparent 60%)",
            }}
          />
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: "radial-gradient(circle, #27272a 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="container relative mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-14 items-center">

              {/* Left: Copy */}
              <div>
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-mono font-semibold mb-8"
                  style={{
                    background: "rgba(129,140,248,0.08)",
                    color: "#818cf8",
                    border: "1px solid rgba(129,140,248,0.2)",
                  }}
                >
                  <span
                    className="ai-pulse"
                    style={{ background: "#818cf8", boxShadow: "0 0 0 0 rgba(129,140,248,0.6)" }}
                  />
                  AI CAREER OPERATING SYSTEM
                </motion.div>

                {/* H1 */}
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.07 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
                >
                  Your career,{" "}
                  <span className="forge-gradient">operating at</span>
                  <br />
                  full intelligence.
                </motion.h1>

                {/* Sub */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.14 }}
                  className="text-lg leading-relaxed mb-10 max-w-lg"
                  style={{ color: "#a1a1aa" }}
                >
                  CareerForge is the Cursor for your career — an AI-native operating system
                  that analyzes your resume, maps skill gaps, and builds a precision path
                  to your dream role.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.22 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Link
                    href="/dashboard/upload"
                    className="inline-flex h-12 items-center justify-center rounded-lg px-8 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: "#6366f1" }}
                  >
                    Analyze My Resume
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex h-12 items-center justify-center rounded-lg border px-8 text-sm font-medium transition-all hover:text-white hover:border-zinc-500"
                    style={{ borderColor: "#3f3f46", color: "#a1a1aa", background: "transparent" }}
                  >
                    See how it works
                  </Link>
                </motion.div>

                {/* Career Health Ring */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-10 inline-flex items-center gap-6 rounded-xl px-6 py-4"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <CareerHealthRing score={85} size={80} strokeWidth={7} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#52525b" }}>
                      Sample Career Health
                    </p>
                    <p className="text-sm font-semibold text-white">Strong Candidate</p>
                    <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>
                      Resume · Skills · Interviews · Tasks
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Right: Terminal + Forge avatar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex gap-4 items-start"
              >
                <TerminalWidget />
                <ForgeAvatar />
              </motion.div>
            </div>
          </div>
        </section>


        {/* ── Dashboard Preview ──────────────────────── */}
        <section className="container mx-auto max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center mb-12"
          >
            <span
              className="text-xs font-mono font-semibold uppercase tracking-widest"
              style={{ color: "#818cf8" }}
            >
              The Interface
            </span>
            <h2 className="mt-3 text-4xl font-black tracking-tight">
              A command center for your career.
            </h2>
            <p className="mt-4 max-w-xl mx-auto" style={{ color: "#71717a" }}>
              Not a form. Not a checklist. A living, breathing AI dashboard that evolves
              with every application, interview, and skill you add.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(99,102,241,0.2)",
              boxShadow: "0 0 80px rgba(99,102,241,0.12), 0 40px 80px rgba(0,0,0,0.5)",
            }}
          >
            {/* Top glow line */}
            <div
              className="absolute top-0 left-0 right-0 h-px z-10"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.6), transparent)",
              }}
            />
            <Image
              src="/dashboard-preview.png"
              alt="CareerForge AI Dashboard"
              width={1280}
              height={720}
              className="w-full h-auto"
              priority
            />
          </motion.div>
        </section>

        {/* ── Today's Career Briefing ────────────────── */}
        <section
          id="briefing"
          className="border-y py-16"
          style={{ borderColor: "rgba(255,255,255,0.05)", background: "#111113" }}
        >
          <div className="container mx-auto max-w-5xl px-6">
            <div className="flex flex-col md:flex-row md:items-center gap-10">
              {/* Left: label + forge */}
              <div className="md:w-56 shrink-0 flex flex-col gap-4">
                <div>
                  <p
                    className="text-xs font-mono font-bold uppercase tracking-widest mb-2"
                    style={{ color: "#818cf8" }}
                  >
                    Live Briefing
                  </p>
                  <h2 className="text-2xl font-black tracking-tight leading-tight">
                    Today&apos;s Career<br />Intelligence
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden border-2 forge-ring-pulse shrink-0"
                    style={{ borderColor: "rgba(129,140,248,0.5)" }}
                  >
                    <Image src="/forge.png" alt="Forge AI" width={40} height={40} className="object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "#818cf8" }}>Forge</p>
                    <p className="text-[10px]" style={{ color: "#52525b" }}>Analyzing now</p>
                  </div>
                </div>
              </div>

              {/* Right: briefing items */}
              <div className="flex-1 grid sm:grid-cols-2 gap-3">
                {briefingItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
                    className="flex items-start gap-3 rounded-xl p-4 transition-colors hover:bg-white/[0.03]"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: item.color + "18", color: item.color }}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "#e4e4e7" }}>
                        {item.text}
                      </p>
                      <span
                        className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{ background: item.color + "15", color: item.color }}
                      >
                        {item.tag}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────── */}
        <section id="features" className="container mx-auto max-w-5xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-14 text-center"
          >
            <span
              className="text-xs font-mono font-semibold uppercase tracking-widest"
              style={{ color: "#818cf8" }}
            >
              What&apos;s inside
            </span>
            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Built for precision. Designed for speed.
            </h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: "#71717a" }}>
              Every tool in CareerForge is purpose-built for one outcome — landing
              the role you deserve, faster.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="os-card-interactive p-7"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ background: feature.accent + "18", color: feature.accent }}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#71717a" }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>



        {/* ── CTA Banner ─────────────────────────────── */}
        <section className="container mx-auto max-w-5xl px-6 py-24">
          <div
            className="rounded-2xl border p-14 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(167,139,250,0.05) 100%)",
              borderColor: "rgba(99,102,241,0.2)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(99,102,241,0.14) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10">
              {/* Forge avatar above CTA */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-3 rounded-full px-4 py-2"
                  style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.15)" }}
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border forge-ring-pulse" style={{ borderColor: "rgba(129,140,248,0.5)" }}>
                    <Image src="/forge.png" alt="Forge" width={28} height={28} className="object-cover" />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "#818cf8" }}>
                    Forge is ready to analyze your resume
                  </span>
                  <span className="ai-pulse" />
                </div>
              </div>

              <h2 className="text-4xl font-black tracking-tight mb-4">
                Ready to operate at{" "}
                <span className="forge-gradient">full intelligence?</span>
              </h2>
              <p className="mb-8 max-w-md mx-auto" style={{ color: "#71717a" }}>
                Join 12,000+ engineers, designers, and PMs using CareerForge to navigate
                their career with precision.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard/upload"
                  className="inline-flex h-12 items-center justify-center rounded-lg px-8 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "#6366f1" }}
                >
                  Analyze My Resume — Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center rounded-lg border px-8 text-sm font-medium transition-all hover:text-white hover:border-zinc-500"
                  style={{ borderColor: "#3f3f46", color: "#a1a1aa", background: "transparent" }}
                >
                  Explore Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer
        className="border-t py-8"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "#111113" }}
      >
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row px-6 text-sm" style={{ color: "#52525b" }}>
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="CareerForge AI" width={16} height={16} className="rounded" />
            <span className="font-semibold" style={{ color: "#71717a" }}>CareerForge AI</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
