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
                <button class="btn-cheatsheet" id="assist-cheatsheet-btn">
                    📄 Day-One Cheat Sheet <span class="btn-cheatsheet-hint">· print or save offline</span>
                </button>
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
                ${this.data.guides ? Object.entries(this.data.guides).map(([key, g]) => `
                    <button class="assist-tab assist-tab-guide ${this.activeCategory === key ? 'active' : ''}" data-category="${key}">
                        <span class="assist-tab-icon">${g.icon}</span>
                        <span class="assist-tab-name">${g.name}</span>
                    </button>
                `).join('') : ''}
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

        document.getElementById('assist-cheatsheet-btn')?.addEventListener('click', () => {
            window.soundManager?.play('whoosh');
            this.openCheatSheet();
        });
    }

    /** The essentials you'll want on day one — works offline and prints cleanly. */
    cheatSheetGroups() {
        return [
            {
                heading: 'First Hellos & Your Introduction',
                items: [
                    'Guten Tag!',
                    'Freut mich, Sie kennenzulernen.',
                    'Ich bin der neue Kollege aus Brasilien.',
                    'Ich arbeite im Bereich Biomasse und Biotechnologie.',
                    'Ich lerne noch Deutsch.',
                    'Sprechen Sie Englisch?',
                    'Vielen Dank für Ihre Hilfe.',
                    'Auf Wiedersehen!'
                ]
            },
            {
                heading: 'Giving Your Gift 🥜',
                items: [
                    'Ich habe Ihnen etwas aus Brasilien mitgebracht.',
                    'Das ist eine typisch brasilianische Süßigkeit.',
                    'Sie wird aus Erdnüssen gemacht.',
                    'Ich hoffe, sie schmeckt Ihnen.'
                ]
            },
            {
                heading: 'Getting By',
                items: [
                    'Wo finde ich das Labor / die Toilette / die Kantine?',
                    'Wie komme ich zum DBFZ?',
                    'Eine Fahrkarte, bitte.',
                    'Zahlen, bitte.',
                    'Können Sie mir helfen?',
                    'Es ist ein Notfall.'
                ]
            }
        ];
    }

    findPhrase(de) {
        return this.allPhrases().find(p => p.de === de) || { de, en: '', pron: '' };
    }

    openCheatSheet() {
        // Remove any existing overlay first
        document.getElementById('cheatsheet-overlay')?.remove();

        const groupsHtml = this.cheatSheetGroups().map(group => `
            <div class="cs-group">
                <h3 class="cs-group-heading">${this.escape(group.heading)}</h3>
                ${group.items.map(de => {
                    const p = this.findPhrase(de);
                    return `
                        <div class="cs-row">
                            <div class="cs-de">${this.escape(p.de)}</div>
                            <div class="cs-en">${this.escape(p.en)}</div>
                            ${p.pron ? `<div class="cs-pron">🗣️ ${this.escape(p.pron)}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `).join('');

        const overlay = document.createElement('div');
        overlay.className = 'cheatsheet-overlay';
        overlay.id = 'cheatsheet-overlay';
        overlay.innerHTML = `
            <div class="cheatsheet-print">
                <div class="cs-actions">
                    <button class="btn btn-outline" id="cs-close">← Back</button>
                    <button class="btn btn-primary" id="cs-print">🖨️ Print / Save PDF</button>
                </div>
                <div class="cs-paper">
                    <h2 class="cs-title">🇩🇪 Day-One Cheat Sheet</h2>
                    <p class="cs-sub">My first day at DBFZ Leipzig · keep on your phone</p>
                    ${groupsHtml}
                    <div class="cs-group cs-numbers">
                        <h3 class="cs-group-heading">Emergency Numbers</h3>
                        <div class="cs-row"><div class="cs-de">112</div><div class="cs-en">Ambulance &amp; Fire</div></div>
                        <div class="cs-row"><div class="cs-de">110</div><div class="cs-en">Police</div></div>
                    </div>
                    <p class="cs-footer">Tip: at a toast say “Prost!” with eye contact · carry cash · be 5 min early.</p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        document.body.classList.add('cheatsheet-open');

        document.getElementById('cs-close')?.addEventListener('click', () => this.closeCheatSheet());
        document.getElementById('cs-print')?.addEventListener('click', () => window.print());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeCheatSheet();
        });
    }

    closeCheatSheet() {
        document.getElementById('cheatsheet-overlay')?.remove();
        document.body.classList.remove('cheatsheet-open');
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

        if (this.data.guides && this.data.guides[this.activeCategory]) {
            panel.innerHTML = this.renderGuide(this.data.guides[this.activeCategory]);
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

    renderGuide(guide) {
        return `
            ${guide.intro ? `<p class="assist-blurb">${this.escape(guide.intro)}</p>` : ''}
            ${guide.groups.map(group => `
                <h3 class="assist-section-heading">${this.escape(group.heading)}</h3>
                <div class="tip-grid">
                    ${group.items.map(item => `
                        <div class="tip-card">
                            <div class="tip-icon">${item.icon}</div>
                            <div class="tip-body">
                                <h4 class="tip-title">${this.escape(item.title)}</h4>
                                <p class="tip-text">${this.escape(item.note)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        `;
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
