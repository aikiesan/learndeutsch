/**
 * Think in German — Pattern / Substitution Drills
 * A fixed sentence frame is held constant while one slot is substituted.
 * This builds automaticity with everyday "chunks" so you stop translating
 * word-by-word and start thinking in German.
 *
 * Renders into the #writing-exercise container (same as the quiz engine).
 */
class PatternDrill {
    constructor() {
        this.data = null;
        this.session = null;
        this.loadData();
    }

    async loadData() {
        try {
            const response = await fetch('data/patterns.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.data = await response.json();
        } catch (error) {
            console.error('Failed to load pattern data:', error);
        }
    }

    /** Entry point — called from the dashboard card. */
    start() {
        if (!this.data) {
            setTimeout(() => this.start(), 200);
            return;
        }

        // Build a session: every pattern, slots shuffled within each.
        const patterns = this.shuffle([...this.data.patterns]).map(p => ({
            ...p,
            slots: this.shuffle([...p.slots])
        }));

        this.session = {
            patterns,
            patternIndex: 0,
            slotIndex: 0,
            correct: 0,
            total: 0,
            phase: 'intro' // 'intro' -> 'drill'
        };

        this.renderIntro();
    }

    get currentPattern() {
        return this.session.patterns[this.session.patternIndex];
    }

    container() {
        return document.getElementById('writing-exercise');
    }

    assemble(frame, slotText) {
        return frame.replace('{x}', slotText);
    }

    /** Show the frame so the learner internalises it before substituting. */
    renderIntro() {
        const container = this.container();
        if (!container) return;
        const p = this.currentPattern;
        const model = p.slots[0];
        const modelSentence = this.assemble(p.frame_de, model.de);
        const framePretty = p.frame_de.replace('{x}', '<span class="pd-slot">___</span>');

        container.innerHTML = `
            <div class="pd-container">
                <div class="pd-progress">Pattern ${this.session.patternIndex + 1} of ${this.session.patterns.length}</div>
                <div class="pd-intro-icon">${p.icon}</div>
                <h2 class="pd-intro-name">${this.escape(p.name)}</h2>
                <div class="pd-frame">${framePretty}</div>
                <div class="pd-frame-en">${this.escape(p.frame_en.replace('{x}', '___'))}</div>
                ${p.tip ? `<p class="pd-tip">💡 ${this.escape(p.tip)}</p>` : ''}

                <div class="pd-model" id="pd-model">
                    <div class="pd-model-label">For example:</div>
                    <div class="pd-model-de">${this.escape(modelSentence)}</div>
                    <div class="pd-model-en">${this.escape(this.assemble(p.frame_en, model.en))}</div>
                    <button class="pd-speak" id="pd-model-speak">🔊 Hear it</button>
                </div>

                <button class="btn btn-primary btn-playful pd-start" id="pd-start-drill">Start drill →</button>
            </div>
        `;

        // Auto-speak the model once, and on demand
        this.speak(modelSentence);
        document.getElementById('pd-model-speak')?.addEventListener('click', () => this.speak(modelSentence));
        document.getElementById('pd-start-drill')?.addEventListener('click', () => {
            window.soundManager?.play('click');
            this.session.phase = 'drill';
            this.session.slotIndex = 0;
            this.renderDrill();
        });
    }

    /** One substitution round: cue in English, tap the right German chunk. */
    renderDrill() {
        const container = this.container();
        if (!container) return;
        const p = this.currentPattern;

        if (this.session.slotIndex >= p.slots.length) {
            this.nextPattern();
            return;
        }

        const slot = p.slots[this.session.slotIndex];
        const cueEn = this.assemble(p.frame_en, slot.en);
        const framePretty = p.frame_de.replace('{x}', '<span class="pd-slot">…</span>');

        // 3 options: the correct slot + 2 distractors from the same frame
        const distractors = this.shuffle(p.slots.filter(s => s.de !== slot.de)).slice(0, 2);
        const options = this.shuffle([slot, ...distractors]);

        container.innerHTML = `
            <div class="pd-container">
                <div class="pd-progress">
                    <span>${p.icon} ${this.escape(p.name)}</span>
                    <span>${this.session.slotIndex + 1}/${p.slots.length}</span>
                </div>

                <div class="pd-frame pd-frame-sm">${framePretty}</div>

                <div class="pd-cue-label">Say in German:</div>
                <div class="pd-cue">“${this.escape(cueEn)}”</div>

                <div class="pd-options" id="pd-options">
                    ${options.map(o => `
                        <button class="pd-option" data-de="${this.escape(o.de)}">${this.escape(o.de)}</button>
                    `).join('')}
                </div>

                <div class="pd-feedback hidden" id="pd-feedback"></div>
            </div>
        `;

        const optionsEl = document.getElementById('pd-options');
        optionsEl.querySelectorAll('.pd-option').forEach(btn => {
            btn.addEventListener('click', () => this.handleAnswer(btn, slot));
        });
    }

    handleAnswer(btn, slot) {
        const p = this.currentPattern;
        const chosen = btn.dataset.de;
        const isCorrect = chosen === slot.de;
        const fullSentence = this.assemble(p.frame_de, slot.de);
        this.session.total++;

        // Lock options and mark correct/wrong
        document.querySelectorAll('.pd-option').forEach(b => {
            b.classList.add('locked');
            if (b.dataset.de === slot.de) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
        });

        if (isCorrect) {
            this.session.correct++;
            window.soundManager?.play('correct');
        } else {
            window.soundManager?.play('wrong');
        }

        // Always speak the correct full sentence — production + audio reinforcement
        this.speak(fullSentence);

        const feedback = document.getElementById('pd-feedback');
        feedback.classList.remove('hidden');
        feedback.classList.add(isCorrect ? 'pd-ok' : 'pd-no');
        feedback.innerHTML = `
            <div class="pd-full-de">${this.escape(fullSentence)}</div>
            <div class="pd-full-en">${this.escape(this.assemble(p.frame_en, slot.en))}</div>
            <div class="pd-say-again">🗣️ Say it out loud, then continue</div>
            <button class="btn btn-primary btn-playful pd-next" id="pd-next">${isCorrect ? 'Next →' : 'Got it →'}</button>
        `;
        document.getElementById('pd-next')?.addEventListener('click', () => {
            window.soundManager?.play('click');
            this.session.slotIndex++;
            this.renderDrill();
        });
    }

    nextPattern() {
        this.session.patternIndex++;
        if (this.session.patternIndex >= this.session.patterns.length) {
            this.finish();
            return;
        }
        this.session.phase = 'intro';
        this.renderIntro();
    }

    finish() {
        const container = this.container();
        if (!container) return;
        const { correct, total } = this.session;
        const accuracy = total ? Math.round((correct / total) * 100) : 0;
        const xp = correct * 6;

        window.gamificationSystem?.addXP(xp);
        if (accuracy >= 80) window.interactiveExercises?.createConfetti?.(60);
        window.gamificationSystem?.updateUI?.();

        container.innerHTML = `
            <div class="pd-container pd-finish">
                <div class="pd-intro-icon">${accuracy >= 80 ? '🎉' : '💪'}</div>
                <h2 class="pd-intro-name">${accuracy >= 80 ? 'Sehr gut!' : 'Gut gemacht!'}</h2>
                <p class="pd-tip">You drilled ${this.session.patterns.length} everyday patterns. Repetition is what makes them automatic — come back daily.</p>
                <div class="pd-stats">
                    <div><div class="pd-stat-num">${accuracy}%</div><div class="pd-stat-lbl">Accuracy</div></div>
                    <div><div class="pd-stat-num">${correct}/${total}</div><div class="pd-stat-lbl">Correct</div></div>
                    <div><div class="pd-stat-num" style="color:var(--xp-color,#E8A87C)">+${xp}</div><div class="pd-stat-lbl">XP</div></div>
                </div>
                <button class="btn btn-primary btn-playful" id="pd-again">Drill again</button>
                <button class="btn btn-outline" id="pd-home">Back home</button>
            </div>
        `;
        document.getElementById('pd-again')?.addEventListener('click', () => this.start());
        document.getElementById('pd-home')?.addEventListener('click', () => {
            window.learnDeutschApp?.navigateToSection('dashboard');
        });
    }

    speak(text) {
        if (window.soundManager?.speakGerman) window.soundManager.speakGerman(text);
    }

    shuffle(arr) {
        return window.utils?.shuffleArray ? window.utils.shuffleArray(arr) : arr.sort(() => Math.random() - 0.5);
    }

    escape(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }
}

window.patternDrill = new PatternDrill();
