"use client";

import * as React from "react";
import { UploadCloud, File, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import * as motion from "framer-motion/client";
import { UploadDropzone } from "@/utils/uploadthing";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

export default function ResumeUploadPage() {
  const [uploadState, setUploadState] = React.useState<UploadState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState("");
  
  // @ts-ignore
  const createResume = useMutation(api.resumes.create);
  // @ts-ignore
  const scheduleAnalysis = useMutation(api.analyses.scheduleAnalysis);
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Resume</h1>
        <p className="text-muted-foreground mt-1">Upload your latest resume for AI analysis and optimization.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border bg-card p-8 shadow-sm"
      >
        <div 
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            uploadState === "idle" ? "border-muted-foreground/25 hover:border-indigo-500/50 hover:bg-indigo-500/5" : 
            uploadState === "success" ? "border-emerald-500/50 bg-emerald-500/5" :
            uploadState === "error" ? "border-rose-500/50 bg-rose-500/5" :
            "border-indigo-500/50 bg-indigo-500/5"
          }`}
        >
          {uploadState === "idle" && (
            <UploadDropzone
              endpoint="resumeUploader"
              onUploadBegin={() => {
                console.log("UploadThing: Upload began");
                setUploadState("uploading");
                setProgress(0);
              }}
              onUploadProgress={(p) => {
                setProgress(p);
              }}
              onClientUploadComplete={async (res) => {
                console.log("UploadThing: Upload complete", res);
                setUploadState("processing");
                if (res && res.length > 0) {
                  const file = res[0];
                  try {
                    console.log("Convex: Calling resumes:create with", {
                      title: file.name,
                      fileUrl: file.url,
                      fileKey: file.key,
                      format: file.name.endsWith(".docx") ? "docx" : "pdf",
                      fileSize: file.size,
                    });
                    
                    const resumeId = await createResume({
                      title: file.name,
                      fileUrl: file.url,
                      fileKey: file.key,
                      format: file.name.endsWith(".docx") ? "docx" : "pdf",
                      fileSize: file.size,
                    });
                    
                    console.log("Convex: Triggering scheduleAnalysis mutation...");
                    scheduleAnalysis({ resumeId }).catch((err) => console.error("Analysis failed to schedule:", err));
                    
                    console.log("Convex: Mutation successful, resumeId:", resumeId);
                    setUploadState("success");
                    toast.success("Resume uploaded successfully.");
                    
                    console.log("Router: Redirecting to", `/dashboard/resumes/${resumeId}`);
                    router.push(`/dashboard/resumes/${resumeId}`);
                  } catch (error: any) {
                    console.error("Convex creation failed:", error);
                    setErrorMessage(error.message || "Unable to save resume metadata.");
                    setUploadState("error");
                  }
                } else {
                  console.warn("UploadThing: Upload completed but no response files found.");
                  setErrorMessage("Upload finished but no file data was returned.");
                  setUploadState("error");
                }
              }}
              onUploadError={(error: Error) => {
                console.error("Upload failed:", error);
                setErrorMessage("Upload failed. Please try again.");
                setUploadState("error");
              }}
              content={{
                label: "Drag and drop your resume or click to browse",
                allowedContent: "Support for PDF or DOCX. Max file size 10MB.",
              }}
              appearance={{
                container: "border-none p-0 w-full flex flex-col items-center justify-center",
                uploadIcon: "text-muted-foreground mb-4 w-12 h-12",
                label: "text-lg font-semibold mb-1 text-foreground",
                allowedContent: "text-sm text-muted-foreground mb-6",
                button: "ut-uploading:bg-indigo-600/50 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-2 rounded-md shadow",
              }}
            />
          )}

          {uploadState === "uploading" && (
            <div className="w-full max-w-sm mx-auto flex flex-col items-center py-12">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
              <h3 className="text-lg font-semibold mb-1">Uploading your resume...</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Progress: {progress}%
              </p>
              
              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {uploadState === "processing" && (
            <div className="w-full max-w-sm mx-auto flex flex-col items-center py-12">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
              <h3 className="text-lg font-semibold mb-1">Analyzing resume...</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Saving metadata and preparing for analysis...
              </p>
            </div>
          )}

          {uploadState === "success" && (
            <div className="flex flex-col items-center py-12">
              <div className="mb-4 rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
                <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Resume uploaded successfully.</h3>
              <p className="text-sm text-muted-foreground mb-6">Redirecting to resume details...</p>
            </div>
          )}
          
          {uploadState === "error" && (
            <div className="flex flex-col items-center py-12">
              <div className="mb-4 rounded-full bg-rose-100 p-3 dark:bg-rose-900/30">
                <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{errorMessage}</h3>
              <button 
                onClick={() => setUploadState("idle")}
                className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-foreground px-8 py-2 text-sm font-medium text-background shadow transition-colors hover:bg-foreground/90"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
