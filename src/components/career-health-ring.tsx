"use client";

import * as React from "react";
import * as motion from "framer-motion/client";

interface CareerHealthRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showBreakdown?: boolean;
  breakdown?: {
    resume: number;
    skills: number;
    interviews: number;
    tasks: number;
  };
  label?: string;
  className?: string;
}

export function CareerHealthRing({
  score,
  size = 140,
  strokeWidth = 10,
  showBreakdown = false,
  breakdown,
  label,
  className = "",
}: CareerHealthRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const dashOffset = circumference * (1 - progress / 100);

  const getColor = (s: number) => {
    if (s >= 80) return "#22c55e";
    if (s >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getGlow = (s: number) => {
    if (s >= 80) return "rgba(34, 197, 94, 0.25)";
    if (s >= 60) return "rgba(245, 158, 11, 0.25)";
    return "rgba(239, 68, 68, 0.25)";
  };

  const getLabel = (s: number) => {
    if (s === 0) return "No Data";
    if (s >= 90) return "Excellent";
    if (s >= 80) return "Strong";
    if (s >= 70) return "Competitive";
    if (s >= 60) return "Developing";
    return "Needs Work";
  };

  const color = getColor(score);
  const glowColor = getGlow(score);
  const statusLabel = label || getLabel(score);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Ring */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg]"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#27272a"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>

        {/* Center score */}
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span
            className="font-mono font-bold leading-none"
            style={{ fontSize: size * 0.22, color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-zinc-500 font-mono mt-0.5">/100</span>
        </div>
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <span
          className="text-sm font-semibold"
          style={{ color }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Breakdown bars */}
      {showBreakdown && breakdown && (
        <div className="mt-4 w-full space-y-2">
          {[
            { label: "Resume", value: breakdown.resume, color: "#818cf8" },
            { label: "Skills", value: breakdown.skills, color: "#22d3ee" },
            { label: "Interviews", value: breakdown.interviews, color: "#a78bfa" },
            { label: "Tasks", value: breakdown.tasks, color: "#22c55e" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 w-20 shrink-0">{item.label}</span>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-mono text-zinc-400 w-8 text-right">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
