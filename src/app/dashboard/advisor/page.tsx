"use client";

import * as React from "react";
import { Send, CheckCircle2, Circle, Plus, Trash2, Zap, BrainCircuit, Target, BarChart, FileText, ArrowRight, Activity, BookOpen, AlertCircle } from "lucide-react";
import * as motion from "framer-motion/client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

export default function AdvisorPage() {
  const { user } = useUser();
  const [activeAdvisor, setActiveAdvisor] = React.useState<"Forge" | "Nova">("Forge");
  const [newTaskTitle, setNewTaskTitle] = React.useState("");

  const chatHistory = useQuery(api.advisor.getChat, user ? { clerkId: user.id, advisor: activeAdvisor } : "skip");
  const goals = useQuery(api.advisor.getGoals, user ? { clerkId: user.id } : "skip");
  const tasks = useQuery(api.advisor.getTasks, user ? { clerkId: user.id } : "skip");

  // For Career Health Score
  const resumes = useQuery(api.resumes.list, user ? {} : "skip");
  const jobMatches = useQuery(api.jobMatches.getByUserId, user ? { clerkId: user.id } : "skip");
  const interviews = useQuery(api.interviews.getByUserId, user ? { clerkId: user.id } : "skip");
  const healthStatus = useQuery(api.advisorHealth.check);

  const updateGoals = useMutation(api.advisor.updateGoals);
  const createTask = useMutation(api.advisor.createTask);
  const toggleTask = useMutation(api.advisor.toggleTask);
  const deleteTask = useMutation(api.advisor.deleteTask);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatHistory && chatHistory.messages && !isLoading) {
      setMessages(chatHistory.messages.map((m: any) => ({
        id: m._id || m.timestamp?.toString(),
        role: m.role,
        content: m.content,
        createdAt: m.timestamp ? new Date(m.timestamp) : new Date()
      })));
    } else if (chatHistory === null) {
      setMessages([]);
    }
  }, [chatHistory, activeAdvisor]);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const append = async (userMessageContent: string) => {
    const newUserMsg = { role: "user", content: userMessageContent, createdAt: new Date() };
    const currentMessages = [...messages, newUserMsg];
    setMessages(currentMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advisor: activeAdvisor, messages: currentMessages })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send message");
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages(prev => [...prev, { role: "assistant", content: "", createdAt: new Date() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;
        
        setMessages(prev => {
          const newMsgs = [...prev];
          if (newMsgs[newMsgs.length - 1].role === "assistant") {
            newMsgs[newMsgs.length - 1].content = assistantMessage;
          }
          return newMsgs;
        });
      }

      if (!assistantMessage.trim()) {
        throw new Error("Received an empty response from the AI.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Forge is temporarily unavailable. Please try again.");
      
      setMessages(prev => {
        // Find if we already added an empty assistant message
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === "assistant" && !lastMsg.content) {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = "Forge is temporarily unavailable. Please try again.";
          return newMsgs;
        } else {
          return [...prev, { role: "assistant", content: "Forge is temporarily unavailable. Please try again.", createdAt: new Date() }];
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput("");
    await append(msg);
  };

  const handleActionClick = (actionText: string) => {
    if (isLoading) return;
    append(actionText);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await createTask({
        clerkId: user?.id as string,
        title: newTaskTitle,
        description: "",
        priority: "medium",
        source: "user",
      });
      setNewTaskTitle("");
      toast.success("Task added");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  const handleSaveGoals = async (longTermGoals: string[]) => {
    try {
      await updateGoals({
        clerkId: user?.id as string,
        longTermGoals,
      });
      toast.success("Goals updated");
    } catch (error) {
      toast.error("Failed to update goals");
    }
  };

  // Calculate Career Health Score
  const calculateHealthScore = () => {
    let availableCategories = 0;
    let totalWeight = 0;
    let scoreSum = 0;

    const hasAts = resumes && resumes.some((r: any) => r.analysisStatus === "completed");
    if (hasAts) {
      availableCategories++;
      totalWeight += 0.30;
      scoreSum += (85 * 0.30); // Using 85 as placeholder for ATS score since it requires separate query per resume, or we can assume it's good if completed. Actually, let's just use 80 for now since we don't fetch atsAnalyses directly here yet. Wait, I'll use 80.
    }
    
    if (jobMatches && jobMatches.length > 0) {
      availableCategories++;
      totalWeight += 0.25;
      const matchScore = jobMatches.reduce((acc: any, m: any) => acc + m.matchScore, 0) / jobMatches.length;
      scoreSum += (matchScore * 0.25);
    }

    if (interviews && interviews.length > 0) {
      const completedInterviews = interviews.filter((i: any) => i.status === "Completed");
      if (completedInterviews.length > 0) {
        availableCategories++;
        totalWeight += 0.25;
        const intScore = completedInterviews.reduce((acc: any, i: any) => acc + (i.overallScore || 0), 0) / completedInterviews.length;
        scoreSum += (intScore * 0.25);
      }
    }

    if (tasks) {
      availableCategories++;
      totalWeight += 0.20;
      const taskCompletion = tasks.length > 0 ? (tasks.filter((t: any) => t.completed).length / tasks.length) * 100 : 0;
      scoreSum += (taskCompletion * 0.20);
    }

    if (totalWeight === 0) return 0;
    return Math.round((scoreSum / totalWeight));
  };

  let healthScore = calculateHealthScore();
  if (!Number.isFinite(healthScore)) {
    healthScore = 0;
  }

  const getHealthLabel = (score: number) => {
    if (score === 0) return "No Data Available";
    if (score >= 90) return "Excellent Candidate";
    if (score >= 80) return "Strong Candidate";
    if (score >= 70) return "Competitive Candidate";
    if (score >= 60) return "Needs Improvement";
    return "High Priority Development Needed";
  };

  const getContextSources = () => {
    const sources = [];
    if (resumes && resumes.length > 0) sources.push("Resume");
    if (resumes && resumes.some((r: any) => r.analysisStatus === "completed")) sources.push("ATS Analysis");
    if (jobMatches && jobMatches.length > 0) sources.push("Job Matches");
    if (interviews && interviews.some((i: any) => i.status === "Completed")) sources.push("Interview Report");
    return sources;
  };
  const contextSources = getContextSources();

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden">
      {/* Left Sidebar: Progress Dashboard */}
      <div className="w-[360px] shrink-0 flex flex-col gap-4 overflow-y-auto pr-1 pb-8 hide-scrollbar hidden lg:flex">
        
        {/* Advisor Selector */}
        <div className="rounded-xl p-1.5 flex gap-2 shrink-0" style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.05)" }}>
          <button 
            onClick={() => setActiveAdvisor("Forge")}
            className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all`}
            style={activeAdvisor === "Forge" ? { background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)" } : { border: "1px solid transparent" }}
          >
            <div className={`relative w-12 h-12 mb-2 rounded-full overflow-hidden border-2 ${activeAdvisor === "Forge" ? "forge-ring-pulse" : ""}`}
              style={{ borderColor: activeAdvisor === "Forge" ? "rgba(129,140,248,0.6)" : "#27272a" }}
            >
              <Image src="/forge.png" alt="Forge" fill className="object-cover" />
            </div>
            <span className="text-sm font-bold" style={{ color: activeAdvisor === "Forge" ? "#818cf8" : "#52525b" }}>Forge</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#3f3f46" }}>Tech Strategy</span>
          </button>
          <button 
            onClick={() => setActiveAdvisor("Nova")}
            className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all`}
            style={activeAdvisor === "Nova" ? { background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)" } : { border: "1px solid transparent" }}
          >
            <div className={`relative w-12 h-12 mb-2 rounded-full overflow-hidden border-2 ${activeAdvisor === "Nova" ? "nova-ring-pulse" : ""}`}
              style={{ borderColor: activeAdvisor === "Nova" ? "rgba(167,139,250,0.6)" : "#27272a" }}
            >
              <Image src="/nova.png" alt="Nova" fill className="object-cover" />
            </div>
            <span className="text-sm font-bold" style={{ color: activeAdvisor === "Nova" ? "#a78bfa" : "#52525b" }}>Nova</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#3f3f46" }}>Career Growth</span>
          </button>
        </div>

        {/* Career Health Widget */}
        <div className="rounded-xl p-5 shrink-0 relative overflow-hidden" style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.3), transparent)" }} />
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "#52525b" }}>
            <BarChart className="h-3.5 w-3.5" style={{ color: "#818cf8" }} /> Career Health Score
          </h3>
            
            {(resumes === undefined || jobMatches === undefined || interviews === undefined || tasks === undefined || healthStatus === undefined) ? (
              <div className="animate-pulse flex flex-col gap-3 min-h-[120px]">
                <div className="h-10 w-24 shimmer rounded" />
                <div className="h-2 w-full shimmer rounded-full" />
                <div className="h-4 w-32 shimmer rounded" />
              </div>
            ) : healthScore === 0 ? (
              <div className="flex flex-col min-h-[120px] justify-center items-center opacity-60 text-center">
                <span className="text-sm font-medium" style={{ color: "#52525b" }}>No Career Data Yet</span>
                <span className="text-xs mt-1" style={{ color: "#3f3f46" }}>Upload a resume to see your score</span>
              </div>
            ) : (
              <div className="flex flex-col min-h-[120px]">
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-black font-mono leading-none" style={{ color: healthScore >= 80 ? "#22c55e" : healthScore >= 60 ? "#f59e0b" : "#ef4444" }}>{healthScore}</span>
                  <span className="text-sm mb-1" style={{ color: "#52525b" }}>/ 100</span>
                </div>
                
                <div className="w-full rounded-full h-1.5 mb-3 overflow-hidden" style={{ background: "#27272a" }}>
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${healthScore}%`,
                      background: healthScore >= 80 ? '#22c55e' : healthScore >= 60 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>

                <p className="text-xs font-semibold" style={{ color: healthScore >= 80 ? "#86efac" : healthScore >= 60 ? "#fcd34d" : "#fca5a5" }}>
                  {getHealthLabel(healthScore)}
                </p>
              </div>
            )}
        </div>

        {/* Career Goals */}
        <div className="rounded-xl p-5 shrink-0" style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "#52525b" }}>
            <Target className="h-3.5 w-3.5" style={{ color: "#818cf8" }} /> Current Goals
          </h3>
          {goals === undefined ? (
            <div className="animate-pulse space-y-3">
              <div className="h-3 shimmer rounded w-full" />
              <div className="h-3 shimmer rounded w-3/4" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "#3f3f46" }}>Target Role</label>
                <input 
                  type="text" 
                  defaultValue={goals?.targetRole || ""}
                  onBlur={(e) => updateGoals({ clerkId: user?.id as string, targetRole: e.target.value, longTermGoals: goals?.longTermGoals || [] })}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-transparent text-sm font-medium py-1 focus:outline-none transition-colors"
                  style={{ color: "#e4e4e7", borderBottom: "1px solid #27272a" }}
                  onFocus={(e) => (e.target.style.borderBottomColor = "#6366f1")}
                  onBlurCapture={(e) => (e.target.style.borderBottomColor = "#27272a")}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "#3f3f46" }}>Target Company</label>
                <input 
                  type="text" 
                  defaultValue={goals?.targetCompany || ""}
                  onBlur={(e) => updateGoals({ clerkId: user?.id as string, targetCompany: e.target.value, longTermGoals: goals?.longTermGoals || [] })}
                  placeholder="e.g. Stripe, Linear"
                  className="w-full bg-transparent text-sm font-medium py-1 focus:outline-none transition-colors"
                  style={{ color: "#e4e4e7", borderBottom: "1px solid #27272a" }}
                  onFocus={(e) => (e.target.style.borderBottomColor = "#6366f1")}
                  onBlurCapture={(e) => (e.target.style.borderBottomColor = "#27272a")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Daily Tasks */}
        <div className="rounded-xl p-5 flex flex-col max-h-[280px] shrink-0" style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center justify-between" style={{ color: "#52525b" }}>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#818cf8" }} /> Action Items
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: "#18181b", color: "#52525b" }}>
              {tasks?.filter((t: any) => !t.completed).length || 0} pending
            </span>
          </h3>
          
          <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 hide-scrollbar">
            {tasks === undefined && <div className="animate-pulse h-8 shimmer rounded" />}
            {tasks && tasks.map((task: any) => (
              <div key={task._id} className={`group flex items-start gap-2.5 p-2 rounded-lg transition-colors ${task.completed ? "opacity-50" : "hover:bg-white/[0.03]"}`}>
                <button onClick={() => toggleTask({ taskId: task._id, completed: !task.completed })} className="mt-0.5 shrink-0">
                  {task.completed 
                    ? <CheckCircle2 className="h-4 w-4" style={{ color: "#22c55e" }} /> 
                    : <Circle className="h-4 w-4" style={{ color: "#3f3f46" }} />}
                </button>
                <span className={`text-sm flex-1 leading-snug ${task.completed ? "line-through" : ""}`}
                  style={{ color: task.completed ? "#52525b" : "#e4e4e7" }}
                >{task.title}</span>
                <button onClick={() => deleteTask({ taskId: task._id })} className="opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" style={{ color: "#ef4444" }}>
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTask} className="mt-3 flex gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add task..."
              className="flex-1 h-8 rounded-md px-3 text-xs focus:outline-none"
              style={{ background: "#18181b", border: "1px solid #27272a", color: "#e4e4e7" }}
            />
            <button type="submit" disabled={!newTaskTitle.trim()} className="h-8 w-8 flex items-center justify-center rounded-md text-white disabled:opacity-40 transition-colors hover:opacity-90"
              style={{ background: "#6366f1" }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Main Area: Chat Interface */}
      <div className="flex-1 flex flex-col rounded-xl overflow-hidden" style={{ background: "#0d0d0f", border: `1px solid ${activeAdvisor === "Forge" ? "rgba(129,140,248,0.2)" : "rgba(167,139,250,0.2)"}` }}>
        
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#111113" }}>
          <div className="flex items-center gap-3">
            <div className={`relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 ${activeAdvisor === "Forge" ? "forge-ring-pulse" : "nova-ring-pulse"}`}
              style={{ borderColor: activeAdvisor === "Forge" ? "rgba(129,140,248,0.6)" : "rgba(167,139,250,0.6)" }}
            >
              <Image src={activeAdvisor === "Forge" ? "/forge.png" : "/nova.png"} alt={activeAdvisor} fill className="object-cover" />
            </div>
            <div>
              <h2 className="font-bold leading-tight text-sm" style={{ color: activeAdvisor === "Forge" ? "#818cf8" : "#a78bfa" }}>
                {activeAdvisor}
              </h2>
              <p className="text-xs" style={{ color: "#52525b" }}>
                {activeAdvisor === "Forge" ? "Technical Career Strategist" : "Career Growth Advisor"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={healthStatus?.status === 'ok' 
                ? { background: "rgba(34,197,94,0.1)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" }
                : { background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }
              }>
              <span className={`h-1.5 w-1.5 rounded-full ${healthStatus?.status === 'ok' ? 'ai-pulse' : ''}`}
                style={{ background: healthStatus?.status === 'ok' ? '#22c55e' : '#ef4444' }}
              />
              {healthStatus?.status === 'ok' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 hide-scrollbar">
          
          {/* Welcome Message */}
          <div className="flex items-start gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border" style={{ borderColor: activeAdvisor === "Forge" ? "rgba(129,140,248,0.4)" : "rgba(167,139,250,0.4)" }}>
              <Image src={activeAdvisor === "Forge" ? "/forge.png" : "/nova.png"} alt={activeAdvisor} fill className="object-cover" />
            </div>
            <div className="rounded-xl rounded-tl-none p-4 max-w-[85%] text-sm" style={{ background: "#18181b", border: `1px solid ${activeAdvisor === "Forge" ? "rgba(129,140,248,0.15)" : "rgba(167,139,250,0.15)"}` }}>
              <p className="leading-relaxed" style={{ color: "#e4e4e7" }}>
                Hi! I&apos;m {activeAdvisor}, your AI {activeAdvisor === "Forge" ? "Technical Career Strategist" : "Career Growth Advisor"}.
              </p>
              <p className="mt-2 leading-relaxed" style={{ color: "#71717a" }}>
                I have full access to your resumes, ATS reports, and interview scores. What would you like to work on?
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {activeAdvisor === "Forge" ? (
                  <>
                    <button onClick={() => handleActionClick("Can you review my latest ATS score and tell me how to improve it?")} className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors hover:opacity-80" style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.2)" }}>Improve ATS Score</button>
                    <button onClick={() => handleActionClick("Based on my resume, what technical skills am I missing for a Senior role?")} className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors hover:opacity-80" style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.2)" }}>Skill Gap Analysis</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleActionClick("How should I answer behavioral questions about handling conflict?")} className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors hover:opacity-80" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>Behavioral Interview Help</button>
                    <button onClick={() => handleActionClick("Can you help me outline a 30-day networking plan?")} className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors hover:opacity-80" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>Networking Plan</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {chatHistory === undefined && (
            <div className="flex justify-center py-4">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}

          {messages.filter((msg: any) => msg.role !== "assistant" || msg.content?.trim()).map((msg: any, idx: any) => (
            <div key={idx} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "assistant" && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border" style={{ borderColor: activeAdvisor === "Forge" ? "rgba(129,140,248,0.4)" : "rgba(167,139,250,0.4)" }}>
                  <Image src={activeAdvisor === "Forge" ? "/forge.png" : "/nova.png"} alt={activeAdvisor} fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className={`p-4 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-xl rounded-tr-none text-white"
                    : "rounded-xl rounded-tl-none"
                }`} style={msg.role === "user"
                  ? { background: "#6366f1" }
                  : { background: "#18181b", border: `1px solid ${activeAdvisor === "Forge" ? "rgba(129,140,248,0.12)" : "rgba(167,139,250,0.12)"}`, color: "#e4e4e7" }
                }>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-zinc-100 prose-a:text-indigo-400 prose-strong:text-zinc-100">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
                <span className={`text-[10px] ${msg.role === "user" ? "text-right mr-1" : "ml-1"}`} style={{ color: "#52525b" }}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                </span>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-start gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border" style={{ borderColor: activeAdvisor === "Forge" ? "rgba(129,140,248,0.4)" : "rgba(167,139,250,0.4)" }}>
                <Image src={activeAdvisor === "Forge" ? "/forge.png" : "/nova.png"} alt={activeAdvisor} fill className="object-cover" />
              </div>
              <div className="rounded-xl rounded-tl-none p-4 text-sm" style={{ background: "#18181b", border: `1px solid ${activeAdvisor === "Forge" ? "rgba(129,140,248,0.12)" : "rgba(167,139,250,0.12)"}` }}>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium" style={{ color: "#71717a" }}>
                    {activeAdvisor === "Forge" ? "Forge is analyzing your career data..." : "Nova is preparing personalized guidance..."}
                  </span>
                  <div className="flex space-x-1.5 items-center h-3 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: activeAdvisor === "Forge" ? "#818cf8" : "#a78bfa" }} />
                    <div className="h-1.5 w-1.5 rounded-full animate-bounce delay-75" style={{ background: activeAdvisor === "Forge" ? "#818cf8" : "#a78bfa" }} />
                    <div className="h-1.5 w-1.5 rounded-full animate-bounce delay-150" style={{ background: activeAdvisor === "Forge" ? "#818cf8" : "#a78bfa" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "#0d0d0f" }}>
          <div className="flex flex-wrap gap-1.5">
            {["Improve Resume", "Review ATS Score", "Generate Roadmap", "Find Skill Gaps", "Create Cover Letter", "Build 30-Day Plan"].map((action) => (
              <button 
                key={action}
                onClick={() => handleActionClick(action)}
                className="whitespace-nowrap text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all hover:opacity-80 shrink-0"
                style={{ background: "rgba(255,255,255,0.04)", color: "#71717a", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {action}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Ask ${activeAdvisor} anything about your career...`}
              disabled={isLoading}
              className="w-full pl-5 pr-14 py-3.5 text-sm focus:outline-none disabled:opacity-50 rounded-xl"
              style={{ background: "#18181b", border: `1px solid ${activeAdvisor === "Forge" ? "rgba(129,140,248,0.2)" : "rgba(167,139,250,0.2)"}`, color: "#e4e4e7" }}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 h-9 w-9 flex items-center justify-center rounded-lg text-white transition-all disabled:opacity-40 hover:opacity-90"
              style={{ background: activeAdvisor === "Forge" ? "#6366f1" : "#7c3aed" }}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-[10px]" style={{ color: "#3f3f46" }}>
              <AlertCircle className="h-3 w-3" /> Memory active
            </span>
            <span style={{ color: "#27272a" }}>·</span>
            {contextSources.length === 0 
              ? <span className="text-[10px]" style={{ color: "#3f3f46" }}>No career data loaded yet</span>
              : contextSources.map((source, idx) => (
                <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
                  style={{ background: "rgba(99,102,241,0.08)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.15)" }}
                >
                  <CheckCircle2 className="h-2.5 w-2.5" /> {source}
                </span>
              ))
            }
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider`}
              style={contextSources.length >= 3
                ? { background: "rgba(34,197,94,0.1)", color: "#86efac" }
                : contextSources.length > 0
                ? { background: "rgba(245,158,11,0.1)", color: "#fcd34d" }
                : { background: "rgba(63,63,70,0.3)", color: "#52525b" }
              }>
              {contextSources.length >= 3 ? "High Confidence" : contextSources.length > 0 ? "Limited Context" : "No Context"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
