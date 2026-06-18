"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Video, Mic, CheckCircle2, ChevronRight, PlayCircle, Square, Activity } from "lucide-react";
import * as motion from "framer-motion/client";

export default function MockInterviewWorkspace() {
  const [step, setStep] = React.useState(1);
  const [role, setRole] = React.useState("Frontend Engineer");
  const [type, setType] = React.useState("Behavioral");
  const [isRecording, setIsRecording] = React.useState(false);
  const [time, setTime] = React.useState(0);

  // Timer logic for recording
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else if (!isRecording && time !== 0) {
      // pause logic handled here if needed
    }
    return () => clearInterval(interval);
  }, [isRecording, time]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleComplete = () => {
    setIsRecording(false);
    setStep(4);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between pb-4 border-b border-border mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/interview-prep"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mock Interview Session</h1>
            <p className="text-sm text-muted-foreground mt-1">Practice and get AI feedback instantly.</p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="hidden md:flex items-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold ${
                step === s ? 'bg-indigo-600 text-white' : 
                step > s ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s !== 4 && <div className={`h-1 w-8 rounded-full ${step > s ? 'bg-emerald-500' : 'bg-secondary'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="max-w-4xl mx-auto h-full">
          {/* Step 1: Select Role */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-12 text-center max-w-lg mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6">
                <Video className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">What role are you interviewing for?</h2>
              <p className="text-muted-foreground">This helps the AI tailor the difficulty and domain of the questions.</p>
              
              <div className="space-y-3 pt-4 text-left">
                {["Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "Product Manager"].map(r => (
                  <button 
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border ${role === r ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-border bg-card hover:bg-muted/50'} transition-colors`}
                  >
                    <span className="font-medium">{r}</span>
                    {role === r && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full inline-flex h-12 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 mt-6"
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Choose Type */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-12 text-center max-w-lg mx-auto">
              <h2 className="text-2xl font-bold">Select Interview Type</h2>
              <p className="text-muted-foreground">Choose the category of questions you want to practice for <span className="font-semibold text-foreground">{role}</span>.</p>
              
              <div className="grid gap-4 pt-4 text-left">
                {[
                  { t: "HR / Recruiter Screen", d: "Basic introduction, culture fit, and expectations." },
                  { t: "Behavioral", d: "STAR method questions focusing on past experiences." },
                  { t: "Technical", d: "Deep dive into domain-specific knowledge and concepts." }
                ].map(item => (
                  <button 
                    key={item.t}
                    onClick={() => setType(item.t)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border ${type === item.t ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-border bg-card hover:bg-muted/50'} transition-colors text-left`}
                  >
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${type === item.t ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-muted-foreground'}`}>
                      {type === item.t && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.t}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.d}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 inline-flex h-12 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
                  Start Session <PlayCircle className="ml-2 h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Active Session */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col gap-6">
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-900/10 p-6 shadow-sm text-center">
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-400 mb-3">
                  Question 1 / 5
                </span>
                <h2 className="text-2xl font-bold text-indigo-950 dark:text-indigo-100 leading-tight max-w-2xl mx-auto">
                  &quot;Tell me about a time you had to optimize the performance of a complex React application. What was your approach?&quot;
                </h2>
              </div>

              <div className="flex-1 rounded-xl border border-border bg-card shadow-sm p-6 flex flex-col items-center justify-center relative overflow-hidden">
                {!isRecording ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Mic className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Ready to answer?</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">Click start recording to capture your voice. The AI will analyze your speech and content.</p>
                    </div>
                    <button 
                      onClick={() => setIsRecording(true)}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-rose-600 px-8 text-sm font-medium text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-700 hover:scale-105"
                    >
                      <Mic className="mr-2 h-4 w-4" /> Start Recording
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-6 w-full max-w-md">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-rose-500/30 animate-ping"></div>
                      <Mic className="h-10 w-10 animate-pulse" />
                    </div>
                    
                    <div>
                      <div className="text-3xl font-mono font-bold text-rose-600 dark:text-rose-400">{formatTime(time)}</div>
                      <div className="flex items-center justify-center gap-2 mt-2 text-rose-600/80 dark:text-rose-400/80 font-medium">
                        <Activity className="h-4 w-4 animate-pulse" /> Recording...
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={handleComplete}
                        className="flex-1 inline-flex h-12 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Finish Answer
                      </button>
                      <button 
                        onClick={() => { setIsRecording(false); setTime(0); }}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                        title="Stop & Reset"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Feedback Dashboard */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center max-w-lg mx-auto mb-8 pt-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Session Completed!</h2>
                <p className="text-muted-foreground mt-1">Here is the AI-generated feedback for your response.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Communication Score</h3>
                  <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">82<span className="text-lg text-indigo-400/50">/100</span></div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Technical Score</h3>
                  <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">78<span className="text-lg text-emerald-400/50">/100</span></div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Confidence Score</h3>
                  <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">84<span className="text-lg text-amber-400/50">/100</span></div>
                </div>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-900/10 p-6">
                <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-300 mb-4">Areas for Improvement</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-rose-800/90 dark:text-rose-200/80">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0"></div>
                    <p><strong>Be more concise:</strong> Your answer took 3 minutes. Try to use the STAR method to keep your response around 90-120 seconds.</p>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-rose-800/90 dark:text-rose-200/80">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0"></div>
                    <p><strong>Technical Depth:</strong> When mentioning code splitting, explain <em>how</em> you implemented it (e.g., React.lazy, dynamic imports) rather than just stating you used it.</p>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-rose-800/90 dark:text-rose-200/80">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0"></div>
                    <p><strong>Metrics:</strong> You missed an opportunity to quantify the result. State the exact percentage the performance improved by.</p>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => { setStep(3); setTime(0); }}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground mr-4"
                >
                  Retry Question
                </button>
                <Link 
                  href="/dashboard/interview-prep"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700"
                >
                  Return to Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
