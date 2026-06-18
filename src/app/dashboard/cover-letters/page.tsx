"use client";

import * as React from "react";
import { PenLine, FileText, Download, Copy, Save, Sparkles, Clock, Edit2 } from "lucide-react";
import * as motion from "framer-motion/client";

const history = [
  { id: 1, company: "Vercel", role: "Frontend Engineer", date: "Today", style: "Startup" },
  { id: 2, company: "Google", role: "SWE II", date: "Yesterday", style: "Technical" },
  { id: 3, company: "Goldman Sachs", role: "UI Developer", date: "Last Week", style: "Professional" },
];

export default function CoverLettersPage() {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showOutput, setShowOutput] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState("Professional");

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowOutput(true);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cover Letter Generator</h1>
        <p className="text-muted-foreground mt-1">Generate personalized, high-converting cover letters instantly using AI.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Panel: Input Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <PenLine className="h-5 w-5 text-indigo-500" />
              Generator Details
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Company Name</label>
                  <input type="text" placeholder="e.g. Vercel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Job Title</label>
                  <input type="text" placeholder="e.g. Frontend Engineer" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Hiring Manager (Optional)</label>
                <input type="text" placeholder="e.g. Jane Doe" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Select Resume</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option>Frontend_Engineer_Resume_v3.pdf</option>
                  <option>FullStack_Dev_v2.pdf</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Job Description</label>
                <textarea 
                  rows={4} 
                  placeholder="Paste the job description..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                ></textarea>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Tone / Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Professional", "Startup", "Technical", "Executive"].map(template => (
                    <button 
                      key={template}
                      onClick={() => setSelectedTemplate(template)}
                      className={`h-9 rounded-md text-xs font-medium border transition-colors ${
                        selectedTemplate === template 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300" 
                          : "bg-background border-input hover:bg-accent text-muted-foreground hover:text-accent-foreground"
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <><Sparkles className="mr-2 h-4 w-4 animate-pulse" /> Generating with AI...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Generate Cover Letter</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Output Editor */}
        <div className="lg:col-span-7 h-full">
          {!showOutput && !isGenerating ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center h-[600px] flex flex-col items-center justify-center">
              <div className="rounded-full bg-secondary p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Letter Generated</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Fill out the details on the left and hit Generate to craft your personalized cover letter.</p>
            </div>
          ) : isGenerating ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center h-[600px] flex flex-col items-center justify-center space-y-4">
              <Sparkles className="h-10 w-10 text-indigo-500 animate-pulse" />
              <h3 className="text-lg font-semibold">Crafting the perfect letter...</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Aligning your skills with the company&apos;s requirements using a {selectedTemplate.toLowerCase()} tone.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-border bg-card shadow-sm h-full flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-400">
                    {selectedTemplate}
                  </span>
                  <span className="text-sm font-medium">Vercel - Frontend Engineer</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Copy">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Save">
                    <Save className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Download">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <textarea 
                  className="w-full h-[500px] resize-none outline-none bg-transparent text-sm leading-relaxed"
                  defaultValue={`Dear Hiring Manager,

I am writing to express my strong interest in the Frontend Engineer position at Vercel. As an avid user of Next.js and a passionate advocate for developer experience, I have closely followed Vercel's mission to make the web faster and more accessible.

In my current role as a Frontend Developer at TechCorp, I architected and deployed scalable React applications, utilizing Redux to streamline global state management across 15+ complex features. I spearheaded performance optimization initiatives that resulted in a 40% reduction in initial load times—an achievement I know aligns perfectly with Vercel's focus on edge network performance.

What excites me most about this opportunity is the chance to contribute to a platform that empowers millions of developers worldwide. My robust background in React, TypeScript, and modern tooling, combined with my dedication to building pixel-perfect, accessible UIs, makes me a strong fit for your engineering team.

I would welcome the opportunity to discuss how my technical skills and product-focused mindset can contribute to Vercel's continued growth. Thank you for your time and consideration.

Sincerely,
John Doe
(555) 123-4567 | john.doe@example.com`}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="pt-8 border-t border-border mt-8">
        <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Recent Cover Letters
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-5 shadow-sm group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{item.company}</h3>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                  <span className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                    {item.style}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="p-1.5 text-muted-foreground hover:text-indigo-600"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
