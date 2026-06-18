"use client";

import * as React from "react";
import { FileQuestion, AlertOctagon, RefreshCcw, LifeBuoy } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
}: {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center p-12 text-center rounded-xl"
      style={{
        background: "rgba(24,24,27,0.5)",
        border: "1px dashed #27272a",
      }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
        style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
      >
        <FileQuestion className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex h-9 items-center justify-center rounded-lg px-5 text-xs font-bold text-white transition-all hover:opacity-90"
          style={{ background: "#6366f1" }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center p-8 text-center rounded-xl"
      style={{
        background: "rgba(239,68,68,0.05)",
        border: "1px solid rgba(239,68,68,0.2)",
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
      >
        <AlertOctagon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold mb-2" style={{ color: "#fca5a5" }}>
        {title}
      </h3>
      <p className="text-sm mb-6 max-w-sm leading-relaxed" style={{ color: "#f87171" }}>
        {description}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-bold text-white transition-all hover:opacity-90"
          style={{ background: "#ef4444" }}
        >
          <RefreshCcw className="mr-2 h-3.5 w-3.5" />
          Retry
        </button>
        <button
          className="inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-medium transition-colors hover:bg-white/5"
          style={{ borderColor: "rgba(239,68,68,0.3)", color: "#fca5a5" }}
        >
          <LifeBuoy className="mr-2 h-3.5 w-3.5" />
          Support
        </button>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ type = "card" }: { type?: "card" | "list" | "dashboard" }) {
  if (type === "card") {
    return (
      <div className="rounded-xl p-6 animate-pulse" style={{ background: "#18181b", border: "1px solid #27272a" }}>
        <div className="h-4 w-1/3 shimmer rounded mb-4" />
        <div className="h-10 w-full shimmer rounded mb-2" />
        <div className="h-3 w-2/3 shimmer rounded" />
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="grid gap-5 md:grid-cols-2 animate-pulse">
        <div className="rounded-xl p-6 h-64 flex flex-col justify-between" style={{ background: "#18181b", border: "1px solid #27272a" }}>
          <div className="h-5 w-1/3 shimmer rounded" />
          <div className="flex items-center justify-center flex-1">
            <div className="h-36 w-36 rounded-full shimmer" />
          </div>
        </div>
        <div className="rounded-xl p-6 h-64 space-y-4" style={{ background: "#18181b", border: "1px solid #27272a" }}>
          <div className="h-5 w-1/2 shimmer rounded mb-4" />
          <div className="h-3 w-full shimmer rounded" />
          <div className="h-3 w-5/6 shimmer rounded" />
          <div className="h-3 w-4/6 shimmer rounded" />
          <div className="h-3 w-full shimmer rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-10 w-10 shimmer rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-1/4 shimmer rounded" />
            <div className="h-3 w-1/2 shimmer rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
