"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import type { Post } from "@/lib/types";

/* ────────────────────────────────────────────
   Follow-up type config
   ──────────────────────────────────────────── */

const FOLLOW_UP_CONFIG = {
  confirmation: {
    icon: CheckCircle2,
    label: "Confirmation",
    color: "text-chai-success",
    bg: "bg-chai-success/10",
    border: "border-chai-success/20",
  },
  refinement: {
    icon: RefreshCw,
    label: "Refinement",
    color: "text-chai-warning",
    bg: "bg-chai-warning/10",
    border: "border-chai-warning/20",
  },
  retraction: {
    icon: AlertTriangle,
    label: "Retraction",
    color: "text-chai-error",
    bg: "bg-chai-error/10",
    border: "border-chai-error/20",
  },
} as const;

/* ────────────────────────────────────────────
   Score Bar
   ──────────────────────────────────────────── */

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-primary"
        />
      </div>
      <span className="w-8 text-right font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}

/* ────────────────────────────────────────────
   Normalize editorial scores (handles legacy nested shape)
   ──────────────────────────────────────────── */

function normalizeScores(meta: any) {
  // New shape: flat properties (noveltyScore, substanceScore, etc.)
  // Legacy shape: nested under meta.scores (scores.novelty, scores.substance, etc.)
  const s = meta?.scores;
  return {
    novelty: meta?.noveltyScore ?? s?.novelty ?? 0,
    substance: meta?.substanceScore ?? s?.substance ?? 0,
    credibility: meta?.credibilityScore ?? s?.credibility ?? 0,
    relevance: meta?.relevanceScore ?? s?.relevance ?? 0,
    timeliness: meta?.timelinessScore ?? s?.timeliness ?? 0,
    overall: meta?.overallScore ?? s?.overall ?? null,
  };
}

/* ────────────────────────────────────────────
   Post Card
   ──────────────────────────────────────────── */

function PostCard({ post, allPosts }: { post: Post; allPosts: Post[] }) {
  const [expanded, setExpanded] = useState(false);

  const followUp = post.followUpType ? FOLLOW_UP_CONFIG[post.followUpType] : null;
  const FollowUpIcon = followUp?.icon;
  const parentPost = post.inReplyToPostId
    ? allPosts.find((p) => p.id === post.inReplyToPostId)
    : null;

  const relativeTime = getRelativeTime(post.createdAt);
  const scores = normalizeScores(post.editorialMeta);
  const overallDisplay = (scores.overall ?? Math.round(
    (scores.novelty + scores.substance + scores.credibility + scores.relevance + scores.timeliness) / 5
  )) || "N/A";

  return (
    <motion.div variants={fadeInUp}>
      <Card
        className={`transition-all duration-300 ${followUp ? followUp.border : "border-border"}`}
      >
        <CardContent className="p-6">
          {/* Thread indicator */}
          {followUp && FollowUpIcon && (
            <div className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 ${followUp.bg}`}>
              <FollowUpIcon className={`h-4 w-4 ${followUp.color}`} />
              <span className={`text-sm font-medium ${followUp.color}`}>
                {followUp.label}
              </span>
              {parentPost && (
                <span className="text-xs text-muted-foreground">
                  — in reply to post {post.inReplyToPostId}
                </span>
              )}
            </div>
          )}

          {/* Meta row */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger>
                <time
                  dateTime={post.createdAt}
                  className="text-xs text-muted-foreground"
                >
                  {relativeTime}
                </time>
              </TooltipTrigger>
              <TooltipContent>{new Date(post.createdAt).toLocaleString()}</TooltipContent>
            </Tooltip>
            <span className="text-xs text-muted-foreground">·</span>
            <Badge variant="outline" className="text-xs">
              Score: {overallDisplay}
            </Badge>
            {post.topicTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Post text */}
          <div className="mb-4 whitespace-pre-line text-sm leading-relaxed text-foreground lg:text-base">
            {post.text}
          </div>

          {/* Sources */}
          {post.sources.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.sources.map((src) => (
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-primary transition-colors hover:bg-primary/5"
                  aria-label={`Source: ${new URL(src).hostname}`}
                >
                  <ExternalLink className="h-3 w-3" />
                  {new URL(src).hostname}
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}

          {/* Expand/collapse rationale */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="Toggle editorial rationale"
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Editorial Rationale
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4 overflow-hidden rounded-xl border border-border bg-muted/50 p-4"
            >
              <p className="text-sm text-muted-foreground">{post.rationale}</p>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Scores
                </h4>
                <ScoreBar label="Novelty" value={scores.novelty} />
                <ScoreBar label="Substance" value={scores.substance} />
                <ScoreBar label="Credibility" value={scores.credibility} />
                <ScoreBar label="Relevance" value={scores.relevance} />
                <ScoreBar label="Timeliness" value={scores.timeliness} />
              </div>

              {post.editorialMeta?.rejectedAlternatives && post.editorialMeta.rejectedAlternatives.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rejected Alternatives ({post.editorialMeta.rejectedAlternatives.length})
                  </h4>
                  <div className="space-y-2">
                    {post.editorialMeta.rejectedAlternatives.map((alt: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border bg-card p-3"
                      >
                        <p className="text-sm font-medium">{alt?.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{alt?.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {post.editorialMeta?.candidatesConsidered || 1} candidates considered this cycle
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   FeedView
   ──────────────────────────────────────────── */

interface FeedViewProps {
  posts: Post[];
}

export default function FeedView({ posts }: FeedViewProps) {
  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 font-heading text-xl font-semibold">No Posts Yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          The agent hasn&apos;t published any posts yet. Trigger a scheduler tick
          or wait for the next autonomous cycle.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {posts.map((post) => (
        <PostCard key={post.id} post={post} allPosts={posts} />
      ))}
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
