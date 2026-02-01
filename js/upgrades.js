const COST_SCALE = 1.15;

const UPGRADE_DEFS = {
    // Click Power upgrades
    betterCalc:     { name: 'Better Calculator',    type: 'click',   baseCost: 10,         effect: 1,      icon: '🧮', desc: '+₹1 per click',       unlockLevel: 1 },
    counterMachine: { name: 'Counting Machine',     type: 'click',   baseCost: 100,        effect: 5,      icon: '🖩', desc: '+₹5 per click',       unlockLevel: 2 },
    digitalCounter: { name: 'Digital Counter',      type: 'click',   baseCost: 1000,       effect: 25,     icon: '💻', desc: '+₹25 per click',      unlockLevel: 4 },
    laserScanner:   { name: 'Laser Scanner',        type: 'click',   baseCost: 15000,      effect: 150,    icon: '🔦', desc: '+₹150 per click',     unlockLevel: 6 },
    quantumCounter: { name: 'Quantum Counter',      type: 'click',   baseCost: 500000,     effect: 2000,   icon: '⚛️', desc: '+₹2,000 per click',   unlockLevel: 9 },

    // Passive Income upgrades
    piggyBank:      { name: 'Piggy Bank',           type: 'passive', baseCost: 50,         effect: 0.5,    icon: '🐷', desc: '+₹0.5/sec',           unlockLevel: 3 },
    savingsAcct:    { name: 'Savings Account',      type: 'passive', baseCost: 500,        effect: 3,      icon: '🏦', desc: '+₹3/sec',              unlockLevel: 5 },
    fixedDeposit:   { name: 'Fixed Deposit',        type: 'passive', baseCost: 5000,       effect: 20,     icon: '📜', desc: '+₹20/sec',             unlockLevel: 5 },
    mutualFund:     { name: 'Mutual Fund (SIP)',    type: 'passive', baseCost: 50000,      effect: 150,    icon: '📈', desc: '+₹150/sec',            unlockLevel: 6 },
    realEstate:     { name: 'Real Estate Fund',     type: 'passive', baseCost: 500000,     effect: 1500,   icon: '🏠', desc: '+₹1,500/sec',          unlockLevel: 7 },
    hedgeFund:      { name: 'Hedge Fund',           type: 'passive', baseCost: 10000000,   effect: 25000,  icon: '🦔', desc: '+₹25,000/sec',         unlockLevel: 10 },
    rbiPrinter:     { name: 'RBI Money Printer',    type: 'passive', baseCost: 1000000000, effect: 500000, icon: '🖨️', desc: '+₹5,00,000/sec',       unlockLevel: 13 },

    // Multiplier upgrades
    chaiBrk:        { name: 'Chai Break',           type: 'multi',   baseCost: 5000,       effect: 1.5,    icon: '☕', desc: 'x1.5 all income',      unlockLevel: 7,  maxOwned: 1 },
    mbaDegree:      { name: 'MBA (IIM)',            type: 'multi',   baseCost: 100000,     effect: 2,      icon: '🎓', desc: 'x2 all income',        unlockLevel: 8,  maxOwned: 1 },
    insiderTip:     { name: 'Insider Knowledge',    type: 'multi',   baseCost: 2000000,    effect: 3,      icon: '🤫', desc: 'x3 all income',        unlockLevel: 10, maxOwned: 1 },
    moneyPrinter:   { name: 'Money Printer',        type: 'multi',   baseCost: 50000000,   effect: 5,      icon: '💸', desc: 'x5 all income',        unlockLevel: 12, maxOwned: 1 }
};

const Upgrades = {
    getAll() {
        return UPGRADE_DEFS;
    },

    getAvailable() {
        const available = {};
        for (const [id, def] of Object.entries(UPGRADE_DEFS)) {
            if (State.data.level >= def.unlockLevel) {
                available[id] = def;
            }
        }
        return available;
    },

    getOwned(id) {
        return State.data.upgrades[id] || 0;
    },

    getCost(id) {
        const def = UPGRADE_DEFS[id];
        const owned = this.getOwned(id);
        return Math.floor(def.baseCost * Math.pow(COST_SCALE, owned));
    },

    canAfford(id) {
        return State.data.balance >= this.getCost(id);
    },

    canBuy(id) {
        const def = UPGRADE_DEFS[id];
        if (def.maxOwned && this.getOwned(id) >= def.maxOwned) return false;
        return this.canAfford(id);
    },

    buy(id) {
        const def = UPGRADE_DEFS[id];
        if (!def) return false;
        if (!this.canBuy(id)) return false;

        const cost = this.getCost(id);
        if (!State.spendMoney(cost)) return false;

        State.data.upgrades[id] = (State.data.upgrades[id] || 0) + 1;

        // Apply effect
        switch (def.type) {
            case 'click':
                State.data.clickPower += def.effect;
                break;
            case 'passive':
                State.data.passiveIncome += def.effect;
                break;
            case 'multi':
                State.data.multiplier *= def.effect;
                break;
        }

        State.save();
        return true;
    },

    recalculate() {
        // Recalculate all stats from owned upgrades (used after prestige reset)
        let clickPower = 1;
        let passiveIncome = 0;
        let multiplier = 1;

        for (const [id, count] of Object.entries(State.data.upgrades)) {
            const def = UPGRADE_DEFS[id];
            if (!def) continue;
            switch (def.type) {
                case 'click':
                    clickPower += def.effect * count;
                    break;
                case 'passive':
                    passiveIncome += def.effect * count;
                    break;
                case 'multi':
                    for (let i = 0; i < count; i++) multiplier *= def.effect;
                    break;
            }
        }

        State.data.clickPower = clickPower;
        State.data.passiveIncome = passiveIncome;
        State.data.multiplier = multiplier;
    }
};
