"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, GitCommit, FileText, CheckCircle, Clock, Eye, Download, RotateCcw } from "lucide-react";
import * as motion from "framer-motion/client";

const versions = [
  { id: "v3", date: "Today at 2:30 PM", changes: "Added AI optimized keywords for Frontend Engineer role.", score: 85, current: true },
  { id: "v2", date: "Yesterday at 10:15 AM", changes: "Updated work experience bullet points.", score: 72, current: false },
  { id: "v1", date: "Oct 12, 2026", changes: "Initial upload.", score: 64, current: false },
];

export default function ResumeVersionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/resumes"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Version History</h1>
          <p className="text-muted-foreground mt-1">Frontend_Engineer_Resume.pdf</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="relative border-l-2 border-border ml-4 space-y-8 pb-4">
          {versions.map((version, i) => (
            <motion.div 
              key={version.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative pl-8"
            >
              {/* Timeline dot */}
              <div className={`absolute -left-[11px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 ${version.current ? 'border-indigo-600 bg-background' : 'border-border bg-muted'}`}>
                {version.current && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
              </div>

              <div className={`rounded-lg border p-5 transition-colors ${version.current ? 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-border bg-background'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        <GitCommit className="h-4 w-4 text-muted-foreground" />
                        Version {version.id}
                      </h3>
                      {version.current && (
                        <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Clock className="mr-1 h-3 w-3" />
                      {version.date}
                    </div>
                    <p className="text-sm">{version.changes}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">ATS Score:</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${version.score >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {version.score}/100
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                        <Eye className="mr-1.5 h-3 w-3" /> View
                      </button>
                      <button className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                        <Download className="mr-1.5 h-3 w-3" /> PDF
                      </button>
                      {!version.current && (
                        <button className="inline-flex h-8 items-center justify-center rounded-md bg-foreground px-3 text-xs font-medium text-background shadow transition-colors hover:bg-foreground/90">
                          <RotateCcw className="mr-1.5 h-3 w-3" /> Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {version.current && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors flex items-center">
                      <Eye className="mr-1 h-4 w-4" />
                      Compare with previous version
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
