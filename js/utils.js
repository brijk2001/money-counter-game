// Indian number formatting: ₹1.2L, ₹3.4Cr etc.
const Utils = {
    formatMoney(amount) {
        if (amount < 0) return '-' + this.formatMoney(-amount);
        if (amount < 1000) return '₹' + Math.floor(amount);
        if (amount < 100000) return '₹' + (amount / 1000).toFixed(1) + 'K';
        if (amount < 10000000) return '₹' + (amount / 100000).toFixed(2) + 'L';
        if (amount < 1000000000) return '₹' + (amount / 10000000).toFixed(2) + 'Cr';
        if (amount < 100000000000) return '₹' + (amount / 1000000000).toFixed(2) + 'K Cr';
        return '₹' + (amount / 10000000000).toFixed(2) + 'L Cr';
    },

    formatMoneyExact(amount) {
        if (amount < 100000) {
            return '₹' + Math.floor(amount).toLocaleString('en-IN');
        }
        return this.formatMoney(amount);
    },

    formatNumber(num) {
        return Math.floor(num).toLocaleString('en-IN');
    },

    formatRate(amount) {
        if (amount < 1) return '₹' + amount.toFixed(1);
        return this.formatMoney(amount);
    },

    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};
