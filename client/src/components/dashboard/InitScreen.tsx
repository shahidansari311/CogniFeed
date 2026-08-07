"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Cpu,
  Scale,
  Bot,
  Code,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PERSONA_TEMPLATES } from "@/lib/constants";
import { staggerContainer, fadeInUp, scaleIn } from "@/lib/animations";
import type { Persona, PersonaTemplate } from "@/lib/types";

/* ────────────────────────────────────────────
   Icon map
   ──────────────────────────────────────────── */

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  Cpu,
  Scale,
  Bot,
  Code,
};

/* ────────────────────────────────────────────
   Props
   ──────────────────────────────────────────── */

interface InitScreenProps {
  onInit: (persona: Persona) => void;
}

/* ────────────────────────────────────────────
   Compiling Step (micro-animation)
   ──────────────────────────────────────────── */

function CompilingStep({ persona, onDone }: { persona: Persona; onDone: () => void }) {
  const steps = [
    "Compiling voice contract...",
    `Setting tone: ${persona.voice?.tone || 'Calibrating...'}`,
    `Locking domain: ${persona.domain}`,
    `Loading ${persona.stableInterests?.length || 'core'} stable interests...`,
    "Generating editorial rejection rubric...",
    "Initializing claims ledger...",
    "Starting autonomous scheduler...",
    "Agent ready.",
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useState(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= steps.length) {
        clearInterval(interval);
        setTimeout(onDone, 600);
      } else {
        setCurrentStep(i);
      }
    }, 400);
    return () => clearInterval(interval);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[60vh] flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold">Initializing {persona.name}</h3>
            <p className="text-sm text-muted-foreground">{persona.role}</p>
          </div>
        </div>

        <div className="space-y-2 font-mono text-sm">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{
                opacity: idx <= currentStep ? 1 : 0.2,
                x: idx <= currentStep ? 0 : -8,
              }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="flex items-center gap-2"
            >
              {idx < currentStep ? (
                <Check className="h-3.5 w-3.5 text-chai-success" />
              ) : idx === currentStep ? (
                <span className="inline-block h-3.5 w-3.5 animate-pulse rounded-full bg-primary" />
              ) : (
                <span className="inline-block h-3.5 w-3.5 rounded-full border border-border" />
              )}
              <span
                className={
                  idx <= currentStep ? "text-foreground" : "text-muted-foreground/40"
                }
              >
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Persona Card
   ──────────────────────────────────────────── */

function PersonaCard({
  template,
  selected,
  onSelect,
}: {
  template: PersonaTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = ICON_MAP[template.icon] || Shield;

  return (
    <motion.div variants={fadeInUp}>
      <Card
        role="button"
        tabIndex={0}
        aria-label={`Select ${template.persona.name} persona`}
        aria-pressed={selected}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={`
          group cursor-pointer transition-all duration-300
          hover:-translate-y-1 hover:shadow-lg
          ${selected ? "border-primary ring-2 ring-primary/20 shadow-lg" : "border-border hover:border-primary/40"}
        `}
      >
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            {selected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
              >
                <Check className="h-3.5 w-3.5 text-primary-foreground" />
              </motion.div>
            )}
          </div>

          <h3 className="mb-1 font-heading text-lg font-semibold">{template.persona.name}</h3>
          <p className="mb-1 text-sm font-medium text-primary">{template.label}</p>
          <p className="mb-4 text-sm text-muted-foreground">{template.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {(template.persona.stableInterests || []).slice(0, 3).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs font-normal">
                {interest.split("/")[0].trim()}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   InitScreen
   ──────────────────────────────────────────── */

export default function InitScreen({ onInit }: InitScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);

  const selectedTemplate = PERSONA_TEMPLATES.find((t) => t.id === selectedId);

  function handleStart() {
    if (!selectedTemplate) return;
    setCompiling(true);
  }

  function handleCompileDone() {
    if (!selectedTemplate) return;
    onInit(selectedTemplate.persona);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatePresence mode="wait">
        {compiling && selectedTemplate ? (
          <CompilingStep
            key="compiling"
            persona={selectedTemplate.persona}
            onDone={handleCompileDone}
          />
        ) : (
          <motion.div
            key="selection"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="flex flex-1 flex-col items-center justify-center px-6 py-16"
          >
            {/* Header */}
            <motion.div variants={fadeInUp} className="mb-12 text-center">
              <motion.div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
                variants={scaleIn}
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="editorial-heading mb-4">
                Initialize Your Agent
              </h1>
              <p className="editorial-body mx-auto max-w-xl">
                Choose a persona template to create an autonomous editorial agent.
                The agent will discover topics, make editorial judgments, publish posts,
                and self-correct — all without human input.
              </p>
            </motion.div>

            {/* Persona Grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mb-10 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {PERSONA_TEMPLATES.map((template) => (
                <PersonaCard
                  key={template.id}
                  template={template}
                  selected={selectedId === template.id}
                  onSelect={() => setSelectedId(template.id)}
                />
              ))}
            </motion.div>

            {/* Start Button */}
            <motion.div variants={fadeInUp}>
              <Button
                size="lg"
                disabled={!selectedTemplate}
                onClick={handleStart}
                aria-label="Initialize selected persona agent"
                className="h-12 px-8 text-base font-medium"
              >
                Initialize Agent
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
