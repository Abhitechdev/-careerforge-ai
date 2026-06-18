"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, FileText, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Loader2, Calendar, BarChart3, TrendingUp } from "lucide-react";
import { ATSScoreWidget } from "@/components/resume/ats-score-widget";
import { AnalysisRadarChart } from "@/components/resume/analysis-radar-chart";
import { KeywordGapList } from "@/components/resume/keyword-gap-list";
import * as motion from "framer-motion/client";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatDistanceToNow, format } from "date-fns";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";
import { deleteUploadThingFile } from "@/app/actions/uploadthing";
import { downloadResumeReport } from "@/lib/report-generator";
import { ErrorCatalog } from "@/lib/errors";

// Error boundary to catch Recharts crashes
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("Chart rendering error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
          <p>Chart visualization unavailable. Score data is shown below.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Score bar component for reliable visualization
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const safeScore = typeof score === "number" && !isNaN(score) ? Math.min(100, Math.max(0, score)) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{safeScore}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${safeScore}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function ResumeAnalysisWorkspace() {
  const params = useParams();
  const id = params.id as any;
  
  // @ts-ignore
  const resume = useQuery(api.resumes.get, { id });
  // @ts-ignore
  const replaceResume = useMutation(api.resumes.replace);
  // @ts-ignore
  const analysis = useQuery(api.analyses.get, { resumeId: id });
  // @ts-ignore
  const retryAnalysis = useMutation(api.analyses.retryAnalysis);
  // @ts-ignore
  const scheduleAnalysis = useMutation(api.analyses.scheduleAnalysis);
  
  const [isReplacing, setIsReplacing] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const handleAnalysisStart = async () => {
    try {
      await scheduleAnalysis({ resumeId: id });
      toast.success("Analysis scheduled in background");
    } catch (e: any) {
      if (e.message.includes("RATE_LIMIT_EXCEEDED")) {
        toast.error(ErrorCatalog.RATE_LIMIT_EXCEEDED.message);
      } else if (e.message.includes("CIRCUIT_BREAKER_TRIPPED")) {
        toast.error(ErrorCatalog.CIRCUIT_BREAKER_TRIPPED.message);
      } else {
        toast.error("Failed to schedule analysis. Please try again.");
      }
    }
  };

  // Debug: log analysis data
  React.useEffect(() => {
    console.log("Analysis:", analysis);
    console.log("Resume status:", resume?.analysisStatus);
    if (analysis) {
      console.log("Analysis fields:", {
        overallScore: analysis.overallScore,
        atsScore: analysis.atsScore,
        skillsScore: analysis.skillsScore,
        formattingScore: analysis.formattingScore,
        experienceScore: analysis.experienceScore,
        skills: analysis.skills,
        missingKeywords: analysis.missingKeywords,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        experienceLevel: analysis.experienceLevel,
        targetRoles: analysis.targetRoles,
      });
    }
  }, [analysis, resume?.analysisStatus]);

  if (resume === undefined) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Safely extract analysis scores with fallback to 0
  const overallScore = analysis?.overallScore ?? 0;
  const atsScore = analysis?.atsScore ?? 0;
  const skillsScore = analysis?.skillsScore ?? 0;
  const formattingScore = analysis?.formattingScore ?? 0;
  const experienceScore = analysis?.experienceScore ?? 0;

  // Determine if analysis has valid data
  const hasAnalysisData = analysis && (
    typeof analysis.overallScore === "number" ||
    typeof analysis.atsScore === "number" ||
    typeof analysis.skillsScore === "number"
  );

  // Build radar data with safe values
  const radarData = [
    { subject: "Skills", A: skillsScore, fullMark: 100 },
    { subject: "Format", A: formattingScore, fullMark: 100 },
    { subject: "Experience", A: experienceScore, fullMark: 100 },
    { subject: "ATS/Keywords", A: atsScore, fullMark: 100 },
  ];

  // Check if radar data is valid (all numbers, no NaN)
  const isRadarDataValid = radarData.every(
    (d) => typeof d.A === "number" && !isNaN(d.A) && d.A >= 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/resumes"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight max-w-[300px] sm:max-w-md truncate" title={resume.title}>
              {resume.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Uploaded {formatDistanceToNow(resume.createdAt, { addSuffix: true })} 
              {resume.lastAnalyzed && ` • Analyzed ${formatDistanceToNow(resume.lastAnalyzed, { addSuffix: true })}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsReplacing(!isReplacing)}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isReplacing ? "Cancel Replace" : "Replace"}
          </button>
          <button 
            onClick={() => window.open(resume.fileUrl, "_blank")}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Resume
          </button>
          {resume.analysisStatus === "completed" && hasAnalysisData && (
            <button 
              onClick={async () => {
                try {
                  const toastId = toast.loading("Generating report...");
                  
                  // Capture radar chart
                  let chartImageBase64 = undefined;
                  const chartElement = document.getElementById("radar-chart-export");
                  if (chartElement) {
                    try {
                      // Import html2canvas dynamically to avoid SSR issues
                      const html2canvas = (await import("html2canvas")).default;
                      const canvas = await html2canvas(chartElement, {
                        backgroundColor: "#ffffff", // Force white background for PDF
                        scale: 2 // High resolution
                      });
                      chartImageBase64 = canvas.toDataURL("image/png");
                    } catch (e) {
                      console.error("Failed to capture chart image:", e);
                    }
                  }

                  downloadResumeReport({
                    resumeTitle: resume.title,
                    fileFormat: resume.format,
                    fileSize: resume.fileSize,
                    uploadDate: resume.createdAt,
                    analysisDate: resume.lastAnalyzed,
                    overallScore: overallScore,
                    atsScore: atsScore,
                    skillsScore: skillsScore,
                    experienceScore: experienceScore,
                    formattingScore: formattingScore,
                    skills: analysis?.skills || [],
                    missingKeywords: analysis?.missingKeywords || [],
                    strengths: analysis?.strengths || [],
                    weaknesses: analysis?.weaknesses || [],
                    recommendations: analysis?.recommendations || [],
                    targetRoles: analysis?.targetRoles || [],
                    experienceLevel: analysis?.experienceLevel || "N/A"
                  }, chartImageBase64);
                  
                  toast.success("Report generated successfully", { id: toastId });
                } catch (error) {
                  console.error("Failed to generate report:", error);
                  toast.error("Failed to generate report");
                }
              }}
              className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              <FileText className="mr-2 h-4 w-4" />
              Download Report
            </button>
          )}
        </div>
      </div>

      {isReplacing && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl border border-border bg-card p-6 shadow-sm overflow-hidden"
        >
          <h3 className="text-lg font-semibold mb-4">Replace Resume</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a new version of this resume. This will delete the current file and reset the analysis status.
          </p>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-colors">
            <UploadDropzone
              endpoint="resumeUploader"
              onUploadBegin={() => setUploadProgress(0)}
              onUploadProgress={(p) => setUploadProgress(p)}
              onClientUploadComplete={async (res) => {
                if (res && res.length > 0) {
                  const file = res[0];
                  try {
                    const oldFileKey = await replaceResume({
                      id: resume._id,
                      title: file.name,
                      fileUrl: file.url,
                      fileKey: file.key,
                      format: file.name.endsWith(".docx") ? "docx" : "pdf",
                      fileSize: file.size,
                    });
                    
                    if (oldFileKey) {
                      await deleteUploadThingFile(oldFileKey);
                    }
                    
                    toast.success("Resume replaced successfully.");
                    setIsReplacing(false);
                  } catch (error: any) {
                    toast.error("Failed to replace resume metadata.");
                    console.error(error);
                  }
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Panel: Resume Details & Metadata */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm p-6">
             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                Resume Details
             </h3>
             <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium capitalize ${
                    resume.analysisStatus === 'completed' ? 'text-emerald-500' : 
                    resume.analysisStatus === 'processing' ? 'text-amber-500' : 
                    resume.analysisStatus === 'failed' ? 'text-rose-500' : 'text-indigo-500'
                  }`}>
                    {resume.analysisStatus}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Primary Status</span>
                  <span className="font-medium">{resume.isPrimary ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">File Type</span>
                  <span className="font-medium uppercase">{resume.format}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">File Size</span>
                  <span className="font-medium">{(resume.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground">Uploaded</span>
                  <span className="font-medium">{format(new Date(resume.createdAt), "MMM d, yyyy")}</span>
                </div>
             </div>

             {/* Quick score summary in sidebar when analysis exists */}
             {hasAnalysisData && (
               <div className="mt-6 pt-6 border-t border-border">
                 <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Scores</h4>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                     <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{overallScore}</div>
                     <div className="text-xs text-muted-foreground">Overall</div>
                   </div>
                   <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                     <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{atsScore}</div>
                     <div className="text-xs text-muted-foreground">ATS</div>
                   </div>
                 </div>
               </div>
             )}

             {resume.analysisStatus !== "completed" && (
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    AI Analysis is required to generate insights, score, and recommendations.
                  </p>
                  <button 
                    disabled={resume.analysisStatus === "processing"}
                    onClick={async () => {
                      await handleAnalysisStart();
                    }}
                    className="w-full inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {resume.analysisStatus === "processing" ? "Analyzing..." : "Analyze Resume"}
                  </button>
                </div>
             )}
          </div>
        </div>

        {/* Right Panel: Analysis Dashboard */}
        <div className="lg:col-span-8 space-y-6">
          {resume.analysisStatus === "completed" && hasAnalysisData ? (
            <>
              {/* Row 1: ATS Score + Score Breakdown Bars */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid gap-6 sm:grid-cols-2"
              >
                <ATSScoreWidget score={overallScore} previousScore={0} />

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Score Breakdown
                  </h3>
                  <div className="space-y-4">
                    <ScoreBar label="ATS Score" score={atsScore} color="bg-indigo-500" />
                    <ScoreBar label="Skills" score={skillsScore} color="bg-emerald-500" />
                    <ScoreBar label="Experience" score={experienceScore} color="bg-amber-500" />
                    <ScoreBar label="Formatting" score={formattingScore} color="bg-violet-500" />
                  </div>
                </div>
              </motion.div>

              {/* Row 2: Radar Chart (with error boundary) */}
              {isRadarDataValid && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Category Radar
                  </h3>
                  <ChartErrorBoundary
                    fallback={
                      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                        <p>Radar chart visualization unavailable. See score breakdown above.</p>
                      </div>
                    }
                  >
                    <div id="radar-chart-export" className="bg-card w-full h-full p-4">
                      <AnalysisRadarChart data={radarData} />
                    </div>
                  </ChartErrorBoundary>
                </motion.div>
              )}

              {/* Row 3: Keywords + AI Insights */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="grid gap-6 md:grid-cols-2"
              >
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="font-semibold text-lg mb-4">Keyword Analysis</h3>
                  {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
                    <KeywordGapList 
                      keywords={[
                        ...analysis.missingKeywords.map((k: string) => ({ word: k, priority: 'High' as const, present: false })),
                        ...(analysis.skills || []).slice(0, 6).map((k: string) => ({ word: k, priority: 'Low' as const, present: true })),
                      ]} 
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">No keyword gap data available.</p>
                  )}
                </div>

                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6 shadow-sm relative overflow-hidden flex flex-col">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/20 blur-2xl"></div>
                  <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-semibold text-lg text-indigo-900 dark:text-indigo-100">AI Insights</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {analysis.strengths && analysis.strengths.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Strengths</h4>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            {analysis.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                      {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">Areas for Improvement</h4>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            {analysis.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                          </ul>
                        </div>
                      )}
                      {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-1">Recommendations</h4>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            {analysis.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}
                      {analysis.targetRoles && analysis.targetRoles.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">Target Roles</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {analysis.targetRoles.map((role: string, i: number) => (
                              <span key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.experienceLevel && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">Experience Level</h4>
                          <span className="inline-flex items-center rounded-md bg-indigo-100 dark:bg-indigo-900/40 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                            {analysis.experienceLevel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          ) : resume.analysisStatus === "completed" && analysis === undefined ? (
            /* Analysis query still loading (race condition fix) */
            <div className="rounded-xl border-2 border-dashed border-indigo-500/50 bg-indigo-500/5 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2">Loading Analysis Data...</h3>
              <p className="text-muted-foreground max-w-md">
                Fetching your analysis results. This should only take a moment.
              </p>
            </div>
          ) : resume.analysisStatus === "completed" && !hasAnalysisData ? (
            /* Status is completed but analysis data is null/empty — fallback */
            <div className="rounded-xl border-2 border-dashed border-amber-500/50 bg-amber-500/5 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Analysis Visualization Available</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                The analysis completed but no visualization data was returned. Try re-analyzing your resume.
              </p>
              <button 
                onClick={async () => {
                  await handleAnalysisStart();
                }}
                className="inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-amber-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-analyze Resume
              </button>
            </div>
          ) : resume.analysisStatus === "processing" ? (
            <div className="rounded-xl border-2 border-dashed border-indigo-500/50 bg-indigo-500/5 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analyzing Resume...</h3>
              <p className="text-muted-foreground max-w-md">
                Extracting skills, calculating ATS score, and generating AI insights. This usually takes 10-20 seconds.
              </p>
            </div>
          ) : resume.analysisStatus === "failed" ? (
            <div className="rounded-xl border-2 border-dashed border-rose-500/50 bg-rose-500/5 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analysis Failed</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {resume.analysisError || "We encountered an error while analyzing your resume. This could be due to an unreadable file format or a temporary service issue."}
              </p>
              <button 
                onClick={async () => {
                  await handleAnalysisStart();
                }}
                className="inline-flex h-10 items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-rose-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Analysis
              </button>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border bg-card/50 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analysis Pending</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                This resume hasn't been analyzed yet. Run the AI analysis to extract skills, calculate an ATS score, and generate actionable insights.
              </p>
              <button 
                onClick={async () => {
                  await handleAnalysisStart();
                }}
                className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
