"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md"
    >
      <nav className="editorial-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="CogniFeed home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight">
              CogniFeed
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </a>
        </div>

        {/* CTA */}
        <Link href="/dashboard">
          <Button size="sm" className="h-9 px-4 text-sm font-medium">
            Launch Agent
          </Button>
        </Link>
      </nav>
    </motion.header>
  );
}
