let ctx: AudioContext | null = null;

export function sfxEnabled(): boolean {
  return localStorage.getItem('lingora.sfx') !== 'off';
}

export function setSfx(on: boolean): void {
  localStorage.setItem('lingora.sfx', on ? 'on' : 'off');
}

/** Short synthesized feedback tones (no audio assets to download). */
export function playSfx(kind: 'correct' | 'wrong' | 'finish'): void {
  if (!sfxEnabled()) return;
  try {
    ctx ??= new AudioContext();
    const notes = { correct: [660, 880], wrong: [220, 180], finish: [523, 659, 784, 1046] }[kind];
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      const t = ctx!.currentTime + i * 0.09;
      osc.type = kind === 'wrong' ? 'square' : 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(kind === 'wrong' ? 0.05 : 0.12, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  } catch {
    // Audio not available (e.g. autoplay policy) — feedback is still shown visually.
  }
}
