const Particles = {
    pool: [],
    active: [],
    container: null,
    POOL_SIZE: 60,

    init() {
        this.container = document.getElementById('particles-container');
        for (let i = 0; i < this.POOL_SIZE; i++) {
            const el = document.createElement('div');
            el.className = 'particle';
            el.style.display = 'none';
            this.container.appendChild(el);
            this.pool.push(el);
        }
    },

    _getElement() {
        if (this.pool.length > 0) return this.pool.pop();
        // Recycle oldest active particle
        if (this.active.length > 0) {
            const oldest = this.active.shift();
            oldest.el.style.display = 'none';
            return oldest.el;
        }
        return null;
    },

    _release(particle) {
        particle.el.style.display = 'none';
        particle.el.className = 'particle';
        particle.el.textContent = '';
        this.pool.push(particle.el);
    },

    spawnFloatingText(x, y, text, type = 'earn') {
        if (!State.data.settings.particles) return;
        const el = this._getElement();
        if (!el) return;

        el.style.display = 'block';
        el.className = 'particle floating-text floating-text--' + type;
        el.textContent = text;
        el.style.left = x + 'px';
        el.style.top = y + 'px';

        const particle = {
            el, x, y,
            vx: Utils.randomRange(-30, 30),
            vy: -120,
            life: 1.0,
            decay: 1.2
        };
        this.active.push(particle);
    },

    spawnConfetti(count = 80) {
        if (!State.data.settings.particles) return;
        for (let i = 0; i < count; i++) {
            const el = this._getElement();
            if (!el) break;

            const colors = ['#FFD700', '#FF6B35', '#00C853', '#2979FF', '#FF4081', '#FF9100'];
            const color = colors[Utils.randomInt(0, colors.length - 1)];
            const startX = Utils.randomRange(0, window.innerWidth);
            const startY = -20;

            el.style.display = 'block';
            el.className = 'particle confetti';
            el.textContent = '';
            el.style.left = startX + 'px';
            el.style.top = startY + 'px';
            el.style.backgroundColor = color;
            el.style.width = Utils.randomRange(6, 12) + 'px';
            el.style.height = Utils.randomRange(6, 12) + 'px';

            const particle = {
                el, x: startX, y: startY,
                vx: Utils.randomRange(-80, 80),
                vy: Utils.randomRange(100, 300),
                rotation: 0,
                rotationSpeed: Utils.randomRange(-360, 360),
                life: 1.0,
                decay: 0.3 + Math.random() * 0.3
            };
            this.active.push(particle);
        }
    },

    spawnCoinBurst(x, y, count = 8) {
        if (!State.data.settings.particles) return;
        for (let i = 0; i < count; i++) {
            const el = this._getElement();
            if (!el) break;

            el.style.display = 'block';
            el.className = 'particle coin-particle';
            el.textContent = '₹';
            el.style.left = x + 'px';
            el.style.top = y + 'px';

            const angle = (Math.PI * 2 / count) * i;
            const speed = Utils.randomRange(60, 140);
            const particle = {
                el, x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 50,
                life: 1.0,
                decay: 1.5
            };
            this.active.push(particle);
        }
    },

    update(dt) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const p = this.active[i];
            p.life -= p.decay * dt;
            if (p.life <= 0) {
                this._release(p);
                this.active.splice(i, 1);
                continue;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Gravity for confetti/coins
            if (p.el.classList.contains('confetti') || p.el.classList.contains('coin-particle')) {
                p.vy += 200 * dt;
            }

            let transform = `translate(${p.x - parseFloat(p.el.style.left)}px, ${p.y - parseFloat(p.el.style.top)}px)`;
            if (p.rotation !== undefined) {
                p.rotation += p.rotationSpeed * dt;
                transform += ` rotate(${p.rotation}deg)`;
            }

            p.el.style.transform = transform;
            p.el.style.opacity = p.life;
        }
    }
};
