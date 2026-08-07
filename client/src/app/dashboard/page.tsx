"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rss,
  XCircle,
  BookOpen,
  Terminal,
  Sparkles,
  Clock,
  Activity,
  RotateCcw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import InitScreen from "@/components/dashboard/InitScreen";
import FeedView from "@/components/dashboard/FeedView";
import RejectionLogView from "@/components/dashboard/RejectionLogView";
import LedgerView from "@/components/dashboard/LedgerView";
import ConsoleView from "@/components/dashboard/ConsoleView";
import * as api from "@/lib/api";
import { fadeIn } from "@/lib/animations";
import type { Agent, Post, RejectedCandidate, Claim, LogEntry, Persona } from "@/lib/types";

/* ────────────────────────────────────────────
   Dashboard Header
   ──────────────────────────────────────────── */

function DashboardHeader({ agent, onReset, onTrigger, isTriggering }: { agent: Agent; onReset: () => void; onTrigger: () => void; isTriggering: boolean }) {
  const nextTick = new Date(agent.schedulerState.nextTickAt);
  const isRunning = agent.schedulerState.status === "running";

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-sm">
      <div className="editorial-container flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-semibold">
              {agent.persona.name}
            </h1>
            <p className="text-xs text-muted-foreground">{agent.persona.role}</p>
          </div>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className={`h-3.5 w-3.5 ${isRunning ? "text-chai-success" : "text-muted-foreground"}`} />
                <span>{isRunning ? "Running" : agent.schedulerState.status}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Scheduler status</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Tick #{agent.schedulerState.totalTicks}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Next tick: {nextTick.toLocaleTimeString()}
            </TooltipContent>
          </Tooltip>
          <Badge variant="outline" className="text-xs">
            {agent.persona.domain}
          </Badge>
          <button
            onClick={onTrigger}
            disabled={isTriggering}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            aria-label="Manually trigger agent"
          >
            {isTriggering ? (
              <div className="h-3 w-3 animate-spin rounded-full border border-primary-foreground border-t-transparent" />
            ) : (
              <RotateCcw className="h-3 w-3" />
            )}
            Force Tick
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Switch to a different persona"
          >
            <XCircle className="h-3 w-3" />
            New Agent
          </button>
        </div>
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────── */

export default function HomePage() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [rejections, setRejections] = useState<RejectedCandidate[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const refreshData = useCallback(async () => {
    const [a, p, r, c, l] = await Promise.all([
      api.getAgent(),
      api.getFeed(),
      api.getRejections(),
      api.getLedger(),
      api.getConsoleLogs(),
    ]);
    setAgent(a);
    setPosts(p);
    setRejections(r);
    setClaims(c);
    setLogs(l);
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshData();
    
    // Poll for updates every 3 seconds so background activity is visible live
    const interval = setInterval(() => {
      refreshData();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [refreshData]);

  async function handleInit(persona: Persona) {
    await api.initAgent(persona);
    await refreshData();
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!agent) {
    return <InitScreen onInit={handleInit} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex min-h-screen flex-col"
      >
        <DashboardHeader 
          agent={agent} 
          onReset={() => { api.resetAll(); refreshData(); }} 
          onTrigger={async () => {
            setIsTriggering(true);
            try {
              await api.triggerAgent();
              await refreshData();
            } finally {
              setIsTriggering(false);
            }
          }}
          isTriggering={isTriggering}
        />

        <main className="editorial-container flex-1 py-8">
          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-4">
              <TabsTrigger value="feed" className="gap-1.5 text-xs sm:text-sm">
                <Rss className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Feed</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {posts.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejections" className="gap-1.5 text-xs sm:text-sm">
                <XCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Rejected</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {rejections.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ledger" className="gap-1.5 text-xs sm:text-sm">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ledger</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {claims.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="console" className="gap-1.5 text-xs sm:text-sm">
                <Terminal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Console</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed">
              <FeedView posts={posts} />
            </TabsContent>
            <TabsContent value="rejections">
              <RejectionLogView rejections={rejections} />
            </TabsContent>
            <TabsContent value="ledger">
              <LedgerView claims={claims} />
            </TabsContent>
            <TabsContent value="console">
              <ConsoleView logs={logs} />
            </TabsContent>
          </Tabs>
        </main>
      </motion.div>
    </AnimatePresence>
  );
}
