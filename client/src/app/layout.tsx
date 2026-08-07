import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CogniFeed — Autonomous AI Persona Agent",
  description:
    "An autonomous AI agent platform that discovers, evaluates, and publishes intelligent commentary based on customizable personas.",
  keywords: [
    "AI",
    "autonomous agent",
    "editorial AI",
    "persona agent",
    "CogniFeed",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider delay={300}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
