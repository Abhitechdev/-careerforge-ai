"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import * as motion from "framer-motion/client";
import { FileText, Download, Calendar, Activity, CheckCircle2, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  const { user, isLoaded } = useUser();
  const reports = useQuery(api.intelligence.getWeeklyReports, isLoaded && user ? { clerkId: user.id } : "skip");
  const generateReport = useMutation(api.intelligence.generateWeeklyReport);
  const [generating, setGenerating] = React.useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      await generateReport({ clerkId: user.id });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Weekly Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: "#71717a" }}>
            Automated summaries of your career progress
          </p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 w-full sm:w-auto"
          style={{ background: "#6366f1" }}
        >
          {generating ? "Generating..." : "Generate New Report"}
        </button>
      </div>

      <div className="grid gap-6">
        {reports === undefined ? (
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-zinc-900 rounded-xl" />
            <div className="h-48 bg-zinc-900 rounded-xl" />
          </div>
        ) : reports.length === 0 ? (
          <div className="os-card p-12 flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-zinc-200">No reports generated yet</h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm">Generate your first weekly report to get AI-driven insights on your career progress.</p>
            <button onClick={handleGenerate} className="mt-6 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-bold">Generate Report</button>
          </div>
        ) : (
          reports.map((report: any, i: number) => (
            <motion.div 
              key={report._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="os-card overflow-hidden"
            >
              <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-zinc-200">
                        Week of {new Date(report.weekStart).toLocaleDateString()}
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">Generated {new Date(report.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors" title="Export PDF">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">AI Summary</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed">{report.summary}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Top Recommendations</h3>
                    <ul className="space-y-2">
                      {report.topRecommendations.map((rec: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-zinc-300">
                          <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Progress Metrics</h3>
                  <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-400 flex items-center gap-1.5"><Activity className="h-3 w-3" /> Career Health</span>
                      <span className="text-sm font-bold font-mono text-white">{report.careerHealthStart} → {report.careerHealthEnd}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-400 flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> ATS Score</span>
                      <span className="text-sm font-bold font-mono text-white">{report.atsStart} → {report.atsEnd}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <span className="block text-2xl font-black font-mono text-cyan-400 mb-1">{report.applicationsCount}</span>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Applications</span>
                    </div>
                    <div className="p-4 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <span className="block text-2xl font-black font-mono text-purple-400 mb-1">{report.interviewsCount}</span>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Interviews</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
