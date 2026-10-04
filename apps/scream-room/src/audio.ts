/** Tiny Web Audio synth so the game has sound without shipping audio files. */
let ctx: AudioContext | null = null
let muted = false

export const setMuted = (m: boolean) => {
  muted = m
}

function ac() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function noise(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  return src
}

export function pop() {
  if (muted) return
  const c = ac()
  const src = noise(c, 0.12)
  const f = c.createBiquadFilter()
  f.type = 'highpass'
  f.frequency.value = 900
  const g = c.createGain()
  g.gain.setValueAtTime(0.6, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12)
  src.connect(f).connect(g).connect(c.destination)
  src.start()
}

export function thud(strength = 1) {
  if (muted) return
  const c = ac()
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(140, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(45, c.currentTime + 0.18)
  const g = c.createGain()
  g.gain.setValueAtTime(0.5 * strength, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22)
  o.connect(g).connect(c.destination)
  o.start()
  o.stop(c.currentTime + 0.25)
}

export function ding() {
  if (muted) return
  const c = ac()
  for (const [i, f] of [660, 990].entries()) {
    const o = c.createOscillator()
    o.frequency.value = f
    const g = c.createGain()
    const t = c.currentTime + i * 0.09
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
    o.connect(g).connect(c.destination)
    o.start(t)
    o.stop(t + 0.4)
  }
}

/** A filtered-noise "roar" that follows scream intensity (0–1). */
export function roar() {
  if (muted) return { set: () => {}, stop: () => {} }
  const c = ac()
  const src = noise(c, 4)
  src.loop = true
  const f = c.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = 0.8
  f.frequency.value = 500
  const g = c.createGain()
  g.gain.value = 0
  src.connect(f).connect(g).connect(c.destination)
  src.start()
  return {
    set: (v: number) => {
      g.gain.setTargetAtTime(v * 0.35, c.currentTime, 0.05)
      f.frequency.setTargetAtTime(400 + v * 1400, c.currentTime, 0.05)
    },
    stop: () => {
      g.gain.setTargetAtTime(0, c.currentTime, 0.08)
      setTimeout(() => src.stop(), 300)
    },
  }
}

/** Live microphone loudness (0–1). Audio never leaves the browser. */
export async function openMic(): Promise<{ level: () => number; close: () => void }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const c = ac()
  const an = c.createAnalyser()
  an.fftSize = 1024
  c.createMediaStreamSource(stream).connect(an)
  const data = new Float32Array(an.fftSize)
  return {
    level: () => {
      an.getFloatTimeDomainData(data)
      let sum = 0
      for (const v of data) sum += v * v
      return Math.min(1, Math.sqrt(sum / data.length) * 6)
    },
    close: () => stream.getTracks().forEach((t) => t.stop()),
  }
}
