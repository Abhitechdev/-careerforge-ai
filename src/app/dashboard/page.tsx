"use client";

import * as React from "react";
import {
  ArrowUpRight, ArrowDownRight, Briefcase,
  FileText, Target, TrendingUp, Activity,
  Clock, Bookmark, Send, Calendar, Compass, ArrowRight, Sun, Zap, CheckCircle2
} from "lucide-react";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import * as motion from "framer-motion/client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CareerHealthRing } from "@/components/career-health-ring";
import { SkillRadarChart } from "@/components/skill-radar-chart";
import { ForgeAssistantWidget } from "@/components/forge-assistant-widget";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const analyticsData = [
  { name: "Jan", applications: 4, interviews: 1 },
  { name: "Feb", applications: 12, interviews: 2 },
  { name: "Mar", applications: 15, interviews: 5 },
  { name: "Apr", applications: 8, interviews: 3 },
  { name: "May", applications: 20, interviews: 8 },
  { name: "Jun", applications: 18, interviews: 7 },
];

const pipeline = [
  { label: "Applied", count: 24, color: "#818cf8" },
  { label: "Interview", count: 3, color: "#22d3ee" },
  { label: "Offer", count: 1, color: "#22c55e" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border px-3 py-2 text-xs" style={{ background: "#18181b", borderColor: "#27272a" }}>
        <p className="text-zinc-400 mb-1 font-medium">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-zinc-400 capitalize">{p.name}:</span>
            <span className="font-mono font-semibold text-white">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const intelligence = useQuery(api.intelligence.getCurrentIntelligence, isLoaded && user ? { clerkId: user.id } : "skip");
  const takeSnapshot = useMutation(api.intelligence.takeSnapshot);

  // Take a snapshot once per session on mount for demo purposes
  React.useEffect(() => {
    if (isLoaded && user && intelligence === null) {
      takeSnapshot({ clerkId: user.id }).catch(() => {});
    }
  }, [isLoaded, user, intelligence, takeSnapshot]);

  const kpis = intelligence ? [
    { title: "Career Health", value: intelligence.careerHealth, unit: "%", change: intelligence.careerHealthChange > 0 ? `+${intelligence.careerHealthChange}%` : `${intelligence.careerHealthChange}%`, up: intelligence.careerHealthChange >= 0, icon: Activity, accent: "accent-green" },
    { title: "Avg ATS Score", value: intelligence.atsScore || "N/A", unit: "/100", change: intelligence.atsScoreChange > 0 ? `+${intelligence.atsScoreChange}` : `${intelligence.atsScoreChange}`, up: intelligence.atsScoreChange >= 0, icon: Target, accent: "accent-indigo" },
    { title: "Applications", value: intelligence.applicationsCount, unit: "", change: intelligence.applicationsChange > 0 ? `+${intelligence.applicationsChange}` : `${intelligence.applicationsChange}`, up: intelligence.applicationsChange >= 0, icon: Briefcase, accent: "accent-cyan" },
    { title: "Job Match Avg", value: intelligence.jobMatchScore || "N/A", unit: "%", change: "0%", up: true, icon: TrendingUp, accent: "accent-amber" },
  ] : [
    { title: "Career Health", value: "--", unit: "%", change: "--", up: true, icon: Activity, accent: "accent-green" },
    { title: "Avg ATS Score", value: "--", unit: "/100", change: "--", up: true, icon: Target, accent: "accent-indigo" },
    { title: "Applications", value: "--", unit: "", change: "--", up: true, icon: Briefcase, accent: "accent-cyan" },
    { title: "Job Match Avg", value: "--", unit: "%", change: "--", up: true, icon: TrendingUp, accent: "accent-amber" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight">Command Center</h1>
          <p className="text-sm mt-0.5" style={{ color: "#71717a" }}>
            Your career intelligence overview
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => user && takeSnapshot({ clerkId: user.id })}
            className="inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-bold text-zinc-300 transition-all hover:bg-white/5 w-full sm:w-auto"
            style={{ borderColor: "#3f3f46" }}
          >
            <Activity className="mr-2 h-3.5 w-3.5 text-zinc-500" />
            Refresh Data
          </button>
          <Link
            href="/dashboard/upload"
            className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-bold text-white transition-all hover:opacity-90 w-full sm:w-auto"
            style={{ background: "#6366f1" }}
          >
            <FileText className="mr-2 h-3.5 w-3.5" />
            Analyze New Resume
          </Link>
        </div>
      </motion.div>

      {/* ── Daily Briefing Widget ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="os-card p-6 flex flex-col md:flex-row gap-6 items-center"
        style={{ background: "linear-gradient(145deg, rgba(17,17,19,1) 0%, rgba(9,9,11,1) 100%)", border: "1px solid rgba(129,140,248,0.15)" }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8" }}>
          <Sun className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: "#818cf8" }}>Daily Career Briefing</p>
          <h2 className="text-xl font-bold mt-1 text-zinc-200">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName || "User"}
          </h2>
          <div className="flex flex-wrap gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-zinc-400">
              <Activity className="h-4 w-4 text-emerald-500" />
              Career Health: <strong className="text-emerald-500">{intelligence?.careerHealth || "--"}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-sm text-zinc-400">
              <Zap className="h-4 w-4 text-amber-500" />
              Potential Gain: <strong className="text-amber-500">+3 Health</strong>
            </span>
          </div>
        </div>
        <div className="md:w-64 w-full shrink-0">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Today's Priorities</p>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2 text-sm text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Apply to 3 jobs
            </li>
            <li className="flex items-center gap-2 text-sm text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Complete React Module 5
            </li>
            <li className="flex items-center gap-2 text-sm text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Practice Interview Question
            </li>
          </ul>
        </div>
      </motion.div>

      {/* ── Hero: Career Health + Hiring Probability ── */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Career Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 os-card forge-ambient p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color: "#818cf8" }} />
              <h2 className="text-sm font-bold text-zinc-200">Career Health Trend</h2>
            </div>
            <Link href="/dashboard/intelligence" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              View History →
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-2">
            {intelligence ? (
              <CareerHealthRing
                score={intelligence.careerHealth}
                size={148}
                showBreakdown={true}
                breakdown={{ 
                  resume: intelligence.atsScore || 0, 
                  skills: intelligence.skillCoverage || 0, 
                  interviews: intelligence.interviewScore || 0, 
                  tasks: 100 // placeholder
                }}
                label="Current Status"
              />
            ) : (
              <div className="animate-pulse h-36 w-36 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
            )}
          </div>
        </motion.div>

        {/* Hiring Probability */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-3 os-card p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-5">
            <Target className="h-4 w-4" style={{ color: "#22d3ee" }} />
            <h2 className="text-sm font-bold text-zinc-200">Hiring Probability</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6 flex-1 items-center justify-center py-4">
            <div className="relative flex items-center justify-center h-32 w-32 shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)" }} />
              <svg className="absolute inset-0 h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                <circle style={{ stroke: "#27272a" }} strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                <motion.circle stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="170 251.2" transform="rotate(0 50 50)"
                  style={{ filter: "drop-shadow(0 0 6px #22d3ee88)" }}
                />
              </svg>
              <span className="text-4xl font-black font-mono text-cyan-400">{intelligence?.hiringProbability || "--"}%</span>
            </div>
            <div className="flex-1 space-y-4 max-w-sm">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Status</p>
                <p className="text-xl font-bold" style={{ color: intelligence && intelligence.hiringProbability >= 85 ? "#22c55e" : intelligence && intelligence.hiringProbability >= 70 ? "#22d3ee" : "#f59e0b" }}>
                  {intelligence?.hiringStatus || "Calculating..."}
                </p>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1 text-zinc-400">
                    <span>ATS Score</span>
                    <span className="font-mono">{intelligence?.atsScore || "--"}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${intelligence?.atsScore || 0}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 text-zinc-400">
                    <span>Interview Readiness</span>
                    <span className="font-mono">{intelligence?.interviewScore || "--"}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${intelligence?.interviewScore || 0}%` }} /></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── KPI Strip ───────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.05 }}
            className={`stat-card ${kpi.accent} p-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-zinc-500">{kpi.title}</p>
              <kpi.icon className="h-4 w-4 text-zinc-600" />
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-3xl font-black font-mono leading-none text-white">
                {kpi.value}
              </span>
              <span className="text-sm text-zinc-500 mb-0.5">{kpi.unit}</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {kpi.up ? (
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span
                className="text-xs font-semibold"
                style={{ color: kpi.up ? "#22c55e" : "#ef4444" }}
              >
                {kpi.change}
              </span>
              <span className="text-xs text-zinc-600">vs last snapshot</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Skill Radar + Forge Advisor ─────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Skill Gap Radar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2 os-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: "#22d3ee" }} />
              <h3 className="text-sm font-bold text-zinc-200">Skill Gap Radar</h3>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{ background: "rgba(34,211,238,0.08)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.15)" }}
            >
              Frontend Engineer
            </span>
          </div>
          <SkillRadarChart targetRole="Frontend Engineer" />
        </motion.div>

        {/* Forge Assistant Widget */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex flex-col gap-4"
        >
          <ForgeAssistantWidget
            advisorName="Forge"
            insights={[
              "Your Hiring Probability is nearing 'Strong Candidate' status.",
              "Add Docker to your skills — 78% of target roles require it.",
              "Your ATS score drops below 70 for Backend roles. Update your resume.",
            ]}
          />

          {/* Weekly Progress Widget */}
          <div className="os-card flex-1 p-5">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Weekly Progress
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">ATS Score</span>
                <span className="text-sm font-mono font-bold text-emerald-400">+4</span>
              </div>
              <div className="h-px bg-zinc-800/50" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Applications</span>
                <span className="text-sm font-mono font-bold text-emerald-400">+7</span>
              </div>
              <div className="h-px bg-zinc-800/50" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Interview Score</span>
                <span className="text-sm font-mono font-bold text-emerald-400">+5</span>
              </div>
            </div>
            <Link href="/dashboard/reports" className="block mt-6 text-center text-xs text-indigo-400 font-medium hover:text-indigo-300">
              View Full Report →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
