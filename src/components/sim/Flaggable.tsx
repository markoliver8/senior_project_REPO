import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface FlagApi { flagMode: boolean; flagged: Set<string>; toggle: (id: string) => void }

export function Flaggable({ id, api, children, className }: { id: string; api: FlagApi; children: ReactNode; className?: string }) {
  const isFlagged = api.flagged.has(id);
  return (
    <span
      role={api.flagMode ? "button" : undefined}
      aria-pressed={api.flagMode ? isFlagged : undefined}
      onClick={(e) => { if (api.flagMode) { e.preventDefault(); e.stopPropagation(); api.toggle(id); } }}
      className={cn(api.flagMode && "flag-target", isFlagged && "flagged", className)}
    >
      {children}
    </span>
  );
}
