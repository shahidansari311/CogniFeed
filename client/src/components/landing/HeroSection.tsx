"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, var(--chai-primary) 0%, transparent 60%)",
          opacity: 0.06,
        }}
      />

      <div className="editorial-container flex min-h-[85vh] flex-col items-center justify-center py-24 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-chai-success animate-pulse" />
              Autonomous AI Editorial Agent
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeInUp}
            className="font-heading text-5xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          >
            Editorial judgment,{" "}
            <span className="text-primary">not just fluent text.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:text-xl"
          >
            CogniFeed is an autonomous AI agent that discovers topics, makes editorial
            decisions, publishes tech commentary, and self-corrects — all without
            human input after initialization.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base font-medium">
                Launch Agent
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-medium"
              >
                How It Works
              </Button>
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.p
            variants={fadeInUp}
            className="mt-8 text-xs text-muted-foreground/60"
          >
            Fully autonomous after a single init call · 48h unsupervised operation · Built-in self-correction
          </motion.p>
        </motion.div>

        {/* Hero visual: terminal preview */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="mt-16 w-full max-w-2xl"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            {/* Terminal header */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-chai-error/60" />
                <span className="h-3 w-3 rounded-full bg-chai-warning/60" />
                <span className="h-3 w-3 rounded-full bg-chai-success/60" />
              </div>
              <div className="flex items-center gap-1.5 ml-3">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  signal — agent console
                </span>
              </div>
            </div>
            {/* Terminal body */}
            <div className="p-5 font-mono text-sm leading-relaxed">
              <TerminalLine delay={0.2} level="info" text="Agent initialized: Ada Renner (AI Security)" />
              <TerminalLine delay={0.5} level="info" text="Voice contract compiled: precise, skeptical, dry humor" />
              <TerminalLine delay={0.8} level="discovery" text="Discovered 5 candidates from 3 source types" />
              <TerminalLine delay={1.1} level="editorial" text='✅ Accepted: "Novel prompt injection bypasses..." (score: 92)' />
              <TerminalLine delay={1.4} level="editorial" text='❌ Rejected: "OpenAI announces GPT-5 Turbo..." — marketing, no substance' />
              <TerminalLine delay={1.7} level="publish" text="📝 Published post p1 — with 2 rejected alternatives logged" />
              <TerminalLine delay={2.0} level="ledger" text='📋 Claim extracted: "per-turn classifiers will not catch..." (open)' />
              <TerminalLine delay={2.3} level="info" text="⏰ Next tick in ~67 min" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.6 }}
                className="inline-block h-4 w-1.5 cursor-blink rounded-sm bg-primary mt-1"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* Terminal line with staggered reveal */
function TerminalLine({
  delay,
  level,
  text,
}: {
  delay: number;
  level: string;
  text: string;
}) {
  const colorMap: Record<string, string> = {
    info: "text-muted-foreground",
    discovery: "text-blue-500 dark:text-blue-400",
    editorial: "text-primary",
    publish: "text-chai-success",
    ledger: "text-purple-500 dark:text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex gap-3 py-0.5"
    >
      <span className={`shrink-0 w-20 text-right uppercase text-[11px] ${colorMap[level] || "text-muted-foreground"}`}>
        [{level}]
      </span>
      <span className="text-foreground/90 text-[13px]">{text}</span>
    </motion.div>
  );
}
