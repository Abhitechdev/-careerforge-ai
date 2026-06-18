"use client";

import * as React from "react";
import { Search, Briefcase, FileText, CheckCircle2, AlertTriangle, ArrowRight, BookmarkPlus, ExternalLink, RefreshCw, Trash2, Download, Copy, ExternalLink as ExtLink, Target } from "lucide-react";
import * as motion from "framer-motion/client";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { downloadJobMatchReport } from "@/lib/report-generator";
import { Document, Packer, Paragraph, TextRun } from "docx";

export default function JobMatchesPage() {
  const { user } = useUser();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);

  // Cover Letter State
  const [clStyle, setClStyle] = React.useState("Professional");
  const [isGeneratingCL, setIsGeneratingCL] = React.useState(false);
  const [generatedCL, setGeneratedCL] = React.useState("");

  // History State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("newest");

  // Form State
  const [selectedResumeId, setSelectedResumeId] = React.useState<string>("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [activeMatchId, setActiveMatchId] = React.useState<string | null>(null);

  // Queries
  const resumes = useQuery(api.resumes.list, user ? {} : "skip");
  const savedMatches = useQuery(api.jobMatches.getByUserId, user ? { clerkId: user.id } : "skip");
  const activeMatch = useQuery(api.jobMatches.getById, activeMatchId ? { id: activeMatchId as any } : "skip");

  // Actions
  const analyzeMatch = useAction(api.jobMatchActions.analyzeJobMatch);
  const deleteMatch = useMutation(api.jobMatches.remove);
  const generateCL = useAction(api.coverLetterActions.generateCoverLetter);

  const completedResumes = resumes?.filter((r: any) => r.analysisStatus === "completed") || [];

  React.useEffect(() => {
    if (completedResumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(completedResumes[0]._id);
    }
  }, [completedResumes, selectedResumeId]);

  const handleAnalyze = async () => {
    if (!selectedResumeId || !jobTitle || !companyName || !jobDescription) {
      toast.error("Please fill in all fields and select a resume.");
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);
    const toastId = toast.loading("Analyzing job compatibility...");

    try {
      const matchId = await analyzeMatch({
        resumeId: selectedResumeId as any,
        jobTitle,
        companyName,
        location: location || "Remote",
        jobDescription,
      });

      setActiveMatchId(matchId);
      setShowResults(true);
      toast.success("Analysis complete!", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to analyze job match.", { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMatch({ id: id as any });
      toast.success("Job match deleted.");
      if (activeMatchId === id) {
        setShowResults(false);
        setActiveMatchId(null);
      }
    } catch (error) {
      toast.error("Failed to delete job match.");
    }
  };

  const loadSavedMatch = (id: string) => {
    setActiveMatchId(id);
    setShowResults(true);
    setGeneratedCL(""); // reset cover letter view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateCL = async () => {
    if (!activeMatch) return;
    setIsGeneratingCL(true);
    const toastId = toast.loading("Drafting cover letter...");
    try {
      const res = await generateCL({
        resumeId: activeMatch.resumeId as any,
        jobTitle: activeMatch.role,
        companyName: activeMatch.company,
        jobDescription: activeMatch.jobDescription,
        style: clStyle as any,
      });
      setGeneratedCL(res.content);
      toast.success("Cover letter ready!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Failed to generate cover letter", { id: toastId });
    } finally {
      setIsGeneratingCL(false);
    }
  };

  const downloadCLDocx = async () => {
    if (!generatedCL) return;
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: generatedCL.split('\n').map(text => new Paragraph({
            children: [new TextRun(text)]
          }))
        }]
      });
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CoverLetter_${activeMatch?.company || 'Job'}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Failed to generate DOCX");
    }
  };

  // Helper for gauge color
  const getScoreColor = (score: number) => {
    if (score >= 80) return { stroke: "stroke-emerald-600", bg: "bg-emerald-50 border-emerald-200 text-emerald-800", ring: "stroke-emerald-200" };
    if (score >= 60) return { stroke: "stroke-amber-500", bg: "bg-amber-50 border-amber-200 text-amber-800", ring: "stroke-amber-200" };
    return { stroke: "stroke-rose-600", bg: "bg-rose-50 border-rose-200 text-rose-800", ring: "stroke-rose-200" };
  };

  // Filter and sort saved matches
  const filteredMatches = React.useMemo(() => {
    if (!savedMatches) return [];
    let matches = [...savedMatches];
    
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      matches = matches.filter(m => m.company.toLowerCase().includes(lowerQ) || m.role.toLowerCase().includes(lowerQ));
    }

    if (sortBy === "newest") {
      matches.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === "highest") {
      matches.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === "lowest") {
      matches.sort((a, b) => a.matchScore - b.matchScore);
    }

    return matches;
  }, [savedMatches, searchQuery, sortBy]);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Match Engine</h1>
        <p className="text-muted-foreground mt-1">Compare your resume against any job description to discover your true compatibility.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Panel: Input Workspace */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              New Job Analysis
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Job Title & Company</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. Frontend Engineer" 
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" 
                  />
                  <input 
                    type="text" 
                    placeholder="Company" 
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="flex h-10 w-full sm:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Location (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Remote, NY" 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" 
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Paste Job Description</label>
                <textarea 
                  rows={8} 
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Select Resume to Compare</label>
                <select 
                  value={selectedResumeId}
                  onChange={e => setSelectedResumeId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  disabled={resumes === undefined}
                >
                  {resumes === undefined && <option value="">Loading resumes...</option>}
                  {resumes !== undefined && completedResumes.length === 0 && <option value="">No analyzed resumes available</option>}
                  {completedResumes.map((r: any) => (
                    <option key={r._id} value={r._id}>
                      {r.title} (Analyzed on {new Date(r.updatedAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || completedResumes.length === 0}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Search className="mr-2 h-4 w-4" /> Analyze Compatibility</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!showResults && !isAnalyzing ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="rounded-full bg-secondary p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Analysis Active</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Paste a job description on the left and hit Analyze to see your compatibility score and missing skills.</p>
            </div>
          ) : isAnalyzing ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center h-full flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
              <h3 className="text-lg font-semibold">Running Deep Match Analysis...</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Applying weighted scoring matrix across experience, skills, and education requirements.</p>
            </div>
          ) : activeMatch ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between bg-card rounded-xl border border-border p-5 shadow-sm gap-4">
                <div>
                  <h2 className="font-bold text-xl">{activeMatch.role}</h2>
                  <p className="text-sm text-muted-foreground">{activeMatch.company} • {activeMatch.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    activeMatch.matchScore >= 80 ? "bg-emerald-100 text-emerald-800" :
                    activeMatch.matchScore >= 60 ? "bg-amber-100 text-amber-800" :
                    "bg-rose-100 text-rose-800"
                  }`}>
                    {activeMatch.matchScore >= 80 ? "Ready to Apply" : activeMatch.matchScore >= 60 ? "Needs Minor Improvements" : "Needs Significant Improvements"}
                  </span>
                  <button 
                    onClick={() => {
                      if (!activeMatch) return;
                      const resumeName = resumes?.find((r: any) => r._id === activeMatch.resumeId)?.title || "Resume";
                      downloadJobMatchReport({
                        resumeTitle: resumeName,
                        jobTitle: activeMatch.role,
                        companyName: activeMatch.company,
                        matchScore: activeMatch.matchScore,
                        skillsScore: activeMatch.skillsMatch,
                        experienceScore: activeMatch.experienceMatch,
                        keywordScore: activeMatch.keywordMatch,
                        educationScore: activeMatch.educationMatch,
                        matchSummary: activeMatch.matchSummary,
                        scoreReasoning: activeMatch.scoreReasoning,
                        missingSkills: activeMatch.missingSkills,
                        recommendations: activeMatch.recommendations || [],
                        learningPath: activeMatch.learningPath || [],
                        coverLetter: generatedCL || undefined
                      });
                    }}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent transition-colors" 
                    title="Export PDF Report"
                  >
                    <Download className="h-4 w-4 text-muted-foreground mr-1" /> PDF Report
                  </button>
                </div>
              </div>

              {/* Recruiter Summary */}
              {activeMatch.matchSummary && (
                <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 p-5 text-sm text-indigo-900 dark:text-indigo-200">
                  <div className="font-semibold mb-1 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Recruiter Summary
                  </div>
                  <p className="leading-relaxed">{activeMatch.matchSummary}</p>
                </div>
              )}

              {/* Match Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`col-span-1 rounded-xl border p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden ${getScoreColor(activeMatch.matchScore).bg}`}>
                  <h3 className="text-sm font-medium mb-2 mt-2">Overall Match</h3>
                  <div className="relative flex items-center justify-center h-28 w-28 mb-2">
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                      <circle className={getScoreColor(activeMatch.matchScore).ring} strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                      <motion.circle 
                        className={getScoreColor(activeMatch.matchScore).stroke} 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        strokeDasharray={`${(activeMatch.matchScore / 100) * 251.2} 251.2`} 
                        transform="rotate(-90 50 50)" 
                      />
                    </svg>
                    <span className="text-3xl font-bold">{activeMatch.matchScore}%</span>
                  </div>
                </div>

                <div className="col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Match Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Skills Match (40%)", score: activeMatch.skillsMatch },
                      { label: "Keyword Match (25%)", score: activeMatch.keywordMatch },
                      { label: "Experience Match (20%)", score: activeMatch.experienceMatch },
                      { label: "Education Match (15%)", score: activeMatch.educationMatch },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{item.label}</span>
                          <span className="font-bold">{item.score}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full ${item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${item.score}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Score Reasoning */}
              {activeMatch.scoreReasoning && (
                <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-4 italic">
                  <span className="font-medium not-italic text-foreground">Score Reasoning:</span> {activeMatch.scoreReasoning}
                </div>
              )}

              {/* Categorized Missing Skills */}
              {activeMatch.missingSkills && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-rose-500" /> Missing Job Requirements
                  </h3>
                  
                  {activeMatch.missingSkills.critical && activeMatch.missingSkills.critical.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-rose-600 mb-2 uppercase tracking-wider">Critical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeMatch.missingSkills?.critical?.map((skill: any, i: any) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 border border-rose-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeMatch.missingSkills.niceToHave && activeMatch.missingSkills.niceToHave.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-amber-600 mb-2 uppercase tracking-wider">Nice to Have</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeMatch.missingSkills?.niceToHave?.map((skill: any, i: any) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeMatch.missingSkills.optional && activeMatch.missingSkills.optional.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wider">Optional / Bonus</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeMatch.missingSkills?.optional?.map((skill: any, i: any) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Learning Path */}
              {activeMatch.learningPath && activeMatch.learningPath.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Briefcase className="h-4 w-4 text-emerald-500" /> Recommended Learning Path
                  </h3>
                  <div className="space-y-3">
                    {activeMatch.learningPath?.map((item: any, i: any) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                        <span className="font-medium text-sm">{item.skill}</span>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <ArrowRight className="h-4 w-4" />
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">{item.resource}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter Generator Section */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm mt-6">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  AI Cover Letter Generator
                </h3>
                
                {!generatedCL ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Generate a highly personalized cover letter incorporating your exact skills, projects, and education from your resume.</p>
                    
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Select Tone / Style</label>
                      <select 
                        value={clStyle}
                        onChange={e => setClStyle(e.target.value)}
                        className="flex h-10 w-full md:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <option value="Professional">Professional (Corporate Format)</option>
                        <option value="Recruiter">Recruiter Focused (Highlights Keywords)</option>
                        <option value="Startup">Startup Focused (Adaptability & Ownership)</option>
                        <option value="FAANG">FAANG Style (Scale & Impact)</option>
                        <option value="Fresher">Fresher Version (Potential & Projects)</option>
                      </select>
                    </div>

                    <button 
                      onClick={handleGenerateCL}
                      disabled={isGeneratingCL}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isGeneratingCL ? (
                        <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Drafting Letter...</>
                      ) : (
                        <><FileText className="mr-2 h-4 w-4" /> Generate Personalized Cover Letter</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                        Generated in {clStyle} Style
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(generatedCL);
                            toast.success("Copied to clipboard");
                          }}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent transition-colors"
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </button>
                        <button 
                          onClick={downloadCLDocx}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent transition-colors"
                        >
                          <Download className="h-3 w-3 mr-1" /> DOCX
                        </button>
                        <button 
                          onClick={() => setGeneratedCL("")}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent transition-colors"
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>
                    
                    <div className="rounded-md border border-input bg-background/50 p-4">
                      <textarea 
                        className="w-full h-[400px] bg-transparent outline-none resize-y text-sm leading-relaxed"
                        value={generatedCL}
                        onChange={(e) => setGeneratedCL(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>

      {/* Saved Job Matches */}
      <div className="pt-8 border-t border-border mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold tracking-tight">Saved Opportunities</h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search company or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Match</option>
              <option value="lowest">Lowest Match</option>
            </select>
          </div>
        </div>
        
        {!savedMatches && (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {filteredMatches.length === 0 && savedMatches && savedMatches.length > 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            No matches found for your search.
          </div>
        )}

        {savedMatches && savedMatches.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-border/50 p-10 text-center flex flex-col items-center justify-center bg-secondary/10">
            <Target className="h-10 w-10 text-indigo-500 mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-foreground mb-1">No saved matches yet</h3>
            <p className="text-sm text-muted-foreground">Analyze a job description above to evaluate your compatibility and save it here.</p>
          </div>
        )}

        {filteredMatches.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.map(job => (
              <div key={job._id} className={`rounded-xl border ${activeMatchId === job._id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-border'} bg-card p-5 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg max-w-[150px] truncate" title={job.role}>{job.role}</h3>
                      <p className="text-sm text-muted-foreground max-w-[150px] truncate" title={job.company}>{job.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(job.createdAt, { addSuffix: true })}</p>
                    </div>
                    <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-full border-2 ${getScoreColor(job.matchScore).bg}`}>
                      <span className="text-sm font-bold">{job.matchScore}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 mt-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                      job.matchScore >= 80 ? "bg-emerald-100 text-emerald-800" :
                      job.matchScore >= 60 ? "bg-amber-100 text-amber-800" :
                      "bg-rose-100 text-rose-800"
                    }`}>
                      {job.matchScore >= 80 ? "Ready to Apply" : job.matchScore >= 60 ? "Minor Improvements" : "Needs Work"}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <button 
                    onClick={() => loadSavedMatch(job._id)}
                    className="flex-1 inline-flex h-8 items-center justify-center rounded-md bg-indigo-600 px-3 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <Search className="mr-1.5 h-3 w-3" /> View Details
                  </button>
                  <button 
                    onClick={() => handleDelete(job._id)}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors" 
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
