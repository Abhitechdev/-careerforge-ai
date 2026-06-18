import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | CareerForge AI",
  description: "Terms and conditions for using CareerForge AI.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "#09090b", color: "#e4e4e7" }}>
      {/* Background Ambience */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.08) 0%, transparent 60%)",
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
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">Terms of Service</h1>
          <p className="text-zinc-400">Last Updated: October 2026</p>
        </div>

        <div className="space-y-10 text-zinc-300 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-indigo-400 font-mono text-sm">01.</span> Overview
            </h2>
            <p>
              Welcome to CareerForge AI OS. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service. These terms govern your use of our resume analysis, interview preparation, and job matching tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-indigo-400 font-mono text-sm">02.</span> AI and Employment Disclaimer
            </h2>
            <p>
              CareerForge AI utilizes advanced artificial intelligence to provide resume feedback, mock interviews, and career guidance. <strong>However, we do not guarantee employment, job interviews, or specific career outcomes.</strong> 
              Our AI provides probabilistic suggestions based on industry data and semantic matching. You are solely responsible for reviewing any AI-generated content before using it in your job search. CareerForge AI is an advisory tool, not an employment agency.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-indigo-400 font-mono text-sm">03.</span> User Responsibilities
            </h2>
            <p className="mb-3">As a user of CareerForge AI, you agree to the following:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>You will provide accurate and truthful information regarding your professional experience.</li>
              <li>You will not upload malicious files, viruses, or illegal content to our platform.</li>
              <li>You will not use automated scripts, bots, or scrapers to extract data from our platform.</li>
              <li>You will not attempt to reverse engineer our proprietary AI models or algorithms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-indigo-400 font-mono text-sm">04.</span> Account Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion, without prior notice, if we determine that you have violated these terms. Abuse of our AI systems, including generating excessive or inappropriate requests, may result in an immediate and permanent ban. Upon termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-indigo-400 font-mono text-sm">05.</span> Future Billing Policy
            </h2>
            <p>
              Currently, certain features of CareerForge AI are provided free of charge during our beta phase. We reserve the right to introduce premium subscription tiers, usage limits, or paid features in the future. Should any billing changes occur, users will be provided with reasonable advance notice and given the option to opt-out or delete their account before any charges are incurred.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-indigo-400 font-mono text-sm">06.</span> Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, CareerForge AI and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
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
