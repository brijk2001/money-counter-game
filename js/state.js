const SAVE_KEY = 'moneyCounterGame_v1';
const SAVE_INTERVAL = 30000; // 30 seconds

const State = {
    data: null,

    getDefault() {
        return {
            balance: 0,
            lifetimeEarnings: 0,
            totalClicks: 0,
            clickPower: 1,
            passiveIncome: 0,
            multiplier: 1,
            level: 1,
            prestigeCount: 0,
            prestigeMultiplier: 1,
            upgrades: {},
            achievements: [],
            combo: { count: 0, timer: 0, multiplier: 1 },
            settings: { sound: true, particles: true },
            lastSaveTime: Date.now(),
            stats: { sessionClicks: 0, bestCombo: 0, totalTimePlayed: 0 },
            version: 1
        };
    },

    init() {
        this.load();
        this._startAutoSave();
        window.addEventListener('beforeunload', () => this.save());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.save();
        });
    },

    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                this.data = { ...this.getDefault(), ...saved };
                this.data.combo = { count: 0, timer: 0, multiplier: 1 };
                this.data.stats.sessionClicks = 0;
            } else {
                this.data = this.getDefault();
            }
        } catch (e) {
            console.warn('Failed to load save, starting fresh:', e);
            this.data = this.getDefault();
        }
    },

    save() {
        try {
            this.data.lastSaveTime = Date.now();
            localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Failed to save:', e);
        }
    },

    reset() {
        this.data = this.getDefault();
        this.save();
    },

    _startAutoSave() {
        setInterval(() => this.save(), SAVE_INTERVAL);
    },

    addMoney(amount) {
        const earned = amount * this.data.multiplier * this.data.prestigeMultiplier * this.data.combo.multiplier;
        this.data.balance += earned;
        this.data.lifetimeEarnings += earned;
        return earned;
    },

    spendMoney(amount) {
        if (this.data.balance >= amount) {
            this.data.balance -= amount;
            return true;
        }
        return false;
    },

    getEffectiveClickPower() {
        return this.data.clickPower * this.data.multiplier * this.data.prestigeMultiplier * this.data.combo.multiplier;
    },

    getEffectivePassiveIncome() {
        return this.data.passiveIncome * this.data.multiplier * this.data.prestigeMultiplier;
    },

    getOfflineEarnings() {
        const now = Date.now();
        const elapsed = (now - this.data.lastSaveTime) / 1000;
        if (elapsed < 10 || this.data.passiveIncome <= 0) return 0;
        return this.getEffectivePassiveIncome() * elapsed * 0.5;
    }
};
