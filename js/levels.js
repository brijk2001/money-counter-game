const LEVELS = [
    { level: 1,  title: 'Coin Counter',        threshold: 0,              unlocks: 'Manual clicking' },
    { level: 2,  title: 'Junior Clerk',         threshold: 100,            unlocks: 'First upgrade' },
    { level: 3,  title: 'Senior Clerk',         threshold: 500,            unlocks: 'Auto-clicker' },
    { level: 4,  title: 'Head Cashier',         threshold: 2000,           unlocks: 'Combo mechanic' },
    { level: 5,  title: 'Asst. Manager',        threshold: 10000,          unlocks: 'Passive income' },
    { level: 6,  title: 'Branch Manager',       threshold: 50000,          unlocks: 'Investments' },
    { level: 7,  title: 'Regional Manager',     threshold: 250000,         unlocks: 'Multipliers' },
    { level: 8,  title: 'Zonal Head',           threshold: 1000000,        unlocks: 'Prestige' },
    { level: 9,  title: 'General Manager',      threshold: 5000000,        unlocks: 'Mega upgrades' },
    { level: 10, title: 'Dalal Street Trader',  threshold: 25000000,       unlocks: 'Market events' },
    { level: 11, title: 'SEBI Analyst',         threshold: 100000000,      unlocks: 'Golden click' },
    { level: 12, title: 'Fund Manager',         threshold: 500000000,      unlocks: 'Automation' },
    { level: 13, title: 'Bank Chairman',        threshold: 2000000000,     unlocks: 'Prestige tier 2' },
    { level: 14, title: 'Finance Secretary',    threshold: 10000000000,    unlocks: 'Time warp' },
    { level: 15, title: 'RBI Governor',         threshold: 100000000000,   unlocks: 'Endgame' }
];

const Levels = {
    getCurrent() {
        return LEVELS[State.data.level - 1];
    },

    getNext() {
        if (State.data.level >= LEVELS.length) return null;
        return LEVELS[State.data.level];
    },

    getProgress() {
        const current = this.getCurrent();
        const next = this.getNext();
        if (!next) return 1;
        const earned = State.data.lifetimeEarnings;
        const range = next.threshold - current.threshold;
        const progress = earned - current.threshold;
        return Math.min(1, Math.max(0, progress / range));
    },

    checkLevelUp() {
        const next = this.getNext();
        if (!next) return null;
        if (State.data.lifetimeEarnings >= next.threshold) {
            State.data.level = next.level;
            return next;
        }
        return null;
    },

    getByLevel(level) {
        return LEVELS[level - 1] || null;
    }
};
