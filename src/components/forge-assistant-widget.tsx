"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import * as motion from "framer-motion/client";

interface ForgeAssistantWidgetProps {
  advisorName?: "Forge" | "Nova";
  insights?: string[];
  className?: string;
}

const DEFAULT_INSIGHTS = [
  "Add Docker to your skills — 78% of target roles require it.",
  "Your ATS score drops below 70 for Backend roles. Update your resume.",
  "3 new Frontend Engineer matches found at companies in your target list.",
];

export function ForgeAssistantWidget({
  advisorName = "Forge",
  insights = DEFAULT_INSIGHTS,
  className = "",
}: ForgeAssistantWidgetProps) {
  const isForge = advisorName === "Forge";
  const accentColor = isForge ? "#818cf8" : "#a78bfa";
  const accentBg = isForge ? "rgba(129, 140, 248, 0.08)" : "rgba(167, 139, 250, 0.08)";
  const accentBorder = isForge ? "rgba(129, 140, 248, 0.2)" : "rgba(167, 139, 250, 0.2)";
  const pulseClass = isForge ? "forge-ring-pulse" : "nova-ring-pulse";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 ${className}`}
      style={{
        background: "var(--surface-2)",
        borderColor: accentBorder,
      }}
    >
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar with pulse ring */}
        <div className={`relative w-10 h-10 rounded-full overflow-hidden border-2 shrink-0 ${pulseClass}`}
          style={{ borderColor: accentColor + "60" }}
        >
          <Image
            src={isForge ? "/forge.png" : "/nova.png"}
            alt={advisorName}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: accentColor }}>
              {advisorName} says
            </span>
            <span className="ai-pulse" />
          </div>
          <p className="text-xs text-zinc-500">
            {isForge ? "Technical Career Strategist" : "Career Growth Advisor"}
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-2.5 mb-4">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.2, duration: 0.3 }}
            className="flex gap-2.5 items-start"
          >
            <Sparkles
              className="h-3.5 w-3.5 mt-0.5 shrink-0"
              style={{ color: accentColor }}
            />
            <p className="text-xs text-zinc-300 leading-relaxed">{insight}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/dashboard/advisor"
        className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ color: accentColor }}
      >
        Ask {advisorName} anything
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
