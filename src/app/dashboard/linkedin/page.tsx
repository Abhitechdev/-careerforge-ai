"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Link as LinkedinIcon, Sparkles, CheckCircle2, AlertTriangle, ChevronRight, Activity, Award } from "lucide-react";
import * as motion from "framer-motion/client";

export default function LinkedinOptimizationPage() {
  const { user } = useUser();
  const profile = useQuery(api.networking.getLinkedinProfile, user ? { clerkId: user.id } : "skip");
  const saveProfile = useMutation(api.networking.saveLinkedinProfile);

  const [url, setUrl] = React.useState("");
  const [headline, setHeadline] = React.useState("");
  const [about, setAbout] = React.useState("");
  const [skills, setSkills] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsAnalyzing(true);
    
    // Simulate AI Analysis
    setTimeout(async () => {
      const headlineScore = headline.length > 20 ? 85 : 50;
      const aboutScore = about.length > 100 ? 90 : 60;
      const skillsScore = skills.split(",").length >= 5 ? 88 : 45;
      
      const totalScore = Math.round((headlineScore + aboutScore + skillsScore) / 3);
      
      const recommendations = [];
      if (headlineScore < 70) recommendations.push("Improve headline clarity and add your target role.");
      if (aboutScore < 70) recommendations.push("Add more measurable achievements to your about section.");
      if (skillsScore < 70) recommendations.push("Increase keyword coverage by adding at least 5 core skills.");
      if (totalScore >= 70) recommendations.push("Add project links and GitHub repositories to stand out.");

      await saveProfile({
        clerkId: user.id,
        profileUrl: url,
        linkedinScore: totalScore,
        headlineScore,
        aboutScore,
        skillsScore,
        recommendations: recommendations.length > 0 ? recommendations : ["Your profile is highly optimized! Keep networking."],
      });

      setIsAnalyzing(false);
    }, 2000);
  };

  React.useEffect(() => {
    if (profile) {
      if (!url && profile.profileUrl) setUrl(profile.profileUrl);
    }
  }, [profile]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LinkedIn Optimization</h1>
          <p className="text-muted-foreground mt-1">Analyze and improve your LinkedIn profile to attract more recruiters.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <LinkedinIcon className="h-5 w-5 text-[#0A66C2]" />
              Profile Details
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                <input value={url} onChange={e => setUrl(e.target.value)} type="url" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Headline</label>
                <input value={headline} onChange={e => setHeadline(e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]" placeholder="e.g. Software Engineer | React | Node.js" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">About Section</label>
                <textarea rows={4} value={about} onChange={e => setAbout(e.target.value)} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]" placeholder="Paste your about section here..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Top Skills (comma separated)</label>
                <input value={skills} onChange={e => setSkills(e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]" placeholder="React, TypeScript, AWS..." />
              </div>
              
              <button disabled={isAnalyzing || (!headline && !about && !skills)} type="submit" className="w-full bg-[#0A66C2] hover:bg-[#084e96] text-white py-2 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
                {isAnalyzing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Sparkles className="h-4 w-4" />}
                {isAnalyzing ? "Analyzing Profile..." : "Analyze Profile"}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-7 space-y-6">
          {profile ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[#0A66C2]"></div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 relative z-10">Overall LinkedIn Score</h3>
                
                <div className="relative flex items-center justify-center h-40 w-40 mb-2 z-10">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                    <circle className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                    <motion.circle 
                      className="stroke-[#0A66C2]" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      strokeDasharray={`${(profile.linkedinScore / 100) * 251.2} 251.2`} 
                      transform="rotate(-90 50 50)" 
                    />
                  </svg>
                  <span className="text-5xl font-black">{profile.linkedinScore}</span>
                </div>
                <p className="text-sm text-muted-foreground z-10 mt-2">
                  Last analyzed on {new Date(profile.lastAnalyzedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <span className="block text-2xl font-bold mb-1 text-[#0A66C2]">{profile.headlineScore}</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase">Headline</span>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <span className="block text-2xl font-bold mb-1 text-[#0A66C2]">{profile.aboutScore}</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase">About</span>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <span className="block text-2xl font-bold mb-1 text-[#0A66C2]">{profile.skillsScore}</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase">Skills</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-amber-500" />
                  Recommendations
                </h3>
                <ul className="space-y-3">
                  {profile.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 bg-secondary/30 p-3 rounded-lg border border-border">
                      {profile.linkedinScore >= 80 ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                      )}
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center bg-secondary/10 h-full">
              <Activity className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Profile Analyzed Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Enter your LinkedIn details on the left and click Analyze Profile to get your score and personalized recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
