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
            },
            {
                id: 'sc_006',
                level: 'A1',
                prompt: 'Build a sentence: "Where is the train station?"',
                correctSentence: 'Wo ist der Bahnhof?',
                words: ['Wo', 'ist', 'der', 'Bahnhof?'],
                hints: ['Start with the question word', 'Use the correct article'],
                category: 'questions'
            },
            {
                id: 'sc_007',
                level: 'A1',
                prompt: 'Build a sentence: "The weather is beautiful today"',
                correctSentence: 'Das Wetter ist heute schön.',
                words: ['Das', 'Wetter', 'ist', 'heute', 'schön.'],
                hints: ['Weather is neuter', 'Put time expression before the adjective'],
                category: 'time_weather'
            },
            {
                id: 'sc_008',
                level: 'A1',
                prompt: 'Build a sentence: "I wear a shirt"',
                correctSentence: 'Ich trage ein Hemd.',
                words: ['Ich', 'trage', 'ein', 'Hemd.'],
                hints: ['Use the verb for "to wear"', 'Hemd is neuter'],
                category: 'clothing'
            },
            {
                id: 'sc_009',
                level: 'A1',
                prompt: 'Build a sentence: "My mother is happy"',
                correctSentence: 'Meine Mutter ist glücklich.',
                words: ['Meine', 'Mutter', 'ist', 'glücklich.'],
                hints: ['Use feminine possessive for mother', 'Remember the adjective for happy'],
                category: 'family'
            },
            {
                id: 'sc_010',
                level: 'A1',
                prompt: 'Build a sentence: "The book is on the table"',
                correctSentence: 'Das Buch liegt auf dem Tisch.',
                words: ['Das', 'Buch', 'liegt', 'auf', 'dem', 'Tisch.'],
                hints: ['Use "liegt" for lying position', '"auf" + dative for location'],
                category: 'prepositions'
            },
            {
                id: 'sc_011',
                level: 'A2',
                prompt: 'Build a sentence: "I am looking forward to the party"',
                correctSentence: 'Ich freue mich auf die Party.',
                words: ['Ich', 'freue', 'mich', 'auf', 'die', 'Party.'],
                hints: ['Use the reflexive verb "sich freuen"', '"auf" + accusative for looking forward to'],
                category: 'feelings'
            },
            {
                id: 'sc_012',
                level: 'A2',
                prompt: 'Build a sentence: "Can you help me please?"',
                correctSentence: 'Können Sie mir bitte helfen?',
                words: ['Können', 'Sie', 'mir', 'bitte', 'helfen?'],
                hints: ['Start with the modal verb', 'Formal "you" is "Sie"'],
                category: 'communication'
            },
            {
                id: 'sc_013',
                level: 'A2',
                prompt: 'Build a sentence: "I have to download the app"',
                correctSentence: 'Ich muss die App herunterladen.',
                words: ['Ich', 'muss', 'die', 'App', 'herunterladen.'],
                hints: ['Use "müssen" for "have to"', 'Separable verb goes at the end'],
                category: 'technology'
            },
            {
                id: 'sc_014',
                level: 'A2',
                prompt: 'Build a sentence: "The gym opens at seven"',
                correctSentence: 'Das Fitnessstudio öffnet um sieben.',
                words: ['Das', 'Fitnessstudio', 'öffnet', 'um', 'sieben.'],
                hints: ['Fitnessstudio is neuter', 'Use "um" for specific times'],
                category: 'leisure'
            },
            {
                id: 'sc_015',
                level: 'A2',
                prompt: 'Build a sentence: "I get up at six o\'clock"',
                correctSentence: 'Ich stehe um sechs Uhr auf.',
                words: ['Ich', 'stehe', 'um', 'sechs', 'Uhr', 'auf.'],
                hints: ['aufstehen is separable', 'Prefix goes at the end'],
                category: 'daily_life'
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
            },
            {
                id: 'tr_006',
                level: 'A1',
                english: 'Where are you from?',
                german: 'Woher kommst du?',
                hints: ['woher = where from', 'informal "du"'],
                category: 'questions',
                difficulty: 2
            },
            {
                id: 'tr_007',
                level: 'A1',
                english: 'The jacket is too expensive.',
                german: 'Die Jacke ist zu teuer.',
                hints: ['Jacke is feminine', '"zu" means "too"'],
                category: 'clothing',
                difficulty: 2
            },
            {
                id: 'tr_008',
                level: 'A1',
                english: 'The dog runs in the park.',
                german: 'Der Hund läuft im Park.',
                hints: ['Hund is masculine', '"im" = in dem'],
                category: 'animals',
                difficulty: 2
            },
            {
                id: 'tr_009',
                level: 'A1',
                english: 'I live next to the supermarket.',
                german: 'Ich wohne neben dem Supermarkt.',
                hints: ['neben + dative', 'Supermarkt is masculine'],
                category: 'prepositions',
                difficulty: 3
            },
            {
                id: 'tr_010',
                level: 'A1',
                english: 'We have no idea.',
                german: 'Wir haben keine Ahnung.',
                hints: ['keine Ahnung is a common phrase', 'negation with "keine"'],
                category: 'phrases',
                difficulty: 2
            },
            {
                id: 'tr_011',
                level: 'A2',
                english: 'I am excited about the trip.',
                german: 'Ich bin aufgeregt wegen der Reise.',
                hints: ['aufgeregt = excited', 'wegen + genitive'],
                category: 'feelings',
                difficulty: 3
            },
            {
                id: 'tr_012',
                level: 'A2',
                english: 'Can you upload the photo?',
                german: 'Kannst du das Foto hochladen?',
                hints: ['hochladen = to upload', 'separable verb at end'],
                category: 'technology',
                difficulty: 3
            },
            {
                id: 'tr_013',
                level: 'A2',
                english: 'I go to the gym every day.',
                german: 'Ich gehe jeden Tag ins Fitnessstudio.',
                hints: ['jeden Tag = every day', 'ins = in das'],
                category: 'leisure',
                difficulty: 2
            },
            {
                id: 'tr_014',
                level: 'A2',
                english: 'I would like to invite you to dinner.',
                german: 'Ich möchte dich zum Abendessen einladen.',
                hints: ['einladen = to invite', 'zum = zu dem'],
                category: 'communication',
                difficulty: 3
            },
            {
                id: 'tr_015',
                level: 'A2',
                english: 'My apartment has two bedrooms.',
                german: 'Meine Wohnung hat zwei Schlafzimmer.',
                hints: ['Wohnung = apartment', 'Schlafzimmer = bedroom'],
                category: 'daily_life',
                difficulty: 2
            },
            {
                id: 'tr_016',
                level: 'A2',
                english: 'I forgot my password.',
                german: 'Ich habe mein Passwort vergessen.',
                hints: ['vergessen = to forget', 'perfect tense with haben'],
                category: 'technology',
                difficulty: 3
            },
            {
                id: 'tr_017',
                level: 'A2',
                english: 'The team won the game.',
                german: 'Die Mannschaft hat das Spiel gewonnen.',
                hints: ['Mannschaft = team', 'perfect tense of gewinnen'],
                category: 'leisure',
                difficulty: 3
            },
            {
                id: 'tr_018',
                level: 'A2',
                english: 'I am satisfied with my work.',
                german: 'Ich bin mit meiner Arbeit zufrieden.',
                hints: ['zufrieden = satisfied', 'mit + dative'],
                category: 'feelings',
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

        // Clear any existing content and event listeners
        exerciseContainer.innerHTML = '';

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

        // Small delay to ensure DOM is ready
        setTimeout(() => {
            this.setupExerciseEventListeners();
        }, 10);
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

        if (!sentenceBuilder) {
            console.error('Sentence builder not found!');
            return;
        }

        // Drag and drop functionality
        wordChips.forEach(chip => {
            // Store reference to the specific chip element
            chip.addEventListener('dragstart', (e) => {
                if (!chip.classList.contains('used')) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', chip.dataset.word);
                    chip.classList.add('dragging');
                    chip.setAttribute('data-dragging', 'true');
                }
            });

            chip.addEventListener('dragend', (e) => {
                chip.classList.remove('dragging');
                chip.removeAttribute('data-dragging');
            });

            // Click to move functionality for mobile
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                if (!chip.classList.contains('used')) {
                    this.moveWordToBuilder(chip.dataset.word, chip);
                }
            });
        });

        // Drag and drop on sentence builder
        sentenceBuilder.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            sentenceBuilder.classList.add('drag-over');
        });

        sentenceBuilder.addEventListener('dragleave', (e) => {
            // Only remove class if we're actually leaving the sentence builder
            if (e.target === sentenceBuilder) {
                sentenceBuilder.classList.remove('drag-over');
            }
        });

        sentenceBuilder.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sentenceBuilder.classList.remove('drag-over');

            const word = e.dataTransfer.getData('text/plain');
            if (word) {
                // Find the chip that's being dragged
                const chip = document.querySelector('.word-chip[data-dragging="true"]');
                if (chip) {
                    chip.removeAttribute('data-dragging');
                    this.moveWordToBuilder(word, chip);
                }
            }
        });

        checkBtn?.addEventListener('click', () => this.checkSentenceConstruction());
        clearBtn?.addEventListener('click', () => this.clearSentenceBuilder());
        hintBtn?.addEventListener('click', () => this.showSentenceHint());
    }

    moveWordToBuilder(word, chipElement) {
        const sentenceBuilder = document.getElementById('sentence-builder');
        if (!sentenceBuilder || !chipElement) {
            console.error('Sentence builder or chip element not found', {sentenceBuilder, chipElement});
            return;
        }

        // Don't add if already used
        if (chipElement.classList.contains('used')) {
            return;
        }

        const hint = sentenceBuilder.querySelector('.builder-hint');
        if (hint) hint.remove();

        // Create word in builder
        const wordInBuilder = document.createElement('span');
        wordInBuilder.className = 'word-in-sentence';
        wordInBuilder.textContent = word;
        wordInBuilder.dataset.word = word;

        // Ensure visibility with inline styles as fallback
        wordInBuilder.style.display = 'inline-block';
        wordInBuilder.style.padding = '8px 16px';
        wordInBuilder.style.margin = '4px';
        wordInBuilder.style.backgroundColor = '#FFCC00';
        wordInBuilder.style.color = '#000000';
        wordInBuilder.style.border = '1px solid #FFCC00';
        wordInBuilder.style.borderRadius = '8px';
        wordInBuilder.style.cursor = 'pointer';
        wordInBuilder.style.userSelect = 'none';

        // Click to remove from builder
        wordInBuilder.addEventListener('click', (e) => {
            e.preventDefault();
            this.removeWordFromBuilder(wordInBuilder);
        });

        sentenceBuilder.appendChild(wordInBuilder);
        chipElement.classList.add('used');
        chipElement.style.pointerEvents = 'none';
        chipElement.style.opacity = '0.5';

        console.log('Word added to builder:', word);
    }

    removeWordFromBuilder(wordElement) {
        const word = wordElement.dataset.word;
        const chip = document.querySelector(`.word-chip[data-word="${word}"]`);

        wordElement.remove();

        if (chip) {
            chip.classList.remove('used');
            chip.style.pointerEvents = 'auto';
            chip.style.opacity = '1';
        }

        // Add hint back if no words
        const sentenceBuilder = document.getElementById('sentence-builder');
        if (sentenceBuilder && sentenceBuilder.children.length === 0) {
            const hint = document.createElement('p');
            hint.className = 'builder-hint';
            hint.textContent = 'Drop words here...';
            hint.style.color = '#999';
            hint.style.fontStyle = 'italic';
            hint.style.margin = '0';
            hint.style.padding = '8px';
            sentenceBuilder.appendChild(hint);
        }

        console.log('Word removed from builder:', word);
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
            window.utils.showAlert(`Please write at least ${this.currentExercise.minWords} words. Current: ${wordCount}`, 'info');
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
            window.utils.showAlert('Nothing to save yet. Start writing first!', 'info');
            return;
        }

        // Save to localStorage for now
        const draftKey = `draft_${this.currentExercise.id}_${Date.now()}`;
        localStorage.setItem(draftKey, JSON.stringify({
            exerciseId: this.currentExercise.id,
            text: text,
            savedAt: new Date().toISOString()
        }));

        window.utils.showAlert('Draft saved successfully!', 'success');
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

    // Utility functions - delegate to shared utils
    shuffleArray(array) {
        return window.utils.shuffleArray(array);
    }

    calculateStringSimilarity(str1, str2) {
        return window.utils.calculateSimilarity(str1, str2);
    }

    showError(message) {
        console.error(message);
        window.utils.showAlert(message, 'error');
    }
}

// Initialize exercise manager
window.exerciseManager = new ExerciseManager();