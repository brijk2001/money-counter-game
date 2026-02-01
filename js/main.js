const Game = {
    lastTime: 0,
    passiveAccumulator: 0,

    init() {
        State.init();
        Upgrades.recalculate();
        Particles.init();
        Audio.init();
        UI.init();

        // Set initial theme tier
        document.body.setAttribute('data-level-tier', UI._getLevelTier(State.data.level));

        // Check offline earnings
        const offlineEarnings = State.getOfflineEarnings();
        if (offlineEarnings > 0) {
            State.data.balance += offlineEarnings;
            State.data.lifetimeEarnings += offlineEarnings;
            UI.showWelcomeBack(offlineEarnings);
        }

        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1); // cap at 100ms
        this.lastTime = timestamp;

        // Passive income
        if (State.data.passiveIncome > 0) {
            const earned = State.getEffectivePassiveIncome() * dt;
            State.data.balance += earned;
            State.data.lifetimeEarnings += earned;
            UI.dirty.balance = true;
        }

        // Combo timer
        const hadCombo = State.data.combo.count > 0;
        Click.updateCombo(dt * 1000);
        if (hadCombo && State.data.combo.count === 0) {
            UI.dirty.stats = true;
        }

        // Level check
        const levelUp = Levels.checkLevelUp();
        if (levelUp) {
            UI.showLevelUp(levelUp);
            UI.dirty.level = true;
            UI.dirty.upgrades = true;
        }

        // Level progress (check if dirty)
        const progress = Levels.getProgress();
        if (Math.abs(parseFloat(UI.elements.levelProgress.style.width) / 100 - progress) > 0.001) {
            UI.dirty.level = true;
        }

        // Update particles
        Particles.update(dt);

        // Render
        UI.render();

        // Track time played
        State.data.stats.totalTimePlayed += dt;

        requestAnimationFrame((t) => this.loop(t));
    }
};

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
