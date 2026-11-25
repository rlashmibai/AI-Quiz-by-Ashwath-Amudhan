'use client';

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || isMuted) return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setQuizMuted(muted: boolean) {
  isMuted = muted;
}

export function getQuizMuted(): boolean {
  return isMuted;
}

function playTone(
  ctx: AudioContext,
  startFreq: number,
  endFreq: number,
  durationSec: number,
  type: OscillatorType = 'sine',
  peakGain = 0.14,
  delaySec = 0
) {
  const now = ctx.currentTime + delaySec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, now);
  if (endFreq !== startFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + durationSec);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationSec + 0.02);
}

export function playTapSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 520, 680, 0.055, 'triangle', 0.13);
}

export function playTileToggleSound(selected: boolean) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (selected) {
    playTone(ctx, 560, 820, 0.075, 'sine', 0.14);
  } else {
    playTone(ctx, 520, 360, 0.075, 'sine', 0.11);
  }
}

export function playPairConnectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 523.25, 523.25, 0.09, 'sine', 0.12, 0);
  playTone(ctx, 659.25, 659.25, 0.11, 'sine', 0.13, 0.055);
}

export function playCorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 523.25, 523.25, 0.12, 'triangle', 0.14, 0);
  playTone(ctx, 659.25, 659.25, 0.12, 'triangle', 0.14, 0.08);
  playTone(ctx, 783.99, 783.99, 0.18, 'triangle', 0.15, 0.16);
  playTone(ctx, 1046.5, 1046.5, 0.24, 'sine', 0.14, 0.24);
}

export function playIncorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 350, 310, 0.14, 'sine', 0.12, 0);
  playTone(ctx, 290, 250, 0.18, 'sine', 0.12, 0.11);
}

export function playCelebrationSound(isHighTier: boolean) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const notes = isHighTier
    ? [523.25, 659.25, 783.99, 1046.5, 1318.5]
    : [440, 554.37, 659.25, 880];
  notes.forEach((freq, idx) => {
    playTone(ctx, freq, freq, 0.22, 'triangle', 0.12, idx * 0.09);
  });
}
