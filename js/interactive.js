// Interactive Exercises - Quiz, Typing, Challenge Modes

class InteractiveExercises {
    constructor() {
        this.currentQuiz = null;
        this.currentTyping = null;
        this.streakCount = 0;
        this.currentLevel = 'A1';

        // Session timer
        this.sessionStartTime = Date.now();
        this.sessionTimerInterval = null;

        // Bonus tracking
        this.bonuses = {
            speed: { threshold: 3000, xp: 5, name: 'Speed Bonus' },
            streak: { thresholds: [3, 5, 10], xp: [10, 25, 50], name: 'Streak Bonus' },
            accuracy: { threshold: 100, xp: 30, name: 'Perfect Score' },
            completion: { xp: 20, name: 'Completion Bonus' },
            combo: { threshold: 2, xp: 15, name: 'Combo Bonus' }
        };
        this.exerciseTypesCompleted = new Set();

        this.init();
    }

    init() {
        // Wait for vocabulary manager to load
        this.waitForVocabulary();
        // Start session timer
        this.startSessionTimer();
        // Setup challenge mode listeners
        this.setupChallengeModeListeners();
        // Setup level selector
        this.setupLevelSelector();
    }

    waitForVocabulary() {
        if (window.vocabularyManager && window.vocabularyManager.vocabularyData) {
            console.log('Interactive exercises initialized');
        } else {
            setTimeout(() => this.waitForVocabulary(), 100);
        }
    }

    // ==================== SESSION TIMER ====================
    startSessionTimer() {
        this.sessionStartTime = Date.now();
        this.updateSessionTimerDisplay();

        this.sessionTimerInterval = setInterval(() => {
            this.updateSessionTimerDisplay();
        }, 1000);
    }

    updateSessionTimerDisplay() {
        const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;

        let display;
        if (hours > 0) {
            display = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        const timerEl = document.getElementById('session-timer');
        if (timerEl) {
            timerEl.textContent = display;
        }
    }

    // ==================== LEVEL SELECTOR ====================
    setupLevelSelector() {
        document.addEventListener('click', (e) => {
            const levelBtn = e.target.closest('.level-btn');
            if (levelBtn) {
                const level = levelBtn.dataset.level;
                this.setLevel(level);
            }
        });
    }

    setLevel(level) {
        this.currentLevel = level;

        // Update UI
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });

        // Update vocabulary manager level
        if (window.vocabularyManager) {
            window.vocabularyManager.setLevel(level);
        }

        // Update category grid based on level
        this.updateCategoryGrid(level);
    }

    updateCategoryGrid(level) {
        const grid = document.getElementById('category-grid');
        if (!grid) return;

        // A2 has different/additional categories
        const a2Categories = `
            <button class="category-pill" data-category="travel">
                <span>✈️</span> Travel
            </button>
            <button class="category-pill" data-category="work">
                <span>💼</span> Work
            </button>
            <button class="category-pill" data-category="city">
                <span>🏙️</span> City Life
            </button>
            <button class="category-pill" data-category="transport">
                <span>🚇</span> Transport
            </button>
            <button class="category-pill" data-category="health">
                <span>🏥</span> Health
            </button>
            <button class="category-pill" data-category="shopping">
                <span>🛒</span> Shopping
            </button>
            <button class="category-pill" data-category="restaurant">
                <span>🍽️</span> Restaurant
            </button>
            <button class="category-pill" data-category="accommodation">
                <span>🏨</span> Accommodation
            </button>
            <button class="category-pill active" data-category="all">
                <span>📖</span> All Words
            </button>
        `;

        const a1Categories = `
            <button class="category-pill" data-category="greetings">
                <span>👋</span> Greetings
            </button>
            <button class="category-pill" data-category="numbers">
                <span>🔢</span> Numbers
            </button>
            <button class="category-pill" data-category="colors">
                <span>🎨</span> Colors
            </button>
            <button class="category-pill" data-category="family">
                <span>👨‍👩‍👧</span> Family
            </button>
            <button class="category-pill" data-category="food">
                <span>🍎</span> Food
            </button>
            <button class="category-pill" data-category="verbs">
                <span>🏃</span> Verbs
            </button>
            <button class="category-pill active" data-category="all">
                <span>📖</span> All Words
            </button>
        `;

        grid.innerHTML = level === 'A2' ? a2Categories : a1Categories;
    }

    // ==================== CHALLENGE MODE LISTENERS ====================
    setupChallengeModeListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#timed-challenge')) {
                this.startTimedChallenge();
            } else if (e.target.closest('#survival-mode')) {
                this.startSurvivalMode();
            } else if (e.target.closest('#reverse-quiz')) {
                this.startReverseQuiz();
            }
        });
    }

    // ==================== BONUS SYSTEM ====================
    showBonusPopup(bonusType, amount, icon = '🎁') {
        const popup = document.createElement('div');
        popup.className = 'bonus-popup';
        popup.innerHTML = `
            <div class="bonus-icon">${icon}</div>
            <div class="bonus-title">${bonusType}</div>
            <div class="bonus-amount">+${amount} XP</div>
        `;
        document.body.appendChild(popup);

        window.soundManager?.play('celebration');

        setTimeout(() => {
            popup.style.animation = 'bonusPopOut 0.3s ease-out forwards';
            setTimeout(() => popup.remove(), 300);
        }, 1500);
    }

    calculateBonuses(quizResult) {
        const bonuses = [];

        // Speed bonus (if answered quickly)
        if (quizResult.avgTimePerQuestion && quizResult.avgTimePerQuestion < this.bonuses.speed.threshold) {
            bonuses.push({ type: 'speed', xp: this.bonuses.speed.xp, icon: '⚡' });
        }

        // Streak bonus
        if (this.streakCount >= 10) {
            bonuses.push({ type: 'streak', xp: this.bonuses.streak.xp[2], icon: '🔥' });
        } else if (this.streakCount >= 5) {
            bonuses.push({ type: 'streak', xp: this.bonuses.streak.xp[1], icon: '🔥' });
        } else if (this.streakCount >= 3) {
            bonuses.push({ type: 'streak', xp: this.bonuses.streak.xp[0], icon: '🔥' });
        }

        // Accuracy bonus (perfect score)
        if (quizResult.accuracy === 100) {
            bonuses.push({ type: 'accuracy', xp: this.bonuses.accuracy.xp, icon: '💯' });
        }

        // Completion bonus
        bonuses.push({ type: 'completion', xp: this.bonuses.completion.xp, icon: '✅' });

        // Combo bonus (multiple exercise types in session)
        this.exerciseTypesCompleted.add(quizResult.type);
        if (this.exerciseTypesCompleted.size >= this.bonuses.combo.threshold) {
            bonuses.push({ type: 'combo', xp: this.bonuses.combo.xp, icon: '🎯' });
        }

        return bonuses;
    }

    awardBonuses(bonuses) {
        let totalBonus = 0;
        bonuses.forEach((bonus, index) => {
            totalBonus += bonus.xp;
            setTimeout(() => {
                this.showBonusPopup(this.bonuses[bonus.type].name, bonus.xp, bonus.icon);
            }, index * 800);
        });

        if (totalBonus > 0) {
            window.gamificationSystem.addXP(totalBonus);
        }

        return totalBonus;
    }

    // ==================== CONFETTI SYSTEM ====================
    createConfetti(count = 50) {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        // Cozy pastel confetti colors
        const colors = ['#FFDAB3', '#E8D5E8', '#C8E6C9', '#B3D9E8', '#F5C6CB', '#FFD54F', '#FFAB91', '#B39DDB'];
        const shapes = ['circle', 'square', 'triangle'];

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
            container.appendChild(confetti);
        }

        setTimeout(() => container.remove(), 4000);
    }

    // ==================== XP POPUP ====================
    showXPPopup(xp, x, y) {
        const popup = document.createElement('div');
        popup.className = 'xp-popup';
        popup.textContent = `+${xp} XP`;
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
        document.body.appendChild(popup);

        setTimeout(() => popup.remove(), 1500);
    }

    // ==================== TAP-TO-ANSWER QUIZ ====================
    startQuiz(category = 'all', questionCount = 10) {
        const words = window.vocabularyManager.getWordsForStudy(category, questionCount * 2);

        if (words.length < 4) {
            alert('Not enough words available for a quiz. Please try a different category.');
            return;
        }

        this.currentQuiz = {
            words: words.slice(0, questionCount),
            allWords: window.vocabularyManager.getAllWords(),
            currentIndex: 0,
            score: 0,
            answers: [],
            startTime: Date.now(),
            category: category
        };

        this.streakCount = 0;
        this.showQuizInterface();
        this.showQuizQuestion();
    }

    showQuizInterface() {
        const container = document.getElementById('writing-exercise');
        if (!container) return;

        container.innerHTML = `
            <div class="quiz-container quiz-fullscreen">
                <div class="quiz-progress">
                    <div class="streak-counter" id="quiz-streak">
                        <span class="streak-fire">🔥</span>
                        <span class="streak-number">0</span>
                    </div>
                    <div class="progress-dots" id="progress-dots"></div>
                    <div class="quiz-score">
                        <span id="quiz-score-display">0</span> / <span id="quiz-total">${this.currentQuiz.words.length}</span>
                    </div>
                </div>

                <div class="quiz-question" id="quiz-question">
                    <!-- Question content -->
                </div>

                <div class="quiz-options quiz-grid-4" id="quiz-options">
                    <!-- Answer options - 2x2 grid on mobile -->
                </div>

                <div class="quiz-feedback hidden" id="quiz-feedback"></div>
            </div>
        `;

        // Create progress dots
        const dotsContainer = document.getElementById('progress-dots');
        for (let i = 0; i < this.currentQuiz.words.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i === 0) dot.classList.add('current');
            dotsContainer.appendChild(dot);
        }
    }

    showQuizQuestion() {
        if (this.currentQuiz.currentIndex >= this.currentQuiz.words.length) {
            this.endQuiz();
            return;
        }

        const word = this.currentQuiz.words[this.currentQuiz.currentIndex];
        const questionEl = document.getElementById('quiz-question');
        const optionsEl = document.getElementById('quiz-options');

        // Generate 3 options (1 correct + 2 wrong)
        const options = this.generateQuizOptions(word);

        questionEl.innerHTML = `
            <div class="question-emoji">${word.emoji || '📚'}</div>
            <div class="question-text">What does this mean?</div>
            <div class="question-word">${word.word}</div>
            ${word.cognate ? `<span class="cognate-badge">🔗 Similar to English</span>` : ''}
        `;

        optionsEl.innerHTML = options.map((option, index) => `
            <button class="quiz-option btn-playful" data-answer="${option}" data-index="${index}">
                <span class="option-letter">${['A', 'B', 'C', 'D'][index]}</span>
                <span class="option-text">${option}</span>
            </button>
        `).join('');

        // Play whoosh sound for new question
        window.soundManager?.play('whoosh');

        // Add click listeners
        optionsEl.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuizAnswer(e, word));
        });

        // Update progress dots
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('current');
            if (i === this.currentQuiz.currentIndex) dot.classList.add('current');
        });
    }

    generateQuizOptions(correctWord) {
        const correctAnswer = correctWord.translation;
        const allWords = this.currentQuiz.allWords;

        // Get wrong answers from same category if possible
        let wrongAnswers = allWords
            .filter(w => w.id !== correctWord.id && w.translation !== correctAnswer)
            .map(w => w.translation);

        // Shuffle and take 3 (for 4 total options)
        wrongAnswers = this.shuffleArray(wrongAnswers).slice(0, 3);

        // Combine and shuffle all 4 options
        return this.shuffleArray([correctAnswer, ...wrongAnswers]);
    }

    handleQuizAnswer(event, word) {
        const btn = event.currentTarget;
        const selectedAnswer = btn.dataset.answer;
        const isCorrect = selectedAnswer === word.translation;

        // Play select sound immediately
        window.soundManager?.play('select');

        // Disable all buttons
        document.querySelectorAll('.quiz-option').forEach(b => {
            b.classList.add('disabled');
            if (b.dataset.answer === word.translation) {
                b.classList.add('correct');
            }
        });

        if (isCorrect) {
            btn.classList.add('correct');
            this.currentQuiz.score++;
            this.streakCount++;

            // Play correct sound
            setTimeout(() => window.soundManager?.play('correct'), 100);

            // Update streak display
            const streakEl = document.getElementById('quiz-streak');
            streakEl.querySelector('.streak-number').textContent = this.streakCount;
            if (this.streakCount >= 3) {
                streakEl.classList.add('streak-milestone');
                window.soundManager?.play('streak');
                setTimeout(() => streakEl.classList.remove('streak-milestone'), 600);
            }

            // XP popup
            const rect = btn.getBoundingClientRect();
            this.showXPPopup(10, rect.left + rect.width / 2, rect.top);

            // Show mnemonic if available
            if (word.mnemonic) {
                this.showQuizFeedback(true, word.mnemonic);
            }
        } else {
            btn.classList.add('wrong');
            this.streakCount = 0;
            document.getElementById('quiz-streak').querySelector('.streak-number').textContent = 0;

            // Play wrong sound
            setTimeout(() => window.soundManager?.play('wrong'), 100);

            // Show correct answer with mnemonic
            this.showQuizFeedback(false, `${word.translation} - ${word.mnemonic || ''}`);
        }

        // Update score display
        document.getElementById('quiz-score-display').textContent = this.currentQuiz.score;

        // Update progress dot
        const dots = document.querySelectorAll('.progress-dot');
        dots[this.currentQuiz.currentIndex].classList.add(isCorrect ? 'correct' : 'wrong');

        // Record answer
        this.currentQuiz.answers.push({
            word: word,
            selected: selectedAnswer,
            correct: isCorrect
        });

        // Update word progress
        window.storageManager.addVocabularyProgress(
            word.id,
            word.category,
            word.difficulty,
            isCorrect
        );

        // Next question after delay
        setTimeout(() => {
            this.currentQuiz.currentIndex++;
            this.hideQuizFeedback();
            this.showQuizQuestion();
        }, isCorrect ? 1000 : 2000);
    }

    showQuizFeedback(isCorrect, message) {
        const feedback = document.getElementById('quiz-feedback');
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = `
            <span class="feedback-icon">${isCorrect ? '✅' : '💡'}</span>
            <span class="feedback-text">${message}</span>
        `;
        feedback.classList.remove('hidden');
    }

    hideQuizFeedback() {
        const feedback = document.getElementById('quiz-feedback');
        if (feedback) feedback.classList.add('hidden');
    }

    endQuiz() {
        const totalTime = Math.floor((Date.now() - this.currentQuiz.startTime) / 1000);
        const accuracy = Math.round((this.currentQuiz.score / this.currentQuiz.words.length) * 100);

        // Award XP
        const baseXP = this.currentQuiz.score * 10;
        const bonusXP = accuracy >= 80 ? 25 : (accuracy >= 60 ? 15 : 0);
        const totalXP = baseXP + bonusXP;

        // Record exercise completion
        window.gamificationSystem.simulateExerciseCompletion(
            'multiple_choice',
            accuracy,
            totalTime,
            this.currentQuiz.words.map(w => w.id)
        );

        // Show celebration with sounds
        if (accuracy >= 80) {
            this.createConfetti(80);
            window.soundManager?.play('celebration');
            window.soundManager?.play('levelUp');
        } else if (accuracy >= 50) {
            window.soundManager?.play('correct');
        }

        const container = document.getElementById('writing-exercise');
        container.innerHTML = `
            <div class="celebration-content" style="margin: 0 auto; max-width: 400px;">
                <div class="celebration-emoji">${accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}</div>
                <h2 class="celebration-title">${accuracy >= 80 ? 'Ausgezeichnet!' : accuracy >= 50 ? 'Gut gemacht!' : 'Keep practicing!'}</h2>
                <div class="results-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0;">
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${accuracy}%</div>
                        <div style="color: var(--text-muted);">Accuracy</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${this.currentQuiz.score}/${this.currentQuiz.words.length}</div>
                        <div style="color: var(--text-muted);">Correct</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--info);">${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}</div>
                        <div style="color: var(--text-muted);">Time</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--xp-color);">+${totalXP}</div>
                        <div style="color: var(--text-muted);">XP Earned</div>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startQuiz('${this.currentQuiz.category}', ${this.currentQuiz.words.length})">
                        Play Again
                    </button>
                    <button class="btn btn-outline" onclick="window.interactiveExercises.showExerciseSelector()">
                        Back to Exercises
                    </button>
                </div>
            </div>
        `;

        window.gamificationSystem.updateUI();
    }

    // ==================== TYPING PRACTICE ====================
    startTyping(category = 'all', wordCount = 10, difficulty = 1) {
        const allWords = window.vocabularyManager.getAllWords(category);

        // Filter by difficulty
        let words = allWords.filter(w => w.difficulty <= difficulty);
        if (words.length < 5) words = allWords;

        // Shuffle and limit
        words = this.shuffleArray(words).slice(0, wordCount);

        if (words.length === 0) {
            alert('No words available. Please try a different category.');
            return;
        }

        this.currentTyping = {
            words: words,
            currentIndex: 0,
            score: 0,
            attempts: [],
            startTime: Date.now(),
            difficulty: difficulty,
            hintsUsed: 0
        };

        this.showTypingInterface();
        this.showTypingWord();
    }

    showTypingInterface() {
        const container = document.getElementById('writing-exercise');
        if (!container) return;

        container.innerHTML = `
            <div class="typing-exercise">
                <div class="quiz-progress">
                    <div class="typing-difficulty">
                        Level: ${'⭐'.repeat(this.currentTyping.difficulty)}
                    </div>
                    <div class="progress-dots" id="typing-progress-dots"></div>
                    <div class="typing-score">
                        <span id="typing-score-display">0</span> / <span>${this.currentTyping.words.length}</span>
                    </div>
                </div>

                <div class="typing-prompt" id="typing-prompt">
                    <!-- Word prompt -->
                </div>

                <div class="typing-input-container">
                    <input type="text"
                           id="typing-input"
                           class="typing-input"
                           placeholder="Type the German word..."
                           autocomplete="off"
                           autocapitalize="off"
                           spellcheck="false">
                </div>

                <div class="typing-actions" style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                    <button class="btn btn-outline" id="typing-hint-btn">
                        💡 Hint
                    </button>
                    <button class="btn btn-primary" id="typing-check-btn">
                        Check Answer
                    </button>
                    <button class="btn btn-outline" id="typing-skip-btn">
                        Skip →
                    </button>
                </div>

                <div class="typing-feedback hidden" id="typing-feedback"></div>
            </div>
        `;

        // Create progress dots
        const dotsContainer = document.getElementById('typing-progress-dots');
        for (let i = 0; i < this.currentTyping.words.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i === 0) dot.classList.add('current');
            dotsContainer.appendChild(dot);
        }

        // Event listeners
        document.getElementById('typing-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkTypingAnswer();
        });
        document.getElementById('typing-input').addEventListener('input', (e) => {
            this.handleTypingInput(e.target.value);
        });
        document.getElementById('typing-hint-btn').addEventListener('click', () => this.showTypingHint());
        document.getElementById('typing-check-btn').addEventListener('click', () => this.checkTypingAnswer());
        document.getElementById('typing-skip-btn').addEventListener('click', () => this.skipTypingWord());
    }

    showTypingWord() {
        if (this.currentTyping.currentIndex >= this.currentTyping.words.length) {
            this.endTyping();
            return;
        }

        const word = this.currentTyping.words[this.currentTyping.currentIndex];
        const promptEl = document.getElementById('typing-prompt');

        promptEl.innerHTML = `
            <div class="prompt-emoji">${word.emoji || '📝'}</div>
            <div class="prompt-label">Type in German:</div>
            <div class="prompt-word">${word.translation}</div>
            ${word.cognate ? `<div class="cognate-badge" style="margin-top: 0.5rem;">🔗 ${word.cognateNote || 'Similar to English'}</div>` : ''}
        `;

        // Reset input
        const input = document.getElementById('typing-input');
        input.value = '';
        input.className = 'typing-input';
        input.focus();

        // Update progress
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('current');
            if (i === this.currentTyping.currentIndex) dot.classList.add('current');
        });

        // Hide feedback
        document.getElementById('typing-feedback').classList.add('hidden');
    }

    handleTypingInput(value) {
        const word = this.currentTyping.words[this.currentTyping.currentIndex];
        const correct = word.word.toLowerCase().replace(/^(der|die|das)\s+/i, '');
        const input = document.getElementById('typing-input');
        const userInput = value.toLowerCase().trim();

        // Real-time feedback
        if (userInput.length > 0) {
            if (correct.startsWith(userInput)) {
                input.className = 'typing-input almost-correct';
            } else if (this.calculateSimilarity(userInput, correct) > 0.5) {
                input.className = 'typing-input almost-correct';
            } else {
                input.className = 'typing-input';
            }
        } else {
            input.className = 'typing-input';
        }
    }

    checkTypingAnswer() {
        const word = this.currentTyping.words[this.currentTyping.currentIndex];
        const input = document.getElementById('typing-input');
        const userAnswer = input.value.trim().toLowerCase();

        // Remove article from correct answer for comparison
        const correctFull = word.word.toLowerCase();
        const correctNoArticle = correctFull.replace(/^(der|die|das)\s+/i, '');

        const similarity = Math.max(
            this.calculateSimilarity(userAnswer, correctFull),
            this.calculateSimilarity(userAnswer, correctNoArticle)
        );

        const isCorrect = similarity >= 0.9;
        const isAlmostCorrect = similarity >= 0.7;

        // Update UI
        if (isCorrect) {
            input.className = 'typing-input correct';
            this.currentTyping.score++;
            document.getElementById('typing-score-display').textContent = this.currentTyping.score;

            // Play correct sound
            window.soundManager?.play('correct');

            // Show success feedback
            this.showTypingFeedback(true, `✅ Correct! ${word.mnemonic || ''}`);

            // XP popup
            const rect = input.getBoundingClientRect();
            this.showXPPopup(12, rect.left + rect.width / 2, rect.top);

            // Update progress dot
            const dots = document.querySelectorAll('.progress-dot');
            dots[this.currentTyping.currentIndex].classList.add('correct');

            // Record progress
            window.storageManager.addVocabularyProgress(word.id, word.category, word.difficulty, true);

            // Next word
            setTimeout(() => {
                this.currentTyping.currentIndex++;
                this.showTypingWord();
            }, 1500);

        } else if (isAlmostCorrect) {
            input.className = 'typing-input almost-correct';
            window.soundManager?.play('pop');
            this.showTypingFeedback(false, `Almost! The answer is: ${word.word}`, 'hint');

            // Let them try again or continue
            setTimeout(() => {
                input.className = 'typing-input';
            }, 2000);

        } else {
            input.className = 'typing-input incorrect';
            window.soundManager?.play('wrong');
            this.showTypingFeedback(false, `The correct answer is: ${word.word}`);

            // Update progress dot
            const dots = document.querySelectorAll('.progress-dot');
            dots[this.currentTyping.currentIndex].classList.add('wrong');

            // Record progress
            window.storageManager.addVocabularyProgress(word.id, word.category, word.difficulty, false);

            // Next word
            setTimeout(() => {
                this.currentTyping.currentIndex++;
                this.showTypingWord();
            }, 2500);
        }

        this.currentTyping.attempts.push({
            word: word,
            userAnswer: userAnswer,
            correct: isCorrect
        });
    }

    showTypingHint() {
        const word = this.currentTyping.words[this.currentTyping.currentIndex];
        const correct = word.word;
        this.currentTyping.hintsUsed++;

        // Progressive hints
        let hint = '';
        if (this.currentTyping.hintsUsed === 1) {
            hint = `First letter: "${correct[0].toUpperCase()}"`;
        } else if (this.currentTyping.hintsUsed === 2) {
            hint = `Starts with: "${correct.substring(0, 3)}..."`;
        } else {
            hint = `Answer: "${correct}"`;
        }

        if (word.mnemonic) {
            hint += ` (Memory tip: ${word.mnemonic})`;
        }

        this.showTypingFeedback(false, hint, 'hint');
    }

    skipTypingWord() {
        const word = this.currentTyping.words[this.currentTyping.currentIndex];

        // Mark as wrong
        const dots = document.querySelectorAll('.progress-dot');
        dots[this.currentTyping.currentIndex].classList.add('wrong');

        this.currentTyping.attempts.push({
            word: word,
            userAnswer: '',
            correct: false,
            skipped: true
        });

        this.currentTyping.currentIndex++;
        this.showTypingWord();
    }

    showTypingFeedback(isCorrect, message, type = null) {
        const feedback = document.getElementById('typing-feedback');
        feedback.className = `typing-feedback ${type || (isCorrect ? 'correct' : 'incorrect')}`;
        feedback.innerHTML = message;
        feedback.classList.remove('hidden');
    }

    endTyping() {
        const totalTime = Math.floor((Date.now() - this.currentTyping.startTime) / 1000);
        const accuracy = Math.round((this.currentTyping.score / this.currentTyping.words.length) * 100);

        // Award XP
        const baseXP = this.currentTyping.score * 12;
        const bonusXP = accuracy >= 80 ? 25 : (accuracy >= 60 ? 15 : 0);
        const totalXP = baseXP + bonusXP;

        // Record exercise
        window.gamificationSystem.simulateExerciseCompletion(
            'typing',
            accuracy,
            totalTime,
            this.currentTyping.words.map(w => w.id)
        );

        if (accuracy >= 80) {
            this.createConfetti(60);
        }

        const container = document.getElementById('writing-exercise');
        container.innerHTML = `
            <div class="celebration-content" style="margin: 0 auto; max-width: 400px;">
                <div class="celebration-emoji">${accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}</div>
                <h2 class="celebration-title">${accuracy >= 80 ? 'Excellent typing!' : accuracy >= 50 ? 'Good effort!' : 'Keep practicing!'}</h2>
                <div class="results-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0;">
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${accuracy}%</div>
                        <div style="color: var(--text-muted);">Accuracy</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${this.currentTyping.score}/${this.currentTyping.words.length}</div>
                        <div style="color: var(--text-muted);">Correct</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--info);">${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}</div>
                        <div style="color: var(--text-muted);">Time</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--xp-color);">+${totalXP}</div>
                        <div style="color: var(--text-muted);">XP Earned</div>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem;">
                    <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startTyping('all', 10, ${Math.min(3, this.currentTyping.difficulty + (accuracy >= 80 ? 1 : 0))})">
                        ${accuracy >= 80 ? 'Next Level' : 'Try Again'}
                    </button>
                    <button class="btn btn-outline" onclick="window.interactiveExercises.showExerciseSelector()">
                        Back to Exercises
                    </button>
                </div>
            </div>
        `;

        window.gamificationSystem.updateUI();
    }

    // ==================== TIMED CHALLENGE MODE ====================
    startTimedChallenge(category = 'all', questionCount = 10, timeLimit = 60) {
        const words = window.vocabularyManager.getWordsForStudy(category, questionCount * 2);

        if (words.length < 4) {
            alert('Not enough words available. Please try a different category.');
            return;
        }

        // Navigate to practice section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('practice')?.classList.add('active');

        this.currentQuiz = {
            words: words.slice(0, questionCount),
            allWords: window.vocabularyManager.getAllWords(),
            currentIndex: 0,
            score: 0,
            answers: [],
            startTime: Date.now(),
            category: category,
            mode: 'timed',
            timeLimit: timeLimit,
            questionStartTime: Date.now()
        };

        this.streakCount = 0;
        this.showTimedQuizInterface();
        this.startTimedCountdown();
        this.showQuizQuestion();
    }

    showTimedQuizInterface() {
        const container = document.getElementById('writing-exercise');
        if (!container) return;

        container.innerHTML = `
            <div class="quiz-container quiz-fullscreen">
                <div class="quiz-progress">
                    <div class="streak-counter" id="quiz-streak">
                        <span class="streak-fire">🔥</span>
                        <span class="streak-number">0</span>
                    </div>
                    <div class="progress-dots" id="progress-dots"></div>
                    <div class="quiz-score">
                        <span id="quiz-score-display">0</span> / <span id="quiz-total">${this.currentQuiz.words.length}</span>
                    </div>
                </div>

                <div class="quiz-question" id="quiz-question">
                    <!-- Question content -->
                </div>

                <div class="quiz-options quiz-grid-4" id="quiz-options">
                    <!-- Answer options -->
                </div>

                <div class="quiz-feedback hidden" id="quiz-feedback"></div>
            </div>
        `;

        // Add timed overlay
        const timedOverlay = document.createElement('div');
        timedOverlay.className = 'timed-overlay';
        timedOverlay.id = 'timed-overlay';
        timedOverlay.textContent = this.currentQuiz.timeLimit;
        document.body.appendChild(timedOverlay);

        // Create progress dots
        const dotsContainer = document.getElementById('progress-dots');
        for (let i = 0; i < this.currentQuiz.words.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i === 0) dot.classList.add('current');
            dotsContainer.appendChild(dot);
        }
    }

    startTimedCountdown() {
        const overlay = document.getElementById('timed-overlay');
        let remaining = this.currentQuiz.timeLimit;

        this.timedInterval = setInterval(() => {
            remaining--;
            if (overlay) {
                overlay.textContent = remaining;
                if (remaining <= 10) {
                    overlay.classList.add('warning');
                }
            }

            if (remaining <= 0) {
                clearInterval(this.timedInterval);
                this.endTimedChallenge();
            }
        }, 1000);
    }

    endTimedChallenge() {
        clearInterval(this.timedInterval);
        document.getElementById('timed-overlay')?.remove();

        const totalTime = Math.floor((Date.now() - this.currentQuiz.startTime) / 1000);
        const accuracy = Math.round((this.currentQuiz.score / this.currentQuiz.words.length) * 100);

        // Calculate bonuses
        const bonuses = this.calculateBonuses({
            type: 'timed_challenge',
            accuracy: accuracy,
            avgTimePerQuestion: totalTime / this.currentQuiz.currentIndex
        });

        const baseXP = this.currentQuiz.score * 12; // Higher XP for timed
        const bonusXP = this.awardBonuses(bonuses);
        const totalXP = baseXP + bonusXP;

        window.gamificationSystem.simulateExerciseCompletion(
            'timed_challenge',
            accuracy,
            totalTime,
            this.currentQuiz.words.map(w => w.id)
        );

        if (accuracy >= 80) {
            this.createConfetti(80);
            window.soundManager?.play('celebration');
        }

        const container = document.getElementById('writing-exercise');
        container.innerHTML = `
            <div class="celebration-content" style="margin: 0 auto; max-width: 400px;">
                <div class="celebration-emoji">${accuracy >= 80 ? '⏱️🎉' : accuracy >= 50 ? '⏱️👍' : '⏱️💪'}</div>
                <h2 class="celebration-title">Timed Challenge ${accuracy >= 80 ? 'Complete!' : 'Over!'}</h2>
                <div class="results-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0;">
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${accuracy}%</div>
                        <div style="color: var(--text-muted);">Accuracy</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${this.currentQuiz.score}/${this.currentQuiz.words.length}</div>
                        <div style="color: var(--text-muted);">Correct</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--info);">${totalTime}s</div>
                        <div style="color: var(--text-muted);">Time Used</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--xp-color);">+${baseXP}</div>
                        <div style="color: var(--text-muted);">XP Earned</div>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startTimedChallenge()">
                        Try Again
                    </button>
                    <button class="btn btn-outline" onclick="window.interactiveExercises.showExerciseSelector()">
                        Back
                    </button>
                </div>
            </div>
        `;

        window.gamificationSystem.updateUI();
    }

    // ==================== SURVIVAL MODE ====================
    startSurvivalMode(category = 'all') {
        const words = window.vocabularyManager.getAllWords(category);

        if (words.length < 4) {
            alert('Not enough words available. Please try a different category.');
            return;
        }

        // Navigate to practice section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('practice')?.classList.add('active');

        this.currentQuiz = {
            words: this.shuffleArray([...words]),
            allWords: words,
            currentIndex: 0,
            score: 0,
            answers: [],
            startTime: Date.now(),
            category: category,
            mode: 'survival',
            lives: 3,
            maxLives: 3,
            questionStartTime: Date.now()
        };

        this.streakCount = 0;
        this.showSurvivalInterface();
        this.showSurvivalQuestion();
    }

    showSurvivalInterface() {
        const container = document.getElementById('writing-exercise');
        if (!container) return;

        container.innerHTML = `
            <div class="quiz-container quiz-fullscreen">
                <div class="quiz-progress">
                    <div class="lives-display" id="lives-display">
                        ${'<span class="life-heart">❤️</span>'.repeat(this.currentQuiz.maxLives)}
                    </div>
                    <div class="streak-counter" id="quiz-streak">
                        <span class="streak-fire">🔥</span>
                        <span class="streak-number">0</span>
                    </div>
                    <div class="quiz-score">
                        Score: <span id="quiz-score-display">0</span>
                    </div>
                </div>

                <div class="quiz-question" id="quiz-question">
                    <!-- Question content -->
                </div>

                <div class="quiz-options quiz-grid-4" id="quiz-options">
                    <!-- Answer options -->
                </div>

                <div class="quiz-feedback hidden" id="quiz-feedback"></div>
            </div>
        `;
    }

    showSurvivalQuestion() {
        if (this.currentQuiz.lives <= 0 || this.currentQuiz.currentIndex >= this.currentQuiz.words.length) {
            this.endSurvivalMode();
            return;
        }

        const word = this.currentQuiz.words[this.currentQuiz.currentIndex];
        const questionEl = document.getElementById('quiz-question');
        const optionsEl = document.getElementById('quiz-options');

        const options = this.generateQuizOptions(word);

        questionEl.innerHTML = `
            <div class="question-emoji">${word.emoji || '📚'}</div>
            <div class="question-text">What does this mean?</div>
            <div class="question-word">${word.word}</div>
        `;

        optionsEl.innerHTML = options.map((option, index) => `
            <button class="quiz-option btn-playful" data-answer="${option}" data-index="${index}">
                <span class="option-letter">${['A', 'B', 'C', 'D'][index]}</span>
                <span class="option-text">${option}</span>
            </button>
        `).join('');

        window.soundManager?.play('whoosh');
        this.currentQuiz.questionStartTime = Date.now();

        optionsEl.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSurvivalAnswer(e, word));
        });
    }

    handleSurvivalAnswer(event, word) {
        const btn = event.currentTarget;
        const selectedAnswer = btn.dataset.answer;
        const isCorrect = selectedAnswer === word.translation;
        const answerTime = Date.now() - this.currentQuiz.questionStartTime;

        window.soundManager?.play('select');

        document.querySelectorAll('.quiz-option').forEach(b => {
            b.classList.add('disabled');
            if (b.dataset.answer === word.translation) {
                b.classList.add('correct');
            }
        });

        if (isCorrect) {
            btn.classList.add('correct');
            this.currentQuiz.score++;
            this.streakCount++;

            setTimeout(() => window.soundManager?.play('correct'), 100);

            // Update streak display
            const streakEl = document.getElementById('quiz-streak');
            streakEl.querySelector('.streak-number').textContent = this.streakCount;
            if (this.streakCount >= 3) {
                streakEl.classList.add('streak-milestone');
                window.soundManager?.play('streak');
                setTimeout(() => streakEl.classList.remove('streak-milestone'), 600);
            }

            // Speed bonus check
            if (answerTime < 3000) {
                const rect = btn.getBoundingClientRect();
                this.showXPPopup(15, rect.left + rect.width / 2, rect.top);
            } else {
                const rect = btn.getBoundingClientRect();
                this.showXPPopup(10, rect.left + rect.width / 2, rect.top);
            }
        } else {
            btn.classList.add('wrong');
            this.currentQuiz.lives--;
            this.streakCount = 0;

            setTimeout(() => window.soundManager?.play('wrong'), 100);

            // Update lives display
            const livesContainer = document.getElementById('lives-display');
            const hearts = livesContainer.querySelectorAll('.life-heart');
            hearts[this.currentQuiz.maxLives - this.currentQuiz.lives - 1]?.classList.add('lost');

            document.getElementById('quiz-streak').querySelector('.streak-number').textContent = 0;
        }

        document.getElementById('quiz-score-display').textContent = this.currentQuiz.score;

        window.storageManager.addVocabularyProgress(
            word.id,
            word.category,
            word.difficulty,
            isCorrect
        );

        setTimeout(() => {
            this.currentQuiz.currentIndex++;
            this.showSurvivalQuestion();
        }, isCorrect ? 800 : 1500);
    }

    endSurvivalMode() {
        const totalTime = Math.floor((Date.now() - this.currentQuiz.startTime) / 1000);
        const questionsAnswered = this.currentQuiz.currentIndex;
        const accuracy = questionsAnswered > 0 ? Math.round((this.currentQuiz.score / questionsAnswered) * 100) : 0;

        const bonuses = this.calculateBonuses({
            type: 'survival',
            accuracy: accuracy,
            avgTimePerQuestion: totalTime / questionsAnswered
        });

        const baseXP = this.currentQuiz.score * 15; // Higher XP for survival
        const bonusXP = this.awardBonuses(bonuses);

        window.gamificationSystem.simulateExerciseCompletion(
            'survival',
            accuracy,
            totalTime,
            []
        );

        if (this.currentQuiz.score >= 10) {
            this.createConfetti(100);
            window.soundManager?.play('celebration');
        }

        const container = document.getElementById('writing-exercise');
        container.innerHTML = `
            <div class="celebration-content" style="margin: 0 auto; max-width: 400px;">
                <div class="celebration-emoji">${this.currentQuiz.lives > 0 ? '🏆' : '💀'}</div>
                <h2 class="celebration-title">${this.currentQuiz.lives > 0 ? 'You Survived!' : 'Game Over!'}</h2>
                <div class="results-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0;">
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${this.currentQuiz.score}</div>
                        <div style="color: var(--text-muted);">Final Score</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${accuracy}%</div>
                        <div style="color: var(--text-muted);">Accuracy</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--error);">${'❤️'.repeat(this.currentQuiz.lives)}${'🖤'.repeat(this.currentQuiz.maxLives - this.currentQuiz.lives)}</div>
                        <div style="color: var(--text-muted);">Lives Left</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--xp-color);">+${baseXP}</div>
                        <div style="color: var(--text-muted);">XP Earned</div>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startSurvivalMode()">
                        Try Again
                    </button>
                    <button class="btn btn-outline" onclick="window.interactiveExercises.showExerciseSelector()">
                        Back
                    </button>
                </div>
            </div>
        `;

        window.gamificationSystem.updateUI();
    }

    // ==================== REVERSE QUIZ (German → English) ====================
    startReverseQuiz(category = 'all', questionCount = 10) {
        const words = window.vocabularyManager.getWordsForStudy(category, questionCount * 2);

        if (words.length < 4) {
            alert('Not enough words available. Please try a different category.');
            return;
        }

        // Navigate to practice section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('practice')?.classList.add('active');

        this.currentQuiz = {
            words: words.slice(0, questionCount),
            allWords: window.vocabularyManager.getAllWords(),
            currentIndex: 0,
            score: 0,
            answers: [],
            startTime: Date.now(),
            category: category,
            mode: 'reverse',
            questionStartTime: Date.now()
        };

        this.streakCount = 0;
        this.showQuizInterface();
        this.showReverseQuizQuestion();
    }

    showReverseQuizQuestion() {
        if (this.currentQuiz.currentIndex >= this.currentQuiz.words.length) {
            this.endReverseQuiz();
            return;
        }

        const word = this.currentQuiz.words[this.currentQuiz.currentIndex];
        const questionEl = document.getElementById('quiz-question');
        const optionsEl = document.getElementById('quiz-options');

        // Generate options from German words
        const options = this.generateReverseQuizOptions(word);

        questionEl.innerHTML = `
            <div class="question-emoji">${word.emoji || '📚'}</div>
            <div class="question-text">How do you say this in German?</div>
            <div class="question-word">${word.translation}</div>
        `;

        optionsEl.innerHTML = options.map((option, index) => `
            <button class="quiz-option btn-playful" data-answer="${option}" data-index="${index}">
                <span class="option-letter">${['A', 'B', 'C', 'D'][index]}</span>
                <span class="option-text">${option}</span>
            </button>
        `).join('');

        window.soundManager?.play('whoosh');
        this.currentQuiz.questionStartTime = Date.now();

        optionsEl.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleReverseQuizAnswer(e, word));
        });

        // Update progress dots
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('current');
            if (i === this.currentQuiz.currentIndex) dot.classList.add('current');
        });
    }

    generateReverseQuizOptions(correctWord) {
        const correctAnswer = correctWord.word;
        const allWords = this.currentQuiz.allWords;

        let wrongAnswers = allWords
            .filter(w => w.id !== correctWord.id && w.word !== correctAnswer)
            .map(w => w.word);

        wrongAnswers = this.shuffleArray(wrongAnswers).slice(0, 3);

        return this.shuffleArray([correctAnswer, ...wrongAnswers]);
    }

    handleReverseQuizAnswer(event, word) {
        const btn = event.currentTarget;
        const selectedAnswer = btn.dataset.answer;
        const isCorrect = selectedAnswer === word.word;
        const answerTime = Date.now() - this.currentQuiz.questionStartTime;

        window.soundManager?.play('select');

        document.querySelectorAll('.quiz-option').forEach(b => {
            b.classList.add('disabled');
            if (b.dataset.answer === word.word) {
                b.classList.add('correct');
            }
        });

        if (isCorrect) {
            btn.classList.add('correct');
            this.currentQuiz.score++;
            this.streakCount++;

            setTimeout(() => window.soundManager?.play('correct'), 100);

            const streakEl = document.getElementById('quiz-streak');
            streakEl.querySelector('.streak-number').textContent = this.streakCount;
            if (this.streakCount >= 3) {
                streakEl.classList.add('streak-milestone');
                window.soundManager?.play('streak');
                setTimeout(() => streakEl.classList.remove('streak-milestone'), 600);
            }

            const xpAmount = answerTime < 3000 ? 15 : 10;
            const rect = btn.getBoundingClientRect();
            this.showXPPopup(xpAmount, rect.left + rect.width / 2, rect.top);

            if (word.mnemonic) {
                this.showQuizFeedback(true, word.mnemonic);
            }
        } else {
            btn.classList.add('wrong');
            this.streakCount = 0;
            document.getElementById('quiz-streak').querySelector('.streak-number').textContent = 0;

            setTimeout(() => window.soundManager?.play('wrong'), 100);
            this.showQuizFeedback(false, `${word.word} - ${word.mnemonic || ''}`);
        }

        document.getElementById('quiz-score-display').textContent = this.currentQuiz.score;

        const dots = document.querySelectorAll('.progress-dot');
        dots[this.currentQuiz.currentIndex].classList.add(isCorrect ? 'correct' : 'wrong');

        this.currentQuiz.answers.push({
            word: word,
            selected: selectedAnswer,
            correct: isCorrect
        });

        window.storageManager.addVocabularyProgress(
            word.id,
            word.category,
            word.difficulty,
            isCorrect
        );

        setTimeout(() => {
            this.currentQuiz.currentIndex++;
            this.hideQuizFeedback();
            this.showReverseQuizQuestion();
        }, isCorrect ? 1000 : 2000);
    }

    endReverseQuiz() {
        const totalTime = Math.floor((Date.now() - this.currentQuiz.startTime) / 1000);
        const accuracy = Math.round((this.currentQuiz.score / this.currentQuiz.words.length) * 100);

        const bonuses = this.calculateBonuses({
            type: 'reverse_quiz',
            accuracy: accuracy,
            avgTimePerQuestion: totalTime / this.currentQuiz.words.length
        });

        const baseXP = this.currentQuiz.score * 12;
        const bonusXP = accuracy >= 80 ? 25 : (accuracy >= 60 ? 15 : 0);
        const totalXP = baseXP + bonusXP;

        window.gamificationSystem.simulateExerciseCompletion(
            'reverse_quiz',
            accuracy,
            totalTime,
            this.currentQuiz.words.map(w => w.id)
        );

        this.awardBonuses(bonuses);

        if (accuracy >= 80) {
            this.createConfetti(80);
            window.soundManager?.play('celebration');
        }

        const container = document.getElementById('writing-exercise');
        container.innerHTML = `
            <div class="celebration-content" style="margin: 0 auto; max-width: 400px;">
                <div class="celebration-emoji">${accuracy >= 80 ? '🔄🎉' : accuracy >= 50 ? '🔄👍' : '🔄💪'}</div>
                <h2 class="celebration-title">${accuracy >= 80 ? 'Excellent!' : accuracy >= 50 ? 'Good job!' : 'Keep practicing!'}</h2>
                <p style="text-align: center; color: var(--text-muted);">Reverse Quiz Complete</p>
                <div class="results-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0;">
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${accuracy}%</div>
                        <div style="color: var(--text-muted);">Accuracy</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${this.currentQuiz.score}/${this.currentQuiz.words.length}</div>
                        <div style="color: var(--text-muted);">Correct</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--info);">${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}</div>
                        <div style="color: var(--text-muted);">Time</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--xp-color);">+${totalXP}</div>
                        <div style="color: var(--text-muted);">XP Earned</div>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startReverseQuiz()">
                        Play Again
                    </button>
                    <button class="btn btn-outline" onclick="window.interactiveExercises.showExerciseSelector()">
                        Back
                    </button>
                </div>
            </div>
        `;

        window.gamificationSystem.updateUI();
    }

    // ==================== EXERCISE SELECTOR ====================
    showExerciseSelector() {
        const container = document.getElementById('writing-exercise');
        if (!container) return;

        container.innerHTML = `
            <div class="exercise-selection">
                <!-- Challenge Modes Section -->
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>🎮</span> Challenge Modes
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
                        <button class="exercise-type-card" onclick="window.interactiveExercises.startTimedChallenge()" style="padding: 1rem; text-align: center; border: 2px solid var(--border-light); border-radius: var(--border-radius-lg); background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), var(--bg-card)); cursor: pointer; transition: all 0.2s;">
                            <div style="font-size: 2rem;">⏱️</div>
                            <div style="font-weight: 600; font-size: 0.85rem;">Timed</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted);">60 seconds</div>
                        </button>
                        <button class="exercise-type-card" onclick="window.interactiveExercises.startSurvivalMode()" style="padding: 1rem; text-align: center; border: 2px solid var(--border-light); border-radius: var(--border-radius-lg); background: linear-gradient(135deg, rgba(255, 87, 51, 0.1), var(--bg-card)); cursor: pointer; transition: all 0.2s;">
                            <div style="font-size: 2rem;">💀</div>
                            <div style="font-weight: 600; font-size: 0.85rem;">Survival</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted);">3 lives</div>
                        </button>
                        <button class="exercise-type-card" onclick="window.interactiveExercises.startReverseQuiz()" style="padding: 1rem; text-align: center; border: 2px solid var(--border-light); border-radius: var(--border-radius-lg); background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), var(--bg-card)); cursor: pointer; transition: all 0.2s;">
                            <div style="font-size: 2rem;">🔄</div>
                            <div style="font-weight: 600; font-size: 0.85rem;">Reverse</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted);">EN → DE</div>
                        </button>
                    </div>
                </div>

                <h3 style="margin-bottom: 1rem;">Choose an Exercise</h3>
                <div class="exercise-types" style="display: grid; gap: 1rem;">
                    <button class="exercise-type-card" onclick="window.interactiveExercises.startQuiz()" style="padding: 1.5rem; text-align: left; border: 2px solid var(--border-light); border-radius: var(--border-radius-lg); background: var(--bg-card); cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 2.5rem;">🎯</div>
                            <div>
                                <h4 style="margin: 0 0 0.25rem 0;">Tap-to-Answer Quiz</h4>
                                <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">Fast vocabulary practice with 4 options</p>
                            </div>
                        </div>
                    </button>

                    <button class="exercise-type-card" onclick="window.interactiveExercises.startTyping()" style="padding: 1.5rem; text-align: left; border: 2px solid var(--border-light); border-radius: var(--border-radius-lg); background: var(--bg-card); cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 2.5rem;">⌨️</div>
                            <div>
                                <h4 style="margin: 0 0 0.25rem 0;">Typing Practice</h4>
                                <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">Type German words with hints</p>
                            </div>
                        </div>
                    </button>

                    <button class="exercise-type-card" onclick="window.vocabularyManager.startFlashcardSession()" style="padding: 1.5rem; text-align: left; border: 2px solid var(--border-light); border-radius: var(--border-radius-lg); background: var(--bg-card); cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 2.5rem;">📚</div>
                            <div>
                                <h4 style="margin: 0 0 0.25rem 0;">Flashcards</h4>
                                <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">Review vocabulary with spaced repetition</p>
                            </div>
                        </div>
                    </button>

                    <button class="exercise-type-card" onclick="window.exerciseManager.startExercise('sentenceConstruction')" style="padding: 1.5rem; text-align: left; border: 2px solid var(--border-light); border-radius: var(--border-radius-lg); background: var(--bg-card); cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 2.5rem;">🧩</div>
                            <div>
                                <h4 style="margin: 0 0 0.25rem 0;">Sentence Building</h4>
                                <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">Drag words to build sentences</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        `;

        // Add hover effects
        container.querySelectorAll('.exercise-type-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = 'var(--accent-color)';
                card.style.transform = 'translateY(-2px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = 'var(--border-light)';
                card.style.transform = 'translateY(0)';
            });
        });
    }

    // ==================== UTILITY FUNCTIONS ====================
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    calculateSimilarity(str1, str2) {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();

        if (s1 === s2) return 1;
        if (s1.length === 0 || s2.length === 0) return 0;

        const distance = this.levenshteinDistance(s1, s2);
        const maxLength = Math.max(s1.length, s2.length);
        return 1 - (distance / maxLength);
    }

    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));

        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + cost
                );
            }
        }

        return matrix[str2.length][str1.length];
    }
}

// Initialize
window.interactiveExercises = new InteractiveExercises();
