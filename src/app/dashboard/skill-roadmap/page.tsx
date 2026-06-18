"use client";

import * as React from "react";
import { CheckCircle2, Target, ArrowRight, BookOpen, Award, TrendingUp, ChevronDown } from "lucide-react";
import * as motion from "framer-motion/client";
import { SkillRadarChart } from "@/components/skill-radar-chart";

export default function CareerRoadmapPage() {
  const [goal, setGoal] = React.useState("Frontend Engineer");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Goal Selection */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Skill Roadmap</h1>
          <p className="text-sm mt-1" style={{ color: "#71717a" }}>Your personalized path to mastering missing skills.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#52525b" }}>Target Role</label>
          <div className="relative">
            <select 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="appearance-none h-9 rounded-lg px-3 pr-9 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: "#18181b", border: "1px solid #3f3f46", color: "#e4e4e7" }}
            >
              <option value="Frontend Engineer">Frontend Engineer</option>
              <option value="Full Stack Engineer">Full Stack Engineer</option>
              <option value="Backend Engineer">Backend Engineer</option>
              <option value="AI Engineer">AI Engineer</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 pointer-events-none" style={{ color: "#71717a" }} />
          </div>
        </div>
      </div>

      {/* Skill Gap Radar */}
      <div className="os-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4" style={{ color: "#22d3ee" }} />
          <h2 className="text-sm font-bold" style={{ color: "#e4e4e7" }}>Skill Gap Radar</h2>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: "rgba(34,211,238,0.08)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.15)" }}>vs {goal}</span>
        </div>
        <SkillRadarChart targetRole={goal} />
      </div>

      {/* Overview & Progress Tracking */}
      <div className="grid gap-5 md:grid-cols-12 items-start">
        <div className="md:col-span-8 grid gap-5 sm:grid-cols-2">
          {/* Current vs Target */}
          <div className="os-card p-6 flex flex-col justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#52525b" }}>Skill Gap Analysis</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold" style={{ color: "#e4e4e7" }}>Current Skills</span>
                  <span style={{ color: "#71717a" }}>React, TS, Node</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#27272a" }}>
                  <div className="h-full rounded-full" style={{ width: "100%", background: "#22c55e" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold" style={{ color: "#e4e4e7" }}>Target Skills</span>
                  <span style={{ color: "#ef4444" }}>Docker, AWS, CI/CD</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#27272a" }}>
                  <div className="h-full rounded-full" style={{ width: "25%", background: "#ef4444" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="os-card p-6 flex flex-col justify-between items-center text-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest self-start mb-2" style={{ color: "#52525b" }}>Roadmap Completion</h3>
            <div className="relative flex items-center justify-center h-28 w-28 my-4">
              <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />
              <svg className="absolute inset-0 h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                <circle style={{ stroke: "#27272a" }} strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                <motion.circle stroke="#6366f1" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="170 251.2" transform="rotate(0 50 50)"
                  style={{ filter: "drop-shadow(0 0 6px #6366f188)" }}
                />
              </svg>
              <span className="text-3xl font-black font-mono" style={{ color: "#818cf8" }}>68%</span>
            </div>
            <div className="flex justify-between w-full text-xs font-medium mt-2">
              <span className="flex items-center gap-1" style={{ color: "#22c55e" }}><CheckCircle2 className="h-3 w-3" /> 2 Done</span>
              <span className="flex items-center gap-1" style={{ color: "#818cf8" }}><TrendingUp className="h-3 w-3" /> 1 Active</span>
              <span className="flex items-center gap-1" style={{ color: "#52525b" }}><Target className="h-3 w-3" /> 1 Next</span>
            </div>
          </div>
        </div>

        {/* Recommended Certifications */}
        <div className="md:col-span-4 os-card overflow-hidden h-full">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
            <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: "#e4e4e7" }}>
              <Award className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} /> Certifications
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { title: "AWS Cloud Practitioner", diff: "Beginner", time: "20h", priority: "High" },
              { title: "Docker Associate", diff: "Intermediate", time: "15h", priority: "High" },
              { title: "Azure Fundamentals", diff: "Beginner", time: "18h", priority: "Low" },
            ].map(cert => (
              <div key={cert.title} className="rounded-lg p-3 transition-colors hover:bg-white/[0.03]" style={{ border: "1px solid #27272a" }}>
                <h4 className="font-semibold text-xs mb-2" style={{ color: "#e4e4e7" }}>{cert.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={cert.priority === 'High'
                      ? { background: "rgba(239,68,68,0.1)", color: "#fca5a5" }
                      : { background: "rgba(255,255,255,0.05)", color: "#71717a" }
                    }>
                    {cert.priority}
                  </span>
                  <span className="text-[10px]" style={{ color: "#52525b" }}>{cert.diff} · {cert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Roadmap Timeline */}
      <div className="pt-2">
        <h2 className="text-lg font-black tracking-tight mb-6">Execution Plan</h2>
        <div className="space-y-5 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px" style={{ "--tw-before-bg": "#27272a" } as React.CSSProperties}>
          <style>{`.space-y-5.relative::before { background: #27272a; }`}</style>
          {[
            { month: "Month 1", title: "Docker Fundamentals", tasks: ["Containers", "Docker Compose", "Deployment"], status: "completed" },
            { month: "Month 2", title: "AWS Foundations", tasks: ["EC2", "S3", "IAM"], status: "completed" },
            { month: "Month 3", title: "CI/CD", tasks: ["GitHub Actions", "Pipelines", "Deployment Automation"], status: "active" },
            { month: "Month 4", title: "System Design Basics", tasks: ["Scalability", "Load Balancing", "Databases"], status: "upcoming" },
          ].map((item, index) => (
            <div key={item.month} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}
                style={{
                  background: item.status === 'completed' ? '#22c55e' : item.status === 'active' ? '#6366f1' : '#27272a',
                  borderColor: '#09090b',
                  boxShadow: item.status === 'active' ? '0 0 12px rgba(99,102,241,0.5)' : 'none'
                }}
              >
                {item.status === 'completed' 
                  ? <CheckCircle2 className="h-4 w-4 text-white" />
                  : item.status === 'active'
                  ? <TrendingUp className="h-4 w-4 text-white" />
                  : <BookOpen className="h-4 w-4" style={{ color: "#52525b" }} />}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl transition-all hover:border-indigo-500/30"
                style={{ background: "#18181b", border: `1px solid ${item.status === 'active' ? 'rgba(99,102,241,0.3)' : '#27272a'}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: item.status === 'completed' ? '#22c55e' : item.status === 'active' ? '#818cf8' : '#52525b' }}
                  >{item.month}</span>
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: "#fafafa" }}>{item.title}</h3>
                <ul className="space-y-1.5">
                  {item.tasks.map(task => (
                    <li key={task} className="text-xs flex items-center gap-2" style={{ color: "#71717a" }}>
                      <div className="h-1 w-1 rounded-full shrink-0" style={{ background: item.status === 'completed' ? '#22c55e' : item.status === 'active' ? '#6366f1' : '#3f3f46' }} />
                      {task}
                    </li>
                  ))}
                </ul>
                {item.status === 'active' && (
                  <button className="mt-4 inline-flex h-8 items-center justify-center rounded-lg px-4 text-xs font-bold text-white hover:opacity-90"
                    style={{ background: "#6366f1" }}
                  >
                    Continue Learning <ArrowRight className="ml-1.5 h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
