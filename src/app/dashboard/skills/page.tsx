"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Clock, Target } from "lucide-react";
import * as motion from "framer-motion/client";

export default function SkillRoadmapPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Gap Analysis & Roadmap</h1>
        <p className="text-muted-foreground mt-1">Compare your current skills against your target role: <span className="font-semibold text-foreground">Frontend Engineer</span>.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Skills */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Current Skills Verified
          </h2>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Node.js", "HTML/CSS", "Redux", "Jest", "Git"].map(skill => (
              <span key={skill} className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Missing Skills Identified
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2">High Priority</h3>
              <div className="flex flex-wrap gap-2">
                {["Docker", "AWS"].map(skill => (
                  <span key={skill} className="inline-flex items-center rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-sm font-medium text-rose-700 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">Medium Priority</h3>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400">
                  Redis
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Low Priority</h3>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-muted border border-border px-3 py-1 text-sm font-medium text-muted-foreground">
                  Kubernetes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Roadmap Preview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">AI-Generated Learning Roadmap</h2>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
            Customize Plan <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        <div className="relative border-l-2 border-indigo-100 dark:border-indigo-900/50 ml-4 space-y-8 pb-4">
          {[
            { week: "Week 1", title: "Docker Fundamentals", target: "Docker", time: "5 hours", completed: false },
            { week: "Week 2", title: "AWS Basics", target: "AWS", time: "8 hours", completed: false },
            { week: "Week 3", title: "CI/CD Foundations", target: "AWS", time: "6 hours", completed: false },
            { week: "Week 4", title: "Redis Essentials", target: "Redis", time: "4 hours", completed: false },
          ].map((item, i) => (
            <motion.div 
              key={item.week}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative pl-8"
            >
              <div className="absolute -left-[11px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-indigo-600 bg-background">
                <div className="h-2 w-2 rounded-full bg-indigo-600" />
              </div>
              
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-indigo-500/30 hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {item.week}
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" /> {item.time}
                  </div>
                </div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Master the core concepts required to close your skill gap for <span className="font-medium text-foreground">{item.target}</span>.
                </p>
                <div className="flex justify-end">
                  <button className="inline-flex h-8 items-center justify-center rounded-md bg-foreground px-4 text-xs font-medium text-background shadow transition-colors hover:bg-foreground/90">
                    Start Module
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
