const Audio = {
    ctx: null,
    enabled: true,

    init() {
        this.enabled = State.data.settings.sound;
    },

    _ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    },

    _playTone(freq, duration, type = 'sine', volume = 0.15) {
        if (!this.enabled) return;
        try {
            const ctx = this._ensureContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) { /* audio not available */ }
    },

    click() {
        this._playTone(800, 0.06, 'sine', 0.1);
    },

    purchase() {
        if (!this.enabled) return;
        this._playTone(523, 0.1, 'sine', 0.12);
        setTimeout(() => this._playTone(659, 0.1, 'sine', 0.12), 80);
        setTimeout(() => this._playTone(784, 0.15, 'sine', 0.12), 160);
    },

    levelUp() {
        if (!this.enabled) return;
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 0.2, 'sine', 0.15), i * 120);
        });
    },

    comboTick() {
        this._playTone(1200, 0.04, 'square', 0.05);
    },

    achievement() {
        if (!this.enabled) return;
        const notes = [784, 988, 1175, 1568];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 0.15, 'triangle', 0.12), i * 100);
        });
    },

    toggle() {
        this.enabled = !this.enabled;
        State.data.settings.sound = this.enabled;
        return this.enabled;
    }
};
