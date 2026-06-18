"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Loader2, Users, Activity, Target, ShieldCheck, ArrowRight, Zap, RefreshCw } from "lucide-react";

export default function AnalyticsDashboard() {
  const { user, isLoaded } = useUser();
  const metrics = useQuery(api.analytics.getDashboardMetrics);

  if (!isLoaded || metrics === undefined) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
  }

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());
  const email = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = email && adminEmails.includes(email);

  if (!isAdmin && process.env.NEXT_PUBLIC_ADMIN_EMAILS) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-20 w-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="h-10 w-10 text-rose-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">403 - Access Denied</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          You do not have permission to view the Product Analytics dashboard.
        </p>
      </div>
    );
  }

  const launchReadyStatus = 
    metrics.launchReadinessScore >= 80 ? "Launch Ready" :
    metrics.launchReadinessScore >= 60 ? "Beta Ready" : "Needs Work";

  const launchReadyColor = 
    metrics.launchReadinessScore >= 80 ? "text-emerald-500 bg-emerald-500/10" :
    metrics.launchReadinessScore >= 60 ? "text-amber-500 bg-amber-500/10" : "text-rose-500 bg-rose-500/10";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Analytics</h1>
          <p className="text-muted-foreground mt-1">Measure activation, retention, and launch readiness.</p>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${launchReadyColor.replace('text-', 'border-').replace('bg-', '').split(' ')[0]}`}>
          <div className={`p-2 rounded-md ${launchReadyColor}`}>
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground font-medium">Readiness Score</div>
            <div className={`text-xl font-bold ${launchReadyColor.split(' ')[0]}`}>{metrics.launchReadinessScore}/100 - {launchReadyStatus}</div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Active Users (Stickiness)</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Daily Active (DAU)" value={metrics.dau} icon={<Activity className="h-5 w-5 text-emerald-500" />} />
        <MetricCard title="Weekly Active (WAU)" value={metrics.wau} icon={<Users className="h-5 w-5 text-indigo-500" />} />
        <MetricCard title="Monthly Active (MAU)" value={metrics.mau} icon={<Users className="h-5 w-5 text-slate-500" />} />
        <MetricCard title="DAU / MAU Ratio" value={`${metrics.dauMauRatio.toFixed(1)}%`} icon={<RefreshCw className="h-5 w-5 text-amber-500" />} />
      </div>

      <h2 className="text-xl font-bold mt-12 mb-4">Growth & Health</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Users" value={metrics.totalUsers} icon={<Users className="h-5 w-5 text-indigo-500" />} />
        <MetricCard title="Activation Rate" value={`${metrics.activationRate.toFixed(1)}%`} icon={<Zap className="h-5 w-5 text-amber-500" />} />
        <MetricCard title="7-Day Retention" value={`${metrics.retentionRate.toFixed(1)}%`} icon={<RefreshCw className="h-5 w-5 text-emerald-500" />} />
      </div>

      <h2 className="text-xl font-bold mt-12 mb-4">Funnel Analysis</h2>
      <div className="rounded-xl border border-border bg-card p-6 overflow-x-auto">
        <div className="min-w-[600px] flex items-center justify-between">
          <FunnelStep title="Signed Up" value="100%" />
          <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 flex-shrink-0" />
          <FunnelStep title="Uploaded Resume" value="75%" />
          <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 flex-shrink-0" />
          <FunnelStep title="ATS Analysis" value="60%" />
          <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 flex-shrink-0" />
          <FunnelStep title="Used Advisor" value="45%" />
          <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 flex-shrink-0" />
          <FunnelStep title="Interview Prep" value="20%" />
        </div>
        <p className="text-xs text-muted-foreground mt-6 text-center">
          * Note: Funnel percentages are simulated estimates for the beta until comprehensive event tracking reaches statistical significance.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-secondary rounded-md">{icon}</div>
        <span className="font-medium text-sm text-muted-foreground">{title}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function FunnelStep({ title, value }: { title: string, value: string }) {
  return (
    <div className="flex flex-col items-center flex-1 text-center">
      <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center border-4 border-background shadow-sm mb-3">
        <span className="font-bold text-lg">{value}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
  );
}
