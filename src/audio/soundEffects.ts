// Web Audio API procedural sound engine for tactile Soroban wooden/plastic clacks

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.7;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic wooden bead impact sound
  public playClack(isUpper: boolean = false, pitchVariation: number = 1.0) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreq = isUpper ? 380 * pitchVariation : 480 * pitchVariation;

      // 1. Transient Click (impact of bead hitting beam/wood)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch drop creates a crisp wood knock feel
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * 2.2, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.035);

      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      // Filter for rich wooden resonance
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 1.5, now);
      filter.Q.setValueAtTime(2.5, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);

      // 2. Subtle low body resonance
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(baseFreq * 0.9, now);
      subGain.gain.setValueAtTime(0.2 * this.volume, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.035);
    } catch {
      // Audio might be blocked until user interacts
    }
  }

  // Swift sweep when clearing abacus
  public playResetSweep() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      for (let i = 0; i < 7; i++) {
        setTimeout(() => {
          this.playClack(i % 2 === 0, 0.9 + Math.random() * 0.3);
        }, i * 22);
      }
    } catch {
      // ignore
    }
  }

  // Gentle Japanese zen bell / singing bowl chime for victory / completed step
  public playSuccessChime() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (harmonious pentatonic lift)

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.85);
      });
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundEngine();
