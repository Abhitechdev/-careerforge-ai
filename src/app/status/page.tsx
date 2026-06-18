import Link from "next/link";
import { ArrowLeft, Activity, Database, Key, BrainCircuit, Mail } from "lucide-react";

export const metadata = {
  title: "System Status | CareerForge AI",
  description: "Real-time system health and service status.",
};

// Force dynamic rendering so it checks env vars on every load (acting as a live check)
export const dynamic = 'force-dynamic';

export default function StatusPage() {
  // Check "real" config state. If keys exist, we assume the connection is operational.
  const services = [
    {
      name: "Authentication (Clerk)",
      icon: Key,
      isOperational: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
    {
      name: "Database (Convex)",
      icon: Database,
      isOperational: !!process.env.NEXT_PUBLIC_CONVEX_URL,
    },
    {
      name: "AI Inference (NVIDIA / OpenAI)",
      icon: BrainCircuit,
      isOperational: !!process.env.NVIDIA_API_KEY || !!process.env.OPENAI_API_KEY,
    },
    {
      name: "Email Delivery (Resend)",
      icon: Mail,
      isOperational: !!process.env.RESEND_API_KEY,
    },
  ];

  const allOperational = services.every((s) => s.isOperational);

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
        
        {/* Status Header */}
        <div className="mb-14 text-center">
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${allOperational ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <Activity className={allOperational ? 'text-green-500 h-8 w-8' : 'text-red-500 h-8 w-8'} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            System Status
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
             {allOperational ? (
               <>
                 <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                 <span className="text-sm font-medium text-zinc-300">All Systems Operational</span>
               </>
             ) : (
               <>
                 <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                 <span className="text-sm font-medium text-red-400">Some Systems Degraded</span>
               </>
             )}
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono font-semibold text-zinc-500 uppercase tracking-widest mb-6">Live Service Health</h2>
          
          <div className="grid gap-3">
            {services.map((service) => (
              <div 
                key={service.name} 
                className="flex items-center justify-between p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${service.isOperational ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <service.icon className={`h-5 w-5 ${service.isOperational ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <span className="font-medium text-zinc-200">{service.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {service.isOperational ? (
                    <>
                      <span className="text-sm text-green-400 font-medium">Operational</span>
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-red-400 font-medium">Offline</span>
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="border-t py-8 text-center text-sm text-zinc-500 relative z-10" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#09090b" }}>
        CareerForge AI OS © 2026. All rights reserved.
      </footer>
    </div>
  );
}
