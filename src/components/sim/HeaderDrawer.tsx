import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";
import type { AuthResult, EmailContent } from "@/lib/sim/types";
import type { FlagApi } from "./Flaggable";
import { cn } from "@/lib/utils";

type Field = keyof EmailContent["headers"]["iocs"];

export function HeaderDrawer({ open, onOpenChange, email, api }: { open: boolean; onOpenChange: (o: boolean) => void; email: EmailContent; api: FlagApi }) {
  const h = email.headers;
  const fromDomain = email.from.address.split("@")[1];
  const rows: { field: Field; label: string; value: string; status?: AuthResult; bad: boolean }[] = [
    { field: "spf", label: "SPF", value: `${h.spf} (sender IP ${h.originIp})`, status: h.spf, bad: h.spf !== "pass" },
    { field: "dkim", label: "DKIM", value: `${h.dkim} (d=${fromDomain})`, status: h.dkim, bad: h.dkim !== "pass" },
    { field: "dmarc", label: "DMARC", value: `${h.dmarc} (p=reject)`, status: h.dmarc, bad: h.dmarc !== "pass" },
    { field: "returnPath", label: "Return-Path", value: h.returnPath, bad: h.returnPath.split("@")[1] !== fromDomain },
    ...(h.replyTo ? [{ field: "replyTo" as Field, label: "Reply-To", value: h.replyTo, bad: h.replyTo.split("@")[1] !== fromDomain }] : []),
    { field: "receivedFrom", label: "Received", value: `${h.receivedFrom} [${h.originIp}]`, bad: !h.receivedFrom.endsWith(fromDomain) },
  ];
  const raw = [
    `Return-Path: <${h.returnPath}>`,
    `Received: from ${h.receivedFrom} (${h.receivedFrom} [${h.originIp}])`,
    `        by mx1.acmecorp.com with ESMTPS; ${email.time}`,
    `Authentication-Results: mx1.acmecorp.com;`,
    `       spf=${h.spf} smtp.mailfrom=${h.returnPath.split("@")[1]};`,
    `       dkim=${h.dkim} header.d=${fromDomain};`,
    `       dmarc=${h.dmarc} header.from=${fromDomain}`,
    `From: "${email.from.name}" <${email.from.address}>`,
    ...(h.replyTo ? [`Reply-To: <${h.replyTo}>`] : []),
    `To: <${email.to}>`,
    `Subject: ${email.subject.text}`,
    `Message-ID: ${h.messageId}`,
    `MIME-Version: 1.0`,
  ].join("\n");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Message headers</SheetTitle>
          <SheetDescription>Technical triage of authentication and routing.</SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="parsed" className="px-4">
          <TabsList><TabsTrigger value="parsed">Parsed</TabsTrigger><TabsTrigger value="raw">Raw</TabsTrigger></TabsList>
          <TabsContent value="parsed" className="space-y-2">
            {rows.map((r) => {
              const key = h.iocs[r.field] ?? `hdr:${r.field}`;
              return (
                <div key={r.field} className={cn("flex items-center gap-3 rounded-md border p-3", r.bad && "border-destructive/60 bg-destructive/10")}>
                  <div className="w-24 font-mono text-xs text-muted-foreground">{r.label}</div>
                  <div className="flex-1 font-mono text-xs break-all">
                    {r.status && <Badge variant={r.bad ? "destructive" : "secondary"} className="mr-2 uppercase">{r.status}</Badge>}
                    {r.value}
                  </div>
                  <Button size="icon" variant={api.flagged.has(key) ? "default" : "ghost"} aria-label={`Flag ${r.label}`} onClick={() => api.toggle(key)}>
                    <Flag />
                  </Button>
                </div>
              );
            })}
            <p className="pt-2 text-xs text-muted-foreground">Red rows failed validation or don't align with the From domain. Flag the ones you consider indicators.</p>
          </TabsContent>
          <TabsContent value="raw">
            <pre className="overflow-x-auto rounded-md border bg-muted p-3 font-mono text-[11px] leading-relaxed">{raw}</pre>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
