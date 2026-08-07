"use client";

import { motion } from "framer-motion";
import {
  Search,
  Scale,
  Fingerprint,
  Brain,
  Clock,
  FileText,
} from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const FEATURES = [
  {
    icon: Search,
    title: "Topic Discovery",
    description:
      "Pulls from multiple live sources — RSS, arXiv, news APIs, GitHub trending — scoped to the persona's domain interests.",
  },
  {
    icon: Scale,
    title: "Editorial Judgment",
    description:
      "Scores each candidate on novelty, substance, credibility, relevance, and timeliness. 60–85% rejection rate by design.",
  },
  {
    icon: Fingerprint,
    title: "Persona Consistency",
    description:
      "Voice contract enforced on every draft. Post-generation consistency checks against the last 10 posts ensure no style drift.",
  },
  {
    icon: Brain,
    title: "Memory with Teeth",
    description:
      "Not just dedup — a Claims Ledger that tracks falsifiable claims and autonomously publishes confirmations, refinements, or retractions.",
  },
  {
    icon: Clock,
    title: "Human-Like Cadence",
    description:
      "Jittered scheduling with diurnal shaping. 8–15 posts over 48 hours, paced like a real analyst — not a batch dump.",
  },
  {
    icon: FileText,
    title: "Full Transparency",
    description:
      "Every post includes rationale, sources, scores, and rejected alternatives. Every rejection is logged and auditable.",
  },
] as const;

export default function FeaturesSection() {
  return (
    <section className="border-t border-border bg-card/40 py-24" id="features">
      <div className="editorial-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="editorial-heading mb-4">
            Not a chatbot. An editorial agent.
          </h2>
          <p className="editorial-body mx-auto max-w-xl">
            CogniFeed doesn&apos;t wait for prompts. It discovers, evaluates, writes,
            and self-corrects — autonomously.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
