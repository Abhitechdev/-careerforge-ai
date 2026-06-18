"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";
import * as motion from "framer-motion/client";
import { CheckCircle, Briefcase, GraduationCap, Award, ArrowRight, Bot, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useMutation(api.onboarding.completeOnboarding);
  const createResume = useMutation(api.resumes.create);
  const scheduleAnalysis = useMutation(api.analyses.scheduleAnalysis);

  const [step, setStep] = React.useState(1);
  const [experienceLevel, setExperienceLevel] = React.useState<"Student" | "Fresher" | "Professional" | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);

  const handleLevelSelect = (level: "Student" | "Fresher" | "Professional") => {
    setExperienceLevel(level);
    setTimeout(() => setStep(2), 400);
  };

  const handleFinish = async () => {
    if (!experienceLevel) return;
    setIsCompleting(true);
    try {
      await completeOnboarding({ experienceLevel });
      toast.success("Welcome to CareerForge AI!");
      router.push("/dashboard");
    } catch (e) {
      toast.error("Failed to complete onboarding.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-20 px-6">
      <div className="w-full max-w-2xl">
        <div className="mb-12 flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -z-10 -translate-y-1/2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500" 
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / 2) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${step >= i ? "bg-indigo-600 text-white" : "bg-secondary text-muted-foreground"}`}>
              {i}
            </div>
          ))}
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Welcome to CareerForge AI</h1>
              <p className="text-muted-foreground text-lg">Let's personalize your career operating system. Where are you in your journey?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <LevelCard title="Student" desc="Still studying, looking for internships or fresh grad roles." icon={<GraduationCap className="h-8 w-8 text-sky-500" />} selected={experienceLevel === "Student"} onClick={() => handleLevelSelect("Student")} />
              <LevelCard title="Fresher" desc="Recently graduated, actively looking for junior roles." icon={<Award className="h-8 w-8 text-emerald-500" />} selected={experienceLevel === "Fresher"} onClick={() => handleLevelSelect("Fresher")} />
              <LevelCard title="Professional" desc="Experienced, looking to level up or pivot careers." icon={<Briefcase className="h-8 w-8 text-indigo-500" />} selected={experienceLevel === "Professional"} onClick={() => handleLevelSelect("Professional")} />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Upload Your Resume</h1>
              <p className="text-muted-foreground text-lg">We'll analyze it against industry standards in the background.</p>
            </div>

            <div className="p-8 border-2 border-dashed border-muted-foreground/25 rounded-2xl bg-card hover:bg-secondary/10 transition-colors">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
                  <p className="text-muted-foreground font-medium">Processing your resume...</p>
                </div>
              ) : (
                <UploadDropzone
                  endpoint="resumeUploader"
                  onUploadBegin={() => setIsUploading(true)}
                  onClientUploadComplete={async (res) => {
                    if (res && res.length > 0) {
                      const file = res[0];
                      try {
                        const resumeId = await createResume({
                          title: file.name,
                          fileUrl: file.url,
                          fileKey: file.key,
                          format: file.name.endsWith(".docx") ? "docx" : "pdf",
                          fileSize: file.size,
                        });
                        
                        scheduleAnalysis({ resumeId }).catch(console.error);
                        toast.success("Resume uploaded! Analysis started.");
                        setStep(3);
                      } catch (err) {
                        toast.error("Failed to save resume metadata.");
                        setIsUploading(false);
                      }
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload failed: ${error.message}`);
                    setIsUploading(false);
                  }}
                  appearance={{
                    button: "ut-uploading:bg-indigo-600/50 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-2 rounded-md shadow",
                  }}
                />
              )}
            </div>

            <div className="flex justify-center">
              <button onClick={() => setStep(3)} className="text-muted-foreground hover:text-foreground text-sm font-medium">
                Skip for now
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Meet Forge & Nova</h1>
              <p className="text-muted-foreground text-lg">Your AI Career Advisors are ready.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 bg-card border border-border p-8 rounded-2xl">
              <div className="h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Bot className="h-12 w-12 text-indigo-500" />
              </div>
              <div className="space-y-4">
                <p className="text-foreground/90 text-lg">
                  "I'm <strong>Forge</strong>, your strategic career advisor. I'll help you navigate job applications, analyze your ATS scores, and plan your long-term career growth."
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Job Matching
                  <span className="mx-2">•</span>
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Interview Prep
                  <span className="mx-2">•</span>
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Networking
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={handleFinish} 
                disabled={isCompleting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 shadow-xl shadow-indigo-500/20 disabled:opacity-50 transition-all hover:scale-105"
              >
                {isCompleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Enter Dashboard <ArrowRight className="h-5 w-5" /></>}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function LevelCard({ title, desc, icon, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 text-left transition-all ${
        selected ? "border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10 scale-105" : "border-border bg-card hover:border-indigo-500/30 hover:bg-secondary/50"
      }`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </button>
  );
}
