/**
 * Minimalist, high-end sound synthesis for a medical app.
 * Uses Web Audio API to avoid network latency and large assets.
 */

class SoundEngine {
    private ctx: AudioContext | null = null;

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Minimalist 'Pop' for sending messages.
     * Short, upward frequency sweep.
     */
    playSend() {
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    /**
     * Soft 'Ding' for receiving messages.
     * Gentle, harmonic double-tone.
     */
    playReceive() {
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // First tone
        this.playTone(880, 0.1, 0.05);
        // Second tone slightly delayed
        setTimeout(() => this.playTone(1174.66, 0.2, 0.05), 50);
    }

    private playTone(freq: number, duration: number, volume: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
}

export const sounds = new SoundEngine();
