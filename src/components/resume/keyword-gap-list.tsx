"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Plus } from "lucide-react";

interface Keyword {
  word: string;
  priority: "High" | "Medium" | "Low";
  present: boolean;
}

interface KeywordGapListProps {
  keywords: Keyword[];
}

export function KeywordGapList({ keywords }: KeywordGapListProps) {
  const missingKeywords = keywords.filter(k => !k.present);
  const presentKeywords = keywords.filter(k => k.present);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-500" />
          Missing Keywords (High Priority)
        </h4>
        <div className="flex flex-wrap gap-2">
          {missingKeywords.map((k) => (
            <div 
              key={k.word} 
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                k.priority === "High" 
                  ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400" 
                  : k.priority === "Medium"
                  ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              <Plus className="h-3 w-3" />
              {k.word}
            </div>
          ))}
          {missingKeywords.length === 0 && (
            <p className="text-sm text-muted-foreground">No critical missing keywords. Great job!</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Successfully Included
        </h4>
        <div className="flex flex-wrap gap-2">
          {presentKeywords.map((k) => (
            <div 
              key={k.word} 
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400"
            >
              <CheckCircle2 className="h-3 w-3" />
              {k.word}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
