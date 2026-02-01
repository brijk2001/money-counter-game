const COMBO_TIMEOUT = 800; // ms between clicks to maintain combo
const COMBO_TIERS = [
    { count: 0,  multiplier: 1,   label: '' },
    { count: 5,  multiplier: 1.5, label: 'x1.5' },
    { count: 15, multiplier: 2,   label: 'x2' },
    { count: 30, multiplier: 3,   label: 'x3' },
    { count: 50, multiplier: 5,   label: 'x5!' }
];

const Click = {
    lastClickTime: 0,

    handleClick(x, y) {
        const now = performance.now();

        // Update combo
        if (now - this.lastClickTime < COMBO_TIMEOUT) {
            State.data.combo.count++;
        } else {
            State.data.combo.count = 1;
        }
        this.lastClickTime = now;
        State.data.combo.timer = COMBO_TIMEOUT;

        // Calculate combo multiplier
        let comboMult = 1;
        let comboLabel = '';
        for (const tier of COMBO_TIERS) {
            if (State.data.combo.count >= tier.count) {
                comboMult = tier.multiplier;
                comboLabel = tier.label;
            }
        }
        State.data.combo.multiplier = comboMult;

        // Calculate and add earnings
        const earned = State.data.clickPower * State.data.multiplier * State.data.prestigeMultiplier * comboMult;
        State.data.balance += earned;
        State.data.lifetimeEarnings += earned;
        State.data.totalClicks++;
        State.data.stats.sessionClicks++;

        if (State.data.combo.count > State.data.stats.bestCombo) {
            State.data.stats.bestCombo = State.data.combo.count;
        }

        return { earned, x, y, comboLabel, comboCount: State.data.combo.count };
    },

    updateCombo(dt) {
        if (State.data.combo.timer > 0) {
            State.data.combo.timer -= dt;
            if (State.data.combo.timer <= 0) {
                State.data.combo.count = 0;
                State.data.combo.multiplier = 1;
                State.data.combo.timer = 0;
            }
        }
    },

    getComboTier() {
        for (let i = COMBO_TIERS.length - 1; i >= 0; i--) {
            if (State.data.combo.count >= COMBO_TIERS[i].count) {
                return COMBO_TIERS[i];
            }
        }
        return COMBO_TIERS[0];
    }
};
