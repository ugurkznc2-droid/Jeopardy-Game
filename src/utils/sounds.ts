let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3, startTime = 0) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
}

export function playCorrectSound() {
  // Ascending major arpeggio: C5 -> E5 -> G5 -> C6
  playTone(523.25, 0.15, 'sine', 0.25, 0);
  playTone(659.25, 0.15, 'sine', 0.25, 0.1);
  playTone(783.99, 0.15, 'sine', 0.25, 0.2);
  playTone(1046.50, 0.3, 'sine', 0.3, 0.3);
}

export function playWrongSound() {
  // Low buzzer
  playTone(150, 0.4, 'sawtooth', 0.15, 0);
  playTone(120, 0.3, 'sawtooth', 0.12, 0.15);
}

export function playDailyDoubleSound() {
  // Dramatic ascending fanfare
  playTone(392, 0.2, 'square', 0.15, 0);
  playTone(523.25, 0.2, 'square', 0.15, 0.15);
  playTone(659.25, 0.2, 'square', 0.15, 0.3);
  playTone(783.99, 0.4, 'square', 0.2, 0.45);
  playTone(1046.50, 0.5, 'sine', 0.25, 0.6);
}

export function playTimerTickSound() {
  playTone(800, 0.05, 'sine', 0.1, 0);
}

export function playTimerExpiredSound() {
  playTone(200, 0.5, 'square', 0.2, 0);
  playTone(150, 0.5, 'square', 0.15, 0.3);
}

export function playRevealSound() {
  playTone(440, 0.1, 'sine', 0.15, 0);
  playTone(550, 0.15, 'sine', 0.2, 0.08);
}

export function playSelectSound() {
  playTone(600, 0.08, 'sine', 0.1, 0);
}
