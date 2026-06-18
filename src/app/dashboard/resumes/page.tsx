"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, MoreVertical, Edit, Download, Trash, Eye, Sparkles, Plus, Clock, Star, Loader2 } from "lucide-react";
import * as motion from "framer-motion/client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { deleteUploadThingFile } from "@/app/actions/uploadthing";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/nextjs";

export default function ResumesPage() {
  const { user } = useUser();
  // @ts-ignore
  const resumes = useQuery(api.resumes.list, user ? {} : "skip");
  // @ts-ignore
  const removeResume = useMutation(api.resumes.remove);
  // @ts-ignore
  const setPrimary = useMutation(api.resumes.setPrimary);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const handleDelete = async (id: any, fileKey: string) => {
    try {
      setIsDeleting(id);
      await removeResume({ id });
      await deleteUploadThingFile(fileKey);
      toast.success("Resume deleted successfully");
    } catch (error) {
      toast.error("Failed to delete resume");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetPrimary = async (id: any) => {
    try {
      await setPrimary({ id });
      toast.success("Primary resume updated");
    } catch (error) {
      toast.error("Failed to update primary resume");
      console.error(error);
    }
  };

  if (resumes === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">My Resumes</h1>
          <p className="text-sm mt-0.5" style={{ color: "#71717a" }}>Manage and optimize your resumes for different roles.</p>
        </div>
        <Link 
          href="/dashboard/upload"
          className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-bold text-white hover:opacity-90 transition-all w-full sm:w-auto"
          style={{ background: "#6366f1" }}
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          New Resume
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-20 rounded-xl" style={{ border: "1px dashed #27272a" }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold mb-2">No resumes yet</h3>
          <p className="text-sm mb-6" style={{ color: "#71717a" }}>Upload your first resume to get started.</p>
          <Link 
            href="/dashboard/upload"
            className="inline-flex h-9 items-center justify-center rounded-lg px-5 text-xs font-bold text-white hover:opacity-90"
            style={{ background: "#6366f1" }}
          >
            Upload Resume
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume: any, i: number) => (
            <motion.div
              key={resume._id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="group relative flex flex-col p-5 rounded-xl transition-all"
              style={{
                background: "#18181b",
                border: resume.isPrimary ? "1px solid rgba(99,102,241,0.35)" : "1px solid #27272a",
                boxShadow: resume.isPrimary ? "0 0 20px rgba(99,102,241,0.08)" : "none"
              }}
            >
              {resume.isPrimary && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 rounded-full p-1" style={{ background: "#6366f1" }}>
                  <Star className="h-3.5 w-3.5 text-white fill-current" />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm truncate max-w-[150px]" title={resume.title} style={{ color: "#fafafa" }}>{resume.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{ background: "rgba(255,255,255,0.06)", color: "#71717a" }}>
                        {resume.format}
                      </span>
                      <span className="text-[10px]" style={{ color: "#52525b" }}>{(resume.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: "#71717a" }}>Status</span>
                  <span className="text-xs font-bold capitalize"
                    style={{ color: resume.analysisStatus === 'completed' ? '#22c55e' : resume.analysisStatus === 'processing' ? '#f59e0b' : resume.analysisStatus === 'failed' ? '#ef4444' : '#818cf8' }}
                  >
                    {resume.analysisStatus}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#27272a" }}>
                  <div 
                    className="h-full transition-all rounded-full"
                    style={{
                      background: resume.analysisStatus === 'completed' ? '#22c55e' : resume.analysisStatus === 'processing' ? '#f59e0b' : resume.analysisStatus === 'failed' ? '#ef4444' : '#6366f1',
                      width: resume.analysisStatus === 'completed' ? '100%' : resume.analysisStatus === 'processing' ? '50%' : resume.analysisStatus === 'failed' ? '100%' : '25%'
                    }}
                  />
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center text-xs" title={new Date(resume.createdAt).toLocaleString()} style={{ color: "#52525b" }}>
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(resume.createdAt, { addSuffix: true })}
                </div>
                
                <div className="flex items-center gap-0.5">
                  <Link href={`/dashboard/resumes/${resume._id}`} className="p-1.5 transition-colors hover:text-indigo-400" style={{ color: "#52525b" }} title="View Details">
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button 
                    onClick={() => handleSetPrimary(resume._id)}
                    disabled={resume.isPrimary}
                    className="p-1.5 transition-colors"
                    style={{ color: resume.isPrimary ? "#818cf8" : "#52525b" }}
                    title={resume.isPrimary ? "Primary Resume" : "Set as Primary"}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => window.open(resume.fileUrl, "_blank")}
                    className="p-1.5 transition-colors hover:text-zinc-200"
                    style={{ color: "#52525b" }}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(resume._id, resume.fileKey)}
                    disabled={isDeleting === resume._id}
                    className="p-1.5 transition-colors hover:text-red-400 disabled:opacity-50"
                    style={{ color: "#52525b" }}
                    title="Delete"
                  >
                    {isDeleting === resume._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
