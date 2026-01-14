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
        // Setup adaptive CTA and motivational phrases
        this.setupAdaptiveCTA();
        this.showMotivationalPhrase();
        // Setup keyboard navigation for quizzes
        this.setupKeyboardNavigation();
    }

    // ==================== KEYBOARD NAVIGATION ====================
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle when quiz options are visible
            const optionsContainer = document.getElementById('quiz-options');
            if (!optionsContainer || optionsContainer.closest('.hidden')) return;

            const options = optionsContainer.querySelectorAll('.quiz-option:not(.disabled)');
            if (options.length === 0) return;

            let selectedIndex = -1;

            // Number keys 1-4
            if (e.key >= '1' && e.key <= '4') {
                selectedIndex = parseInt(e.key) - 1;
            }
            // Letter keys A-D (case insensitive)
            else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
                selectedIndex = e.key.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
            }

            // Click the corresponding option if it exists
            if (selectedIndex >= 0 && selectedIndex < options.length) {
                e.preventDefault();
                options[selectedIndex].click();
            }
        });
    }

    // ==================== MOTIVATIONAL GERMAN PHRASES ====================
    motivationalPhrases = [
        { german: 'Übung macht den Meister!', english: 'Practice makes perfect!' },
        { german: 'Schritt für Schritt!', english: 'Step by step!' },
        { german: 'Du schaffst das!', english: 'You can do it!' },
        { german: 'Weiter so!', english: 'Keep it up!' },
        { german: 'Jeden Tag ein bisschen besser!', english: 'A little better every day!' },
        { german: 'Lernen ist ein Abenteuer!', english: 'Learning is an adventure!' },
        { german: 'Der Weg ist das Ziel!', english: 'The journey is the destination!' },
        { german: 'Gut gemacht!', english: 'Well done!' },
        { german: 'Bleib dran!', english: 'Stay on it!' },
        { german: 'Wissen ist Macht!', english: 'Knowledge is power!' }
    ];

    showMotivationalPhrase() {
        const phraseEl = document.getElementById('motivational-phrase');
        if (!phraseEl) return;

        const phrase = this.motivationalPhrases[Math.floor(Math.random() * this.motivationalPhrases.length)];
        phraseEl.textContent = phrase.german;
        phraseEl.title = phrase.english;
    }

    // ==================== ADAPTIVE CTA ====================
    setupAdaptiveCTA() {
        const lastActivity = window.storageManager?.getLastActivity?.() || localStorage.getItem('lastActivity');
        const lastExercise = localStorage.getItem('lastExerciseType');
        const consecutiveAccuracy = this.getConsecutiveAccuracy();

        const greetingEl = document.getElementById('hero-greeting');
        const subtitleEl = document.getElementById('hero-subtitle');
        const ctaTitleEl = document.getElementById('cta-title');
        const ctaDescEl = document.getElementById('cta-desc');
        const ctaIconEl = document.getElementById('cta-icon');

        if (!greetingEl) return;

        // Check if returning user
        if (lastExercise) {
            greetingEl.textContent = 'Willkommen zurück!';
            subtitleEl.textContent = 'Continue your German journey';

            const exerciseNames = {
                'quiz': { icon: '🎯', name: 'Quiz', desc: 'Continue your quiz session' },
                'typing': { icon: '⌨️', name: 'Typing Practice', desc: 'Resume typing practice' },
                'timed_challenge': { icon: '⏱️', name: 'Timed Challenge', desc: 'Beat your best time' },
                'survival': { icon: '💀', name: 'Survival Mode', desc: 'Try to survive again' },
                'reverse_quiz': { icon: '🔄', name: 'Reverse Quiz', desc: 'Continue EN → DE practice' }
            };

            const exercise = exerciseNames[lastExercise] || { icon: '🎯', name: 'Continue', desc: 'Pick up where you left off' };
            ctaIconEl.textContent = exercise.icon;
            ctaTitleEl.textContent = exercise.name;
            ctaDescEl.textContent = exercise.desc;
        }

        // If user has high accuracy, suggest A2 challenge
        if (consecutiveAccuracy >= 80 && this.currentLevel === 'A1') {
            subtitleEl.textContent = 'You\'re doing great! Ready for a challenge?';
        }
    }

    getConsecutiveAccuracy() {
        try {
            const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
            if (history.length < 3) return 0;

            const lastThree = history.slice(-3);
            const avgAccuracy = lastThree.reduce((sum, q) => sum + (q.accuracy || 0), 0) / 3;
            return avgAccuracy;
        } catch {
            return 0;
        }
    }

    // ==================== A1/A2 MIXING ====================
    shouldSprinkleA2Words() {
        if (this.currentLevel !== 'A1') return false;
        return this.getConsecutiveAccuracy() >= 80;
    }

    getA2Words() {
        // Extract all words from A2 categories
        const a2Data = window.vocabularyManager?.allLevelsData?.A2;
        if (!a2Data || !a2Data.categories) return [];

        let a2Words = [];
        Object.values(a2Data.categories).forEach(category => {
            if (category.words && Array.isArray(category.words)) {
                a2Words = a2Words.concat(category.words);
            }
        });
        return a2Words;
    }

    getWordsWithA2Sprinkle(category, count) {
        let words = window.vocabularyManager.getWordsForStudy(category, count);

        if (this.shouldSprinkleA2Words()) {
            const a2Words = this.getA2Words();
            if (a2Words.length > 0) {
                const a2Sample = this.shuffleArray([...a2Words]).slice(0, Math.ceil(count * 0.2));

                // Mark A2 words as challenge words
                a2Sample.forEach(w => w.isChallenge = true);

                // Mix in A2 words (replace some A1 words)
                words = words.slice(0, count - a2Sample.length).concat(a2Sample);
                words = this.shuffleArray(words);
            }
        }

        return words;
    }

    // ==================== SMART CATEGORY MIXING ====================
    getWordsWithCategoryMixing(primaryCategory, count) {
        // Get words from the primary category
        let primaryWords = window.vocabularyManager.getAllWords(primaryCategory);

        // If category is 'all', just return shuffled words
        if (primaryCategory === 'all') {
            return this.shuffleArray([...primaryWords]).slice(0, count);
        }

        // Calculate target: 75% from primary category, 25% from others
        const primaryTarget = Math.ceil(count * 0.75);
        const supplementTarget = count - primaryTarget;

        // Get available primary words (up to target or all available)
        const availablePrimaryWords = Math.min(primaryWords.length, primaryTarget);
        const selectedPrimaryWords = this.shuffleArray([...primaryWords]).slice(0, availablePrimaryWords);

        // If we have enough from primary category, return
        if (selectedPrimaryWords.length >= count) {
            return selectedPrimaryWords.slice(0, count);
        }

        // Need to supplement from other categories
        const wordsNeeded = count - selectedPrimaryWords.length;

        // Get all words from other categories
        const allCategories = window.vocabularyManager.vocabularyData?.categories || {};
        let supplementWords = [];

        Object.keys(allCategories).forEach(cat => {
            if (cat !== primaryCategory) {
                const catWords = window.vocabularyManager.getAllWords(cat);
                supplementWords = supplementWords.concat(catWords);
            }
        });

        // Remove duplicates based on word ID
        const primaryWordIds = new Set(selectedPrimaryWords.map(w => w.id));
        supplementWords = supplementWords.filter(w => !primaryWordIds.has(w.id));

        // Get the needed supplement words
        const selectedSupplementWords = this.shuffleArray(supplementWords).slice(0, wordsNeeded);

        // Combine and shuffle
        const finalWords = [...selectedPrimaryWords, ...selectedSupplementWords];
        return this.shuffleArray(finalWords);
    }

    waitForVocabulary(retryCount = 0) {
        const MAX_RETRIES = 50; // 5 seconds max (50 * 100ms)

        if (window.vocabularyManager && window.vocabularyManager.vocabularyData) {
            // Vocabulary loaded successfully
            return;
        }

        if (retryCount >= MAX_RETRIES) {
            console.warn('Vocabulary manager failed to load within timeout');
            return;
        }

        setTimeout(() => this.waitForVocabulary(retryCount + 1), 100);
    }

    // ==================== SESSION TIMER ====================
    startSessionTimer() {
        // Clear any existing timer first to prevent memory leaks
        this.stopSessionTimer();

        this.sessionStartTime = Date.now();
        this.updateSessionTimerDisplay();

        this.sessionTimerInterval = setInterval(() => {
            this.updateSessionTimerDisplay();
        }, 1000);

        // Pause timer when page is hidden, resume when visible
        this.handleVisibilityChange = () => {
            if (document.hidden) {
                this.pauseSessionTimer();
            } else {
                this.resumeSessionTimer();
            }
        };
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    stopSessionTimer() {
        if (this.sessionTimerInterval) {
            clearInterval(this.sessionTimerInterval);
            this.sessionTimerInterval = null;
        }
        if (this.handleVisibilityChange) {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            this.handleVisibilityChange = null;
        }
    }

    pauseSessionTimer() {
        if (this.sessionTimerInterval) {
            clearInterval(this.sessionTimerInterval);
            this.sessionTimerInterval = null;
            this.pausedAt = Date.now();
        }
    }

    resumeSessionTimer() {
        if (this.pausedAt) {
            // Adjust start time to account for paused duration
            const pauseDuration = Date.now() - this.pausedAt;
            this.sessionStartTime += pauseDuration;
            this.pausedAt = null;
        }
        if (!this.sessionTimerInterval) {
            this.sessionTimerInterval = setInterval(() => {
                this.updateSessionTimerDisplay();
            }, 1000);
        }
    }

    // Cleanup method - call when destroying the instance
    destroy() {
        this.stopSessionTimer();
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

    showXPPopupCustom(text, x, y) {
        const popup = document.createElement('div');
        popup.className = 'xp-popup';
        popup.textContent = text;
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
        document.body.appendChild(popup);

        setTimeout(() => popup.remove(), 1500);
    }

    showAchievementPopup(title, subtitle) {
        const popup = document.getElementById('achievement-popup');
        if (!popup) return;

        popup.innerHTML = `
            <div class="achievement-title">${title}</div>
            <div class="achievement-subtitle">${subtitle}</div>
        `;
        popup.classList.remove('hidden');
        popup.style.animation = 'none';
        setTimeout(() => {
            popup.style.animation = 'achievementSlide 2s ease';
        }, 10);

        setTimeout(() => {
            popup.classList.add('hidden');
        }, 2000);
    }

    // ==================== TAP-TO-ANSWER QUIZ ====================
    startQuiz(category = 'all', questionCount = 10) {
        // Ensure vocabulary is loaded
        if (!window.vocabularyManager || !window.vocabularyManager.vocabularyData) {
            console.warn('Vocabulary not loaded yet, retrying...');
            setTimeout(() => this.startQuiz(category, questionCount), 200);
            return;
        }

        let allWords = window.vocabularyManager.getAllWords(category);
        let words;

        // Check if category has enough words
        if (allWords.length < 4 && category !== 'all') {
            // Use smart category mixing to supplement with other categories
            allWords = this.getWordsWithCategoryMixing(category, questionCount);

            if (allWords.length < 4) {
                window.utils.showAlert('Not enough words available. Please try "All Words" or switch levels.', 'warning');
                return;
            }
        }

        // Use A2 sprinkle if applicable, otherwise use category mixing or all words
        if (this.shouldSprinkleA2Words()) {
            words = this.getWordsWithA2Sprinkle(category, questionCount);
        } else if (allWords.length < questionCount && category !== 'all') {
            // Use smart mixing to reach desired question count
            words = this.getWordsWithCategoryMixing(category, questionCount);
        } else {
            words = this.shuffleArray([...allWords]).slice(0, questionCount);
        }

        if (words.length < 4) {
            window.utils.showAlert('Not enough words available. Please try "All Words" or switch levels.', 'warning');
            return;
        }

        // Navigate to practice section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('practice')?.classList.add('active');

        this.currentQuiz = {
            words: words,
            allWords: allWords,
            currentIndex: 0,
            score: 0,
            answers: [],
            startTime: Date.now(),
            category: category,
            mode: 'standard',
            totalXP: 0,
            fastestAnswer: Infinity,
            slowestAnswer: 0,
            questionStartTime: Date.now()
        };

        this.streakCount = 0;
        this.maxStreak = 0;
        this.comboMultiplier = 1;
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
                        <span class="combo-multiplier hidden" id="combo-multiplier">×1</span>
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
                <div class="achievement-popup hidden" id="achievement-popup"></div>
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
            if (this.currentQuiz.mode === 'progressive') {
                this.endProgressiveQuiz();
            } else {
                this.endQuiz();
            }
            return;
        }

        // Track question start time for speed bonus
        this.currentQuiz.questionStartTime = Date.now();

        const word = this.currentQuiz.words[this.currentQuiz.currentIndex];
        const questionEl = document.getElementById('quiz-question');
        const optionsEl = document.getElementById('quiz-options');

        // Generate 3 options (1 correct + 2 wrong)
        const options = this.generateQuizOptions(word);

        const safeWord = window.utils.escapeHtml(word.word);
        const safeWordJs = window.utils.escapeJs(word.word);

        questionEl.innerHTML = `
            <div class="question-emoji">${word.emoji || '📚'}</div>
            <div class="question-text">What does this mean?</div>
            <div class="question-word">
                ${safeWord}${word.isChallenge ? '<span class="challenge-badge">⭐ A2 Challenge</span>' : ''}
                <button class="speak-btn" onclick="event.stopPropagation(); window.soundManager.speakWithFeedback('${safeWordJs}', this)" title="Listen to pronunciation">🔊</button>
            </div>
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

        // Calculate answer time for speed bonus
        const answerTime = (Date.now() - this.currentQuiz.questionStartTime) / 1000;
        this.currentQuiz.fastestAnswer = Math.min(this.currentQuiz.fastestAnswer, answerTime);
        this.currentQuiz.slowestAnswer = Math.max(this.currentQuiz.slowestAnswer, answerTime);

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
            this.maxStreak = Math.max(this.maxStreak, this.streakCount);

            // Calculate XP with combo multiplier and speed bonus
            let xpEarned = 10;

            // Combo multiplier increases with streak
            if (this.streakCount >= 10) {
                this.comboMultiplier = 5;
            } else if (this.streakCount >= 5) {
                this.comboMultiplier = 3;
            } else if (this.streakCount >= 3) {
                this.comboMultiplier = 2;
            } else {
                this.comboMultiplier = 1;
            }

            xpEarned = Math.floor(xpEarned * this.comboMultiplier);

            // Speed bonus (extra 5 XP for answers under 3 seconds)
            if (answerTime < 3) {
                xpEarned += 5;
            }

            this.currentQuiz.totalXP += xpEarned;

            // Play correct sound
            setTimeout(() => window.soundManager?.play('correct'), 100);

            // FUN REACTIONS FOR CORRECT ANSWERS!
            if (window.funUtils) {
                window.funUtils.mascotReact('correct');

                // Random chance for beer clink on correct answer
                if (Math.random() > 0.7) {
                    window.funUtils.triggerBeerClink();
                }

                // Show funny motivational phrase
                const funMessage = window.funUtils.getMotivationalPhrase('correct');
                if (word.mnemonic) {
                    this.showQuizFeedback(true, `${funMessage}<br><small>${word.mnemonic}</small>`);
                } else {
                    this.showQuizFeedback(true, funMessage);
                }
            }

            // Update streak display
            const streakEl = document.getElementById('quiz-streak');
            streakEl.querySelector('.streak-number').textContent = this.streakCount;

            // Show/update combo multiplier
            const comboEl = document.getElementById('combo-multiplier');
            if (this.comboMultiplier > 1) {
                comboEl.textContent = `×${this.comboMultiplier}`;
                comboEl.classList.remove('hidden');
                comboEl.style.animation = 'none';
                setTimeout(() => comboEl.style.animation = 'pulse 0.3s ease', 10);
            } else {
                comboEl.classList.add('hidden');
            }

            // Milestone achievements
            if (this.streakCount === 3) {
                this.showAchievementPopup('🎯 Hat Trick!', 'Three in a row!');
                streakEl.classList.add('streak-milestone');
                window.soundManager?.play('streak');
                setTimeout(() => streakEl.classList.remove('streak-milestone'), 600);
            } else if (this.streakCount === 5) {
                this.showAchievementPopup('🔥 On Fire!', 'Five streak combo!');
                streakEl.classList.add('streak-milestone');
                window.soundManager?.play('streak');
                if (window.funUtils) {
                    window.funUtils.triggerGermanConfetti('german');
                }
                setTimeout(() => streakEl.classList.remove('streak-milestone'), 600);
            } else if (this.streakCount === 10) {
                this.showAchievementPopup('⚡ UNSTOPPABLE!', 'Ten streak! You\'re a legend!');
                streakEl.classList.add('streak-milestone');
                window.soundManager?.play('streak');
                if (window.funUtils) {
                    window.funUtils.triggerGermanConfetti('german');
                }
                setTimeout(() => streakEl.classList.remove('streak-milestone'), 600);
            } else if (this.streakCount >= 3) {
                streakEl.classList.add('streak-milestone');
                setTimeout(() => streakEl.classList.remove('streak-milestone'), 600);
            }

            // Speed bonus achievement
            if (answerTime < 2) {
                this.showAchievementPopup('⚡ Lightning Fast!', `${answerTime.toFixed(1)}s answer!`);
            }

            // XP popup with multiplier
            const rect = btn.getBoundingClientRect();
            let xpText = `+${xpEarned} XP`;
            if (this.comboMultiplier > 1) {
                xpText = `+${xpEarned} XP (×${this.comboMultiplier})`;
            }
            if (answerTime < 3) {
                xpText += ' ⚡';
            }
            this.showXPPopupCustom(xpText, rect.left + rect.width / 2, rect.top);

        } else {
            btn.classList.add('wrong');
            this.streakCount = 0;
            this.comboMultiplier = 1;
            document.getElementById('quiz-streak').querySelector('.streak-number').textContent = 0;
            document.getElementById('combo-multiplier').classList.add('hidden');

            // Play wrong sound
            setTimeout(() => window.soundManager?.play('wrong'), 100);

            // Shake animation on wrong answer
            btn.style.animation = 'shake 0.4s';

            // FUN REACTIONS FOR WRONG ANSWERS!
            if (window.funUtils) {
                window.funUtils.mascotReact('wrong');
                const funMessage = window.funUtils.getMotivationalPhrase('wrong');
                this.showQuizFeedback(false, `${funMessage}<br><small>Correct: ${word.translation} - ${word.mnemonic || ''}</small>`);
            } else {
                // Show correct answer with mnemonic
                this.showQuizFeedback(false, `${word.translation} - ${word.mnemonic || ''}`);
            }
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

        // Track analytics (time-of-day, category mastery)
        if (window.analyticsManager) {
            window.analyticsManager.recordExercise(isCorrect, word.category || 'General');
        }

        // Check milestones
        if (window.progressMapManager) {
            window.progressMapManager.checkMilestones();
        }

        // Next question after delay
        setTimeout(() => {
            this.currentQuiz.currentIndex++;
            this.hideQuizFeedback();
            this.showQuizQuestion();
        }, isCorrect ? 1000 : 2000);
    }

    showQuizFeedback(isCorrect, message, germanWord = null) {
        const feedback = document.getElementById('quiz-feedback');
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;

        // Extract German word from the current question if not provided
        const word = germanWord || this.currentQuiz?.words[this.currentQuiz.currentIndex]?.word;
        const safeWordJs = word ? window.utils.escapeJs(word) : '';
        const safeMessage = window.utils.escapeHtml(message);

        feedback.innerHTML = `
            <span class="feedback-icon">${isCorrect ? '✅' : '💡'}</span>
            <span class="feedback-text">${safeMessage}</span>
            ${word ? `<button class="speak-btn speak-btn-inline" onclick="window.soundManager.speakWithFeedback('${safeWordJs}', this)" title="Listen">🔊</button>` : ''}
        `;
        feedback.classList.remove('hidden');

        // Auto-pronounce the word on correct answers
        if (isCorrect && word && window.soundManager?.speechEnabled) {
            setTimeout(() => {
                window.soundManager.speakGerman(word);
            }, 300);
        }
    }

    hideQuizFeedback() {
        const feedback = document.getElementById('quiz-feedback');
        if (feedback) feedback.classList.add('hidden');
    }

    endQuiz() {
        const totalTime = Math.floor((Date.now() - this.currentQuiz.startTime) / 1000);
        const accuracy = Math.round((this.currentQuiz.score / this.currentQuiz.words.length) * 100);

        // Save quiz history for adaptive features
        this.saveQuizHistory({ accuracy, type: 'quiz', timestamp: Date.now() });
        localStorage.setItem('lastExerciseType', 'quiz');

        // Use tracked total XP (includes combo bonuses and speed bonuses)
        const totalXP = this.currentQuiz.totalXP || (this.currentQuiz.score * 10);
        const bonusXP = accuracy >= 80 ? 30 : (accuracy >= 60 ? 15 : 0);
        const finalXP = totalXP + bonusXP;

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

        // Get fastest and slowest answer times
        const fastestTime = this.currentQuiz.fastestAnswer < Infinity ? this.currentQuiz.fastestAnswer.toFixed(1) : 'N/A';
        const avgTime = (totalTime / this.currentQuiz.words.length).toFixed(1);

        const container = document.getElementById('writing-exercise');
        container.innerHTML = `
            <div class="celebration-content" style="margin: 0 auto; max-width: 500px;">
                <div class="celebration-emoji">${accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}</div>
                <h2 class="celebration-title">${accuracy >= 80 ? 'Ausgezeichnet!' : accuracy >= 50 ? 'Gut gemacht!' : 'Keep practicing!'}</h2>

                <!-- Main Stats Grid -->
                <div class="results-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0; padding: 1rem; background: var(--bg-card); border-radius: var(--border-radius-lg);">
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: var(--success);">${accuracy}%</div>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Accuracy</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: var(--primary-color);">${this.currentQuiz.score}/${this.currentQuiz.words.length}</div>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Correct</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--xp-color);">+${finalXP}</div>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">XP Earned</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--accent-color);">🔥 ${this.maxStreak}</div>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Max Streak</div>
                    </div>
                </div>

                <!-- Detailed Stats -->
                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--border-radius-md); margin-bottom: 1.5rem;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; font-size: 0.9rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-muted);">⏱️ Total Time:</span>
                            <span style="font-weight: 600;">${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-muted);">⚡ Fastest:</span>
                            <span style="font-weight: 600;">${fastestTime}s</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-muted);">📊 Avg Time:</span>
                            <span style="font-weight: 600;">${avgTime}s</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-muted);">🎯 Category:</span>
                            <span style="font-weight: 600;">${this.currentQuiz.category === 'all' ? 'All' : this.currentQuiz.category}</span>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startQuiz('${this.currentQuiz.category}', ${this.currentQuiz.words.length})" style="font-size: 1.1rem; padding: 0.75rem 2rem;">
                        🔄 One More Round!
                    </button>
                    ${accuracy >= 80 ? `
                    <button class="btn btn-accent" onclick="window.interactiveExercises.startProgressiveQuiz('${this.currentQuiz.category}', 2)">
                        🚀 Level Up!
                    </button>
                    ` : `
                    <button class="btn btn-outline" onclick="window.interactiveExercises.startQuiz('${this.currentQuiz.category}', ${this.currentQuiz.words.length})">
                        💪 Try Again
                    </button>
                    `}
                    <button class="btn btn-outline" onclick="window.interactiveExercises.showExerciseSelector()">
                        ← Back
                    </button>
                </div>
            </div>
        `;

        window.gamificationSystem.updateUI();
    }

    // ==================== PROGRESSIVE QUIZ MODE ====================
    startProgressiveQuiz(category = 'all', difficultyLevel = 1) {
        // Ensure vocabulary is loaded
        if (!window.vocabularyManager || !window.vocabularyManager.vocabularyData) {
            setTimeout(() => this.startProgressiveQuiz(category, difficultyLevel), 200);
            return;
        }

        // Progressive: More questions, mix levels if doing well
        const questionCount = 10 + (difficultyLevel - 1) * 5; // 10, 15, 20...
        let allWords = window.vocabularyManager.getAllWords(category);

        // Use smart category mixing if not enough words
        if (allWords.length < questionCount && category !== 'all') {
            allWords = this.getWordsWithCategoryMixing(category, questionCount);
        }

        // At higher difficulty, mix in A2 words
        if (difficultyLevel >= 2) {
            const a2Words = this.getA2Words();
            if (a2Words.length > 0) {
                // Mark A2 words as challenge
                a2Words.forEach(w => w.isChallenge = true);
                const mixRatio = Math.min(0.5, difficultyLevel * 0.15); // 15%, 30%, 45%...
                const a2Count = Math.floor(questionCount * mixRatio);
                const a2Sample = this.shuffleArray([...a2Words]).slice(0, a2Count);
                allWords = [...allWords, ...a2Sample];
            }
        }

        const words = this.shuffleArray([...allWords]).slice(0, questionCount);

        if (words.length < 4) {
            window.utils.showAlert('Not enough words available.', 'warning');
            return;
        }

        // Navigate to practice section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('practice')?.classList.add('active');

        this.currentQuiz = {
            words: words,
            allWords: allWords,
            currentIndex: 0,
            score: 0,
            answers: [],
            startTime: Date.now(),
            category: category,
            mode: 'progressive',
            difficultyLevel: difficultyLevel
        };

        this.streakCount = 0;
        this.showProgressiveInterface(difficultyLevel);
        this.showQuizQuestion();
    }

    showProgressiveInterface(level) {
        const container = document.getElementById('writing-exercise');
        if (!container) return;

        container.innerHTML = `
            <div class="quiz-container quiz-fullscreen">
                <div class="quiz-progress">
                    <div class="difficulty-badge" style="background: linear-gradient(135deg, #C4703C, #D4924A); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-weight: 600; font-size: 0.8rem;">
                        Level ${level} ${'⭐'.repeat(Math.min(level, 5))}
                    </div>
                    <div class="streak-counter" id="quiz-streak">
                        <span class="streak-fire">🔥</span>
                        <span class="streak-number">0</span>
                    </div>
                    <div class="progress-dots" id="progress-dots"></div>
                    <div class="quiz-score">
                        <span id="quiz-score-display">0</span> / <span id="quiz-total">${this.currentQuiz.words.length}</span>
                    </div>
                </div>

                <div class="quiz-question" id="quiz-question"></div>
                <div class="quiz-options quiz-grid-4" id="quiz-options"></div>
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

    endProgressiveQuiz() {
        const totalTime = Math.floor((Date.now() - this.currentQuiz.startTime) / 1000);
        const accuracy = Math.round((this.currentQuiz.score / this.currentQuiz.words.length) * 100);
        const currentLevel = this.currentQuiz.difficultyLevel || 1;
        const nextLevel = accuracy >= 80 ? currentLevel + 1 : currentLevel;

        // Save quiz history
        this.saveQuizHistory({ accuracy, type: 'progressive', level: currentLevel, timestamp: Date.now() });
        localStorage.setItem('lastExerciseType', 'quiz');

        const baseXP = this.currentQuiz.score * 10 + (currentLevel * 5);
        const bonusXP = accuracy >= 80 ? 30 : (accuracy >= 60 ? 15 : 0);
        const totalXP = baseXP + bonusXP;

        window.gamificationSystem.simulateExerciseCompletion(
            'progressive_quiz',
            accuracy,
            totalTime,
            this.currentQuiz.words.map(w => w.id)
        );

        if (accuracy >= 80) {
            this.createConfetti(100);
            window.soundManager?.play('celebration');
            window.soundManager?.play('levelUp');
        }

        const container = document.getElementById('writing-exercise');
        container.innerHTML = `
            <div class="celebration-content" style="margin: 0 auto; max-width: 400px;">
                <div class="celebration-emoji">${accuracy >= 80 ? '🚀' : accuracy >= 50 ? '💪' : '📚'}</div>
                <h2 class="celebration-title">${accuracy >= 80 ? 'Level Complete!' : 'Good Effort!'}</h2>
                <p style="text-align: center; color: var(--text-muted);">Level ${currentLevel} ${'⭐'.repeat(Math.min(currentLevel, 5))}</p>
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
                <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem;">
                    ${accuracy >= 80 ? `
                        <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startProgressiveQuiz('${this.currentQuiz.category}', ${nextLevel})">
                            🚀 Level ${nextLevel}
                        </button>
                    ` : `
                        <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startProgressiveQuiz('${this.currentQuiz.category}', ${currentLevel})">
                            💪 Try Again
                        </button>
                    `}
                    <button class="btn btn-outline" onclick="window.interactiveExercises.showExerciseSelector()">
                        Back
                    </button>
                </div>
            </div>
        `;

        window.gamificationSystem.updateUI();
    }

    // ==================== TYPING PRACTICE ====================
    startTyping(category = 'all', wordCount = 10, difficulty = 1) {
        let allWords = window.vocabularyManager.getAllWords(category);

        // Use smart category mixing if not enough words
        if (allWords.length < wordCount && category !== 'all') {
            allWords = this.getWordsWithCategoryMixing(category, wordCount);
        }

        // Filter by difficulty
        let words = allWords.filter(w => w.difficulty <= difficulty);
        if (words.length < 5) words = allWords;

        // Shuffle and limit
        words = this.shuffleArray(words).slice(0, wordCount);

        if (words.length === 0) {
            window.utils.showAlert('No words available. Please try a different category.', 'warning');
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
        // Debounced input handler for better performance
        const debouncedHandler = window.utils.debounce((value) => {
            this.handleTypingInput(value);
        }, 150);
        document.getElementById('typing-input').addEventListener('input', (e) => {
            debouncedHandler(e.target.value);
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
        // Ensure vocabulary is loaded
        if (!window.vocabularyManager || !window.vocabularyManager.vocabularyData) {
            setTimeout(() => this.startTimedChallenge(category, questionCount, timeLimit), 200);
            return;
        }

        let allWords = window.vocabularyManager.getAllWords(category);

        // Use smart category mixing if not enough words
        if (allWords.length < questionCount && category !== 'all') {
            allWords = this.getWordsWithCategoryMixing(category, questionCount);
        }

        if (allWords.length < 4) {
            window.utils.showAlert('Not enough words available. Please try a different category.', 'warning');
            return;
        }

        const words = this.shuffleArray([...allWords]).slice(0, questionCount);

        // Navigate to practice section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('practice')?.classList.add('active');

        this.currentQuiz = {
            words: words,
            allWords: allWords,
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
        this.showTimedQuestion();
    }

    showTimedQuestion() {
        // Check if quiz is complete
        if (this.currentQuiz.currentIndex >= this.currentQuiz.words.length) {
            this.endTimedChallenge();
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
            btn.addEventListener('click', (e) => this.handleTimedAnswer(e, word));
        });

        // Update progress dots
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('current');
            if (i === this.currentQuiz.currentIndex) dot.classList.add('current');
        });
    }

    handleTimedAnswer(event, word) {
        const btn = event.currentTarget;
        const selectedAnswer = btn.dataset.answer;
        const isCorrect = selectedAnswer === word.translation;

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

            const streakEl = document.getElementById('quiz-streak');
            if (streakEl) {
                streakEl.querySelector('.streak-number').textContent = this.streakCount;
            }
        } else {
            btn.classList.add('wrong');
            this.streakCount = 0;
            setTimeout(() => window.soundManager?.play('wrong'), 100);
        }

        document.getElementById('quiz-score-display').textContent = this.currentQuiz.score;

        const dots = document.querySelectorAll('.progress-dot');
        if (dots[this.currentQuiz.currentIndex]) {
            dots[this.currentQuiz.currentIndex].classList.add(isCorrect ? 'correct' : 'wrong');
        }

        // Move to next question quickly for timed mode
        setTimeout(() => {
            this.currentQuiz.currentIndex++;
            this.showTimedQuestion();
        }, 500);
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
        // Clear timer immediately
        if (this.timedInterval) {
            clearInterval(this.timedInterval);
            this.timedInterval = null;
        }
        document.getElementById('timed-overlay')?.remove();

        const totalTime = Math.floor((Date.now() - this.currentQuiz.startTime) / 1000);
        const questionsAnswered = this.currentQuiz.currentIndex;
        const accuracy = questionsAnswered > 0 ? Math.round((this.currentQuiz.score / questionsAnswered) * 100) : 0;

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

        // Save quiz history
        this.saveQuizHistory({ accuracy, type: 'timed_challenge', timestamp: Date.now() });
        localStorage.setItem('lastExerciseType', 'timed_challenge');

        const container = document.getElementById('writing-exercise');
        const completed = questionsAnswered >= this.currentQuiz.words.length;
        container.innerHTML = `
            <div class="celebration-content" style="margin: 0 auto; max-width: 400px;">
                <div class="celebration-emoji">${completed && accuracy >= 80 ? '⏱️🎉' : completed ? '⏱️👍' : '⏱️💪'}</div>
                <h2 class="celebration-title">${completed ? 'Challenge Complete!' : 'Time\'s Up!'}</h2>
                <p style="text-align: center; color: var(--text-muted);">${completed ? 'You finished all questions!' : `Answered ${questionsAnswered}/${this.currentQuiz.words.length}`}</p>
                <div class="results-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0;">
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${accuracy}%</div>
                        <div style="color: var(--text-muted);">Accuracy</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${this.currentQuiz.score}/${questionsAnswered}</div>
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
                <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem;">
                    <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startTimedChallenge('all', 10, ${completed && accuracy >= 80 ? 45 : 60})">
                        ${completed && accuracy >= 80 ? '⚡ Faster (45s)' : '🔄 Try Again'}
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
        // Ensure vocabulary is loaded
        if (!window.vocabularyManager || !window.vocabularyManager.vocabularyData) {
            setTimeout(() => this.startSurvivalMode(category), 200);
            return;
        }

        let words = window.vocabularyManager.getAllWords(category);

        // Use smart category mixing if not enough words
        if (words.length < 10 && category !== 'all') {
            words = this.getWordsWithCategoryMixing(category, 10);
        }

        if (words.length < 4) {
            window.utils.showAlert('Not enough words available. Please try a different category.', 'warning');
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
        // Ensure vocabulary is loaded
        if (!window.vocabularyManager || !window.vocabularyManager.vocabularyData) {
            setTimeout(() => this.startReverseQuiz(category, questionCount), 200);
            return;
        }

        let allWords = window.vocabularyManager.getAllWords(category);

        // Use smart category mixing if not enough words
        if (allWords.length < questionCount && category !== 'all') {
            allWords = this.getWordsWithCategoryMixing(category, questionCount);
        }

        const words = this.shuffleArray([...allWords]).slice(0, questionCount);

        if (words.length < 4) {
            window.utils.showAlert('Not enough words available. Please try a different category.', 'warning');
            return;
        }

        // Navigate to practice section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('practice')?.classList.add('active');

        this.currentQuiz = {
            words: words,
            allWords: allWords,
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

    // ==================== MATCH PAIRS GAME ====================
    startMatchPairs(category = 'all', pairCount = 6) {
        // Ensure vocabulary is loaded
        if (!window.vocabularyManager || !window.vocabularyManager.vocabularyData) {
            setTimeout(() => this.startMatchPairs(category, pairCount), 200);
            return;
        }

        let allWords = window.vocabularyManager.getAllWords(category);

        // Use smart category mixing if not enough words
        if (allWords.length < pairCount && category !== 'all') {
            allWords = this.getWordsWithCategoryMixing(category, pairCount);
        }

        const words = this.shuffleArray([...allWords]).slice(0, pairCount);

        if (words.length < 4) {
            window.utils.showAlert('Not enough words available. Please try a different category.', 'warning');
            return;
        }

        // Navigate to practice section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('practice')?.classList.add('active');

        this.currentMatch = {
            words: words,
            cards: [],
            flippedCards: [],
            matchedPairs: 0,
            moves: 0,
            startTime: Date.now(),
            isLocked: false
        };

        this.createMatchCards();
        this.showMatchInterface();
    }

    createMatchCards() {
        const cards = [];

        // Create pairs of cards (German and English)
        this.currentMatch.words.forEach((word, index) => {
            cards.push({
                id: `de_${index}`,
                pairId: index,
                type: 'german',
                text: word.word,
                emoji: word.emoji || '🇩🇪',
                isFlipped: false,
                isMatched: false
            });
            cards.push({
                id: `en_${index}`,
                pairId: index,
                type: 'english',
                text: word.translation,
                emoji: '🇬🇧',
                isFlipped: false,
                isMatched: false
            });
        });

        // Shuffle cards
        this.currentMatch.cards = this.shuffleArray(cards);
    }

    showMatchInterface() {
        const container = document.getElementById('writing-exercise');
        if (!container) return;

        const gridSize = this.currentMatch.cards.length <= 12 ? 'grid-4' : 'grid-4';

        container.innerHTML = `
            <div class="match-pairs-game">
                <div class="match-header">
                    <div class="match-badge">
                        <span>🎴</span> Match Pairs
                    </div>
                    <div class="match-stats">
                        <div class="match-stat">
                            <span class="stat-icon">🎯</span>
                            <span id="match-pairs-count">0</span>/<span>${this.currentMatch.words.length}</span>
                        </div>
                        <div class="match-stat">
                            <span class="stat-icon">👆</span>
                            <span id="match-moves">0</span> moves
                        </div>
                        <div class="match-stat">
                            <span class="stat-icon">⏱️</span>
                            <span id="match-timer">0:00</span>
                        </div>
                    </div>
                </div>

                <p class="match-instruction">Flip cards to find matching German-English pairs!</p>

                <div class="match-grid ${gridSize}" id="match-grid">
                    ${this.currentMatch.cards.map((card, i) => `
                        <div class="match-card" data-index="${i}" data-pair="${card.pairId}">
                            <div class="match-card-inner">
                                <div class="match-card-front">
                                    <span class="card-icon">❓</span>
                                </div>
                                <div class="match-card-back ${card.type}">
                                    <span class="card-emoji">${card.emoji}</span>
                                    <span class="card-text">${card.text}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="match-actions">
                    <button class="btn btn-outline" onclick="window.interactiveExercises.restartMatchPairs()">
                        🔄 Restart
                    </button>
                    <button class="btn btn-outline" onclick="window.interactiveExercises.showExerciseSelector()">
                        ← Back
                    </button>
                </div>
            </div>
        `;

        // Add click listeners to cards
        document.querySelectorAll('.match-card').forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
        });

        // Start timer
        this.startMatchTimer();
    }

    startMatchTimer() {
        if (this.matchTimerInterval) clearInterval(this.matchTimerInterval);

        this.matchTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.currentMatch.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            const timerEl = document.getElementById('match-timer');
            if (timerEl) {
                timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    flipCard(cardElement) {
        const index = parseInt(cardElement.dataset.index);
        const card = this.currentMatch.cards[index];

        // Don't flip if locked, already flipped, or already matched
        if (this.currentMatch.isLocked || card.isFlipped || card.isMatched) {
            return;
        }

        // Flip the card
        card.isFlipped = true;
        cardElement.classList.add('flipped');
        this.currentMatch.flippedCards.push({ card, element: cardElement });

        window.soundManager?.play('click');

        // Speak the word if it's German
        if (card.type === 'german') {
            window.soundManager?.speakGerman(card.text);
        }

        // Check for match when 2 cards are flipped
        if (this.currentMatch.flippedCards.length === 2) {
            this.currentMatch.moves++;
            document.getElementById('match-moves').textContent = this.currentMatch.moves;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [first, second] = this.currentMatch.flippedCards;

        if (first.card.pairId === second.card.pairId) {
            // Match found!
            this.currentMatch.matchedPairs++;
            document.getElementById('match-pairs-count').textContent = this.currentMatch.matchedPairs;

            first.card.isMatched = true;
            second.card.isMatched = true;

            first.element.classList.add('matched');
            second.element.classList.add('matched');

            window.soundManager?.play('correct');

            this.currentMatch.flippedCards = [];

            // Check for game completion
            if (this.currentMatch.matchedPairs === this.currentMatch.words.length) {
                setTimeout(() => this.endMatchPairs(), 500);
            }
        } else {
            // No match - flip back
            this.currentMatch.isLocked = true;
            window.soundManager?.play('wrong');

            setTimeout(() => {
                first.card.isFlipped = false;
                second.card.isFlipped = false;

                first.element.classList.remove('flipped');
                second.element.classList.remove('flipped');

                this.currentMatch.flippedCards = [];
                this.currentMatch.isLocked = false;
            }, 1000);
        }
    }

    restartMatchPairs() {
        if (this.matchTimerInterval) clearInterval(this.matchTimerInterval);
        this.startMatchPairs();
    }

    endMatchPairs() {
        if (this.matchTimerInterval) clearInterval(this.matchTimerInterval);

        const totalTime = Math.floor((Date.now() - this.currentMatch.startTime) / 1000);
        const pairs = this.currentMatch.words.length;
        const moves = this.currentMatch.moves;

        // Calculate score based on efficiency (fewer moves = better)
        const perfectMoves = pairs; // Minimum possible moves
        const efficiency = Math.min(100, Math.round((perfectMoves / moves) * 100));

        // Calculate XP
        const baseXP = pairs * 15;
        const efficiencyBonus = efficiency >= 80 ? 40 : (efficiency >= 60 ? 20 : 0);
        const speedBonus = totalTime < pairs * 10 ? 25 : 0; // Under 10 seconds per pair
        const totalXP = baseXP + efficiencyBonus + speedBonus;

        // Record exercise
        window.gamificationSystem?.simulateExerciseCompletion(
            'matchPairs',
            efficiency,
            totalTime,
            this.currentMatch.words.map(w => w.id)
        );

        if (efficiency >= 70) {
            this.createConfetti(50);
            window.soundManager?.play('celebration');
        }

        const container = document.getElementById('writing-exercise');
        container.innerHTML = `
            <div class="celebration-content" style="margin: 0 auto; max-width: 450px;">
                <div class="celebration-emoji">${efficiency >= 80 ? '🎴🎉' : efficiency >= 60 ? '🎴👍' : '🎴💪'}</div>
                <h2 class="celebration-title">${efficiency >= 80 ? 'Perfect Memory!' : efficiency >= 60 ? 'Great matching!' : 'Good effort!'}</h2>

                <div class="results-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0;">
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${pairs}/${pairs}</div>
                        <div style="color: var(--text-muted);">Pairs Found</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${moves}</div>
                        <div style="color: var(--text-muted);">Moves</div>
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

                <div class="efficiency-bar" style="margin: 1rem 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Efficiency</span>
                        <span>${efficiency}%</span>
                    </div>
                    <div style="background: var(--border-light); border-radius: 10px; height: 10px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, var(--success), #4CAF50); width: ${efficiency}%; height: 100%; border-radius: 10px; transition: width 0.5s ease;"></div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem;">
                    <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startMatchPairs()">
                        🎴 Play Again
                    </button>
                    <button class="btn btn-outline" onclick="window.interactiveExercises.startMatchPairs('all', 8)">
                        🔥 Harder (8 pairs)
                    </button>
                    <button class="btn btn-outline" onclick="window.interactiveExercises.showExerciseSelector()">
                        Back to Exercises
                    </button>
                </div>
            </div>
        `;

        window.gamificationSystem?.updateUI();
    }

    // ==================== LISTENING PRACTICE ====================
    startListeningPractice(category = 'all', wordCount = 10) {
        // Ensure vocabulary is loaded
        if (!window.vocabularyManager || !window.vocabularyManager.vocabularyData) {
            setTimeout(() => this.startListeningPractice(category, wordCount), 200);
            return;
        }

        // Check if speech synthesis is available
        if (!window.soundManager?.isSpeechAvailable()) {
            window.utils.showAlert('Sorry, listening practice requires speech synthesis which is not available in your browser.', 'error');
            return;
        }

        let allWords = window.vocabularyManager.getAllWords(category);

        // Use smart category mixing if not enough words
        if (allWords.length < wordCount && category !== 'all') {
            allWords = this.getWordsWithCategoryMixing(category, wordCount);
        }

        const words = this.shuffleArray([...allWords]).slice(0, wordCount);

        if (words.length === 0) {
            window.utils.showAlert('No words available. Please try a different category.', 'warning');
            return;
        }

        // Navigate to practice section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('practice')?.classList.add('active');

        this.currentListening = {
            words: words,
            currentIndex: 0,
            score: 0,
            attempts: [],
            startTime: Date.now(),
            hintsUsed: 0
        };

        this.showListeningInterface();
        this.showListeningWord();
    }

    showListeningInterface() {
        const container = document.getElementById('writing-exercise');
        if (!container) return;

        container.innerHTML = `
            <div class="listening-exercise">
                <div class="quiz-progress">
                    <div class="listening-badge">
                        <span>🎧</span> Listening Practice
                    </div>
                    <div class="progress-dots" id="listening-progress-dots"></div>
                    <div class="listening-score">
                        <span id="listening-score-display">0</span> / <span>${this.currentListening.words.length}</span>
                    </div>
                </div>

                <div class="listening-prompt" id="listening-prompt">
                    <div class="listening-icon-large">🔊</div>
                    <p class="listening-instruction">Listen and type what you hear</p>
                    <button class="btn btn-primary btn-lg speak-word-btn" id="play-word-btn">
                        🔊 Play Word
                    </button>
                    <button class="btn btn-outline speak-slow-btn" id="play-slow-btn">
                        🐢 Play Slowly
                    </button>
                </div>

                <div class="listening-input-container">
                    <input type="text"
                           id="listening-input"
                           class="listening-input"
                           placeholder="Type the German word you hear..."
                           autocomplete="off"
                           autocapitalize="off"
                           spellcheck="false">
                </div>

                <div class="listening-actions" style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                    <button class="btn btn-outline" id="listening-hint-btn">
                        💡 Show Translation
                    </button>
                    <button class="btn btn-primary" id="listening-check-btn">
                        Check Answer
                    </button>
                    <button class="btn btn-outline" id="listening-skip-btn">
                        Skip →
                    </button>
                </div>

                <div class="listening-feedback hidden" id="listening-feedback"></div>
            </div>
        `;

        // Create progress dots
        const dotsContainer = document.getElementById('listening-progress-dots');
        for (let i = 0; i < this.currentListening.words.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i === 0) dot.classList.add('current');
            dotsContainer.appendChild(dot);
        }

        // Event listeners
        document.getElementById('listening-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkListeningAnswer();
        });
        document.getElementById('play-word-btn').addEventListener('click', () => this.playCurrentWord());
        document.getElementById('play-slow-btn').addEventListener('click', () => this.playCurrentWord(0.6));
        document.getElementById('listening-hint-btn').addEventListener('click', () => this.showListeningHint());
        document.getElementById('listening-check-btn').addEventListener('click', () => this.checkListeningAnswer());
        document.getElementById('listening-skip-btn').addEventListener('click', () => this.skipListeningWord());
    }

    showListeningWord() {
        if (this.currentListening.currentIndex >= this.currentListening.words.length) {
            this.endListeningPractice();
            return;
        }

        const word = this.currentListening.words[this.currentListening.currentIndex];

        // Reset input
        const input = document.getElementById('listening-input');
        input.value = '';
        input.className = 'listening-input';
        input.focus();

        // Update progress
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('current');
            if (i === this.currentListening.currentIndex) dot.classList.add('current');
        });

        // Hide feedback and hint
        document.getElementById('listening-feedback').classList.add('hidden');

        // Auto-play the word
        setTimeout(() => this.playCurrentWord(), 500);
    }

    playCurrentWord(rate = 0.9) {
        const word = this.currentListening.words[this.currentListening.currentIndex];
        const btn = rate < 0.8 ? document.getElementById('play-slow-btn') : document.getElementById('play-word-btn');

        if (btn) {
            btn.classList.add('speaking');
            const utterance = new SpeechSynthesisUtterance(word.word);
            if (window.soundManager?.germanVoice) {
                utterance.voice = window.soundManager.germanVoice;
            }
            utterance.lang = 'de-DE';
            utterance.rate = rate;

            utterance.onend = () => btn.classList.remove('speaking');
            utterance.onerror = () => btn.classList.remove('speaking');

            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        }
    }

    showListeningHint() {
        const word = this.currentListening.words[this.currentListening.currentIndex];
        this.currentListening.hintsUsed++;

        const feedback = document.getElementById('listening-feedback');
        feedback.className = 'listening-feedback hint';
        feedback.innerHTML = `💡 Translation: "${word.translation}" ${word.emoji || ''}`;
        feedback.classList.remove('hidden');
    }

    checkListeningAnswer() {
        const word = this.currentListening.words[this.currentListening.currentIndex];
        const input = document.getElementById('listening-input');
        const userAnswer = input.value.trim().toLowerCase();

        // Remove article from correct answer for comparison
        const correctFull = word.word.toLowerCase();
        const correctNoArticle = correctFull.replace(/^(der|die|das)\s+/i, '');

        const similarity = Math.max(
            this.calculateSimilarity(userAnswer, correctFull),
            this.calculateSimilarity(userAnswer, correctNoArticle)
        );

        const isCorrect = similarity >= 0.85;

        if (isCorrect) {
            input.className = 'listening-input correct';
            this.currentListening.score++;
            document.getElementById('listening-score-display').textContent = this.currentListening.score;

            window.soundManager?.play('correct');

            this.showListeningFeedback(true, `✅ Correct! "${word.word}" = ${word.translation}`);

            // Update progress dot
            const dots = document.querySelectorAll('.progress-dot');
            dots[this.currentListening.currentIndex].classList.add('correct');

            // Next word after delay
            setTimeout(() => {
                this.currentListening.currentIndex++;
                this.showListeningWord();
            }, 1500);

        } else {
            input.className = 'listening-input incorrect';
            window.soundManager?.play('wrong');

            this.showListeningFeedback(false, `The word was: "${word.word}" (${word.translation})`);

            // Update progress dot
            const dots = document.querySelectorAll('.progress-dot');
            dots[this.currentListening.currentIndex].classList.add('wrong');

            // Next word after delay
            setTimeout(() => {
                this.currentListening.currentIndex++;
                this.showListeningWord();
            }, 2500);
        }

        this.currentListening.attempts.push({
            word: word,
            userAnswer: userAnswer,
            correct: isCorrect
        });
    }

    skipListeningWord() {
        const word = this.currentListening.words[this.currentListening.currentIndex];

        // Mark as wrong
        const dots = document.querySelectorAll('.progress-dot');
        dots[this.currentListening.currentIndex].classList.add('wrong');

        this.currentListening.attempts.push({
            word: word,
            userAnswer: '',
            correct: false,
            skipped: true
        });

        this.currentListening.currentIndex++;
        this.showListeningWord();
    }

    showListeningFeedback(isCorrect, message) {
        const feedback = document.getElementById('listening-feedback');
        feedback.className = `listening-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = message;
        feedback.classList.remove('hidden');
    }

    endListeningPractice() {
        const totalTime = Math.floor((Date.now() - this.currentListening.startTime) / 1000);
        const accuracy = Math.round((this.currentListening.score / this.currentListening.words.length) * 100);

        // Award XP
        const baseXP = this.currentListening.score * 12;
        const bonusXP = accuracy >= 80 ? 30 : (accuracy >= 60 ? 15 : 0);
        const totalXP = baseXP + bonusXP;

        // Record exercise
        window.gamificationSystem.simulateExerciseCompletion(
            'listening',
            accuracy,
            totalTime,
            this.currentListening.words.map(w => w.id)
        );

        if (accuracy >= 80) {
            this.createConfetti(60);
            window.soundManager?.play('celebration');
        }

        const container = document.getElementById('writing-exercise');
        container.innerHTML = `
            <div class="celebration-content" style="margin: 0 auto; max-width: 400px;">
                <div class="celebration-emoji">${accuracy >= 80 ? '🎧🎉' : accuracy >= 50 ? '🎧👍' : '🎧💪'}</div>
                <h2 class="celebration-title">${accuracy >= 80 ? 'Excellent listening!' : accuracy >= 50 ? 'Good effort!' : 'Keep practicing!'}</h2>
                <div class="results-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0;">
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${accuracy}%</div>
                        <div style="color: var(--text-muted);">Accuracy</div>
                    </div>
                    <div class="result-stat" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${this.currentListening.score}/${this.currentListening.words.length}</div>
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
                    <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startListeningPractice()">
                        🎧 Practice Again
                    </button>
                    <button class="btn btn-outline" onclick="window.interactiveExercises.showExerciseSelector()">
                        Back to Exercises
                    </button>
                </div>
            </div>
        `;

        window.gamificationSystem.updateUI();
    }

    // ==================== UTILITY FUNCTIONS ====================
    // Delegate to shared utils module
    shuffleArray(array) {
        return window.utils.shuffleArray(array);
    }

    calculateSimilarity(str1, str2) {
        return window.utils.calculateSimilarity(str1, str2);
    }

    saveQuizHistory(result) {
        try {
            const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
            history.push(result);
            // Keep only last 10 entries
            if (history.length > 10) history.shift();
            localStorage.setItem('quizHistory', JSON.stringify(history));
        } catch (e) {
            console.error('Error saving quiz history:', e);
        }
    }
}

// Initialize
window.interactiveExercises = new InteractiveExercises();
