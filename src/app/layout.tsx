import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ResumeProvider } from "@/contexts/ResumeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HydraHunt - Career Warfare AI Platform",
  description: "Transform your career with AI-powered resume building, job hunting automation, and career intelligence. Hunt smarter with Hydra.",
  keywords: ["HydraHunt", "Resume Builder", "Job Hunt", "AI Career", "Resume Analysis", "Job Application Automation"],
  authors: [{ name: "HydraHunt Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "HydraHunt - Career Warfare AI Platform",
    description: "AI-powered career warfare platform for precision resume building and job hunting",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <ResumeProvider>
            <LanguageProvider>
              {children}
              <Toaster />
            </LanguageProvider>
          </ResumeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
