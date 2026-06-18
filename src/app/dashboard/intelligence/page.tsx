"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from "recharts";
import * as motion from "framer-motion/client";
import { Activity, Target, Briefcase, TrendingUp, Users } from "lucide-react";

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

export default function IntelligencePage() {
  const { user, isLoaded } = useUser();
  const snapshotsRaw = useQuery(api.intelligence.getSnapshots, isLoaded && user ? { clerkId: user.id } : "skip");

  const snapshots = React.useMemo(() => {
    if (!snapshotsRaw) return [];
    // Reverse to get chronological order for charts
    return [...snapshotsRaw].reverse().map((s, i) => ({
      name: `Snap ${i + 1}`,
      health: s.careerHealth,
      ats: s.atsScore,
      probability: s.hiringProbability,
      interviews: s.interviewScore,
      apps: s.applicationsCount
    }));
  }, [snapshotsRaw]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Career Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: "#71717a" }}>
            Track your progress and historical performance
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Career Health Trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="os-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-4 w-4" style={{ color: "#22c55e" }} />
            <h2 className="text-sm font-bold text-zinc-200">Career Health Trend</h2>
          </div>
          <div style={{ height: 260, minHeight: 260 }}>
            {snapshots.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={snapshots} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#27272a" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#27272a" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="health" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-zinc-500">Not enough data to plot</div>
            )}
          </div>
        </motion.div>

        {/* Hiring Probability History */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="os-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-4 w-4" style={{ color: "#22d3ee" }} />
            <h2 className="text-sm font-bold text-zinc-200">Hiring Probability History</h2>
          </div>
          <div style={{ height: 260, minHeight: 260 }}>
            {snapshots.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={snapshots} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#27272a" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#27272a" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="probability" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#09090b', r: 4, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-zinc-500">Not enough data to plot</div>
            )}
          </div>
        </motion.div>

        {/* ATS & Interview History */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="os-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: "#818cf8" }} />
              <h2 className="text-sm font-bold text-zinc-200">Component Scores over Time</h2>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400" /> ATS</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" /> Interviews</div>
            </div>
          </div>
          <div style={{ height: 260, minHeight: 260 }}>
            {snapshots.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={snapshots} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#27272a" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#27272a" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="ats" stroke="#818cf8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="interviews" stroke="#a78bfa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-zinc-500">Not enough data to plot</div>
            )}
          </div>
        </motion.div>
        
        {/* Skill Benchmarking */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="os-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-4 w-4" style={{ color: "#f59e0b" }} />
            <h2 className="text-sm font-bold text-zinc-200">Skill Benchmarking (vs Industry Avg)</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
             {/* Mock Benchmark Data */}
             <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Frontend Skills</p>
                <div className="space-y-3">
                   <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-emerald-400">You (82)</span><span className="text-zinc-500">Avg (74)</span></div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full relative">
                         <div className="absolute top-0 left-0 h-full bg-zinc-600 rounded-full" style={{ width: "74%" }} />
                         <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full opacity-80" style={{ width: "82%" }} />
                      </div>
                   </div>
                </div>
             </div>
             <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Backend Skills</p>
                <div className="space-y-3">
                   <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-red-400">You (45)</span><span className="text-zinc-500">Avg (67)</span></div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full relative">
                         <div className="absolute top-0 left-0 h-full bg-zinc-600 rounded-full" style={{ width: "67%" }} />
                         <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full opacity-80" style={{ width: "45%" }} />
                      </div>
                   </div>
                </div>
             </div>
             <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">System Design</p>
                <div className="space-y-3">
                   <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-red-400">You (32)</span><span className="text-zinc-500">Avg (71)</span></div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full relative">
                         <div className="absolute top-0 left-0 h-full bg-zinc-600 rounded-full" style={{ width: "71%" }} />
                         <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full opacity-80" style={{ width: "32%" }} />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
