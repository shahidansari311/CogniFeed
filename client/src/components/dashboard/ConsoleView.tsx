"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Inbox } from "lucide-react";
import { fadeIn } from "@/lib/animations";
import type { LogEntry, LogLevel } from "@/lib/types";

const LEVEL_COLORS: Record<LogLevel, string> = {
  info: "text-muted-foreground",
  discovery: "text-blue-500 dark:text-blue-400",
  editorial: "text-primary",
  publish: "text-emerald-500 dark:text-emerald-400",
  ledger: "text-purple-500 dark:text-purple-400",
  warn: "text-orange-500 dark:text-orange-400",
  error: "text-red-500 dark:text-red-400 font-bold",
};

interface ConsoleViewProps {
  logs: LogEntry[];
}

export default function ConsoleView({ logs }: ConsoleViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  if (logs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 font-heading text-xl font-semibold">Console Empty</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Scheduler logs, discovery passes, editorial decisions, and ledger reviews
          will appear here in real time.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Terminal className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Agent Console</span>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {logs.length} entries
        </span>
        <span className="cursor-blink inline-block h-4 w-1.5 rounded-sm bg-primary" />
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        className="max-h-[60vh] overflow-y-auto p-4 font-mono text-xs leading-relaxed lg:text-sm"
        role="log"
        aria-live="polite"
        aria-label="Agent console output"
      >
        {logs.map((log, idx) => (
          <div
            key={log.id}
            className={`flex gap-3 py-1 ${idx === 0 ? "opacity-100" : "opacity-80"}`}
          >
            <span className="shrink-0 text-muted-foreground/60">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span
              className={`shrink-0 w-20 text-right uppercase ${LEVEL_COLORS[log.level]}`}
            >
              [{log.level}]
            </span>
            <span className="text-foreground">{log.message}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
