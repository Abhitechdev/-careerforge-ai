"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Search, MapPin, Briefcase, DollarSign, Clock, Building2, Sparkles, BookmarkPlus, ArrowRight, Loader2, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function JobSearchPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchJobs = useAction(api.jobSearch.searchJobs);
  const createApplication = useMutation(api.applications.create);
  const trackJobActivity = useMutation(api.jobSearch.trackJobActivity);

  const [query, setQuery] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [remote, setRemote] = React.useState(false);
  
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Initialize from URL params if Forge/Nova linked here
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const loc = params.get("location");
    const rem = params.get("remote");
    
    if (q) setQuery(q);
    if (loc) setLocation(loc);
    if (rem === "true") setRemote(true);

    if (q && user) {
      handleSearch(q, loc || "", rem === "true");
    }
  }, [user]);

  const handleSearch = async (overrideQuery?: string, overrideLoc?: string, overrideRem?: boolean) => {
    if (!user) return;
    const q = overrideQuery ?? query;
    if (!q) {
      toast.error("Please enter a job title or keyword.");
      return;
    }

    setIsLoading(true);
    setJobs([]);
    try {
      const results = await searchJobs({
        clerkId: user.id,
        query: q,
        location: overrideLoc ?? location,
        remote: overrideRem ?? remote
      });
      setJobs(results);
    } catch (err) {
      toast.error("Failed to fetch jobs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = async (job: any, analyze: boolean = false) => {
    if (!user) return;
    try {
      const appId = await createApplication({
        clerkId: user.id,
        company: job.company || "Unknown Company",
        role: job.title,
        location: job.location || "Remote",
        matchScore: job.lexicalMatch,
        notes: `Found via ${job.source}. Apply Link: ${job.url}\n\nDescription Snippet: ${job.description?.substring(0, 200)}...`
      });

      await trackJobActivity({
        clerkId: user.id,
        type: "saved",
        jobId: job.id,
        company: job.company,
        role: job.title
      });

      if (analyze) {
        toast.success("Job saved! Navigating to Analysis Workspace...");
        router.push(`/dashboard/applications/${appId}`);
      } else {
        toast.success("Job saved successfully!");
      }
    } catch (error) {
      toast.error("Failed to save job.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Job Discovery</h1>
        <p className="text-muted-foreground">Find and analyze roles matched to your career profile.</p>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Job title, keywords, or company..." 
            className="w-full pl-10 pr-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div className="md:w-64 relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="City, state, or zip" 
            className="w-full pl-10 pr-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <label className="flex items-center gap-2 px-4 py-3 border border-input rounded-md cursor-pointer hover:bg-secondary/50">
          <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
          <span className="text-sm font-medium">Remote</span>
        </label>
        <button 
          onClick={() => handleSearch()}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md font-medium transition-colors disabled:opacity-70 flex items-center gap-2 justify-center"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          Search
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p>Scanning JSearch and Adzuna for the best opportunities...</p>
          </div>
        )}

        {!isLoading && jobs.length === 0 && query && (
          <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground">No jobs found</h3>
            <p className="mt-1">Try adjusting your search filters or location.</p>
          </div>
        )}

        {!isLoading && jobs.length > 0 && (
          <div className="grid gap-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-medium text-muted-foreground">Showing {jobs.length} roles matched to your profile</span>
            </div>
            {jobs.map((job, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-emerald-50 dark:border-emerald-900/20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      {job.lexicalMatch}%
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold mt-1 tracking-wider">Match</span>
                  </div>
                </div>

                <div className="md:w-3/4">
                  <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline cursor-pointer"><a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a></h3>
                  <div className="flex items-center gap-2 mt-1 mb-4 text-sm font-medium">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{job.company || "Confidential"}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{job.source}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location || "Remote"}</div>
                    {job.salary && <div className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-emerald-500" /> <span className="font-medium text-foreground">{job.salary}</span></div>}
                    {job.type && <div className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.type}</div>}
                    {job.postedAt && <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {new Date(job.postedAt).toLocaleDateString()}</div>}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                    {job.description || "No description provided."}
                  </p>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleSaveJob(job, false)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-secondary text-sm font-medium transition-colors"
                    >
                      <BookmarkPlus className="h-4 w-4" /> Save Job
                    </button>
                    <button 
                      onClick={() => handleSaveJob(job, true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 text-sm font-medium transition-colors"
                    >
                      <Sparkles className="h-4 w-4" /> Analyze Job
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
