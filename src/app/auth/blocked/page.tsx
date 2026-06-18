import * as React from "react";
import { AlertOctagon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BlockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
          <AlertOctagon className="h-8 w-8" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-foreground">Registration Blocked</h1>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Please use a valid personal, educational, or work email address.
        </p>
        
        <div className="bg-secondary/50 rounded-lg p-4 mb-8 text-sm text-muted-foreground border border-border">
          Temporary email providers are not supported to ensure the security and quality of our platform.
        </div>

        <Link 
          href="/signup" 
          className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Try another email
        </Link>
      </div>
    </div>
  );
}
