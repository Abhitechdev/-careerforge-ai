"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Network, Users, MessageSquare, Target, ArrowRight, Activity, Link as LinkedinIcon } from "lucide-react";
import Link from "next/link";
import * as motion from "framer-motion/client";

export default function NetworkingPage() {
  const { user } = useUser();
  const analytics = useQuery(api.networking.getNetworkingAnalytics, user ? { clerkId: user.id } : "skip");

  if (analytics === undefined) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Networking Command Center</h1>
        <p className="text-muted-foreground mt-1">Monitor your professional network growth, referrals, and recruiter interactions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Networking Score
            </h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-indigo-600">{analytics?.networking?.networkingScore || 0}</span>
            <span className="text-muted-foreground mb-1">/ 100</span>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Based on your referrals, recruiter responses, and goal completion.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              Goal Completion
            </h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-emerald-600">{analytics?.networking?.goalCompletion || 0}%</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${analytics?.networking?.goalCompletion || 0}%` }}></div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
              <LinkedinIcon className="h-5 w-5 text-[#0A66C2]" />
              LinkedIn Optimization
            </h3>
            <p className="text-sm text-muted-foreground">Current Profile Score: <strong className="text-foreground">{analytics?.networking?.linkedinScore || 0}/100</strong></p>
          </div>
          <Link href="/dashboard/linkedin" className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors mt-4">
            Optimize Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Referral Pipeline
            </h3>
            <Link href="/dashboard/referrals" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
              Manage <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm font-medium">Total Requests</span>
              <span className="font-bold">{analytics?.referrals?.totalRequests || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm font-medium">Accepted</span>
              <span className="font-bold text-emerald-600">{analytics?.referrals?.accepted || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm font-medium">Interviews Generated</span>
              <span className="font-bold text-indigo-600">{analytics?.referrals?.interviews || 0}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-rose-500" />
              Recruiter Activity
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <span className="block text-2xl font-black mb-1">{analytics?.recruiters?.contacted || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Contacted</span>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <span className="block text-2xl font-black mb-1 text-emerald-600">{analytics?.recruiters?.responses || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Responses</span>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <span className="block text-2xl font-black mb-1 text-indigo-600">{analytics?.recruiters?.interviews || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Interviews</span>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <span className="block text-2xl font-black mb-1">{analytics?.recruiters?.responseRate || 0}%</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Response Rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
