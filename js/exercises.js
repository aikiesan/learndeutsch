class ExerciseManager {
    constructor() {
        this.currentExercise = null;
        this.exerciseData = {
            sentenceConstruction: [],
            translation: [],
            freeWriting: []
        };
        this.loadExerciseData();
    }

    async loadExerciseData() {
        try {
            // For now, we'll create exercises dynamically
            // In the future, you could load from JSON files
            this.generateBasicExercises();
        } catch (error) {
            console.error('Error loading exercise data:', error);
        }
    }

    generateBasicExercises() {
        // Basic sentence construction exercises for A1 level
        this.exerciseData.sentenceConstruction = [
            {
                id: 'sc_001',
                level: 'A1',
                prompt: 'Build a sentence: "I am a student"',
                correctSentence: 'Ich bin ein Student.',
                words: ['Ich', 'bin', 'ein', 'Student.'],
                hints: ['Start with the subject', 'Use the correct form of "to be"'],
                category: 'basic_sentences'
            },
            {
                id: 'sc_002',
                level: 'A1',
                prompt: 'Build a sentence: "My name is Anna"',
                correctSentence: 'Ich heiße Anna.',
                words: ['Ich', 'heiße', 'Anna.'],
                hints: ['Use the phrase for introducing yourself'],
                category: 'introductions'
            },
            {
                id: 'sc_003',
                level: 'A1',
                prompt: 'Build a sentence: "The apple is red"',
                correctSentence: 'Der Apfel ist rot.',
                words: ['Der', 'Apfel', 'ist', 'rot.'],
                hints: ['Remember the article for apple', 'Use the correct form of "to be"'],
                category: 'colors_objects'
            },
            {
                id: 'sc_004',
                level: 'A1',
                prompt: 'Build a sentence: "I have two cats"',
                correctSentence: 'Ich habe zwei Katzen.',
                words: ['Ich', 'habe', 'zwei', 'Katzen.'],
                hints: ['Use the correct form of "to have"', 'Remember the number'],
                category: 'family_animals'
            },
            {
                id: 'sc_005',
                level: 'A1',
                prompt: 'Build a sentence: "We go to school"',
                correctSentence: 'Wir gehen zur Schule.',
                words: ['Wir', 'gehen', 'zur', 'Schule.'],
                hints: ['Start with "we"', 'Use the correct preposition'],
                category: 'daily_activities'
            }
        ];

        // Translation exercises
        this.exerciseData.translation = [
            {
                id: 'tr_001',
                level: 'A1',
                english: 'Hello, how are you?',
                german: 'Hallo, wie geht es dir?',
                hints: ['informal greeting', 'use "dir" for informal'],
                category: 'greetings',
                difficulty: 2
            },
            {
                id: 'tr_002',
                level: 'A1',
                english: 'I am twenty years old.',
                german: 'Ich bin zwanzig Jahre alt.',
                hints: ['use "bin" for "I am"', 'remember "Jahre alt"'],
                category: 'personal_info',
                difficulty: 2
            },
            {
                id: 'tr_003',
                level: 'A1',
                english: 'My family is big.',
                german: 'Meine Familie ist groß.',
                hints: ['possessive pronoun "meine"', 'adjective "groß"'],
                category: 'family',
                difficulty: 2
            },
            {
                id: 'tr_004',
                level: 'A1',
                english: 'The cat is black and white.',
                german: 'Die Katze ist schwarz und weiß.',
                hints: ['article "die" for cat', 'use "und" for "and"'],
                category: 'colors_animals',
                difficulty: 3
            },
            {
                id: 'tr_005',
                level: 'A1',
                english: 'I drink coffee in the morning.',
                german: 'Ich trinke morgens Kaffee.',
                hints: ['verb "trinken"', '"morgens" for "in the morning"'],
                category: 'daily_routine',
                difficulty: 3
            }
        ];

        // Free writing prompts
        this.exerciseData.freeWriting = [
            {
                id: 'fw_001',
                level: 'A1',
                title: 'Introduce Yourself',
                prompt: 'Write 3-4 sentences introducing yourself. Include your name, age, and where you live.',
                suggestions: [
                    'Ich heiße...',
                    'Ich bin ... Jahre alt.',
                    'Ich wohne in...',
                    'Ich komme aus...'
                ],
                minWords: 15,
                maxWords: 50,
                category: 'personal_introduction'
            },
            {
                id: 'fw_002',
                level: 'A1',
                title: 'My Family',
                prompt: 'Describe your family. Who are the members? What are they like?',
                suggestions: [
                    'Meine Familie ist...',
                    'Ich habe...',
                    'Mein Vater/Meine Mutter...',
                    'Wir wohnen...'
                ],
                minWords: 20,
                maxWords: 60,
                category: 'family_description'
            },
            {
                id: 'fw_003',
                level: 'A1',
                title: 'My Daily Routine',
                prompt: 'Write about what you do in the morning. Use simple sentences.',
                suggestions: [
                    'Ich stehe um ... Uhr auf.',
                    'Ich trinke...',
                    'Ich esse...',
                    'Ich gehe...'
                ],
                minWords: 25,
                maxWords: 70,
                category: 'daily_routine'
            }
        ];
    }

    startExercise(type, exerciseId = null) {
        let exercise;

        if (exerciseId) {
            exercise = this.exerciseData[type].find(ex => ex.id === exerciseId);
        } else {
            // Get random exercise of this type
            const exercises = this.exerciseData[type];
            exercise = exercises[Math.floor(Math.random() * exercises.length)];
        }

        if (!exercise) {
            this.showError(`No exercises available for type: ${type}`);
            return false;
        }

        this.currentExercise = {
            ...exercise,
            type: type,
            startTime: Date.now(),
            attempts: 0,
            userAnswer: '',
            isComplete: false
        };

        this.displayExercise();
        return true;
    }

    displayExercise() {
        if (!this.currentExercise) return;

        const exerciseContainer = document.getElementById('writing-exercise');
        if (!exerciseContainer) return;

        let exerciseHTML = '';

        switch (this.currentExercise.type) {
            case 'sentenceConstruction':
                exerciseHTML = this.createSentenceConstructionHTML();
                break;
            case 'translation':
                exerciseHTML = this.createTranslationHTML();
                break;
            case 'freeWriting':
                exerciseHTML = this.createFreeWritingHTML();
                break;
        }

        exerciseContainer.innerHTML = exerciseHTML;
        this.setupExerciseEventListeners();
    }

    createSentenceConstructionHTML() {
        const exercise = this.currentExercise;
        const shuffledWords = this.shuffleArray([...exercise.words]);

        return `
            <div class="exercise-prompt">
                <h3>${exercise.prompt}</h3>
                <p><em>Drag the words below to form the correct German sentence.</em></p>
            </div>

            <div class="sentence-builder" id="sentence-builder">
                <p class="builder-hint">Drop words here...</p>
            </div>

            <div class="word-bank">
                <h4>Word Bank</h4>
                <div class="word-chips" id="word-chips">
                    ${shuffledWords.map(word => `
                        <div class="word-chip" data-word="${word}" draggable="true">
                            ${word}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="exercise-actions">
                <button class="btn btn-primary" id="check-sentence">Check Answer</button>
                <button class="btn btn-outline" id="clear-sentence">Clear</button>
                <button class="btn btn-outline" id="hint-sentence">Hint</button>
            </div>

            <div class="exercise-feedback hidden" id="exercise-feedback"></div>
        `;
    }

    createTranslationHTML() {
        const exercise = this.currentExercise;

        return `
            <div class="exercise-prompt">
                <h3>Translation Exercise</h3>
                <p>Translate the following English sentence into German:</p>
                <div class="translation-source">
                    "${exercise.english}"
                </div>
            </div>

            <div class="translation-input">
                <label for="translation-answer">Your German translation:</label>
                <textarea
                    id="translation-answer"
                    class="writing-textarea"
                    placeholder="Type your German translation here..."
                    rows="3"
                ></textarea>
            </div>

            <div class="exercise-actions">
                <button class="btn btn-primary" id="check-translation">Check Translation</button>
                <button class="btn btn-outline" id="hint-translation">Show Hint</button>
            </div>

            <div class="hints-section hidden" id="hints-section">
                <h4>Hints:</h4>
                <ul>
                    ${exercise.hints.map(hint => `<li>${hint}</li>`).join('')}
                </ul>
            </div>

            <div class="exercise-feedback hidden" id="exercise-feedback"></div>
        `;
    }

    createFreeWritingHTML() {
        const exercise = this.currentExercise;

        return `
            <div class="exercise-prompt">
                <h3>${exercise.title}</h3>
                <p>${exercise.prompt}</p>
                <div class="writing-requirements">
                    <span class="requirement">📝 ${exercise.minWords}-${exercise.maxWords} words</span>
                    <span class="requirement">🎯 Level: ${exercise.level}</span>
                </div>
            </div>

            <div class="writing-suggestions">
                <h4>Suggested phrases to get you started:</h4>
                <div class="suggestion-chips">
                    ${exercise.suggestions.map(suggestion => `
                        <div class="suggestion-chip" onclick="window.exerciseManager.insertSuggestion('${suggestion}')">
                            ${suggestion}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="writing-area">
                <textarea
                    id="free-writing-answer"
                    class="writing-textarea"
                    placeholder="Start writing in German..."
                    rows="8"
                ></textarea>
                <div class="writing-stats">
                    <span id="word-count">0</span> words
                    <span id="character-count">0</span> characters
                </div>
            </div>

            <div class="exercise-actions">
                <button class="btn btn-primary" id="submit-writing">Submit Writing</button>
                <button class="btn btn-outline" id="save-draft">Save Draft</button>
            </div>

            <div class="exercise-feedback hidden" id="exercise-feedback"></div>
        `;
    }

    setupExerciseEventListeners() {
        const type = this.currentExercise.type;

        if (type === 'sentenceConstruction') {
            this.setupSentenceConstructionListeners();
        } else if (type === 'translation') {
            this.setupTranslationListeners();
        } else if (type === 'freeWriting') {
            this.setupFreeWritingListeners();
        }
    }

    setupSentenceConstructionListeners() {
        const wordChips = document.querySelectorAll('.word-chip');
        const sentenceBuilder = document.getElementById('sentence-builder');
        const checkBtn = document.getElementById('check-sentence');
        const clearBtn = document.getElementById('clear-sentence');
        const hintBtn = document.getElementById('hint-sentence');

        // Drag and drop functionality
        wordChips.forEach(chip => {
            chip.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.word);
                e.target.classList.add('dragging');
            });

            chip.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });

            // Click to move functionality for mobile
            chip.addEventListener('click', () => {
                this.moveWordToBuilder(chip.dataset.word, chip);
            });
        });

        sentenceBuilder.addEventListener('dragover', (e) => {
            e.preventDefault();
            sentenceBuilder.classList.add('drag-over');
        });

        sentenceBuilder.addEventListener('dragleave', () => {
            sentenceBuilder.classList.remove('drag-over');
        });

        sentenceBuilder.addEventListener('drop', (e) => {
            e.preventDefault();
            sentenceBuilder.classList.remove('drag-over');
            const word = e.dataTransfer.getData('text/plain');
            const chip = document.querySelector(`[data-word="${word}"]`);
            this.moveWordToBuilder(word, chip);
        });

        checkBtn?.addEventListener('click', () => this.checkSentenceConstruction());
        clearBtn?.addEventListener('click', () => this.clearSentenceBuilder());
        hintBtn?.addEventListener('click', () => this.showSentenceHint());
    }

    moveWordToBuilder(word, chipElement) {
        const sentenceBuilder = document.getElementById('sentence-builder');
        const hint = sentenceBuilder.querySelector('.builder-hint');

        if (hint) hint.remove();

        // Create word in builder
        const wordInBuilder = document.createElement('span');
        wordInBuilder.className = 'word-in-sentence';
        wordInBuilder.textContent = word;
        wordInBuilder.dataset.word = word;

        // Click to remove from builder
        wordInBuilder.addEventListener('click', () => {
            this.removeWordFromBuilder(wordInBuilder);
        });

        sentenceBuilder.appendChild(wordInBuilder);
        chipElement.classList.add('used');
        chipElement.style.pointerEvents = 'none';
    }

    removeWordFromBuilder(wordElement) {
        const word = wordElement.dataset.word;
        const chip = document.querySelector(`.word-chip[data-word="${word}"]`);

        wordElement.remove();
        chip.classList.remove('used');
        chip.style.pointerEvents = 'auto';

        // Add hint back if no words
        const sentenceBuilder = document.getElementById('sentence-builder');
        if (sentenceBuilder.children.length === 0) {
            const hint = document.createElement('p');
            hint.className = 'builder-hint';
            hint.textContent = 'Drop words here...';
            sentenceBuilder.appendChild(hint);
        }
    }

    clearSentenceBuilder() {
        const sentenceBuilder = document.getElementById('sentence-builder');
        const words = sentenceBuilder.querySelectorAll('.word-in-sentence');

        words.forEach(word => this.removeWordFromBuilder(word));
    }

    checkSentenceConstruction() {
        const sentenceBuilder = document.getElementById('sentence-builder');
        const wordsInSentence = Array.from(sentenceBuilder.querySelectorAll('.word-in-sentence'))
            .map(word => word.textContent);

        const userSentence = wordsInSentence.join(' ');
        const correctSentence = this.currentExercise.correctSentence;
        const isCorrect = userSentence === correctSentence;

        this.currentExercise.attempts++;
        this.currentExercise.userAnswer = userSentence;

        this.showExerciseFeedback(isCorrect, {
            userAnswer: userSentence,
            correctAnswer: correctSentence,
            explanation: isCorrect ? 'Perfect! Well done!' : `Correct answer: "${correctSentence}"`
        });

        if (isCorrect) {
            this.completeExercise(100);
        } else if (this.currentExercise.attempts >= 3) {
            this.completeExercise(25); // Partial credit after 3 attempts
        }
    }

    setupTranslationListeners() {
        const checkBtn = document.getElementById('check-translation');
        const hintBtn = document.getElementById('hint-translation');
        const textarea = document.getElementById('translation-answer');

        checkBtn?.addEventListener('click', () => this.checkTranslation());
        hintBtn?.addEventListener('click', () => this.showTranslationHints());

        // Real-time character count could be added here
        textarea?.addEventListener('input', () => {
            // Could add live feedback or suggestions
        });
    }

    checkTranslation() {
        const textarea = document.getElementById('translation-answer');
        const userAnswer = textarea.value.trim().toLowerCase();
        const correctAnswer = this.currentExercise.german.toLowerCase();

        // Simple similarity check (in real app, use more sophisticated comparison)
        const similarity = this.calculateStringSimilarity(userAnswer, correctAnswer);
        const isCorrect = similarity > 0.8; // 80% similarity threshold

        this.currentExercise.attempts++;
        this.currentExercise.userAnswer = textarea.value.trim();

        let score = 0;
        let explanation = '';

        if (similarity >= 0.9) {
            score = 100;
            explanation = 'Excellent translation!';
        } else if (similarity >= 0.7) {
            score = 75;
            explanation = `Good! Minor differences. Correct: "${this.currentExercise.german}"`;
        } else if (similarity >= 0.5) {
            score = 50;
            explanation = `Partially correct. Try again or check the correct answer: "${this.currentExercise.german}"`;
        } else {
            score = 25;
            explanation = `Keep practicing! Correct answer: "${this.currentExercise.german}"`;
        }

        this.showExerciseFeedback(isCorrect, {
            userAnswer: textarea.value.trim(),
            correctAnswer: this.currentExercise.german,
            explanation: explanation
        });

        if (score >= 75 || this.currentExercise.attempts >= 3) {
            this.completeExercise(score);
        }
    }

    showTranslationHints() {
        const hintsSection = document.getElementById('hints-section');
        if (hintsSection) {
            hintsSection.classList.remove('hidden');
        }
    }

    setupFreeWritingListeners() {
        const submitBtn = document.getElementById('submit-writing');
        const saveBtn = document.getElementById('save-draft');
        const textarea = document.getElementById('free-writing-answer');

        submitBtn?.addEventListener('click', () => this.submitFreeWriting());
        saveBtn?.addEventListener('click', () => this.saveFreeWritingDraft());

        // Real-time word/character count
        textarea?.addEventListener('input', () => {
            this.updateWritingStats();
        });
    }

    updateWritingStats() {
        const textarea = document.getElementById('free-writing-answer');
        const wordCountEl = document.getElementById('word-count');
        const charCountEl = document.getElementById('character-count');

        const text = textarea.value.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        const charCount = text.length;

        if (wordCountEl) wordCountEl.textContent = wordCount;
        if (charCountEl) charCountEl.textContent = charCount;
    }

    insertSuggestion(suggestion) {
        const textarea = document.getElementById('free-writing-answer');
        const currentValue = textarea.value;
        const newValue = currentValue ? `${currentValue} ${suggestion}` : suggestion;

        textarea.value = newValue;
        textarea.focus();
        this.updateWritingStats();
    }

    submitFreeWriting() {
        const textarea = document.getElementById('free-writing-answer');
        const text = textarea.value.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;

        if (wordCount < this.currentExercise.minWords) {
            alert(`Please write at least ${this.currentExercise.minWords} words. Current: ${wordCount}`);
            return;
        }

        this.currentExercise.userAnswer = text;

        // Simple scoring based on word count and requirements
        let score = 70; // Base score

        if (wordCount >= this.currentExercise.minWords) score += 20;
        if (wordCount <= this.currentExercise.maxWords) score += 10;

        this.showExerciseFeedback(true, {
            userAnswer: text,
            explanation: `Great work! You wrote ${wordCount} words. Your writing has been saved.`,
            wordCount: wordCount
        });

        this.completeExercise(score);
    }

    saveFreeWritingDraft() {
        const textarea = document.getElementById('free-writing-answer');
        const text = textarea.value.trim();

        if (!text) {
            alert('Nothing to save yet. Start writing first!');
            return;
        }

        // Save to localStorage for now
        const draftKey = `draft_${this.currentExercise.id}_${Date.now()}`;
        localStorage.setItem(draftKey, JSON.stringify({
            exerciseId: this.currentExercise.id,
            text: text,
            savedAt: new Date().toISOString()
        }));

        alert('Draft saved successfully!');
    }

    showExerciseFeedback(isCorrect, details) {
        const feedbackEl = document.getElementById('exercise-feedback');
        if (!feedbackEl) return;

        const feedbackClass = isCorrect ? 'correct' : 'incorrect';
        const icon = isCorrect ? '✅' : '❌';

        feedbackEl.className = `exercise-feedback ${feedbackClass}`;
        feedbackEl.innerHTML = `
            <div class="feedback-header">
                <span class="feedback-icon">${icon}</span>
                <span class="feedback-title">${isCorrect ? 'Correct!' : 'Try Again'}</span>
            </div>
            <div class="feedback-content">
                <p>${details.explanation}</p>
                ${details.userAnswer && details.correctAnswer && details.userAnswer !== details.correctAnswer ?
                    `<div class="answer-comparison">
                        <div class="user-answer">Your answer: "${details.userAnswer}"</div>
                        <div class="correct-answer">Correct: "${details.correctAnswer}"</div>
                    </div>` : ''
                }
            </div>
        `;

        feedbackEl.classList.remove('hidden');
    }

    completeExercise(score) {
        if (this.currentExercise.isComplete) return;

        this.currentExercise.isComplete = true;
        this.currentExercise.endTime = Date.now();
        this.currentExercise.score = score;

        const totalTime = Math.floor((this.currentExercise.endTime - this.currentExercise.startTime) / 1000);

        // Record completion with gamification system
        const result = window.gamificationSystem.simulateExerciseCompletion(
            'writing',
            score,
            totalTime,
            [] // No specific words for writing exercises
        );

        // Update UI
        window.gamificationSystem.updateUI();

        // Show achievements if any
        if (result.achievements.length > 0) {
            result.achievements.forEach(achievement => {
                window.gamificationSystem.displayAchievementNotification(achievement);
            });
        }

        // Add continue button to feedback
        setTimeout(() => {
            const feedbackEl = document.getElementById('exercise-feedback');
            if (feedbackEl) {
                const continueBtn = document.createElement('button');
                continueBtn.className = 'btn btn-primary';
                continueBtn.textContent = 'Continue Learning';
                continueBtn.onclick = () => this.showExerciseSelection();
                feedbackEl.appendChild(continueBtn);
            }
        }, 2000);
    }

    showExerciseSelection() {
        // Reset current exercise
        this.currentExercise = null;

        // Show exercise type selection
        const exerciseContainer = document.getElementById('writing-exercise');
        if (!exerciseContainer) return;

        exerciseContainer.innerHTML = `
            <div class="exercise-selection">
                <h3>Choose an Exercise Type</h3>
                <div class="exercise-types">
                    <button class="exercise-type-card" onclick="window.exerciseManager.startExercise('sentenceConstruction')">
                        <div class="exercise-icon">🧩</div>
                        <h4>Sentence Construction</h4>
                        <p>Build German sentences from word blocks</p>
                    </button>

                    <button class="exercise-type-card" onclick="window.exerciseManager.startExercise('translation')">
                        <div class="exercise-icon">🔄</div>
                        <h4>Translation</h4>
                        <p>Translate English sentences to German</p>
                    </button>

                    <button class="exercise-type-card" onclick="window.exerciseManager.startExercise('freeWriting')">
                        <div class="exercise-icon">✏️</div>
                        <h4>Free Writing</h4>
                        <p>Write original German texts</p>
                    </button>
                </div>
            </div>
        `;
    }

    // Utility functions
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    calculateStringSimilarity(str1, str2) {
        // Simple Levenshtein distance-based similarity
        const distance = this.levenshteinDistance(str1, str2);
        const maxLength = Math.max(str1.length, str2.length);
        return maxLength === 0 ? 1 : 1 - (distance / maxLength);
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

    showError(message) {
        console.error(message);
        alert(message);
    }
}

// Initialize exercise manager
window.exerciseManager = new ExerciseManager();