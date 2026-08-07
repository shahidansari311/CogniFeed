"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  CircleDot,
  BookOpen,
  Inbox,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import type { Claim, ClaimStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  ClaimStatus,
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  open: {
    icon: CircleDot,
    label: "Open",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  confirmed: {
    icon: CheckCircle2,
    label: "Confirmed",
    color: "text-chai-success",
    bg: "bg-chai-success/10",
  },
  refined: {
    icon: RefreshCw,
    label: "Refined",
    color: "text-chai-warning",
    bg: "bg-chai-warning/10",
  },
  retracted: {
    icon: AlertTriangle,
    label: "Retracted",
    color: "text-chai-error",
    bg: "bg-chai-error/10",
  },
};

interface LedgerViewProps {
  claims: Claim[];
}

export default function LedgerView({ claims }: LedgerViewProps) {
  if (claims.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 font-heading text-xl font-semibold">No Claims Yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          The claims ledger tracks falsifiable claims extracted from published posts.
          Claims are revisited and can be confirmed, refined, or retracted.
        </p>
      </motion.div>
    );
  }

  const grouped = {
    open: claims.filter((c) => c.status === "open"),
    confirmed: claims.filter((c) => c.status === "confirmed"),
    refined: claims.filter((c) => c.status === "refined"),
    retracted: claims.filter((c) => c.status === "retracted"),
  };

  return (
    <div className="space-y-8">
      {/* Summary badges */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-3"
      >
        {(Object.keys(grouped) as ClaimStatus[]).map((status) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          return (
            <div
              key={status}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${config.bg}`}
            >
              <Icon className={`h-4 w-4 ${config.color}`} />
              <span className={`text-sm font-medium ${config.color}`}>
                {grouped[status].length} {config.label}
              </span>
            </div>
          );
        })}
      </motion.div>

      {/* Claims list */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {claims.map((claim) => {
          const config = STATUS_CONFIG[claim.status];
          const Icon = config.icon;

          return (
            <motion.div key={claim.id} variants={fadeInUp}>
              <Card className="transition-all duration-200 hover:shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${config.color}`}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          from post {claim.postId}
                        </span>
                      </div>
                      <p className="mb-3 text-sm leading-relaxed">{claim.text}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {claim.topicTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {claim.entities.map((entity) => (
                          <span
                            key={entity}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                          >
                            <BookOpen className="h-3 w-3" />
                            {entity}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger>
                            <span>
                              Opened {new Date(claim.openedAt).toLocaleDateString()}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {new Date(claim.openedAt).toLocaleString()}
                          </TooltipContent>
                        </Tooltip>
                        {claim.resolvedAt && (
                          <>
                            <span>·</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <span>
                                  Resolved{" "}
                                  {new Date(claim.resolvedAt).toLocaleDateString()}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {new Date(claim.resolvedAt).toLocaleString()}
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}
                        {claim.resolutionPostId && (
                          <>
                            <span>·</span>
                            <span>Resolution: {claim.resolutionPostId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
