// Local browser speech synthesis — no network requests are made.
const ok = () => typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text: string, opts: { pitch?: number; rate?: number; volume?: number } = {}, onEnd?: () => void) {
  if (!ok()) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = opts.pitch ?? 1;
  u.rate = opts.rate ?? 1;
  u.volume = opts.volume ?? 1;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}
export const stopSpeech = () => { if (ok()) window.speechSynthesis.cancel(); };
export const pauseSpeech = () => { if (ok()) window.speechSynthesis.pause(); };
export const resumeSpeech = () => { if (ok()) window.speechSynthesis.resume(); };
