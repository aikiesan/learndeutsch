class VocabularyManager {
    constructor() {
        this.vocabularyData = null;
        this.allLevelsData = {};
        this.currentLevel = 'A1';
        this.currentSession = null;
        this.sessionWords = [];
        this.currentWordIndex = 0;
        this.loadAllVocabularyData();
    }

    async loadAllVocabularyData() {
        try {
            // Load all available levels
            const levels = ['a1', 'a2', 'b1'];
            const promises = levels.map(level =>
                fetch(`data/vocabulary/${level}.json`)
                    .then(response => response.json())
                    .then(data => ({ level: level.toUpperCase(), data }))
                    .catch(() => null) // Ignore failed loads
            );

            const results = await Promise.all(promises);

            results.forEach(result => {
                if (result) {
                    this.allLevelsData[result.level] = result.data;
                }
            });

            // Set initial vocabulary data
            this.vocabularyData = this.allLevelsData[this.currentLevel] || this.allLevelsData['A1'];

            this.displayVocabularyStats();
            this.populateVocabularyList();
        } catch (error) {
            console.error('Error loading vocabulary data:', error);
            this.showError('Failed to load vocabulary data');
        }
    }

    setLevel(level) {
        if (this.allLevelsData[level]) {
            this.currentLevel = level;
            this.vocabularyData = this.allLevelsData[level];
            this.displayVocabularyStats();
            this.populateVocabularyList();
        }
        // Silently ignore unavailable levels
    }

    async loadVocabularyData() {
        // For backward compatibility - now just uses allLevelsData
        if (this.vocabularyData) return;
        await this.loadAllVocabularyData();
    }

    getAllWords(categoryFilter = 'all') {
        if (!this.vocabularyData) return [];

        let words = [];

        if (categoryFilter === 'all') {
            Object.values(this.vocabularyData.categories).forEach(category => {
                words = words.concat(category.words.map(word => ({
                    ...word,
                    category: Object.keys(this.vocabularyData.categories)
                        .find(key => this.vocabularyData.categories[key] === category)
                })));
            });
        } else {
            const category = this.vocabularyData.categories[categoryFilter];
            if (category) {
                words = category.words.map(word => ({
                    ...word,
                    category: categoryFilter
                }));
            }
        }

        return words;
    }

    getWordsForStudy(category = 'all', limit = 10, includeNew = true, includeReview = true) {
        const allWords = this.getAllWords(category);
        const userData = window.storageManager.getUserData();
        const learnedWords = userData.wordsLearned;

        let studyWords = [];

        // Get words for review (spaced repetition)
        if (includeReview) {
            const reviewWords = window.storageManager.getWordsForReview(Math.floor(limit * 0.7));
            const reviewWordData = reviewWords.map(wordProgress => {
                const word = allWords.find(w => w.id === wordProgress.id);
                return word ? { ...word, isReview: true, progress: wordProgress } : null;
            }).filter(w => w !== null);

            studyWords = studyWords.concat(reviewWordData);
        }

        // Add new words to fill the session
        if (includeNew && studyWords.length < limit) {
            const newWords = allWords.filter(word => {
                const isLearned = learnedWords.some(learned => learned.id === word.id);
                return !isLearned && !studyWords.some(sw => sw.id === word.id);
            });

            // Sort by difficulty for progressive learning
            newWords.sort((a, b) => a.difficulty - b.difficulty);

            const needed = limit - studyWords.length;
            studyWords = studyWords.concat(
                newWords.slice(0, needed).map(word => ({ ...word, isReview: false }))
            );
        }

        // Shuffle the words for variety
        return this.shuffleArray(studyWords).slice(0, limit);
    }

    shuffleArray(array) {
        return window.utils.shuffleArray(array);
    }

    startFlashcardSession(category = 'all', wordCount = 10) {
        const words = this.getWordsForStudy(category, wordCount);

        if (words.length === 0) {
            this.showError('No words available for study in this category');
            return false;
        }

        this.currentSession = {
            id: Date.now(),
            category: category,
            startTime: Date.now(),
            totalWords: words.length,
            correctAnswers: 0,
            answers: []
        };

        this.sessionWords = words;
        this.currentWordIndex = 0;

        this.showFlashcardInterface();
        this.displayCurrentFlashcard();

        return true;
    }

    showFlashcardInterface() {
        // Hide vocabulary list and show flashcard container
        const vocabularyList = document.getElementById('vocabulary-list');
        const flashcardContainer = document.getElementById('flashcard-container');

        if (vocabularyList) vocabularyList.style.display = 'none';
        if (flashcardContainer) flashcardContainer.classList.remove('hidden');

        // Set up event listeners
        this.setupFlashcardEventListeners();
    }

    setupFlashcardEventListeners() {
        const revealBtn = document.getElementById('reveal-translation');
        const hardBtn = document.getElementById('difficulty-hard');
        const mediumBtn = document.getElementById('difficulty-medium');
        const easyBtn = document.getElementById('difficulty-easy');

        // Remove existing listeners
        [revealBtn, hardBtn, mediumBtn, easyBtn].forEach(btn => {
            if (btn) {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
            }
        });

        // Add new listeners
        document.getElementById('reveal-translation')?.addEventListener('click', () => {
            this.revealTranslation();
        });

        document.getElementById('difficulty-hard')?.addEventListener('click', () => {
            this.handleDifficultyResponse('hard');
        });

        document.getElementById('difficulty-medium')?.addEventListener('click', () => {
            this.handleDifficultyResponse('medium');
        });

        document.getElementById('difficulty-easy')?.addEventListener('click', () => {
            this.handleDifficultyResponse('easy');
        });
    }

    displayCurrentFlashcard() {
        if (this.currentWordIndex >= this.sessionWords.length) {
            this.endFlashcardSession();
            return;
        }

        const currentWord = this.sessionWords[this.currentWordIndex];

        // Update flashcard content
        const wordGerman = document.getElementById('word-german');
        const wordEnglish = document.getElementById('word-english');
        const wordExample = document.getElementById('word-example');
        const currentCard = document.getElementById('current-card');
        const totalCards = document.getElementById('total-cards');
        const progressBar = document.getElementById('flashcard-progress');

        if (wordGerman) {
            wordGerman.innerHTML = `
                ${currentWord.word}
                <button class="speak-btn" onclick="window.soundManager.speakWithFeedback('${currentWord.word.replace(/'/g, "\\'")}', this)" title="Listen to pronunciation">
                    🔊
                </button>
            `;
        }
        if (wordEnglish) wordEnglish.textContent = currentWord.translation;
        if (wordExample) {
            wordExample.innerHTML = `
                ${currentWord.example}
                <button class="speak-btn speak-btn-small" onclick="window.soundManager.speakWithFeedback('${currentWord.example.replace(/'/g, "\\'")}', this)" title="Listen to example">
                    🔊
                </button>
            `;
        }
        if (currentCard) currentCard.textContent = this.currentWordIndex + 1;
        if (totalCards) totalCards.textContent = this.sessionWords.length;

        if (progressBar) {
            const progress = ((this.currentWordIndex + 1) / this.sessionWords.length) * 100;
            progressBar.style.width = `${progress}%`;
        }

        // Reset card state
        const flashcardFront = document.querySelector('.flashcard-front');
        const flashcardBack = document.querySelector('.flashcard-back');

        if (flashcardFront) flashcardFront.classList.remove('hidden');
        if (flashcardBack) flashcardBack.classList.add('hidden');

        // Add review indicator if this is a review word
        const flashcard = document.getElementById('flashcard');
        if (currentWord.isReview) {
            flashcard?.classList.add('review-word');
        } else {
            flashcard?.classList.remove('review-word');
        }
    }

    revealTranslation() {
        const flashcardFront = document.querySelector('.flashcard-front');
        const flashcardBack = document.querySelector('.flashcard-back');

        if (flashcardFront) flashcardFront.classList.add('hidden');
        if (flashcardBack) flashcardBack.classList.remove('hidden');

        // Record that the user viewed the translation
        const currentWord = this.sessionWords[this.currentWordIndex];
        if (!this.currentSession.answers[this.currentWordIndex]) {
            this.currentSession.answers[this.currentWordIndex] = {
                word: currentWord,
                viewedTranslation: true,
                startTime: Date.now()
            };
        }
    }

    handleDifficultyResponse(difficulty) {
        const currentWord = this.sessionWords[this.currentWordIndex];
        const answerData = this.currentSession.answers[this.currentWordIndex] || {
            word: currentWord,
            startTime: Date.now()
        };

        answerData.difficulty = difficulty;
        answerData.endTime = Date.now();
        answerData.responseTime = answerData.endTime - answerData.startTime;

        // Calculate correctness based on difficulty selection
        // Easy = correct, Medium = somewhat correct, Hard = incorrect
        const correct = difficulty === 'easy' || difficulty === 'medium';
        answerData.correct = correct;

        if (correct) {
            this.currentSession.correctAnswers++;
        }

        this.currentSession.answers[this.currentWordIndex] = answerData;

        // Update progress in storage
        window.storageManager.addVocabularyProgress(
            currentWord.id,
            currentWord.category,
            currentWord.difficulty,
            correct
        );

        // Move to next word
        this.currentWordIndex++;

        // Small delay for better UX
        setTimeout(() => {
            this.displayCurrentFlashcard();
        }, 500);
    }

    endFlashcardSession() {
        if (!this.currentSession) return;

        const endTime = Date.now();
        const totalTime = Math.floor((endTime - this.currentSession.startTime) / 1000); // in seconds
        const score = Math.round((this.currentSession.correctAnswers / this.currentSession.totalWords) * 100);

        // Record exercise completion
        const wordIds = this.sessionWords.map(w => w.id);
        const exerciseResult = window.gamificationSystem.simulateExerciseCompletion(
            'flashcard',
            score,
            totalTime,
            wordIds
        );

        // Show session results
        this.showSessionResults({
            ...this.currentSession,
            endTime,
            totalTime,
            score,
            exerciseResult
        });

        // Update UI
        window.gamificationSystem.updateUI();
    }

    showSessionResults(sessionData) {
        const flashcardContainer = document.getElementById('flashcard-container');
        const vocabularyList = document.getElementById('vocabulary-list');

        // Hide flashcard interface
        if (flashcardContainer) flashcardContainer.classList.add('hidden');
        if (vocabularyList) vocabularyList.style.display = 'grid';

        // Create and show results modal
        this.createResultsModal(sessionData);
    }

    createResultsModal(sessionData) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
                <div class="session-results">
                    <h3>Session Complete! 🎉</h3>
                    <div class="results-stats">
                        <div class="result-stat">
                            <span class="result-number">${sessionData.score}%</span>
                            <span class="result-label">Accuracy</span>
                        </div>
                        <div class="result-stat">
                            <span class="result-number">${sessionData.correctAnswers}/${sessionData.totalWords}</span>
                            <span class="result-label">Correct</span>
                        </div>
                        <div class="result-stat">
                            <span class="result-number">${Math.floor(sessionData.totalTime / 60)}:${(sessionData.totalTime % 60).toString().padStart(2, '0')}</span>
                            <span class="result-label">Time</span>
                        </div>
                        <div class="result-stat">
                            <span class="result-number">+${sessionData.exerciseResult.xp.gainedXP}</span>
                            <span class="result-label">XP Earned</span>
                        </div>
                    </div>

                    ${sessionData.exerciseResult.achievements.length > 0 ? `
                        <div class="new-achievements">
                            <h4>New Achievements!</h4>
                            ${sessionData.exerciseResult.achievements.map(achievement => `
                                <div class="achievement-mini">
                                    <span class="achievement-icon">${achievement.icon}</span>
                                    <span class="achievement-name">${achievement.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class="session-actions">
                        <button class="btn btn-primary" onclick="window.vocabularyManager.startFlashcardSession('${sessionData.category}', ${sessionData.totalWords}); this.parentElement.parentElement.parentElement.parentElement.remove();">
                            Study Again
                        </button>
                        <button class="btn btn-outline" onclick="this.parentElement.parentElement.parentElement.parentElement.remove();">
                            Continue Learning
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 30000);
    }

    displayVocabularyStats() {
        if (!this.vocabularyData) return;

        const userData = window.storageManager.getUserData();
        const wordsLearned = userData.statistics.totalWordsLearned;
        const wordsForReview = window.storageManager.getWordsForReview().length;
        const averageAccuracy = Math.round(userData.statistics.averageAccuracy * 100) || 0;

        const elements = {
            'words-learned': wordsLearned,
            'words-reviewing': wordsForReview,
            'accuracy-rate': `${averageAccuracy}%`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Update level progress
        this.updateLevelProgress();
    }

    updateLevelProgress() {
        const userData = window.storageManager.getUserData();
        const totalA1Words = this.vocabularyData ? this.vocabularyData.totalWords : 150;
        const learnedA1Words = userData.wordsLearned.filter(w => w.category &&
            Object.keys(this.vocabularyData.categories).includes(w.category)).length;

        const progressPercentage = Math.min(100, (learnedA1Words / totalA1Words) * 100);

        // Update A1 level card progress
        const a1Card = document.querySelector('[data-level="A1"]');
        if (a1Card) {
            const progressBar = a1Card.querySelector('.progress-fill');
            const progressText = a1Card.querySelector('.progress-text');

            if (progressBar) progressBar.style.width = `${progressPercentage}%`;
            if (progressText) progressText.textContent = `${learnedA1Words}/${totalA1Words} words`;
        }
    }

    populateVocabularyList() {
        const vocabularyList = document.getElementById('vocabulary-list');
        if (!vocabularyList || !this.vocabularyData) return;

        vocabularyList.innerHTML = '';

        const userData = window.storageManager.getUserData();
        const allWords = this.getAllWords();

        allWords.forEach(word => {
            const wordProgress = userData.wordsLearned.find(w => w.id === word.id);
            const wordElement = this.createVocabularyItem(word, wordProgress);
            vocabularyList.appendChild(wordElement);
        });
    }

    createVocabularyItem(word, progress = null) {
        const item = document.createElement('div');
        item.className = 'vocabulary-item';

        const masteryLevel = progress ? progress.masteryLevel : 0;
        const masteryDots = Array.from({ length: 5 }, (_, i) =>
            `<span class="mastery-dot ${i < masteryLevel ? 'filled' : ''}"></span>`
        ).join('');

        // Escape quotes for onclick handler
        const escapedWord = word.word.replace(/'/g, "\\'");
        const escapedExample = word.example.replace(/'/g, "\\'");

        item.innerHTML = `
            <div class="vocabulary-category">${word.category}</div>
            <div class="vocabulary-word">
                ${word.word}
                <button class="speak-btn speak-btn-small" onclick="event.stopPropagation(); window.soundManager.speakWithFeedback('${escapedWord}', this)" title="Listen">🔊</button>
            </div>
            <div class="vocabulary-translation">${word.translation}</div>
            <div class="vocabulary-example">
                "${word.example}"
                <button class="speak-btn speak-btn-tiny" onclick="event.stopPropagation(); window.soundManager.speakWithFeedback('${escapedExample}', this)" title="Listen to example">🔊</button>
            </div>
            <div class="vocabulary-progress">
                <div class="mastery-level">
                    ${masteryDots}
                </div>
                <span class="last-reviewed">
                    ${progress ? `Reviewed ${this.formatTimeAgo(progress.lastReviewed)}` : 'Not studied'}
                </span>
            </div>
        `;

        return item;
    }

    formatTimeAgo(timestamp) {
        return window.utils.formatTimeAgo(timestamp);
    }

    filterVocabularyByCategory(category) {
        const vocabularyList = document.getElementById('vocabulary-list');
        if (!vocabularyList) return;

        vocabularyList.innerHTML = '';
        const words = this.getAllWords(category);
        const userData = window.storageManager.getUserData();

        words.forEach(word => {
            const wordProgress = userData.wordsLearned.find(w => w.id === word.id);
            const wordElement = this.createVocabularyItem(word, wordProgress);
            vocabularyList.appendChild(wordElement);
        });
    }

    showError(message) {
        console.error(message);
        window.utils.showAlert(message, 'error');
    }

    // Multiple choice exercise generation
    generateMultipleChoiceExercise(word) {
        const allWords = this.getAllWords();
        const correctAnswer = word.translation;

        // Get 3 random incorrect answers from the same part of speech if possible
        let wrongAnswers = allWords
            .filter(w => w.id !== word.id && w.translation !== correctAnswer)
            .map(w => w.translation);

        // Shuffle and take 3
        wrongAnswers = this.shuffleArray(wrongAnswers).slice(0, 3);

        // Combine and shuffle all options
        const allOptions = this.shuffleArray([correctAnswer, ...wrongAnswers]);

        return {
            question: `What does "${word.word}" mean?`,
            options: allOptions,
            correctAnswer: correctAnswer,
            word: word
        };
    }

    // Typing exercise generation
    generateTypingExercise(word) {
        return {
            question: `Type the German word for "${word.translation}"`,
            correctAnswer: word.word.toLowerCase(),
            hint: word.example,
            word: word
        };
    }
}

// Initialize vocabulary manager
window.vocabularyManager = new VocabularyManager();