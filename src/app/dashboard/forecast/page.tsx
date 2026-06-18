"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import * as motion from "framer-motion/client";
import { Zap, Target, Activity, CheckCircle2, Search, ArrowRight, BrainCircuit } from "lucide-react";
import { CareerHealthRing } from "@/components/career-health-ring";

export default function ForecastPage() {
  const { user, isLoaded } = useUser();
  const forecasts = useQuery(api.intelligence.getForecasts, isLoaded && user ? { clerkId: user.id } : "skip");
  const generateForecast = useMutation(api.intelligence.generateForecast);
  
  const [skillsInput, setSkillsInput] = React.useState("");
  const [generating, setGenerating] = React.useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !skillsInput.trim()) return;
    setGenerating(true);
    try {
      const skillsArray = skillsInput.split(",").map(s => s.trim()).filter(Boolean);
      await generateForecast({ clerkId: user.id, skillsToLearn: skillsArray });
      setSkillsInput("");
    } finally {
      setGenerating(false);
    }
  };

  const latestForecast = forecasts?.[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Career Forecast Engine</h1>
          <p className="text-sm mt-0.5" style={{ color: "#71717a" }}>
            Simulate how learning new skills impacts your hiring probability
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Simulator Input */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="os-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BrainCircuit className="h-4 w-4" style={{ color: "#818cf8" }} />
            <h2 className="text-sm font-bold text-zinc-200">Forecast Simulator</h2>
          </div>
          
          <p className="text-sm text-zinc-400 mb-6">
            Enter skills you plan to learn or improve. Forge will predict how they impact your career metrics.
          </p>

          <form onSubmit={handleGenerate} className="flex flex-col gap-4 flex-1">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Target Skills</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                  type="text" 
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. Docker, AWS, React Native"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={generating || !skillsInput.trim()}
              className="mt-auto flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-bold transition-colors"
            >
              {generating ? "Simulating..." : "Run Forecast"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </motion.div>

        {/* Forecast Results */}
        <div className="lg:col-span-2 space-y-6">
          {forecasts === undefined ? (
            <div className="animate-pulse h-64 bg-zinc-900 rounded-xl" />
          ) : !latestForecast ? (
             <div className="os-card h-full flex items-center justify-center p-12 text-center">
                <div>
                   <Target className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                   <h3 className="text-lg font-bold text-zinc-200">No Forecasts Run</h3>
                   <p className="text-sm text-zinc-500 mt-2">Run your first simulation using the panel on the left.</p>
                </div>
             </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="os-card p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" style={{ color: "#f59e0b" }} />
                  <h2 className="text-sm font-bold text-zinc-200">Simulation Results</h2>
                </div>
                <span className="text-xs font-mono px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {latestForecast.confidenceScore}% Confidence
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Career Health Impact</p>
                  <div className="flex items-center gap-6">
                    <div className="text-center opacity-60">
                      <span className="text-3xl font-black font-mono block">{latestForecast.currentCareerHealth}</span>
                      <span className="text-xs text-zinc-500">Current</span>
                    </div>
                    <ArrowRight className="h-6 w-6 text-zinc-600" />
                    <div className="text-center">
                      <span className="text-4xl font-black font-mono text-emerald-400 block">{latestForecast.predictedCareerHealth}</span>
                      <span className="text-xs text-emerald-500 font-bold">Predicted (+{latestForecast.predictedCareerHealth - latestForecast.currentCareerHealth})</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-zinc-800/50 pt-8 md:pt-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Hiring Probability Impact</p>
                  <div className="flex items-center gap-6">
                    <div className="text-center opacity-60">
                      <span className="text-3xl font-black font-mono block text-cyan-500">{latestForecast.currentHiringProbability}%</span>
                      <span className="text-xs text-zinc-500">Current</span>
                    </div>
                    <ArrowRight className="h-6 w-6 text-zinc-600" />
                    <div className="text-center">
                      <span className="text-4xl font-black font-mono text-cyan-400 block">{latestForecast.predictedHiringProbability}%</span>
                      <span className="text-xs text-cyan-500 font-bold">Predicted (+{latestForecast.predictedHiringProbability - latestForecast.currentHiringProbability})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800/50">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Skill Impact Breakdown</p>
                <div className="space-y-3">
                  {latestForecast.skillImpacts.map((impact: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium text-zinc-200">{impact.skill}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="block text-xs text-zinc-500">Roles Unlocked</span>
                          <span className="text-sm font-mono font-bold text-white">+{impact.rolesUnlocked}</span>
                        </div>
                        <div className="text-right w-16">
                          <span className="block text-xs text-zinc-500">Impact</span>
                          <span className="text-sm font-mono font-bold text-emerald-400">+{impact.healthImpact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                  <Activity className="h-5 w-5 text-indigo-400 shrink-0" />
                  <p className="text-sm text-indigo-200">
                    <strong>Forge Insight:</strong> Learning these skills will increase your matches by approximately {latestForecast.predictedMatchIncrease} roles and push your profile into a higher tier of hiring probability.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
