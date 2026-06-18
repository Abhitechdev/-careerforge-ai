"use client";

import * as React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SkillRadarChartProps {
  currentSkills?: Record<string, number>;
  targetSkills?: Record<string, number>;
  targetRole?: string;
  className?: string;
}

const DEFAULT_SKILLS = [
  { subject: "Frontend", current: 85, target: 90 },
  { subject: "Backend", current: 60, target: 80 },
  { subject: "DevOps", current: 30, target: 70 },
  { subject: "System Design", current: 50, target: 75 },
  { subject: "Soft Skills", current: 75, target: 80 },
  { subject: "AI/ML", current: 40, target: 65 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-zinc-300 font-medium mb-1">{payload[0]?.payload?.subject}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-zinc-400">{entry.name}:</span>
            <span className="font-mono font-semibold" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SkillRadarChart({
  targetRole = "Frontend Engineer",
  className = "",
}: SkillRadarChartProps) {
  const data = DEFAULT_SKILLS;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Legend */}
      <div className="flex items-center gap-6 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 rounded" style={{ background: "#818cf8" }} />
          <span className="text-xs text-zinc-400">Current Skills</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-0.5 rounded"
            style={{ background: "#22d3ee", borderTop: "1px dashed #22d3ee" }}
          />
          <span className="text-xs text-zinc-400">Target: {targetRole}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: 260, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid
              stroke="#27272a"
              radialLines={false}
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#71717a", fontSize: 11, fontFamily: "Inter" }}
              tickLine={false}
            />
            {/* Target area */}
            <Radar
              name="Target"
              dataKey="target"
              stroke="#22d3ee"
              strokeWidth={1.5}
              fill="#22d3ee"
              fillOpacity={0.06}
              strokeDasharray="4 3"
            />
            {/* Current area */}
            <Radar
              name="Current"
              dataKey="current"
              stroke="#818cf8"
              strokeWidth={2}
              fill="#818cf8"
              fillOpacity={0.15}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Skill tags */}
      <div className="flex flex-wrap gap-2 mt-2">
        {data.map((skill) => {
          const gap = skill.target - skill.current;
          return (
            <span
              key={skill.subject}
              className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md"
              style={{
                background: gap > 20 ? "rgba(239,68,68,0.08)" : gap > 0 ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)",
                color: gap > 20 ? "#fca5a5" : gap > 0 ? "#fcd34d" : "#86efac",
                border: `1px solid ${gap > 20 ? "rgba(239,68,68,0.2)" : gap > 0 ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)"}`,
              }}
            >
              {skill.subject}
              <span className="font-mono font-semibold">{skill.current}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
