"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Calendar, CheckCircle2, Circle, Clock, FileText, Target, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useUser();
  const resolvedParams = React.use(params);
  const applicationId = resolvedParams.id as Id<"applications">;
  
  const app = useQuery(api.applications.getById, { id: applicationId });
  const generatePack = useAction(api.applicationActions.generateApplicationPack);
  
  const [isGenerating, setIsGenerating] = React.useState(false);

  if (app === undefined) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  }
  
  if (app === null) {
    return <div className="text-center py-12">Application not found.</div>;
  }

  const handleGeneratePack = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      await generatePack({
        applicationId,
        clerkId: user.id
      });
      toast.success("Application Pack Generated!");
    } catch (error) {
      toast.error("Failed to generate application pack.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border pb-6">
        <div className="flex items-start gap-4">
          <Link 
            href="/dashboard/applications"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80 mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{app.role}</h1>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {app.status} Stage
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {app.company}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {app.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Added {new Date(app.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGeneratePack}
            disabled={isGenerating || app.generationStatus === 'generating' || app.generationStatus === 'completed'}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {(isGenerating || app.generationStatus === 'generating') ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {app.generationStatus === 'completed' ? 'Pack Generated' : 'Generate App Pack'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Timeline & Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Application Timeline</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
              {[
                { stage: "Applied", date: "Oct 12", active: false, completed: true },
                { stage: "Assessment", date: "Oct 15", active: false, completed: true },
                { stage: "Technical Interview", date: "Oct 18", active: true, completed: false },
                { stage: "Final Round", date: "TBD", active: false, completed: false },
                { stage: "Offer", date: "TBD", active: false, completed: false },
              ].map((item, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                    item.completed ? 'bg-emerald-500' : item.active ? 'bg-purple-600' : 'bg-muted'
                  }`}>
                    {item.completed ? <CheckCircle2 className="h-4 w-4 text-white" /> : item.active ? <Clock className="h-4 w-4 text-white" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm ${item.active ? 'border-purple-500/50 bg-purple-50/50 dark:bg-purple-900/10' : 'border-border bg-card'}`}>
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${item.active ? 'text-purple-700 dark:text-purple-400' : ''}`}>{item.stage}</h4>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-500" /> AI Application Strategy</h3>
            {app.aiStrategy ? (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm leading-relaxed text-indigo-900 dark:text-indigo-200 whitespace-pre-wrap">{app.aiStrategy}</p>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">Generate an Application Pack to receive tailored AI strategy and prep materials.</p>
                <button onClick={handleGeneratePack} disabled={isGenerating || app.generationStatus === 'generating'} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mx-auto disabled:opacity-50">
                  {isGenerating || app.generationStatus === 'generating' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Meta Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-500" /> Match Analysis
              </h3>
            </div>
            <div className="p-5 flex flex-col items-center">
              <div className="relative flex items-center justify-center h-24 w-24 mb-3">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                  <circle className="stroke-muted" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                  <circle className="stroke-indigo-600" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${((app.opportunityScore || 0) / 100) * 251.2} 251.2`} transform="rotate(-90 50 50)" />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{app.opportunityScore || 0}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold -mt-1">Score</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-foreground" /> Materials Used
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Tailored Resume</span>
                {app.resumeId ? (
                  <div className="flex items-center justify-between p-2 rounded-md border border-border bg-secondary/30">
                    <span className="text-sm truncate mr-2">Version Linked</span>
                    <Link href={`/dashboard/resumes`} className="text-indigo-600 hover:text-indigo-700">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic p-2 bg-secondary/20 rounded border border-dashed border-border text-center">Not generated yet</div>
                )}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Cover Letter</span>
                {app.coverLetterId ? (
                  <div className="flex items-center justify-between p-2 rounded-md border border-border bg-secondary/30">
                    <span className="text-sm truncate mr-2">Tailored_Cover_Letter</span>
                    <Link href={`/dashboard/cover-letters`} className="text-indigo-600 hover:text-indigo-700">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic p-2 bg-secondary/20 rounded border border-dashed border-border text-center">Not generated yet</div>
                )}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Interview Prep</span>
                {app.interviewId ? (
                  <div className="flex items-center justify-between p-2 rounded-md border border-border bg-secondary/30">
                    <span className="text-sm truncate mr-2">Role Questions Generated</span>
                    <Link href={`/dashboard/interviews`} className="text-indigo-600 hover:text-indigo-700">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic p-2 bg-secondary/20 rounded border border-dashed border-border text-center">Not generated yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
