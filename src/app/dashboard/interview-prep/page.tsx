"use client";

import * as React from "react";
import { Mic, Search, Briefcase, FileText, CheckCircle2, AlertTriangle, ArrowRight, BookmarkPlus, ExternalLink, RefreshCw, Trash2, Download, Play, MessageSquare, Target, User, BarChart, ChevronRight } from "lucide-react";
import * as motion from "framer-motion/client";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { downloadInterviewReport } from "@/lib/report-generator";

export default function InterviewPrepPage() {
  const { user } = useUser();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  // Queries
  const resumes = useQuery(api.resumes.list, user ? {} : "skip");
  const interviews = useQuery(api.interviews.getByUserId, user ? { clerkId: user.id } : "skip");
  const completedResumes = resumes?.filter((r: any) => r.analysisStatus === "completed") || [];

  // Step 1: Setup State
  const [selectedResumeId, setSelectedResumeId] = React.useState<string>("");
  const [targetRole, setTargetRole] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [activeInterviewId, setActiveInterviewId] = React.useState<string | null>(null);

  // Step 2: Interview State
  const activeInterview = useQuery(api.interviews.getById, activeInterviewId ? { id: activeInterviewId as any } : "skip");
  const activeQuestions = useQuery(api.interviews.getQuestions, activeInterviewId ? { interviewId: activeInterviewId as any } : "skip");
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userResponse, setUserResponse] = React.useState("");
  const [isEvaluating, setIsEvaluating] = React.useState(false);
  const [showFeedback, setShowFeedback] = React.useState(false);

  // Actions
  const generateInterview = useAction(api.interviewActions.generateInterview);
  const evaluateAnswer = useAction(api.interviewActions.evaluateAnswer);
  const completeInterview = useAction(api.interviewActions.completeInterview);
  const deleteInterview = useMutation(api.interviews.remove);

  React.useEffect(() => {
    if (completedResumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(completedResumes[0]._id);
    }
  }, [completedResumes, selectedResumeId]);

  const handleGenerateInterview = async () => {
    if (!targetRole) {
      toast.error("Please enter a target role.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Generating your personalized mock interview...");

    try {
      const interviewId = await generateInterview({
        resumeId: selectedResumeId ? (selectedResumeId as any) : undefined,
        role: targetRole,
        jobDescription: jobDescription || undefined,
      });

      setActiveInterviewId(interviewId);
      setStep(2);
      setCurrentQuestionIndex(0);
      setUserResponse("");
      setShowFeedback(false);
      toast.success("Interview generated! Good luck.", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Failed to generate interview.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!userResponse.trim()) {
      toast.error("Please enter an answer or skip the question.");
      return;
    }
    if (!activeQuestions || !activeQuestions[currentQuestionIndex]) return;

    setIsEvaluating(true);
    const toastId = toast.loading("Evaluating your response...");
    
    try {
      const currentQ = activeQuestions[currentQuestionIndex];
      await evaluateAnswer({
        questionId: currentQ._id as any,
        question: currentQ.question,
        sampleAnswer: currentQ.sampleAnswer,
        userResponse: userResponse,
      });

      setShowFeedback(true);
      toast.success("Feedback received.", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Failed to evaluate answer", { id: toastId });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (!activeQuestions || !activeQuestions[currentQuestionIndex]) return;
    
    // Auto-evaluate with empty response for 0 score
    setIsEvaluating(true);
    try {
      const currentQ = activeQuestions[currentQuestionIndex];
      await evaluateAnswer({
        questionId: currentQ._id as any,
        question: currentQ.question,
        sampleAnswer: currentQ.sampleAnswer,
        userResponse: "SKIPPED",
      });
      setShowFeedback(true);
    } catch (e) {
      toast.error("Failed to skip");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!activeQuestions) return;

    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserResponse("");
      setShowFeedback(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Finish Interview
      const toastId = toast.loading("Calculating final readiness score...");
      try {
        await completeInterview({ interviewId: activeInterviewId as any });
        setStep(3);
        toast.success("Interview complete!", { id: toastId });
      } catch (e) {
        toast.error("Failed to calculate final score", { id: toastId });
      }
    }
  };

  const handleLoadPastInterview = (id: string, status: string) => {
    setActiveInterviewId(id);
    if (status === "Completed") {
      setStep(3);
    } else {
      setStep(2);
      setCurrentQuestionIndex(0);
      setUserResponse("");
      setShowFeedback(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInterview({ id: id as any });
      toast.success("Interview deleted.");
      if (activeInterviewId === id) {
        setStep(1);
        setActiveInterviewId(null);
      }
    } catch (error) {
      toast.error("Failed to delete interview.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", stroke: "stroke-emerald-600", ring: "stroke-emerald-200" };
    if (score >= 80) return { text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", stroke: "stroke-indigo-600", ring: "stroke-indigo-200" };
    if (score >= 70) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", stroke: "stroke-amber-500", ring: "stroke-amber-200" };
    return { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", stroke: "stroke-rose-600", ring: "stroke-rose-200" };
  };

  const getReadinessBadge = (score: number) => {
    if (score >= 90) return { label: "Interview Ready", color: "bg-emerald-100 text-emerald-800" };
    if (score >= 80) return { label: "Strong Candidate", color: "bg-indigo-100 text-indigo-800" };
    if (score >= 70) return { label: "Needs Improvement", color: "bg-amber-100 text-amber-800" };
    return { label: "Practice Required", color: "bg-rose-100 text-rose-800" };
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Interview Prep</h1>
          <p className="text-muted-foreground mt-1">Practice with an AI hiring manager tailored to your exact resume and target role.</p>
        </div>
        {step !== 1 && (
          <button 
            onClick={() => { setStep(1); setActiveInterviewId(null); }}
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            New Interview
          </button>
        )}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-indigo-500" />
                Configure Mock Interview
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target Role <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g. Frontend React Engineer" 
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" 
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block flex items-center justify-between">
                    <span>Select Base Resume</span>
                    <span className="text-xs text-muted-foreground font-normal">Optional</span>
                  </label>
                  <select 
                    value={selectedResumeId}
                    onChange={e => setSelectedResumeId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    disabled={resumes === undefined}
                  >
                    <option value="">Do not use a resume (General Questions Only)</option>
                    {resumes === undefined && <option value="" disabled>Loading resumes...</option>}
                    {completedResumes.map((r: any) => (
                      <option key={r._id} value={r._id}>{r.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block flex items-center justify-between">
                    <span>Target Job Description</span>
                    <span className="text-xs text-muted-foreground font-normal">Optional</span>
                  </label>
                  <textarea 
                    rows={4} 
                    placeholder="Paste the job description to tailor the questions..."
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleGenerateInterview}
                    disabled={isGenerating || !targetRole}
                    className="w-full inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating AI Interview...</>
                    ) : (
                      <><Play className="mr-2 h-4 w-4 fill-white" /> Start Interview</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-full">
              <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-indigo-500" />
                Previous Interviews
              </h2>
              
              {!interviews && (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {interviews && interviews.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-border/50 p-10 text-center flex flex-col items-center justify-center bg-secondary/10">
                  <Mic className="h-10 w-10 text-indigo-500 mb-3 opacity-50" />
                  <h3 className="text-lg font-bold text-foreground mb-1">No interviews yet</h3>
                  <p className="text-sm text-muted-foreground">Configure a mock interview on the left to start practicing.</p>
                </div>
              )}

              {interviews && interviews.length > 0 && (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {interviews.map((inv: any) => (
                    <div key={inv._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border bg-background hover:border-indigo-200 transition-colors gap-4">
                      <div>
                        <h4 className="font-semibold text-sm">{inv.role}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm ${
                            inv.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {inv.status}
                          </span>
                          {inv.status === "Completed" && inv.overallScore && (
                            <span className="text-xs font-medium text-muted-foreground">
                              Score: <span className={getScoreColor(inv.overallScore).text}>{inv.overallScore}%</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => handleLoadPastInterview(inv._id, inv.status)}
                          className="flex-1 sm:flex-none inline-flex h-8 items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium hover:bg-secondary/80 transition-colors"
                        >
                          {inv.status === "Completed" ? "View Report" : "Resume"}
                        </button>
                        <button 
                          onClick={() => handleDelete(inv._id)}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
        </motion.div>
      )}

      {step === 2 && activeInterview && activeQuestions && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">Interviewing for <strong className="text-foreground">{activeInterview.role}</strong></span>
            <span className="font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Question {currentQuestionIndex + 1} of {activeQuestions.length}
            </span>
          </div>

          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
            ></div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Question Header */}
            <div className="p-6 md:p-8 bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-border">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                  {activeQuestions[currentQuestionIndex].category}
                </span>
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                  activeQuestions[currentQuestionIndex].difficulty === 'Hard' ? 'bg-rose-100 text-rose-800' :
                  activeQuestions[currentQuestionIndex].difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {activeQuestions[currentQuestionIndex].difficulty}
                </span>
              </div>
              <h2 className="text-2xl font-bold leading-tight">
                {activeQuestions[currentQuestionIndex].question}
              </h2>
            </div>

            {/* Answer Area */}
            <div className="p-6 md:p-8 space-y-6">
              {!showFeedback ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center justify-between">
                      <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Your Answer</span>
                      <span className="text-xs text-muted-foreground">{userResponse.length} chars</span>
                    </label>
                    <textarea 
                      rows={8}
                      placeholder="Type your response here. Try to use the STAR method (Situation, Task, Action, Result) if applicable..."
                      value={userResponse}
                      onChange={e => setUserResponse(e.target.value)}
                      className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 leading-relaxed resize-y"
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <button 
                      onClick={handleSkipQuestion}
                      disabled={isEvaluating}
                      className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                      Skip Question
                    </button>
                    <button 
                      onClick={handleSubmitResponse}
                      disabled={isEvaluating || !userResponse.trim()}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isEvaluating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Submit Answer
                    </button>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Feedback Box */}
                  <div className={`rounded-xl p-5 border ${getScoreColor(activeQuestions[currentQuestionIndex].score || 0).bg}`}>
                    <div className="flex items-center justify-between mb-3 border-b border-black/10 dark:border-white/10 pb-3">
                      <h3 className="font-bold flex items-center gap-2">
                        <User className="h-5 w-5" /> Recruiter Evaluation
                      </h3>
                      <div className="text-xl font-black">{activeQuestions[currentQuestionIndex].score}/100</div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {activeQuestions[currentQuestionIndex].feedback}
                    </p>
                  </div>

                  {/* Ideal Answer Box */}
                  <div className="rounded-xl border border-border bg-secondary/30 p-5">
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                      <CheckCircle2 className="h-4 w-4" /> Ideal STAR Answer Example
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground italic">
                      {activeQuestions[currentQuestionIndex].sampleAnswer}
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={handleNextQuestion}
                      className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-bold text-white shadow transition-colors hover:bg-indigo-700"
                    >
                      {currentQuestionIndex < activeQuestions.length - 1 ? (
                        <>Next Question <ArrowRight className="ml-2 h-4 w-4" /></>
                      ) : (
                        <>Finish Interview <CheckCircle2 className="ml-2 h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {step === 3 && activeInterview && activeQuestions && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Interview Results</h2>
              <p className="text-muted-foreground">Target Role: {activeInterview.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold ${getReadinessBadge(activeInterview.overallScore || 0).color}`}>
                {getReadinessBadge(activeInterview.overallScore || 0).label}
              </span>
              <button 
                onClick={() => {
                  downloadInterviewReport({
                    candidateName: user?.fullName || "Candidate",
                    role: activeInterview.role,
                    overallScore: activeInterview.overallScore || 0,
                    technicalScore: activeInterview.technicalScore || 0,
                    behavioralScore: activeInterview.behavioralScore || 0,
                    communicationScore: activeInterview.communicationScore || 0,
                    projectScore: activeInterview.projectScore || 0,
                    confidenceScore: activeInterview.confidenceScore || 0,
                    strengths: activeInterview.strengths || [],
                    weaknesses: activeInterview.weaknesses || [],
                    improvementPlan: activeInterview.improvementPlan || [],
                    questions: activeQuestions.map((q: any) => ({
                      question: q.question,
                      category: q.category,
                      score: q.score || 0,
                      feedback: q.feedback || "",
                      sampleAnswer: q.sampleAnswer
                    }))
                  });
                }}
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent transition-colors shadow-sm"
              >
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            {/* Left: Score Overview */}
            <div className="md:col-span-5 space-y-6">
              <div className="rounded-xl border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className={`absolute inset-0 opacity-10 ${getScoreColor(activeInterview.overallScore || 0).bg.split(' ')[0]}`}></div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 relative z-10">Overall Readiness</h3>
                
                <div className="relative flex items-center justify-center h-40 w-40 mb-2 z-10">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                    <circle className={getScoreColor(activeInterview.overallScore || 0).ring} strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                    <motion.circle 
                      className={getScoreColor(activeInterview.overallScore || 0).stroke} 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      strokeDasharray={`${((activeInterview.overallScore || 0) / 100) * 251.2} 251.2`} 
                      transform="rotate(-90 50 50)" 
                    />
                  </svg>
                  <span className="text-5xl font-black">{Math.round(activeInterview.overallScore || 0)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><BarChart className="h-4 w-4 text-indigo-500" /> Category Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: "Technical", score: activeInterview.technicalScore },
                    { label: "Behavioral", score: activeInterview.behavioralScore },
                    { label: "Communication", score: activeInterview.communicationScore },
                    { label: "Project-Based", score: activeInterview.projectScore },
                    { label: "Confidence", score: activeInterview.confidenceScore },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-muted-foreground">{item.label}</span>
                        <span className="font-bold">{Math.round(item.score || 0)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div 
                          className={`h-full ${getScoreColor(item.score || 0).bg.split(' ')[0].replace('bg-', 'bg-').replace('-50', '-500')}`} 
                          style={{ width: `${item.score || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Insights */}
            <div className="md:col-span-7 space-y-6">
              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4" /> Core Strengths
                  </h3>
                  <ul className="space-y-2">
                    {activeInterview.strengths?.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">•</span> <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/10 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-rose-800 dark:text-rose-400 flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4" /> Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {activeInterview.weaknesses?.map((w: string, i: number) => (
                      <li key={i} className="text-sm text-rose-900 dark:text-rose-200 flex items-start gap-2">
                        <span className="text-rose-500 mt-0.5">•</span> <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Plan */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Target className="h-4 w-4 text-indigo-500" /> Interview Action Plan
                </h3>
                <div className="space-y-3">
                  {activeInterview.improvementPlan?.map((plan: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{plan}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Question Review */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm mt-8">
            <h3 className="font-bold text-lg mb-4">Detailed Question Review</h3>
            <div className="space-y-4">
              {activeQuestions.map((q: any, i: number) => (
                <details key={q._id} className="group border border-border rounded-lg bg-secondary/20 open:bg-card overflow-hidden">
                  <summary className="flex items-center justify-between p-4 font-medium cursor-pointer hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm">Q{i + 1}.</span>
                      <span className="text-sm line-clamp-1 group-open:line-clamp-none transition-all">{q.question}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-sm ${getScoreColor(q.score || 0).bg}`}>
                        {q.score}/100
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                    </div>
                  </summary>
                  <div className="p-4 border-t border-border space-y-4 bg-background">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase">Your Answer</span>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{q.userResponse === "SKIPPED" ? <span className="text-rose-500 italic">Skipped</span> : q.userResponse}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-500 uppercase">Recruiter Feedback</span>
                      <p className="text-sm mt-1">{q.feedback}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
