"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search, LayoutDashboard, FileText, Target, FileInput,
  CreditCard, Settings, Briefcase, GraduationCap,
  Zap, Users, Sparkles, BrainCircuit, ArrowRight
} from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[16vh]"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
    >
      {/* Click outside to close */}
      <div className="absolute inset-0 z-[-1]" onClick={() => setOpen(false)} />

      <Command
        className="w-full max-w-[560px] overflow-hidden rounded-xl shadow-2xl"
        style={{
          background: "#0d0d0f",
          border: "1px solid #27272a",
          boxShadow: "0 0 60px rgba(99, 102, 241, 0.12), 0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid #1e1e21" }}
        >
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
            style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
          >
            <BrainCircuit className="h-4 w-4" />
          </div>
          <Command.Input
            placeholder="Ask Forge anything, or search..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            autoFocus
          />
          <kbd
            className="text-[10px] px-1.5 py-1 rounded font-mono shrink-0"
            style={{ background: "#1e1e21", color: "#52525b", border: "1px solid #27272a" }}
          >
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[380px] overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-zinc-600">
            No results found.
          </Command.Empty>

          {/* Navigation */}
          <Command.Group>
            <p className="px-3 py-2 text-[10px] font-bold tracking-widest text-zinc-700 uppercase">
              Navigation
            </p>
            {[
              { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", kbd: "⌘D" },
              { icon: FileText, label: "My Resumes", path: "/dashboard/resumes", kbd: "⌘R" },
              { icon: FileInput, label: "Upload Resume", path: "/dashboard/upload" },
              { icon: Target, label: "Job Matches", path: "/dashboard/job-matches" },
              { icon: Briefcase, label: "Applications", path: "/dashboard/applications", kbd: "⌘A" },
            ].map((item) => (
              <Command.Item
                key={item.path}
                onSelect={() => runCommand(() => router.push(item.path))}
                className="flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm gap-3 transition-colors text-zinc-400 hover:text-white data-[selected=true]:bg-white/5 data-[selected=true]:text-white"
              >
                <item.icon className="h-4 w-4 opacity-60" />
                <span className="flex-1">{item.label}</span>
                {item.kbd && (
                  <kbd
                    className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: "#1e1e21", color: "#52525b" }}
                  >
                    {item.kbd}
                  </kbd>
                )}
              </Command.Item>
            ))}
          </Command.Group>

          {/* AI Actions */}
          <Command.Group>
            <p className="px-3 py-2 mt-2 text-[10px] font-bold tracking-widest text-zinc-700 uppercase">
              Forge AI Commands
            </p>
            {[
              { icon: Sparkles, label: "Analyze my resume with Forge", path: "/dashboard/advisor", accent: "#818cf8" },
              { icon: BrainCircuit, label: "Get skill gap analysis", path: "/dashboard/skill-roadmap", accent: "#22d3ee" },
              { icon: Users, label: "Start mock interview", path: "/dashboard/interview-prep", accent: "#a78bfa" },
              { icon: Zap, label: "Generate cover letter", path: "/dashboard/cover-letters", accent: "#f59e0b" },
              { icon: ArrowRight, label: "Open AI Advisor", path: "/dashboard/advisor", accent: "#818cf8" },
            ].map((item) => (
              <Command.Item
                key={item.label}
                onSelect={() => runCommand(() => router.push(item.path))}
                className="flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm gap-3 transition-colors text-zinc-400 hover:text-white data-[selected=true]:bg-white/5 data-[selected=true]:text-white"
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: item.accent + "20", color: item.accent }}
                >
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <span className="flex-1">{item.label}</span>
              </Command.Item>
            ))}
          </Command.Group>

          {/* Settings */}
          <Command.Group>
            <p className="px-3 py-2 mt-2 text-[10px] font-bold tracking-widest text-zinc-700 uppercase">
              Account
            </p>
            {[
              { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
              { icon: Settings, label: "Settings", path: "/dashboard/settings" },
              { icon: GraduationCap, label: "Skill Roadmap", path: "/dashboard/skill-roadmap" },
            ].map((item) => (
              <Command.Item
                key={item.path}
                onSelect={() => runCommand(() => router.push(item.path))}
                className="flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm gap-3 transition-colors text-zinc-400 hover:text-white data-[selected=true]:bg-white/5 data-[selected=true]:text-white"
              >
                <item.icon className="h-4 w-4 opacity-60" />
                <span className="flex-1">{item.label}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderTop: "1px solid #1e1e21" }}
        >
          <div className="flex items-center gap-2">
            <span className="ai-pulse" />
            <span className="text-[11px] text-zinc-600 font-medium">Powered by Forge AI</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-zinc-700">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> select</span>
          </div>
        </div>
      </Command>
    </div>
  );
}
