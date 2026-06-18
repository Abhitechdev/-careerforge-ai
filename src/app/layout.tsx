import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerForge AI — Career Operating System",
  description:
    "Your AI-powered career operating system. Resume intelligence, job matching, interview prep, and personalized career guidance — all in one place.",
  keywords: ["career", "AI", "resume", "job search", "interview prep", "career coach"],
};

import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ClerkHeader } from "@/components/clerk-header";
import { PHProvider } from "@/components/providers/posthog-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-[var(--font-inter)]">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <PHProvider>
              <ClerkHeader />
              {children}
            </PHProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
