/**
 * Phrasebook / Trip & Work Assist
 * A mobile-first, tap-to-hear phrasebook tailored for a professional stay in Germany.
 * Loads curated phrases, cultural etiquette tips, and gift guidance from data/phrasebook.json.
 */
class PhrasebookManager {
    constructor() {
        this.data = null;
        this.activeCategory = null;
        this.searchTerm = '';
        this.rendered = false;
        this.loadData();
    }

    async loadData() {
        try {
            const response = await fetch('data/phrasebook.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.data = await response.json();
            if (this.data.categories?.length) {
                this.activeCategory = this.data.categories[0].id;
            }
        } catch (error) {
            console.error('Failed to load phrasebook data:', error);
        }
    }

    /** Render the whole section. Called when the user navigates to #assist. */
    render() {
        const container = document.getElementById('assist-content');
        if (!container) return;

        if (!this.data) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Loading phrasebook…</p>';
            // Retry shortly while data finishes loading
            setTimeout(() => this.render(), 200);
            return;
        }

        container.innerHTML = `
            <div class="assist-intro">
                <p class="assist-subtitle">${this.data.subtitle || ''}</p>
            </div>

            <div class="assist-search">
                <span class="assist-search-icon">🔎</span>
                <input type="text" id="assist-search-input" placeholder="Search a phrase, e.g. 'thank you', 'lab', 'biomass'…" autocomplete="off">
                <button class="assist-search-clear" id="assist-search-clear" aria-label="Clear search">&times;</button>
            </div>

            <div class="assist-tabs" id="assist-tabs">
                ${this.data.categories.map(cat => `
                    <button class="assist-tab ${cat.id === this.activeCategory ? 'active' : ''}" data-category="${cat.id}">
                        <span class="assist-tab-icon">${cat.icon}</span>
                        <span class="assist-tab-name">${cat.name}</span>
                    </button>
                `).join('')}
                <button class="assist-tab assist-tab-special ${this.activeCategory === 'etiquette' ? 'active' : ''}" data-category="etiquette">
                    <span class="assist-tab-icon">🇩🇪</span>
                    <span class="assist-tab-name">Etiquette</span>
                </button>
                <button class="assist-tab assist-tab-special ${this.activeCategory === 'gifts' ? 'active' : ''}" data-category="gifts">
                    <span class="assist-tab-icon">🎁</span>
                    <span class="assist-tab-name">Gift Ideas</span>
                </button>
            </div>

            <div class="assist-panel" id="assist-panel"></div>
        `;

        this.attachControls();
        this.renderPanel();
        this.rendered = true;
    }

    attachControls() {
        const tabs = document.getElementById('assist-tabs');
        tabs?.querySelectorAll('.assist-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                window.soundManager?.play('click');
                this.activeCategory = tab.dataset.category;
                this.searchTerm = '';
                const input = document.getElementById('assist-search-input');
                if (input) input.value = '';
                tabs.querySelectorAll('.assist-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderPanel();
            });
        });

        const input = document.getElementById('assist-search-input');
        input?.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.trim().toLowerCase();
            this.renderPanel();
        });

        document.getElementById('assist-search-clear')?.addEventListener('click', () => {
            this.searchTerm = '';
            if (input) input.value = '';
            this.renderPanel();
        });
    }

    /** Build a flat list of all phrases (with category) for searching. */
    allPhrases() {
        const out = [];
        this.data.categories.forEach(cat => {
            cat.phrases.forEach(p => out.push({ ...p, _cat: cat.name, _icon: cat.icon }));
        });
        return out;
    }

    renderPanel() {
        const panel = document.getElementById('assist-panel');
        if (!panel) return;

        // Search mode overrides the active tab
        if (this.searchTerm) {
            const matches = this.allPhrases().filter(p =>
                p.de.toLowerCase().includes(this.searchTerm) ||
                p.en.toLowerCase().includes(this.searchTerm) ||
                (p.note && p.note.toLowerCase().includes(this.searchTerm))
            );

            if (matches.length === 0) {
                panel.innerHTML = `<p class="assist-empty">No phrases found for “${this.escape(this.searchTerm)}”. Try another word.</p>`;
                return;
            }

            panel.innerHTML = `
                <p class="assist-result-count">${matches.length} result${matches.length === 1 ? '' : 's'}</p>
                <div class="phrase-list">
                    ${matches.map(p => this.phraseCard(p, true)).join('')}
                </div>
            `;
            this.attachPhraseActions(panel);
            return;
        }

        if (this.activeCategory === 'etiquette') {
            panel.innerHTML = this.renderTipGrid(this.data.etiquette, 'Respectful things to do in Germany');
            return;
        }

        if (this.activeCategory === 'gifts') {
            panel.innerHTML = this.renderTipGrid(this.data.gifts, 'Gift ideas for your team', true);
            return;
        }

        const cat = this.data.categories.find(c => c.id === this.activeCategory);
        if (!cat) return;

        panel.innerHTML = `
            ${cat.blurb ? `<p class="assist-blurb">${cat.blurb}</p>` : ''}
            <div class="phrase-list">
                ${cat.phrases.map(p => this.phraseCard(p, false)).join('')}
            </div>
        `;
        this.attachPhraseActions(panel);
    }

    renderTipGrid(items, heading, isGift = false) {
        return `
            <h3 class="assist-section-heading">${heading}</h3>
            <div class="tip-grid">
                ${items.map(item => `
                    <div class="tip-card ${isGift ? 'gift-card' : ''}">
                        <div class="tip-icon">${item.icon}</div>
                        <div class="tip-body">
                            <h4 class="tip-title">${item.title}</h4>
                            <p class="tip-text">${item.note || item.tip}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    phraseCard(p, showCat) {
        return `
            <div class="phrase-card" data-de="${this.escape(p.de)}">
                <div class="phrase-main">
                    <div class="phrase-text">
                        ${showCat ? `<span class="phrase-cat">${p._icon} ${this.escape(p._cat)}</span>` : ''}
                        <div class="phrase-de">${this.escape(p.de)}</div>
                        <div class="phrase-en">${this.escape(p.en)}</div>
                        ${p.pron ? `<div class="phrase-pron">🗣️ ${this.escape(p.pron)}</div>` : ''}
                        ${p.note ? `<div class="phrase-note">💡 ${this.escape(p.note)}</div>` : ''}
                    </div>
                    <button class="phrase-speak" aria-label="Hear pronunciation" title="Hear pronunciation">
                        <span class="phrase-speak-icon">🔊</span>
                    </button>
                </div>
            </div>
        `;
    }

    attachPhraseActions(panel) {
        panel.querySelectorAll('.phrase-card').forEach(card => {
            const speak = () => {
                const text = card.dataset.de;
                const btn = card.querySelector('.phrase-speak');
                if (window.soundManager?.speakWithFeedback) {
                    window.soundManager.speakWithFeedback(text, btn);
                } else if (window.soundManager?.speakGerman) {
                    window.soundManager.speakGerman(text);
                }
            };
            // Tap anywhere on the card (but not when selecting text) to hear it
            card.querySelector('.phrase-speak')?.addEventListener('click', (e) => {
                e.stopPropagation();
                speak();
            });
            card.addEventListener('click', () => speak());
        });
    }

    escape(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }
}

// Initialize
window.phrasebookManager = new PhrasebookManager();
