import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isDisposableEmail } from "./lib/email-security";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicRoute = createRouteMatcher(["/", "/login(.*)", "/signup(.*)"]);

// Simple in-memory rate limiting for signups (Note: resets on serverless cold starts, but good enough for basic protection)
const signupRateLimit = new Map<string, { count: number; windowStart: number }>();

export default clerkMiddleware(async (auth, req) => {
  // Signup Rate Limiting
  if (req.nextUrl.pathname.startsWith("/signup")) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour

    let rateInfo = signupRateLimit.get(ip);
    if (!rateInfo || now - rateInfo.windowStart > windowMs) {
      rateInfo = { count: 0, windowStart: now };
    }

    if (rateInfo.count >= 5) {
      // Return 429 Too Many Requests
      return new NextResponse("Too many signup attempts. Please try again later.", { status: 429 });
    }

    rateInfo.count += 1;
    signupRateLimit.set(ip, rateInfo);
  }

  if (isProtectedRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      await auth.protect();
      return;
    }

    // Attempt to extract email from session claims (requires Clerk JWT template customization)
    // Or fallback to checking if the webhook has deleted the user (which would invalidate the session anyway)
    const email = session.sessionClaims?.email as string | undefined;
    
    if (email && isDisposableEmail(email)) {
      return NextResponse.redirect(new URL("/auth/blocked", req.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

