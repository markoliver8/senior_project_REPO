import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ArrowDown, Flag, Globe, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { LinkInfo } from "@/lib/sim/types";
import type { FlagApi } from "./Flaggable";
import { cn } from "@/lib/utils";

function hostOf(u: string) { return u.replace(/^https?:\/\//, "").split("/")[0]; }

export function LinkFacts({ link }: { link: LinkInfo }) {
  const mismatch = hostOf(link.displayUrl) !== hostOf(link.realUrl);
  return (
    <div className="space-y-3 font-mono text-xs">
      <Row k="Displayed" v={link.displayUrl} />
      <Row k="Actual target" v={link.realUrl} warn={mismatch} />
      <Row k="Target IP" v={link.ip} />
      <Row k="Domain created" v={link.created} warn={/day/.test(link.created)} />
      <Row k="Registrar" v={link.registrar} />
      <div>
        <div className="mb-1 text-muted-foreground">Redirect preview</div>
        <div className="space-y-1">
          {link.redirects.map((r, i) => (
            <div key={i}>
              {i > 0 && <ArrowDown className="mx-auto my-0.5 size-3 text-muted-foreground" />}
              <div className="rounded border bg-muted px-2 py-1 break-all">{r}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Row({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("text-right break-all", warn && "text-destructive font-semibold")}>{v}</span>
    </div>
  );
}

/** Simulated hyperlink: hover shows quick triage, click is intercepted locally (no network). */
export function SimLink({ link, text, api, onOpen, className }: { link: LinkInfo; text: string; api: FlagApi; onOpen: (l: LinkInfo) => void; className?: string }) {
  const flagKey = link.ioc ?? `link:${link.id}`;
  return (
    <HoverCard openDelay={250}>
      <HoverCardTrigger asChild>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (api.flagMode) { api.toggle(flagKey); return; }
            toast.warning("Simulated click intercepted", { description: `No request was sent to ${hostOf(link.realUrl)}.` });
            onOpen(link);
          }}
          className={cn("underline underline-offset-2", api.flagMode && "flag-target", api.flagged.has(flagKey) && "flagged", className)}
        >
          {text}
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Globe className="size-4 text-primary" /> Link preview (offline)</div>
        <LinkFacts link={link} />
      </HoverCardContent>
    </HoverCard>
  );
}

export function LinkInspectorSheet({ link, onClose, api }: { link: LinkInfo | null; onClose: () => void; api: FlagApi }) {
  const flagKey = link ? link.ioc ?? `link:${link.id}` : "";
  return (
    <Sheet open={!!link} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><ShieldAlert className="size-5 text-accent" /> Domain triage</SheetTitle>
          <SheetDescription>Sandboxed inspection — the target URL was not opened.</SheetDescription>
        </SheetHeader>
        {link && (
          <div className="space-y-6 px-4">
            <LinkFacts link={link} />
            <Button variant={api.flagged.has(flagKey) ? "default" : "outline"} className="w-full" onClick={() => api.toggle(flagKey)}>
              <Flag /> {api.flagged.has(flagKey) ? "Flagged as indicator" : "Flag link as indicator"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
