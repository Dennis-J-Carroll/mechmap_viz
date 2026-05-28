import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mech Interp Viz - Mechanistic Interpretability Visualization",
  description: "Interactive visualization tool for mechanistic interpretability research. Explore transformer architectures, annotate attention heads and MLP blocks.",
  keywords: ["mechanistic interpretability", "transformer", "attention heads", "MLP", "AI research", "visualization", "GPT", "neural networks"],
  authors: [{ name: "Mech Interp Research" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Portfolio back-link — absolute URL since this app is on its own domain */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 99999,
          background: 'rgba(10,14,20,0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,188,212,0.15)',
          padding: '0 1rem',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="https://dennisjcarroll.com/apps/"
              style={{ color: '#00bcd4', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}
            >
              ← Back to Projects
            </a>
            <span style={{ color: '#4b5563', flexShrink: 0 }}>|</span>
            <span style={{ color: '#d1d5db', fontSize: '13px' }}>Mech Interp Viz</span>
          </div>
          <a
            href="https://dennisjcarroll.com"
            style={{ color: '#00bcd4', fontWeight: 700, letterSpacing: '0.05em', fontSize: '13px', textDecoration: 'none' }}
          >
            DJC
          </a>
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
