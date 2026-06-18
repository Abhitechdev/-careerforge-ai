"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Bug, Lightbulb, MessageSquare, ThumbsUp, Loader2, AlertCircle, Plus, UploadCloud } from "lucide-react";
import * as motion from "framer-motion/client";
import { toast } from "sonner";
import { useAnalytics } from "@/hooks/useAnalytics";
import { UploadButton } from "@/utils/uploadthing";

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = React.useState<"board" | "submit">("board");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback & Support</h1>
        <p className="text-muted-foreground mt-1">Help us improve CareerForge AI by reporting bugs or requesting features.</p>
      </div>

      <div className="flex items-center gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("board")}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "board" ? "border-indigo-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Community Board
        </button>
        <button
          onClick={() => setActiveTab("submit")}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "submit" ? "border-indigo-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Submit Feedback
        </button>
      </div>

      {activeTab === "submit" ? <SubmitFeedbackForm onSubmitted={() => setActiveTab("board")} /> : <FeedbackBoard />}
    </div>
  );
}

function SubmitFeedbackForm({ onSubmitted }: { onSubmitted: () => void }) {
  const createFeedback = useMutation(api.feedback.createFeedback);
  
  const [type, setType] = React.useState<"bug" | "feature_request" | "suggestion">("feature_request");
  const [category, setCategory] = React.useState("General");
  const [content, setContent] = React.useState("");
  const [rating, setRating] = React.useState(0);
  const [severity, setSeverity] = React.useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [screenshotUrl, setScreenshotUrl] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { logEvent } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("Please provide some details.");
    
    setIsSubmitting(true);
    try {
      await createFeedback({
        type,
        category,
        content,
        screenshotUrl: screenshotUrl || undefined,
        rating: type === "suggestion" ? rating : undefined,
        severity: type === "bug" ? severity : undefined,
      });

      logEvent("Feedback Submitted", { 
        type: type, 
        category,
        severity: type === "bug" ? severity : undefined,
        rating: type === "suggestion" ? rating : undefined
      });

      toast.success("Feedback submitted successfully!");
      onSubmitted();
    } catch (error) {
      toast.error("Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-xl border border-border bg-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button type="button" onClick={() => setType("feature_request")} className={`p-4 rounded-lg border flex flex-col items-center gap-2 ${type === "feature_request" ? "border-indigo-500 bg-indigo-500/10 text-indigo-500" : "border-border text-muted-foreground hover:bg-secondary/50"}`}>
            <Lightbulb className="h-6 w-6" />
            <span className="font-medium text-sm">Feature Request</span>
          </button>
          <button type="button" onClick={() => setType("bug")} className={`p-4 rounded-lg border flex flex-col items-center gap-2 ${type === "bug" ? "border-rose-500 bg-rose-500/10 text-rose-500" : "border-border text-muted-foreground hover:bg-secondary/50"}`}>
            <Bug className="h-6 w-6" />
            <span className="font-medium text-sm">Report a Bug</span>
          </button>
          <button type="button" onClick={() => setType("suggestion")} className={`p-4 rounded-lg border flex flex-col items-center gap-2 ${type === "suggestion" ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-border text-muted-foreground hover:bg-secondary/50"}`}>
            <MessageSquare className="h-6 w-6" />
            <span className="font-medium text-sm">General Suggestion</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option>General</option>
              <option>Resume ATS Analysis</option>
              <option>Job Search & Matching</option>
              <option>Interview Prep</option>
              <option>AI Advisors</option>
              <option>Networking</option>
            </select>
          </div>

          {type === "bug" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Severity</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value as any)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="Low">Low - Minor UI issue</option>
                <option value="Medium">Medium - Feature behaves unexpectedly</option>
                <option value="High">High - Core functionality is broken</option>
                <option value="Critical">Critical - Data loss or crash</option>
              </select>
            </div>
          )}

          {type === "suggestion" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Rate your experience</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setRating(star)} className={`text-2xl ${rating >= star ? "text-amber-500" : "text-muted-foreground/30 hover:text-muted-foreground"}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder={type === "bug" ? "What happened? What did you expect to happen?" : "Describe your idea..."}
              className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Attachment (Optional)</label>
            {screenshotUrl ? (
              <div className="flex items-center gap-4 bg-secondary/50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-muted-foreground text-emerald-500 flex-1">Screenshot uploaded.</span>
                <button type="button" onClick={() => setScreenshotUrl("")} className="text-sm text-rose-500 hover:underline">Remove</button>
              </div>
            ) : (
               <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res[0]) {
                    setScreenshotUrl(res[0].url);
                    toast.success("Attachment uploaded.");
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Upload failed: ${error.message}`);
                }}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting || !content.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium text-sm flex items-center gap-2 disabled:opacity-50">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function FeedbackBoard() {
  const [filter, setFilter] = React.useState<"all" | "bug" | "feature_request" | "suggestion">("all");
  const feedback = useQuery(api.feedback.getFeedback, filter === "all" ? {} : { type: filter });
  const toggleUpvote = useMutation(api.feedback.toggleUpvote);

  if (feedback === undefined) {
    return <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="h-9 px-3 rounded-md border border-input bg-background text-sm">
          <option value="all">All Feedback</option>
          <option value="feature_request">Feature Requests</option>
          <option value="bug">Bug Reports</option>
          <option value="suggestion">Suggestions</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {feedback.length === 0 ? (
          <div className="text-center py-12 border border-border border-dashed rounded-xl text-muted-foreground">
            No feedback found for this category.
          </div>
        ) : (
          feedback.map((item) => (
            <motion.div key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-xl border border-border bg-card flex gap-6 items-start">
              <button 
                onClick={() => toggleUpvote({ feedbackId: item._id })}
                className={`flex flex-col items-center justify-center p-2 rounded-md border min-w-[60px] transition-colors ${item.hasUpvoted ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500" : "bg-secondary hover:bg-secondary/80 border-transparent"}`}
              >
                <ThumbsUp className="h-4 w-4 mb-1" />
                <span className="font-semibold text-sm">{item.upvotes}</span>
              </button>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.authorName}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{item.category}</span>
                    {item.type === "bug" && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.severity === 'Critical' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>{item.severity} Bug</span>}
                    {item.type === "feature_request" && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-400">Feature</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{item.content}</p>
                {item.screenshotUrl && (
                  <a href={item.screenshotUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline inline-flex items-center gap-1 mt-2">
                    <AlertCircle className="h-3 w-3" /> View Attachment
                  </a>
                )}
                
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${item.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-500' : item.status === 'In Progress' ? 'bg-amber-500/20 text-amber-500' : 'bg-secondary text-muted-foreground'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
