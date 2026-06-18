"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { logEvent } = useAnalytics();

  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
    logEvent("Error Encountered", { message: error.message, stack: error.stack, digest: error.digest });
  }, [error, logEvent]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      
      <h2 className="text-xl font-bold mb-3">
        {error.name === "AppError" ? (error as any).title : "Something went wrong"}
      </h2>
      
      <p className="text-zinc-400 max-w-md mb-8 text-sm">
        {error.name === "AppError" 
          ? error.message 
          : "An unexpected error occurred. We've logged the issue and are looking into it."}
      </p>

      <button
        onClick={() => reset()}
        className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
      >
        <RefreshCcw className="mr-2 h-4 w-4" />
        {error.name === "AppError" && (error as any).recoveryAction ? (error as any).recoveryAction : "Try Again"}
      </button>
    </div>
  );
}
