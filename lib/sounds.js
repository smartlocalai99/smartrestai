let sharedContext = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedContext) sharedContext = new Ctor();
  return sharedContext;
}

function playTone(ctx, { frequency, endFrequency, startAt, attack = 0.015, duration, peakGain = 0.16 }) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);
  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startAt + duration);
  }

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peakGain, startAt + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

function safelyPlay(build) {
  // Audio is a nice-to-have on top of the interaction — it must never be
  // able to break the thing it's attached to (blocked AudioContext, no
  // audio device in a headless/restricted browser, autoplay policy, etc).
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    build(ctx, ctx.currentTime);
  } catch {
    // ignore — audio isn't essential to the interaction
  }
}

/** Bright ascending two-note chime for adding a favourite. */
export function playFavoriteAddedSound() {
  safelyPlay((ctx, now) => {
    playTone(ctx, { frequency: 720, endFrequency: 880, startAt: now, duration: 0.1, peakGain: 0.15 });
    playTone(ctx, { frequency: 1080, startAt: now + 0.09, duration: 0.14, peakGain: 0.17 });
  });
}

/** Soft descending "oops" blip for removing a favourite. */
export function playFavoriteRemovedSound() {
  safelyPlay((ctx, now) => {
    playTone(ctx, { frequency: 520, endFrequency: 260, startAt: now, duration: 0.16, peakGain: 0.12 });
  });
}

/** Three-note ascending arpeggio for a completed order — the biggest "win" moment in the app. */
export function playOrderSuccessSound() {
  safelyPlay((ctx, now) => {
    playTone(ctx, { frequency: 523.25, startAt: now, duration: 0.14, peakGain: 0.14 }); // C5
    playTone(ctx, { frequency: 659.25, startAt: now + 0.11, duration: 0.14, peakGain: 0.15 }); // E5
    playTone(ctx, { frequency: 783.99, startAt: now + 0.22, duration: 0.26, peakGain: 0.17 }); // G5
  });
}
