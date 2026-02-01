const UI = {
    elements: {},
    dirty: { balance: true, stats: true, upgrades: true, level: true },
    levelUpQueue: [],

    init() {
        this.elements = {
            balance: document.getElementById('balance'),
            clickPower: document.getElementById('click-power'),
            passiveIncome: document.getElementById('passive-income'),
            multiplier: document.getElementById('multiplier'),
            levelTitle: document.getElementById('level-title'),
            levelNum: document.getElementById('level-num'),
            levelProgress: document.getElementById('level-progress-fill'),
            levelNext: document.getElementById('level-next'),
            upgradeList: document.getElementById('upgrade-list'),
            comboDisplay: document.getElementById('combo-display'),
            comboCount: document.getElementById('combo-count'),
            comboMult: document.getElementById('combo-mult'),
            clickTarget: document.getElementById('click-target'),
            modal: document.getElementById('modal-overlay'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalBtn: document.getElementById('modal-btn'),
            soundToggle: document.getElementById('sound-toggle'),
            totalClicks: document.getElementById('total-clicks'),
            shopTabs: document.querySelectorAll('.shop-tab'),
            shopContent: document.getElementById('upgrade-list')
        };

        // Click target events
        const ct = this.elements.clickTarget;
        ct.addEventListener('click', (e) => this._onClick(e));
        ct.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._onClick(touch);
        }, { passive: false });

        // Modal close
        this.elements.modalBtn.addEventListener('click', () => this.closeModal());

        // Sound toggle
        this.elements.soundToggle.addEventListener('click', () => {
            const on = Audio.toggle();
            this.elements.soundToggle.textContent = on ? '🔊' : '🔇';
        });
        this.elements.soundToggle.textContent = State.data.settings.sound ? '🔊' : '🔇';

        // Shop tabs
        this._currentTab = 'all';
        this.elements.shopTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this._currentTab = tab.dataset.tab;
                this.elements.shopTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.dirty.upgrades = true;
            });
        });

        this.markAllDirty();
    },

    markAllDirty() {
        for (const key in this.dirty) this.dirty[key] = true;
    },

    _onClick(e) {
        const rect = this.elements.clickTarget.getBoundingClientRect();
        const x = e.clientX || e.pageX;
        const y = e.clientY || e.pageY;

        const result = Click.handleClick(x, y);

        // Squish animation
        this.elements.clickTarget.classList.remove('squish');
        void this.elements.clickTarget.offsetWidth; // force reflow
        this.elements.clickTarget.classList.add('squish');

        // Floating text
        const textType = result.comboLabel ? 'combo' : 'earn';
        let text = '+' + Utils.formatMoney(result.earned);
        if (result.comboLabel) text += ' ' + result.comboLabel;
        Particles.spawnFloatingText(x, y - 20, text, textType);

        // Coin burst on big combos
        if (result.comboCount > 0 && result.comboCount % 10 === 0) {
            Particles.spawnCoinBurst(x, y, 6);
        }

        Audio.click();

        this.dirty.balance = true;
        this.dirty.stats = true;
    },

    render() {
        if (this.dirty.balance) {
            this.elements.balance.textContent = Utils.formatMoneyExact(State.data.balance);
            this.dirty.balance = false;
        }

        if (this.dirty.stats) {
            this.elements.clickPower.textContent = Utils.formatMoney(State.getEffectiveClickPower());
            this.elements.passiveIncome.textContent = Utils.formatRate(State.getEffectivePassiveIncome()) + '/s';
            this.elements.multiplier.textContent = 'x' + (State.data.multiplier * State.data.prestigeMultiplier).toFixed(1);
            this.elements.totalClicks.textContent = Utils.formatNumber(State.data.totalClicks);

            // Combo
            if (State.data.combo.count > 1) {
                this.elements.comboDisplay.classList.add('visible');
                this.elements.comboCount.textContent = State.data.combo.count;
                this.elements.comboMult.textContent = Click.getComboTier().label;
            } else {
                this.elements.comboDisplay.classList.remove('visible');
            }
            this.dirty.stats = false;
        }

        if (this.dirty.level) {
            const current = Levels.getCurrent();
            const next = Levels.getNext();
            this.elements.levelTitle.textContent = current.title;
            this.elements.levelNum.textContent = 'Level ' + current.level;
            this.elements.levelProgress.style.width = (Levels.getProgress() * 100) + '%';
            this.elements.levelNext.textContent = next ? 'Next: ' + Utils.formatMoney(next.threshold) : 'MAX LEVEL';
            this.dirty.level = false;
        }

        if (this.dirty.upgrades) {
            this._renderUpgrades();
            this.dirty.upgrades = false;
        }
    },

    _renderUpgrades() {
        const available = Upgrades.getAvailable();
        const list = this.elements.upgradeList;
        list.innerHTML = '';

        for (const [id, def] of Object.entries(available)) {
            if (this._currentTab !== 'all' && def.type !== this._currentTab) continue;

            const owned = Upgrades.getOwned(id);
            const cost = Upgrades.getCost(id);
            const canBuy = Upgrades.canBuy(id);
            const maxed = def.maxOwned && owned >= def.maxOwned;

            const card = document.createElement('div');
            card.className = 'upgrade-card' + (canBuy ? ' affordable' : '') + (maxed ? ' maxed' : '');

            card.innerHTML = `
                <div class="upgrade-icon">${def.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${def.name}</div>
                    <div class="upgrade-desc">${def.desc}</div>
                </div>
                <div class="upgrade-action">
                    <div class="upgrade-cost">${maxed ? 'MAXED' : Utils.formatMoney(cost)}</div>
                    <div class="upgrade-owned">${owned > 0 ? 'Owned: ' + owned : ''}</div>
                </div>
            `;

            if (canBuy && !maxed) {
                card.addEventListener('click', () => {
                    if (Upgrades.buy(id)) {
                        Audio.purchase();
                        card.classList.add('purchased-flash');
                        this.markAllDirty();
                    }
                });
            }

            list.appendChild(card);
        }

        if (list.children.length === 0) {
            list.innerHTML = '<div class="no-upgrades">Keep earning to unlock upgrades!</div>';
        }
    },

    showLevelUp(levelData) {
        this.levelUpQueue.push(levelData);
        if (this.levelUpQueue.length === 1) this._showNextLevelUp();
    },

    _showNextLevelUp() {
        if (this.levelUpQueue.length === 0) return;
        const levelData = this.levelUpQueue[0];

        this.elements.modalTitle.textContent = '🎉 Congratulations!';
        this.elements.modalBody.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-badge">Level ${levelData.level}</div>
                <div class="level-up-title">${levelData.title}</div>
                <div class="level-up-unlocks">Unlocked: ${levelData.unlocks}</div>
            </div>
        `;
        this.elements.modal.classList.add('visible');

        Particles.spawnConfetti(100);
        Audio.levelUp();

        // Update theme
        document.body.setAttribute('data-level-tier', this._getLevelTier(levelData.level));
    },

    _getLevelTier(level) {
        if (level <= 3) return '1';
        if (level <= 6) return '2';
        if (level <= 9) return '3';
        if (level <= 12) return '4';
        return '5';
    },

    closeModal() {
        this.elements.modal.classList.remove('visible');
        this.levelUpQueue.shift();
        if (this.levelUpQueue.length > 0) {
            setTimeout(() => this._showNextLevelUp(), 400);
        }
    },

    showWelcomeBack(earnings) {
        this.elements.modalTitle.textContent = '🏦 Welcome Back!';
        this.elements.modalBody.innerHTML = `
            <div class="welcome-back-content">
                <div class="welcome-earnings">You earned</div>
                <div class="welcome-amount">${Utils.formatMoney(earnings)}</div>
                <div class="welcome-sub">while you were away!</div>
            </div>
        `;
        this.elements.modal.classList.add('visible');
    }
};
