import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export function useAnalytics() {
  const logEventMutation = useMutation(api.analytics.logEvent);
  const { user } = useUser();
  
  // Keep session ID consistent during the lifecycle of this hook instance
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    if (!sessionIdRef.current && typeof window !== "undefined") {
      let storedSession = sessionStorage.getItem("careerforge_session");
      if (!storedSession) {
        storedSession = uuidv4();
        sessionStorage.setItem("careerforge_session", storedSession);
        
        // Only log Session Started if we just created the session
        logEventMutation({
          clerkId: user?.id,
          sessionId: storedSession,
          eventType: "Session Started",
          metadata: { url: window.location.href }
        }).catch(console.error);
      }
      sessionIdRef.current = storedSession;
    }
    
    // Attempt to log session ended on unmount (often unreliable, but better than nothing)
    return () => {
      if (sessionIdRef.current) {
        // We could use navigator.sendBeacon here for more reliability, 
        // but for now we'll stick to convex mutation.
      }
    };
  }, [user, logEventMutation]);

  const logEvent = useCallback((eventType: string, metadata?: any) => {
    return logEventMutation({
      clerkId: user?.id,
      sessionId: sessionIdRef.current,
      eventType,
      metadata,
    }).catch(console.error); // Swallow errors to not break UI
  }, [logEventMutation, user]);

  return { logEvent };
}
