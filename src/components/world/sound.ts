export const SOUND_KEY = "wordplay:sound:v1";
export type Cue = "pickup" | "good" | "bad" | "tick" | "go" | "win" | "lose";

let context: AudioContext | null = null;

const notes: Record<Cue, { wave: OscillatorType; tones: number[]; step: number; length: number; volume: number }> = {
  pickup: { wave: "square", tones: [660, 880], step: 0.05, length: 0.06, volume: 0.05 },
  good: { wave: "triangle", tones: [523, 659, 784], step: 0.07, length: 0.12, volume: 0.09 },
  bad: { wave: "sawtooth", tones: [196, 147], step: 0.11, length: 0.16, volume: 0.05 },
  tick: { wave: "sine", tones: [440], step: 0, length: 0.08, volume: 0.07 },
  go: { wave: "triangle", tones: [880], step: 0, length: 0.22, volume: 0.09 },
  win: { wave: "triangle", tones: [523, 659, 784, 1047], step: 0.1, length: 0.22, volume: 0.09 },
  lose: { wave: "triangle", tones: [392, 330, 262], step: 0.14, length: 0.22, volume: 0.07 }
};

export function soundOn() {
  try { return localStorage.getItem(SOUND_KEY) !== "off"; } catch { return true; }
}

export function setSound(on: boolean) {
  try { localStorage.setItem(SOUND_KEY, on ? "on" : "off"); } catch {}
}

export function play(cue: Cue) {
  if (typeof window === "undefined" || !soundOn()) return;
  try {
    const Audio = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Audio) return;
    context ??= new Audio();
    if (context.state === "suspended") void context.resume();
    const { wave, tones, step, length, volume } = notes[cue];
    const start = context.currentTime + 0.01;
    tones.forEach((frequency, index) => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      const at = start + index * step;
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(volume, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
      oscillator.connect(gain).connect(context!.destination);
      oscillator.start(at);
      oscillator.stop(at + length + 0.02);
    });
  } catch {}
}
