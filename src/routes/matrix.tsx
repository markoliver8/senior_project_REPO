import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/matrix")({
  head: () => ({
    meta: [
      { title: "Requirements traceability — Sentinel Range" },
      { name: "description", content: "How each requirement R1–R31 maps to the six prototype features." },
      { property: "og:title", content: "Requirements traceability — Sentinel Range" },
      { property: "og:description", content: "R1–R31 mapped to features F1–F6 and where they live in the app." },
    ],
  }),
  component: Matrix,
});

const F = ["F1 Email & SMS", "F2 Vishing", "F3 Deepfake", "F4 Inspection", "F5 Adaptive", "F6 Analytics"];
type M = "P" | "S" | "";
const ROWS: [string, string, M[], string][] = [
  ["R1", "Realistic mock email client", ["P", "", "", "", "", ""], "Phishing/BEC scenarios: inbox + reading pane"],
  ["R2", "Raw header drawer", ["P", "", "", "S", "", ""], "“View headers” button → Raw tab"],
  ["R3", "Simulated link/attachment clicks", ["P", "", "", "", "", ""], "Clicks intercepted; toast confirms no request"],
  ["R4", "SMS in phone UI with notification", ["P", "", "", "", "", ""], "Lock-screen notification in phone frame"],
  ["R5", "URL previews in SMS", ["P", "", "", "S", "", ""], "Preview card under link bubbles"],
  ["R6", "Report / Reply / Delete on SMS", ["P", "", "", "", "", ""], "SMS action bar"],
  ["R7", "Report / Ignore / Comply on every scenario", ["P", "S", "S", "", "", ""], "Action bar or decision options"],
  ["R8", "Immediate submit, stop timer, debrief", ["P", "S", "S", "", "", "S"], "Top-bar timer freezes on action"],
  ["R9", "Incoming call with answer/decline", ["", "P", "", "", "", ""], "Vishing ringing screen"],
  ["R10", "Synthetic voice audio", ["", "P", "", "", "", ""], "On-device speech synthesis"],
  ["R11", "Call timer & audio controls", ["", "P", "", "", "", ""], "Timer, play/pause, replay, volume"],
  ["R12", "Multiple-choice dialog during call", ["", "P", "", "", "", ""], "Branching response buttons"],
  ["R13", "Cloned voices of executives", ["", "", "P", "", "", ""], "Deepfake tiers 1–2"],
  ["R14", "Org context + cloned voice clip", ["", "", "P", "", "", ""], "Context panel + voice player"],
  ["R15", "Out-of-band verification vs compliance", ["", "S", "P", "", "S", ""], "Verify option scores as pass"],
  ["R16", "Deepfake video conference", ["", "", "P", "", "", ""], "Deepfake tier 3 meeting"],
  ["R17", "Mark artifacts via video overlay", ["", "", "P", "", "", ""], "Artifact marker + click on video"],
  ["R18", "Inspect SPF/DKIM/DMARC/Return-Path", ["S", "", "", "P", "", ""], "Header drawer → Parsed"],
  ["R19", "Readable tables, highlight failures", ["", "", "", "P", "", ""], "Red rows on failed checks"],
  ["R20", "Domain inspection without opening URL", ["S", "", "", "P", "", ""], "Domain triage panel"],
  ["R21", "IP, creation date, redirect preview", ["", "", "", "P", "", ""], "Hover card + triage panel"],
  ["R22", "Pass/fail per category", ["", "", "", "", "P", ""], "Per-category tracking"],
  ["R23", "Competency 0–100 per category", ["", "", "", "", "P", ""], "Updated after every scenario"],
  ["R24", "Harder when excelling, guided when struggling", ["", "", "", "", "P", ""], "Tier-matched scenario selection"],
  ["R25", "2 fails → −1 tier + hints", ["", "", "", "", "P", ""], "Guided mode banner"],
  ["R26", "3 passes → +1 tier", ["", "", "", "", "P", ""], "Promotion banner in debrief"],
  ["R27", "Radar / breakdown charts", ["", "", "", "", "S", "P"], "Dashboard charts"],
  ["R28", "Identify weak vectors", ["", "", "", "", "", "P"], "Weakest vector alert"],
  ["R29", "Debrief with scenario score", ["", "", "", "", "", "P"], "Debrief score"],
  ["R30", "IoCs caught vs missed", ["", "", "", "", "", "P"], "Debrief IoC columns"],
  ["R31", "Actionable key takeaways", ["", "", "", "", "", "P"], "Debrief takeaways"],
];

function Matrix() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Requirements traceability</h1>
        <p className="text-muted-foreground">Every requirement and the feature that delivers it. P = primary, S = supporting.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs">
            <tr><th className="p-3">ID</th><th className="p-3">Requirement</th>{F.map((f) => <th key={f} className="p-3 text-center">{f}</th>)}<th className="p-3">Where in the app</th></tr>
          </thead>
          <tbody>
            {ROWS.map(([id, req, m, where]) => (
              <tr key={id} className="border-t">
                <td className="p-3 font-mono text-primary">{id}</td>
                <td className="p-3">{req}</td>
                {m.map((v, i) => <td key={i} className="p-3 text-center"><span className={cn("inline-block w-6 rounded font-mono text-xs", v === "P" && "bg-primary text-primary-foreground", v === "S" && "bg-secondary")}>{v || "·"}</span></td>)}
                <td className="p-3 text-muted-foreground">{where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
