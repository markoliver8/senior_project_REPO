import { Button } from "@/components/ui/button";
import { Ban, ShieldAlert, Send } from "lucide-react";
import type { Action } from "@/lib/sim/types";

export const DEFAULT_LABELS: Record<Action, string> = { report: "Report Phish", ignore: "Ignore / Delete", comply: "Comply / Submit Info" };

export function ActionBar({ onAction, labels = DEFAULT_LABELS, compact }: { onAction: (a: Action) => void; labels?: Record<Action, string>; compact?: boolean }) {
  return (
    <div className={compact ? "grid grid-cols-3 gap-2" : "flex flex-wrap gap-2"}>
      <Button variant="success" size={compact ? "sm" : "default"} onClick={() => onAction("report")}><ShieldAlert /> {labels.report}</Button>
      <Button variant="outline" size={compact ? "sm" : "default"} onClick={() => onAction("ignore")}><Ban /> {labels.ignore}</Button>
      <Button variant="destructive" size={compact ? "sm" : "default"} onClick={() => onAction("comply")}><Send /> {labels.comply}</Button>
    </div>
  );
}
