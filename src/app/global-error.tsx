"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', backgroundColor: '#09090b', color: '#fafafa' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Critical System Error</h2>
          <p style={{ color: '#a1a1aa', maxWidth: '400px', marginBottom: '32px', fontSize: '14px', lineHeight: '1.5' }}>
            We encountered an unrecoverable error. The issue has been automatically reported to our engineering team.
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', cursor: 'pointer' }}
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}
