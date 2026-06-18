import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import * as motion from "framer-motion/client";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-indigo-500/30">
      {/* Navigation */}
      <div className="absolute top-0 w-full p-6 z-50 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2 font-bold tracking-tight">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="hidden sm:inline-block">CareerForge AI</span>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Premium Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-10"
        >
          <SignIn 
            signUpUrl="/signup" 
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                card: "bg-background/60 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl",
                headerTitle: "text-foreground font-bold",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80",
                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white transition-colors",
                formFieldLabel: "text-foreground font-medium",
                formFieldInput: "bg-transparent border border-input text-foreground hover:border-indigo-500/50 focus:border-indigo-500 transition-colors",
                footerActionLink: "text-indigo-600 hover:text-indigo-500",
                identityPreviewText: "text-foreground",
                identityPreviewEditButtonIcon: "text-indigo-600"
              }
            }}
          />
        </motion.div>
      </main>
    </div>
  );
}
