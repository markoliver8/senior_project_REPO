export type Category = "phishing" | "smishing" | "vishing" | "deepfake" | "bec";
export type Action = "report" | "ignore" | "comply";
export type Tier = 1 | 2 | 3;

export const CATEGORIES: { id: Category; label: string; short: string }[] = [
  { id: "phishing", label: "Email Phishing", short: "Phishing" },
  { id: "smishing", label: "SMS Smishing", short: "Smishing" },
  { id: "vishing", label: "Voice Vishing", short: "Vishing" },
  { id: "deepfake", label: "Deepfake & Voice Clone", short: "Deepfake" },
  { id: "bec", label: "Business Email Compromise", short: "BEC" },
];

export interface Ioc { id: string; label: string; explain: string }
export interface Seg { text: string; ioc?: string; link?: string }

export interface LinkInfo {
  id: string;
  displayUrl: string;
  realUrl: string;
  ip: string;
  created: string;
  registrar: string;
  redirects: string[];
  ioc?: string;
}

export type AuthResult = "pass" | "fail" | "softfail" | "none";

export interface EmailHeaders {
  returnPath: string;
  replyTo?: string;
  receivedFrom: string;
  originIp: string;
  messageId: string;
  spf: AuthResult;
  dkim: AuthResult;
  dmarc: AuthResult;
  /** maps header field -> ioc id when it is an indicator */
  iocs: Partial<Record<"spf" | "dkim" | "dmarc" | "returnPath" | "replyTo" | "receivedFrom", string>>;
}

export interface EmailContent {
  kind: "email";
  from: { name: string; address: string; ioc?: string };
  to: string;
  subject: Seg;
  time: string;
  greeting: Seg;
  body: Seg[][];
  attachments: { name: string; size: string; ioc?: string }[];
  links: LinkInfo[];
  headers: EmailHeaders;
}

export interface SmsContent {
  kind: "sms";
  sender: string;
  senderIoc?: string;
  time: string;
  messages: Seg[][];
  links: LinkInfo[];
}

export interface DialogOption { label: string; next?: string; action?: Action }
export interface CallNode { say: string; ioc?: string; options: DialogOption[] }
export interface CallContent {
  kind: "call";
  caller: string;
  number: string;
  numberIoc?: string;
  voice: { pitch: number; rate: number };
  start: string;
  nodes: Record<string, CallNode>;
}

export interface VoiceCloneContent {
  kind: "voiceclone";
  org: string;
  people: { name: string; role: string }[];
  situation: string;
  caller: string;
  channel: string;
  voice: { pitch: number; rate: number };
  lines: Seg[];
  options: DialogOption[];
}

export type ArtifactType = "lipsync" | "lighting" | "stiffness" | "edges" | "blinking";
export const ARTIFACT_TYPES: { id: ArtifactType; label: string }[] = [
  { id: "lipsync", label: "Audio / lip-sync drift" },
  { id: "lighting", label: "Lighting glitch" },
  { id: "stiffness", label: "Facial stiffness" },
  { id: "edges", label: "Blurred face edges" },
  { id: "blinking", label: "Unnatural blinking" },
];

export interface DeepfakeContent {
  kind: "deepfake";
  meeting: string;
  context: string;
  speaker: string;
  attendees: string[];
  duration: number;
  voice: { pitch: number; rate: number };
  script: { t: number; text: string }[];
  artifacts: { type: ArtifactType; from: number; to: number }[];
  options: DialogOption[];
}

export type ScenarioContent = EmailContent | SmsContent | CallContent | VoiceCloneContent | DeepfakeContent;

export interface Scenario {
  id: string;
  category: Category;
  tier: Tier;
  title: string;
  brief: string;
  correctAction: Action;
  acceptable?: Action[];
  content: ScenarioContent;
  iocs: Ioc[];
  hints: string[];
  takeaways: string[];
}

export interface CategoryState {
  tier: Tier;
  consecPass: number;
  consecFail: number;
  attempts: number;
  passes: number;
  competency: number;
  hints: boolean;
}

export interface ScenarioResult {
  scenarioId: string;
  title: string;
  category: Category;
  tier: Tier;
  action: Action;
  passed: boolean;
  score: number;
  elapsedMs: number;
  hits: string[];
  missed: string[];
  falseFlags: number;
  tierChange: -1 | 0 | 1;
  competencyAfter: number;
  at: number;
}
