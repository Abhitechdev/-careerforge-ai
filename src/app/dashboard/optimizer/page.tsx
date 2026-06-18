"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Download, RotateCw } from "lucide-react";
import * as motion from "framer-motion/client";

export default function ResumeOptimizerPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/resumes/1"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Resume Optimizer</h1>
            <p className="text-sm text-muted-foreground mt-1">Review and accept AI-generated improvements.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            <RotateCw className="mr-2 h-4 w-4" />
            Regenerate
          </button>
          <button className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700">
            <Check className="mr-2 h-4 w-4" />
            Accept Changes
          </button>
          <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            <Download className="mr-2 h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {/* Split Screen Workspace */}
      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        {/* Original */}
        <div className="flex flex-col border border-border rounded-xl bg-card overflow-hidden">
          <div className="bg-muted/50 p-3 border-b border-border font-medium text-sm flex items-center justify-center text-muted-foreground">
            Original Resume
          </div>
          <div className="flex-1 overflow-y-auto p-8 bg-secondary/20 relative">
            <div className="bg-white text-black p-8 rounded shadow-sm w-full min-h-[800px] text-sm space-y-6">
              <div>
                <h2 className="font-bold border-b border-gray-300 mb-2">EXPERIENCE</h2>
                <div className="mb-4">
                  <div className="flex justify-between font-bold">
                    <span>Frontend Developer | TechCorp</span>
                    <span>2022 - Present</span>
                  </div>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li className="bg-rose-100 rounded px-1 -mx-1 text-rose-900 border border-rose-200">
                      Made a React application and used Redux for state management.
                    </li>
                    <li>Worked with the backend team to build APIs.</li>
                    <li className="bg-rose-100 rounded px-1 -mx-1 text-rose-900 border border-rose-200">
                      Fixed bugs and improved performance.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow separator on large screens */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white shadow-lg z-10 hidden lg:flex">
          <ArrowRight className="h-5 w-5" />
        </div>

        {/* Optimized */}
        <div className="flex flex-col border border-indigo-500/30 rounded-xl bg-card overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.1)]">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 border-b border-indigo-500/20 font-medium text-sm flex items-center justify-center text-indigo-700 dark:text-indigo-300">
            Optimized Resume
          </div>
          <div className="flex-1 overflow-y-auto p-8 bg-secondary/20 relative">
            <div className="bg-white text-black p-8 rounded shadow-sm w-full min-h-[800px] text-sm space-y-6">
              <div>
                <h2 className="font-bold border-b border-gray-300 mb-2">EXPERIENCE</h2>
                <div className="mb-4">
                  <div className="flex justify-between font-bold">
                    <span>Frontend Developer | TechCorp</span>
                    <span>2022 - Present</span>
                  </div>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li className="bg-emerald-100 rounded px-1 -mx-1 text-emerald-900 border border-emerald-200 transition-colors">
                      Architected and deployed scalable React applications, utilizing Redux to streamline global state management across 15+ complex features.
                    </li>
                    <li>Collaborated cross-functionally with backend engineers to design and consume RESTful APIs.</li>
                    <li className="bg-emerald-100 rounded px-1 -mx-1 text-emerald-900 border border-emerald-200 transition-colors">
                      Spearheaded performance optimization initiatives, resulting in a 40% reduction in initial load time by implementing code splitting and lazy loading.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
