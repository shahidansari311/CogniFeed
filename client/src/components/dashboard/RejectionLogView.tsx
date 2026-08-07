"use client";

import { motion } from "framer-motion";
import { XCircle, ExternalLink, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import type { RejectedCandidate } from "@/lib/types";

interface RejectionLogViewProps {
  rejections: RejectedCandidate[];
}

export default function RejectionLogView({ rejections }: RejectionLogViewProps) {
  if (rejections.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 font-heading text-xl font-semibold">No Rejections Yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          The editorial filter hasn&apos;t rejected any candidates yet. Rejections
          demonstrate editorial judgment — not everything is worth publishing.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {rejections.map((r) => (
        <motion.div key={r.id} variants={fadeInUp}>
          <Card className="border-border transition-all duration-200 hover:border-chai-error/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chai-error/10">
                  <XCircle className="h-4 w-4 text-chai-error" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-medium leading-tight">{r.title}</h4>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">{r.reason}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="font-mono text-xs text-chai-error"
                    >
                      Score: {r.score}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {r.sourceType}
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger>
                        <time
                          dateTime={r.consideredAt}
                          className="text-xs text-muted-foreground"
                        >
                          {new Date(r.consideredAt).toLocaleTimeString()}
                        </time>
                      </TooltipTrigger>
                      <TooltipContent>
                        {new Date(r.consideredAt).toLocaleString()}
                      </TooltipContent>
                    </Tooltip>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      aria-label={`Open source: ${r.url}`}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Source
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
