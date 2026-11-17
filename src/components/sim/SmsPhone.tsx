import { useEffect, useState } from "react";
import { ChevronLeft, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Action, LinkInfo, SmsContent } from "@/lib/sim/types";
import { Flaggable, type FlagApi } from "./Flaggable";
import { LinkInspectorSheet, SimLink } from "./LinkInspector";
import { ActionBar } from "./ActionBar";

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[340px] rounded-[44px] border-[10px] border-device bg-device p-0 shadow-2xl">
      <div className="relative h-[640px] overflow-hidden rounded-[34px] bg-background">
        <div className="absolute top-2 left-1/2 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-device" />
        {children}
      </div>
    </div>
  );
}

export function SmsPhone({ sms, api, onAction }: { sms: SmsContent; api: FlagApi; onAction: (a: Action) => void }) {
  const [opened, setOpened] = useState(false);
  const [notif, setNotif] = useState(false);
  const [inspect, setInspect] = useState<LinkInfo | null>(null);
  useEffect(() => { const t = setTimeout(() => setNotif(true), 600); return () => clearTimeout(t); }, []);
  const linkById = (id: string) => sms.links.find((l) => l.id === id)!;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[auto_1fr]">
      <PhoneFrame>
        {!opened ? (
          <div className="flex h-full flex-col items-center bg-gradient-to-b from-secondary to-background pt-24">
            <div className="font-mono text-6xl font-light">{sms.time.split(" ")[0]}</div>
            <div className="text-sm text-muted-foreground">Tuesday, November 10</div>
            {notif && (
              <button type="button" onClick={() => setOpened(true)}
                className="mt-10 w-[88%] animate-in slide-in-from-top-4 fade-in rounded-2xl bg-card/90 p-3 text-left shadow-lg backdrop-blur">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><MessageSquare className="size-4 text-success" /> MESSAGES · now</div>
                <div className="mt-1 text-sm font-semibold">{sms.sender}</div>
                <div className="line-clamp-2 text-sm">{(sms.messages[0] ?? []).map((s) => s.text).join("")}</div>
              </button>
            )}
            {notif && <p className="mt-4 text-xs text-muted-foreground">Tap the notification to open</p>}
          </div>
        ) : (
          <div className="flex h-full flex-col pt-10">
            <div className="flex items-center gap-2 border-b px-3 pb-2">
              <ChevronLeft className="size-5 text-primary" />
              <div className="flex-1 text-center">
                <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-secondary text-sm">#</div>
                <Flaggable id={sms.senderIoc ?? "sender-x"} api={api} className="text-xs font-semibold">{sms.sender}</Flaggable>
              </div>
              <Search className="size-4 opacity-0" />
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              <div className="text-center text-[10px] text-muted-foreground">Today {sms.time}</div>
              {sms.messages.map((m, i) => {
                const link = m.find((s) => s.link);
                return (
                  <div key={i} className="max-w-[85%] space-y-1">
                    <div className="rounded-2xl rounded-bl-sm bg-secondary px-3 py-2 text-sm leading-snug">
                      {m.map((seg, j) => seg.link
                        ? <SimLink key={j} link={linkById(seg.link)} text={seg.text} api={api} onOpen={setInspect} className="text-primary" />
                        : <Flaggable key={j} id={seg.ioc ?? `m${i}-${j}`} api={api}>{seg.text}</Flaggable>)}
                    </div>
                    {link?.link && (
                      <button type="button" onClick={() => setInspect(linkById(link.link!))} className="w-full overflow-hidden rounded-xl border bg-card text-left">
                        <div className="h-16 bg-gradient-to-br from-muted to-secondary" />
                        <div className="p-2"><div className="text-xs font-semibold">{linkById(link.link).displayUrl.split("/")[0]}</div><div className="text-[10px] text-muted-foreground">Preview · tap to inspect link</div></div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t p-3"><ActionBar compact onAction={onAction} labels={{ report: "Report", ignore: "Delete", comply: "Reply" }} /></div>
          </div>
        )}
      </PhoneFrame>
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Open the notification, review the message and URL preview. Hover or tap links to inspect them safely.</p>
        {!opened && notif && <Button onClick={() => setOpened(true)}>Open message</Button>}
      </div>
      <LinkInspectorSheet link={inspect} onClose={() => setInspect(null)} api={api} />
    </div>
  );
}
