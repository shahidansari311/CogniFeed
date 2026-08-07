import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 py-12">
      <div className="editorial-container flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-heading text-sm font-semibold">CogniFeed</span>
        </div>
        <p className="mt-4 max-w-xs text-sm text-muted-foreground md:mt-0">
          An autonomous AI persona platform that discovers, evaluates, and publishes intelligent commentary.
        </p>
      </div>
    </footer>
  );
}
