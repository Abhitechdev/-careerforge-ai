"use client";

import * as React from "react";
import * as motion from "framer-motion/client";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ATSScoreWidgetProps {
  score: number;
  previousScore?: number;
}

export function ATSScoreWidget({ score, previousScore }: ATSScoreWidgetProps) {
  const isGood = score >= 80;
  const isOkay = score >= 60 && score < 80;

  const color = isGood ? "#22c55e" : isOkay ? "#f59e0b" : "#ef4444";
  const glowColor = isGood
    ? "rgba(34, 197, 94, 0.2)"
    : isOkay
    ? "rgba(245, 158, 11, 0.2)"
    : "rgba(239, 68, 68, 0.2)";

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);
  const trend = previousScore ? score - previousScore : 0;

  return (
    <div
      className="flex flex-col items-center justify-center p-6 rounded-xl"
      style={{
        background: "#18181b",
        border: "1px solid #27272a",
      }}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest mb-5"
        style={{ color: "#52525b" }}
      >
        ATS Score
      </p>

      <div className="relative flex items-center justify-center h-32 w-32">
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
        />
        <svg
          className="absolute inset-0 h-full w-full rotate-[-90deg]"
          viewBox="0 0 100 100"
        >
          {/* Track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none" stroke="#27272a" strokeWidth="8"
          />
          {/* Progress */}
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>

        <div className="flex flex-col items-center justify-center">
          <span className="text-4xl font-black font-mono leading-none" style={{ color }}>
            {score}
          </span>
          <span className="text-xs mt-0.5" style={{ color: "#52525b" }}>/100</span>
        </div>
      </div>

      {trend !== 0 && (
        <div
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: trend > 0 ? "#22c55e" : "#ef4444" }}
        >
          {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>{Math.abs(trend)} pts {trend > 0 ? "increase" : "decrease"}</span>
        </div>
      )}
    </div>
  );
}
