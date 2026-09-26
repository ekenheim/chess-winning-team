// Synthesised move sounds with the WebAudio API: nothing to license, nothing to load.
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, dur: number, type: OscillatorType, gain = 0.18, when = 0, decayTo = 0.0001) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.6), t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(decayTo, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(dur: number, gain = 0.12, when = 0) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
  const s = c.createBufferSource();
  s.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 1800;
  const g = c.createGain();
  g.gain.value = gain;
  s.connect(f).connect(g).connect(c.destination);
  s.start(t0);
}

export const sound = {
  move() {
    blip(520, 0.07, "sine", 0.12);
    noise(0.05, 0.06);
  },
  capture() {
    blip(180, 0.16, "triangle", 0.22);
    noise(0.09, 0.14);
  },
  check() {
    blip(880, 0.09, "square", 0.05);
    blip(1174, 0.14, "square", 0.05, 0.08);
  },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.5, "triangle", 0.12, i * 0.09, 0.001));
  },
  loss() {
    [392, 349, 311, 262].forEach((f, i) => blip(f, 0.5, "sine", 0.12, i * 0.14, 0.001));
  },
  draw() {
    blip(440, 0.4, "sine", 0.1);
    blip(440, 0.4, "sine", 0.1, 0.25);
  },
};
