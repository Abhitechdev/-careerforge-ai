import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | CareerForge AI",
  description: "Privacy policy and data handling at CareerForge AI.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "#09090b", color: "#e4e4e7" }}>
      {/* Background Ambience */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,197,94,0.05) 0%, transparent 60%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, #27272a 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center px-6" style={{ background: "rgba(9,9,11,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-3xl px-6 py-20 relative z-10">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/10 border border-green-500/20">
            <ShieldCheck className="text-green-500 h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">Privacy Policy</h1>
            <p className="text-zinc-400 mt-2">Your data, operating under your control.</p>
          </div>
        </div>

        <div className="space-y-10 text-zinc-300 leading-relaxed text-sm md:text-base">
          
          <section className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-green-500 font-mono text-sm">01.</span> Resume Storage & Strict Privacy
            </h2>
            <p>
              Your professional data is highly sensitive. When you upload your resume or input your skills, that data is securely stored in our database for the sole purpose of providing our services to you.
            </p>
            <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
              CRITICAL POLICY: We never share, sell, or distribute your resume or personal profile with employers, recruiters, or third parties without your explicit, opt-in action. Your profile is private by default.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-green-500 font-mono text-sm">02.</span> Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li><strong>Account Data:</strong> Name, email address, and authentication identifiers provided via our secure authentication partner (Clerk).</li>
              <li><strong>Professional Data:</strong> Resume documents (PDF/Text), parsed skill sets, job application history, and interview records you explicitly provide.</li>
              <li><strong>Usage Metrics:</strong> Generalized interaction data with our UI to help us understand which features are most useful.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-green-500 font-mono text-sm">03.</span> Product Analytics (PostHog)
            </h2>
            <p>
              We use PostHog to collect anonymous telemetry and product analytics. This helps us identify bugs, improve user experience, and prioritize new features. We ensure that highly sensitive inputs (like the raw text of your resume or interview transcripts) are excluded from behavioral tracking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-green-500 font-mono text-sm">04.</span> Email Communications
            </h2>
            <p>
              We utilize Resend to dispatch transactional emails (like authentication alerts or password resets) and occasional product updates. You have the right to unsubscribe from any non-essential marketing communications via the "Unsubscribe" link provided at the bottom of our emails.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-green-500 font-mono text-sm">05.</span> Data Deletion Requests
            </h2>
            <p>
              You maintain complete ownership over your data. If you wish to permanently delete your account, you can initiate a Data Deletion Request directly from your Account Settings. Alternatively, you can email us at privacy@careerforge.ai. 
            </p>
            <p className="mt-2 text-zinc-400">
              Upon receiving a deletion request, we will hard-delete your user record, uploaded documents, and all associated AI insights from our active databases within 30 days.
            </p>
          </section>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t py-8 text-center text-sm text-zinc-500 relative z-10" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#09090b" }}>
        CareerForge AI OS © 2026. All rights reserved.
      </footer>
    </div>
  );
}
