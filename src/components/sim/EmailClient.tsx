import { useState } from "react";
import { FileCode, Inbox, Paperclip, Search, Star, Archive, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Action, EmailContent, LinkInfo } from "@/lib/sim/types";
import { Flaggable, type FlagApi } from "./Flaggable";
import { HeaderDrawer } from "./HeaderDrawer";
import { LinkInspectorSheet, SimLink } from "./LinkInspector";
import { ActionBar } from "./ActionBar";

const DECOYS = [
  { from: "Calendar", subject: "Weekly sync moved to 3pm", time: "8:02 AM" },
  { from: "Jira", subject: "[FIN-212] Status changed to In Review", time: "Yesterday" },
  { from: "Helen Ward", subject: "Q3 board pack — final", time: "Mon" },
];

export function EmailClient({ email, api, onAction }: { email: EmailContent; api: FlagApi; onAction: (a: Action) => void }) {
  const [headersOpen, setHeadersOpen] = useState(false);
  const [inspect, setInspect] = useState<LinkInfo | null>(null);
  const linkById = (id: string) => email.links.find((l) => l.id === id)!;

  return (
    <div className="overflow-hidden rounded-xl border bg-paper text-paper-foreground shadow-2xl">
      <div className="flex items-center gap-3 border-b border-paper-muted/20 px-4 py-2">
        <div className="flex gap-1.5"><span className="size-3 rounded-full bg-destructive" /><span className="size-3 rounded-full bg-warning" /><span className="size-3 rounded-full bg-success" /></div>
        <div className="mx-auto flex w-1/2 items-center gap-2 rounded-md bg-paper-muted/10 px-3 py-1 text-xs text-paper-muted"><Search className="size-3" /> Search mail</div>
      </div>
      <div className="grid md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-paper-muted/20 md:block">
          <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold"><Inbox className="size-4" /> Inbox</div>
          <div className="border-l-4 border-primary bg-paper-muted/10 px-4 py-3">
            <div className="truncate text-sm font-semibold">{email.from.name}</div>
            <div className="truncate text-xs">{email.subject.text}</div>
            <div className="text-[10px] text-paper-muted">{email.time}</div>
          </div>
          {DECOYS.map((d) => (
            <div key={d.subject} className="px-4 py-3 opacity-60">
              <div className="truncate text-sm">{d.from}</div>
              <div className="truncate text-xs">{d.subject}</div>
              <div className="text-[10px] text-paper-muted">{d.time}</div>
            </div>
          ))}
        </aside>
        <article className="min-w-0 p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold"><Flaggable id={email.subject.ioc ?? "subject"} api={api}>{email.subject.text}</Flaggable></h2>
            <div className="flex gap-1 text-paper-muted"><Star className="size-4" /><Archive className="size-4" /></div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex size-9 items-center justify-center rounded-full bg-paper-muted/20 font-semibold">{email.from.name[0]}</div>
            <div className="min-w-0 flex-1">
              <div><span className="font-semibold">{email.from.name}</span>{" "}
                <Flaggable id={email.from.ioc ?? "from"} api={api} className="font-mono text-xs text-paper-muted">&lt;{email.from.address}&gt;</Flaggable>
              </div>
              <div className="text-xs text-paper-muted">to {email.to} · {email.time}</div>
            </div>
            <Button size="sm" variant="paper" onClick={() => setHeadersOpen(true)}><FileCode /> View headers</Button>
          </div>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed">
            <p><Flaggable id={email.greeting.ioc ?? "greeting-x"} api={api}>{email.greeting.text}</Flaggable></p>
            {email.body.map((para, i) => (
              <p key={i}>
                {para.map((seg, j) =>
                  seg.link ? (
                    <SimLink key={j} link={linkById(seg.link)} text={seg.text} api={api} onOpen={setInspect}
                      className="inline-block rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground no-underline" />
                  ) : (
                    <Flaggable key={j} id={seg.ioc ?? `p${i}-${j}`} api={api}>{seg.text}</Flaggable>
                  ),
                )}
              </p>
            ))}
          </div>
          {email.attachments.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {email.attachments.map((a) => (
                <button key={a.name} type="button"
                  onClick={() => api.flagMode ? api.toggle(a.ioc ?? `att:${a.name}`) : toast.warning("Simulated download blocked", { description: `${a.name} was not downloaded or opened.` })}
                  className={`flex items-center gap-2 rounded-lg border border-paper-muted/30 px-3 py-2 text-left text-sm ${api.flagMode ? "flag-target" : ""} ${api.flagged.has(a.ioc ?? `att:${a.name}`) ? "flagged" : ""}`}>
                  {a.name.endsWith(".pdf") ? <FileText className="size-5" /> : <Paperclip className="size-5" />}
                  <span><span className="block font-medium">{a.name}</span><span className="text-xs text-paper-muted">{a.size}</span></span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-8 border-t border-paper-muted/20 pt-4"><ActionBar onAction={onAction} /></div>
        </article>
      </div>
      <HeaderDrawer open={headersOpen} onOpenChange={setHeadersOpen} email={email} api={api} />
      <LinkInspectorSheet link={inspect} onClose={() => setInspect(null)} api={api} />
    </div>
  );
}
