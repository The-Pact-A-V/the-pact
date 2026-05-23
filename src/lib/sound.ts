// Programmatic chime + haptic helpers. No audio files needed — synthesized
// via Web Audio API. Both gated by the user's `soundOn` preference (caller
// checks before calling).

let ctx: AudioContext | null = null
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const W = window as unknown as { webkitAudioContext?: typeof AudioContext }
    ctx = new (window.AudioContext || W.webkitAudioContext!)()
  }
  return ctx
}

interface Tone {
  freq: number
  duration: number // seconds
  delay?: number   // seconds from now
  volume?: number  // 0..1
}

function playTones(tones: Tone[]): void {
  const c = getCtx()
  if (!c) return
  // Resume context if suspended (iOS autoplay policy requires a user gesture
  // before audio plays; we're usually called from one).
  if (c.state === 'suspended') c.resume().catch(() => {})

  for (const t of tones) {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = t.freq
    osc.connect(gain)
    gain.connect(c.destination)
    const start = c.currentTime + (t.delay ?? 0)
    const vol = t.volume ?? 0.15
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + t.duration)
    osc.start(start)
    osc.stop(start + t.duration + 0.05)
  }
}

// ----- Public sounds -----

// Soft two-note "incoming" chime
export function playBuzzChime(): void {
  playTones([
    { freq: 880, duration: 0.18, volume: 0.18 },
    { freq: 1175, duration: 0.22, delay: 0.12, volume: 0.18 },
  ])
}

// Brighter three-note rising chime for crossing a milestone
export function playMilestoneChime(): void {
  playTones([
    { freq: 659, duration: 0.18, volume: 0.16 },
    { freq: 880, duration: 0.18, delay: 0.14, volume: 0.16 },
    { freq: 1175, duration: 0.32, delay: 0.28, volume: 0.18 },
  ])
}

// Quick single click for ticking a habit
export function playTickClick(): void {
  playTones([{ freq: 1320, duration: 0.07, volume: 0.1 }])
}

// ----- Haptic -----

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // some browsers throw if vibrate is called too frequently
  }
}
