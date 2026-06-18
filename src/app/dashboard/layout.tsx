"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Target, FileInput,
  Briefcase, GraduationCap, CreditCard, Settings,
  Search, Bell, Menu, Zap, Users, ChevronRight,
  Network, Link as LinkedinIcon, MessageSquare
} from "lucide-react";
import { CommandMenu } from "@/components/command-menu";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAnalytics } from "@/hooks/useAnalytics";

const navGroups = [
  {
    label: "WORKSPACE",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Upload Resume", href: "/dashboard/upload", icon: FileInput },
      { name: "Resumes", href: "/dashboard/resumes", icon: FileText },
      { name: "Applications", href: "/dashboard/applications", icon: Briefcase },
    ],
  },
  {
    label: "AI TOOLS",
    items: [
      { name: "Forge Advisor", href: "/dashboard/advisor", icon: Zap },
      { name: "Job Matches", href: "/dashboard/job-matches", icon: Target },
      { name: "Skill Roadmap", href: "/dashboard/skill-roadmap", icon: GraduationCap },
      { name: "Interview Prep", href: "/dashboard/interview-prep", icon: Users },
    ],
  },
  {
    label: "NETWORKING",
    items: [
      { name: "Networking Hub", href: "/dashboard/networking", icon: Network },
      { name: "Referrals", href: "/dashboard/referrals", icon: Users },
      { name: "LinkedIn Optimization", href: "/dashboard/linkedin", icon: LinkedinIcon },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { name: "Career Analytics", href: "/dashboard/intelligence", icon: Target },
      { name: "Reports", href: "/dashboard/reports", icon: FileText },
      { name: "Forecast", href: "/dashboard/forecast", icon: Zap },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const dbUser = useQuery(api.users.getCurrentUser, user ? { clerkId: user.id } : "skip");
  const { logEvent } = useAnalytics();
  
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (pathname) {
      logEvent("Dashboard Viewed", { path: pathname });
    }
  }, [pathname, logEvent]);

  React.useEffect(() => {
    if (dbUser !== undefined && dbUser !== null && !dbUser.onboardingCompleted && pathname !== "/dashboard/onboarding") {
      router.push("/dashboard/onboarding");
    }
  }, [dbUser, pathname, router]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <AnnouncementBanner />
      <div className="flex-1 relative">
        <CommandMenu />

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--surface-1)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Logo */}
        <div
          className="flex h-14 shrink-0 items-center gap-2.5 px-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Image src="/logo-icon.png" alt="CareerForge AI" width={26} height={26} className="rounded-md" />
          <span className="font-bold tracking-tight text-sm text-white">
            CareerForge
            <sup className="ml-0.5 text-[10px] font-semibold" style={{ color: "#818cf8" }}>
              OS
            </sup>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4 gap-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p
                className="px-3 pb-1.5 text-[10px] font-bold tracking-widest"
                style={{ color: "#3f3f46" }}
              >
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "nav-active"
                          : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      <item.icon
                        className={`mr-2.5 h-4 w-4 shrink-0 ${
                          isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Forge Online Status */}
        <div
          className="px-4 py-4 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md" style={{ background: "rgba(34,197,94,0.06)" }}>
            <span className="ai-pulse" />
            <span className="text-xs font-semibold text-zinc-400">Forge is online</span>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────── */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        {/* Top Header */}
        <header
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 px-4 sm:px-6"
          style={{
            background: "rgba(9, 9, 11, 0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="lg:hidden text-zinc-500 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-1.5 text-sm">
            <span className="text-zinc-600">CareerForge</span>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
            <span className="text-zinc-300 font-medium capitalize">
              {pathname === "/dashboard"
                ? "Dashboard"
                : pathname.replace("/dashboard/", "").replace(/-/g, " ")}
            </span>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            {/* AI Command Bar */}
            <button
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-zinc-500 transition-all hover:text-zinc-300"
              style={{
                background: "#18181b",
                border: "1px solid #27272a",
                width: 240,
              }}
              onClick={() => {
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true })
                );
              }}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1 text-left text-xs">Ask Forge anything...</span>
              <kbd
                className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                style={{ background: "#27272a", color: "#71717a" }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="relative p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <Bell className="h-4.5 w-4.5" />
              <span
                className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
                style={{ background: "#6366f1" }}
              />
            </button>

            <div
              className="h-5 w-px"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
            <UserButton />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 py-8">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
      </div>
    </div>
  );
}
