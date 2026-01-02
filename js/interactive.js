// Interactive Exercises - Quiz, Typing, Daily Challenges

class InteractiveExercises {
    constructor() {
        this.currentQuiz = null;
        this.currentTyping = null;
        this.dailyChallenge = null;
        this.streakCount = 0;
        this.init();
    }

    init() {
        // Wait for vocabulary manager to load
        this.waitForVocabulary();
    }

    waitForVocabulary() {
        if (window.vocabularyManager && window.vocabularyManager.vocabularyData) {
            console.log('Interactive exercises initialized');
        } else {
            setTimeout(() => this.waitForVocabulary(), 100);
        }
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

    // ==================== DAILY CHALLENGE ====================
    generateDailyChallenge() {
        const today = new Date().toDateString();
        const savedChallenge = localStorage.getItem('dailyChallenge');

        if (savedChallenge) {
            const parsed = JSON.parse(savedChallenge);
            if (parsed.date === today && !parsed.completed) {
                return parsed;
            }
        }

        // Generate new challenge
        const challenges = [
            { type: 'quiz', name: 'Quick Quiz Master', desc: 'Complete a 10-word quiz with 80%+ accuracy', target: 80, reward: 50 },
            { type: 'typing', name: 'Typing Champion', desc: 'Type 10 words correctly', target: 10, reward: 60 },
            { type: 'flashcards', name: 'Flashcard Pro', desc: 'Review 15 flashcards', target: 15, reward: 40 },
            { type: 'mixed', name: 'All-Rounder', desc: 'Complete 3 different exercise types', target: 3, reward: 75 },
            { type: 'streak', name: 'Perfect Streak', desc: 'Get 5 correct answers in a row', target: 5, reward: 45 }
        ];

        const challenge = challenges[Math.floor(Math.random() * challenges.length)];
        const dailyChallenge = {
            ...challenge,
            date: today,
            progress: 0,
            completed: false
        };

        localStorage.setItem('dailyChallenge', JSON.stringify(dailyChallenge));
        return dailyChallenge;
    }

    startDailyChallenge() {
        const challenge = this.generateDailyChallenge();

        if (challenge.completed) {
            alert('You\'ve already completed today\'s challenge! Come back tomorrow for a new one.');
            return;
        }

        this.dailyChallenge = challenge;

        switch (challenge.type) {
            case 'quiz':
                this.startQuiz('all', 10);
                break;
            case 'typing':
                this.startTyping('all', 10, 2);
                break;
            case 'flashcards':
                window.vocabularyManager.startFlashcardSession('all', 15);
                break;
            case 'mixed':
                this.showMixedChallengeSelector();
                break;
            case 'streak':
                this.startQuiz('all', 10);
                break;
        }
    }

    showMixedChallengeSelector() {
        const container = document.getElementById('writing-exercise');
        container.innerHTML = `
            <div class="daily-challenge-card" style="max-width: 500px; margin: 0 auto;">
                <div class="challenge-icon">🏆</div>
                <div class="challenge-title">Daily Challenge: All-Rounder</div>
                <div class="challenge-desc">Complete 3 different exercise types</div>
                <div class="challenge-reward">🎁 +75 XP Bonus</div>
            </div>
            <div style="margin-top: 2rem;">
                <h3>Choose your exercises:</h3>
                <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                    <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startQuiz()">
                        🎯 Tap-to-Answer Quiz
                    </button>
                    <button class="btn btn-primary btn-playful" onclick="window.interactiveExercises.startTyping()">
                        ⌨️ Typing Practice
                    </button>
                    <button class="btn btn-primary btn-playful" onclick="window.vocabularyManager.startFlashcardSession()">
                        📚 Flashcards
                    </button>
                </div>
            </div>
        `;
    }

    checkDailyChallengeProgress(type, score) {
        if (!this.dailyChallenge || this.dailyChallenge.completed) return;

        let completed = false;

        switch (this.dailyChallenge.type) {
            case 'quiz':
                if (type === 'quiz' && score >= 80) completed = true;
                break;
            case 'typing':
                this.dailyChallenge.progress += score;
                if (this.dailyChallenge.progress >= 10) completed = true;
                break;
            case 'streak':
                if (this.streakCount >= 5) completed = true;
                break;
        }

        if (completed) {
            this.completeDailyChallenge();
        }
    }

    completeDailyChallenge() {
        this.dailyChallenge.completed = true;
        localStorage.setItem('dailyChallenge', JSON.stringify(this.dailyChallenge));

        // Award bonus XP
        window.gamificationSystem.addXP(this.dailyChallenge.reward);

        // Celebration
        this.createConfetti(100);

        setTimeout(() => {
            alert(`🎉 Daily Challenge Complete!\n+${this.dailyChallenge.reward} Bonus XP!`);
        }, 500);
    }

    // ==================== EXERCISE SELECTOR ====================
    showExerciseSelector() {
        const container = document.getElementById('writing-exercise');
        if (!container) return;

        const challenge = this.generateDailyChallenge();

        container.innerHTML = `
            <div class="exercise-selection">
                ${!challenge.completed ? `
                    <div class="daily-challenge-card" style="margin-bottom: 2rem; cursor: pointer;" onclick="window.interactiveExercises.startDailyChallenge()">
                        <div class="challenge-icon">🏆</div>
                        <div class="challenge-title">${challenge.name}</div>
                        <div class="challenge-desc">${challenge.desc}</div>
                        <div class="challenge-reward">🎁 +${challenge.reward} XP Bonus</div>
                    </div>
                ` : `
                    <div style="background: var(--success); color: white; padding: 1rem; border-radius: var(--border-radius-lg); margin-bottom: 2rem; text-align: center;">
                        ✅ Daily Challenge Complete! Come back tomorrow.
                    </div>
                `}

                <h3 style="margin-bottom: 1rem;">Choose an Exercise</h3>
                <div class="exercise-types" style="display: grid; gap: 1rem;">
                    <button class="exercise-type-card" onclick="window.interactiveExercises.startQuiz()" style="padding: 1.5rem; text-align: left; border: 2px solid var(--border-light); border-radius: var(--border-radius-lg); background: var(--bg-card); cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 2.5rem;">🎯</div>
                            <div>
                                <h4 style="margin: 0 0 0.25rem 0;">Tap-to-Answer Quiz</h4>
                                <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">Fast vocabulary practice with 3 options</p>
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
