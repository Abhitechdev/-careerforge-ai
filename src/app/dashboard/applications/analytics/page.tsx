"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { BarChart, Activity, Target, TrendingUp, CheckCircle2, XCircle, Users, Search, Bookmark } from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useUser();
  const applications = useQuery(api.applications.list, user ? { clerkId: user.id } : "skip");
  const jobActivity = useQuery(api.jobSearch.listActivity, user ? { clerkId: user.id } : "skip");

  if (applications === undefined || jobActivity === undefined) {
    return <div className="p-8 text-center animate-pulse">Loading analytics...</div>;
  }

  const jobsSearched = jobActivity.filter((a: any) => a.type === "searched").length;
  const jobsSaved = jobActivity.filter((a: any) => a.type === "saved").length;

  const activeApps = applications.filter((a: any) => a.status !== "Saved" && a.status !== "Withdrawn");
  const totalSent = activeApps.length;
  
  const interviews = activeApps.filter((a: any) => a.status === "Interview").length;
  const offers = activeApps.filter((a: any) => a.status === "Offer").length;
  const rejections = activeApps.filter((a: any) => a.status === "Rejected").length;

  const responseRate = totalSent > 0 ? Math.round(((interviews + offers + rejections) / totalSent) * 100) : 0;
  const interviewRate = totalSent > 0 ? Math.round((interviews / totalSent) * 100) : 0;
  const offerRate = totalSent > 0 ? Math.round((offers / totalSent) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Application Analytics</h1>
        <p className="text-muted-foreground">Track your pipeline conversion rates and job search performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Searches Performed</h3>
            <Search className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold">{jobsSearched}</div>
          <p className="text-xs text-muted-foreground mt-1">Total job queries</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Jobs Saved</h3>
            <Bookmark className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold">{jobsSaved}</div>
          <p className="text-xs text-muted-foreground mt-1">From discovery</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Applications Sent</h3>
            <Activity className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold">{totalSent}</div>
          <p className="text-xs text-muted-foreground mt-1">Total active applications</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Interviews</h3>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold">{interviews}</div>
          <p className="text-xs text-muted-foreground mt-1">{interviewRate}% interview rate</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Offers</h3>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold">{offers}</div>
          <p className="text-xs text-muted-foreground mt-1">{offerRate}% offer rate</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Success Rate</h3>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">{responseRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">Overall response rate</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-indigo-500" /> Funnel Conversion</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Applied to Interview</span>
                <span className="font-medium">{interviewRate}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${interviewRate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Interview to Offer</span>
                <span className="font-medium">{interviews > 0 ? Math.round((offers / interviews) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${interviews > 0 ? Math.round((offers / interviews) * 100) : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><XCircle className="h-5 w-5 text-rose-500" /> Rejection Analysis</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-rose-500">{rejections}</p>
              <p className="text-sm text-muted-foreground">Total Rejections</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold">{totalSent > 0 ? Math.round((rejections / totalSent) * 100) : 0}%</p>
              <p className="text-sm text-muted-foreground">Rejection Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
