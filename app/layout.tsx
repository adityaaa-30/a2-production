import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { Navbar } from "@/components/Navbar";

import { ProjectInquiryProvider } from "@/components/ProjectInquiryContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A2 Production — Crafting Digital Experiences That Inspire",
  description:
    "A2 Production is a creative digital agency crafting brands, products, and motion for companies who refuse to blend in.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} w-full antialiased`}
    >
      <body className="min-h-screen w-full flex flex-col bg-background text-[#f4f4f5] overflow-x-hidden">
        <SmoothScrollProvider>
          <ProjectInquiryProvider>
            <Navbar />
            {children}
          </ProjectInquiryProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
