import "./globals.css";
import Nav from "@/components/nav";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";

const FigtreeFont = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InnoPlan Chatbot — AI-Powered Business Planning",
  description:
    "AInnoPlan Chatbot helps you generate business plans, pitch scripts, and dynamic task assignments for your startup ideas, powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <meta property="og:image" content="/opengraph-image.png" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1280" />
      <meta property="og:image:height" content="832" />
      <meta property="og:site_name" content="InnoPlan Chatbot — AI-Powered Business Planning" />
      <meta property="og:url" content="https://innoplan.vercel.app/" />
      <meta name="twitter:image" content="/twitter-image.png" />
      <meta name="twitter:image:type" content="image/png" />
      <meta name="twitter:image:width" content="1280" />
      <meta name="twitter:image:height" content="832" />
      <meta name="description" content="InnoPlan Chatbot helps you generate business plans, pitch scripts, and dynamic task assignments for your startup ideas, powered by AI." />
      <meta name="keywords" content="InnoPlan Chatbot, AI Business Planning, Startup Tools, AI Pitch Script, AI Task Management" />
      <meta property="og:title" content="InnoPlan Chatbot — Your AI-Powered Startup Assistant" />
      <meta name="twitter:title" content="InnoPlan Chatbot — Your AI-Powered Startup Assistant" />
      <meta name="twitter:description" content="Generate business plans, pitch scripts, and dynamic task assignments effortlessly with InnoPlan Chatbot. Turn your ideas into reality!" />
      <meta property="og:description" content="Generate business plans, pitch scripts, and dynamic task assignments effortlessly with InnoPlan Chatbot. Turn your ideas into reality!" />
      
      <body className={`${FigtreeFont.className} min-h-screen font-light selection:bg-blue-600 selection:text-white`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Nav />
          <Toaster position={"top-center"} richColors />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>

  );
}
