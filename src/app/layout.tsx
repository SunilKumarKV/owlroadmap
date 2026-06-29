import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from '@/components/ThemeProvider';
import Analytics from '@/components/Analytics';
import { Suspense } from 'react';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://owlroadmap.com';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "OwlRoadmap | Interactive Developer Profile & Learning Roadmap Generator",
  description: "Instantly create professional developer profile READMEs, customize step-by-step learning roadmaps, and share your technical portfolio with responsive themes.",
  keywords: ["developer portfolio", "github readme generator", "learning roadmap", "developer dashboard", "portfolio builder", "resume builder", "visual roadmap", "software engineer curriculum"],
  authors: [{ name: "OwlRoadmap Team" }],
  openGraph: {
    title: "OwlRoadmap | Interactive Developer Profile & Learning Roadmap Generator",
    description: "Instantly create professional developer profile READMEs, customize step-by-step learning roadmaps, and share your technical portfolio.",
    type: "website",
    locale: "en_US",
    siteName: "OwlRoadmap",
    url: "/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OwlRoadmap - Visual Developer Workspaces",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OwlRoadmap | Interactive Developer Profile & Learning Roadmap Generator",
    description: "Instantly create professional developer profile READMEs, customize step-by-step learning roadmaps, and share your technical portfolio.",
    images: ["/og-image.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}

