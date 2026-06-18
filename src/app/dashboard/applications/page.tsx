"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, Target, TrendingUp, Inbox, CheckCircle2, XCircle, ChevronRight, MoreHorizontal, MessageSquare } from "lucide-react";
import * as motion from "framer-motion/client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../../../convex/_generated/dataModel";

const columns = [
  { id: "Saved", title: "Saved", color: "border-slate-200 dark:border-slate-800" },
  { id: "Applied", title: "Applied", color: "border-blue-200 dark:border-blue-900/50" },
  { id: "Assessment", title: "Assessment", color: "border-amber-200 dark:border-amber-900/50" },
  { id: "Interview", title: "Interview", color: "border-purple-200 dark:border-purple-900/50" },
  { id: "Offer", title: "Offer", color: "border-emerald-200 dark:border-emerald-900/50" },
  { id: "Rejected", title: "Rejected", color: "border-rose-200 dark:border-rose-900/50" },
  { id: "Withdrawn", title: "Withdrawn", color: "border-gray-300 dark:border-gray-700" },
];

export default function ApplicationsHubPage() {
  const { user } = useUser();
  const applications = useQuery(api.applications.list, user ? { clerkId: user.id } : "skip");
  const updateStatus = useMutation(api.applications.updateStatus);
  const createApplication = useMutation(api.applications.create);
  
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newJobUrl, setNewJobUrl] = React.useState("");
  const [newJobRole, setNewJobRole] = React.useState("");
  const [newJobCompany, setNewJobCompany] = React.useState("");
  const [newJobLocation, setNewJobLocation] = React.useState("");

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newJobRole || !newJobCompany) return;
    
    await createApplication({
      clerkId: user.id,
      role: newJobRole,
      company: newJobCompany,
      location: newJobLocation || "Remote",
      notes: newJobUrl ? `Source: ${newJobUrl}` : "",
      matchScore: Math.floor(Math.random() * 40) + 60, // Temporary mock score
    });
    
    setIsAddModalOpen(false);
    setNewJobRole("");
    setNewJobCompany("");
    setNewJobLocation("");
    setNewJobUrl("");
  };

  const appsSent = applications?.filter((a: any) => a.status !== "Saved" && a.status !== "Withdrawn").length || 0;
  const interviews = applications?.filter((a: any) => a.status === "Interview").length || 0;
  const offers = applications?.filter((a: any) => a.status === "Offer").length || 0;
  
  const responseRate = appsSent > 0 ? Math.round(((interviews + offers + (applications?.filter((a: any) => a.status === "Rejected").length || 0)) / appsSent) * 100) : 0;
  const interviewRate = appsSent > 0 ? Math.round((interviews / appsSent) * 100) : 0;
  const offerRate = appsSent > 0 ? Math.round((offers / appsSent) * 100) : 0;
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications Hub</h1>
          <p className="text-muted-foreground mt-1">Track and manage your entire job search pipeline.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          Add Job
        </button>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add New Job</h2>
            <form onSubmit={handleAddJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input required value={newJobCompany} onChange={e => setNewJobCompany(e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input required value={newJobRole} onChange={e => setNewJobRole(e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input value={newJobLocation} onChange={e => setNewJobLocation(e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Remote, San Francisco" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job URL / Description</label>
                <textarea value={newJobUrl} onChange={e => setNewJobUrl(e.target.value)} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20" placeholder="Paste link or job description here..." />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium transition-colors">
                Save Job
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Widgets */}
      <div className="grid gap-4 md:grid-cols-4 shrink-0">
        {[
          { title: "Apps Sent", value: appsSent.toString(), icon: Inbox, color: "text-blue-500" },
          { title: "Response Rate", value: `${responseRate}%`, icon: MessageSquare, color: "text-indigo-500" },
          { title: "Interview Rate", value: `${interviewRate}%`, icon: TrendingUp, color: "text-purple-500" },
          { title: "Offer Rate", value: `${offerRate}%`, icon: Target, color: "text-emerald-500" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-full bg-secondary ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      {applications && applications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card p-12 text-center mt-4">
          <Inbox className="h-12 w-12 text-indigo-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No applications yet.</h3>
          <p className="text-muted-foreground mb-6 max-w-md">Start building your pipeline by saving a job from the Job Search, or add one manually.</p>
          <div className="flex gap-4">
            <Link href="/dashboard/job-search" className="bg-secondary hover:bg-secondary/80 text-foreground px-6 py-2 rounded-md font-medium text-sm transition-colors">
              Browse Jobs
            </Link>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors">
              Add Manual Job
            </button>
          </div>
        </div>
      ) : (
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex h-full gap-4 min-w-[1200px]">
          {columns.map((col) => (
            <div key={col.id} className="flex-1 flex flex-col w-[280px] shrink-0 bg-secondary/30 dark:bg-secondary/10 rounded-xl border border-border overflow-hidden">
              <div className={`p-3 border-b border-border bg-card flex items-center justify-between shadow-sm`}>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full border-2 ${col.color.split(' ')[0]} bg-background`} />
                  {col.title}
                </h3>
                <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                  {applications?.filter((a: any) => a.status === col.id).length || 0}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {applications?.filter((job: any) => job.status === col.id).map((job: any) => (
                  <div key={job._id} className="bg-card border border-border rounded-lg p-3 shadow-sm hover:border-indigo-500/50 transition-colors group relative">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/dashboard/applications/${job._id}`} className="font-medium text-sm leading-tight hover:text-indigo-600 hover:underline before:absolute before:inset-0">
                        {job.role}
                      </Link>
                      <div className="relative group/menu">
                        <button className="relative z-10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:flex flex-col bg-popover border border-border rounded-md shadow-md z-20 w-32 overflow-hidden">
                          {columns.map(c => (
                            <button 
                              key={c.id} 
                              onClick={() => updateStatus({ id: job._id, status: c.id as any })}
                              className="text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                            >
                              Move to {c.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{job.company}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {job.matchScore || 0}% Match
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {applications?.filter((job: any) => job.status === col.id).length === 0 && (
                  <div className="h-24 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Drop here</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

// Just importing Clock locally for the mockJobs to work
import { Clock } from "lucide-react";
