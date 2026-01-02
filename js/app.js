class LearnDeutschApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Wait for all managers to be available
            await this.waitForManagers();

            // Initialize UI
            this.setupEventListeners();
            this.setupNavigation();
            this.updateUI();

            // Load initial data
            await this.loadInitialData();

            // Show welcome message for new users
            this.checkFirstVisit();

            this.isInitialized = true;
            console.log('LearnDeutsch app initialized successfully');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load the application. Please refresh the page.');
        }
    }

    async waitForManagers() {
        // Wait for all manager instances to be created
        const maxWaitTime = 5000; // 5 seconds
        const startTime = Date.now();

        while (!window.storageManager || !window.gamificationSystem ||
               !window.vocabularyManager || !window.exerciseManager ||
               !window.progressManager) {

            if (Date.now() - startTime > maxWaitTime) {
                throw new Error('Managers failed to initialize within timeout');
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Give additional time for async operations
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });

        // Level cards
        document.querySelectorAll('.level-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const level = e.target.closest('.level-card').dataset.level;
                if (level && !e.target.closest('.level-card').classList.contains('disabled')) {
                    this.selectLevel(level);
                }
            });
        });

        // Quick action cards
        document.getElementById('review-vocabulary')?.addEventListener('click', () => {
            this.startVocabularyReview();
        });

        document.getElementById('writing-exercise')?.addEventListener('click', () => {
            this.startWritingExercise();
        });

        document.getElementById('daily-challenge')?.addEventListener('click', () => {
            this.startDailyChallenge();
        });

        // Vocabulary controls
        document.getElementById('start-flashcards')?.addEventListener('click', () => {
            const category = document.getElementById('vocabulary-category').value;
            this.startFlashcards(category);
        });

        document.getElementById('vocabulary-category')?.addEventListener('change', (e) => {
            window.vocabularyManager.filterVocabularyByCategory(e.target.value);
        });

        // Writing exercise controls
        document.getElementById('writing-type')?.addEventListener('change', (e) => {
            window.exerciseManager.startExercise(e.target.value);
        });

        // Settings controls
        this.setupSettingsListeners();

        // Modal close buttons
        document.getElementById('modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window events
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });
    }

    setupSettingsListeners() {
        // Daily goal setting
        document.getElementById('daily-goal')?.addEventListener('change', (e) => {
            this.updateSetting('dailyGoal', parseInt(e.target.value));
        });

        // Difficulty preference
        document.getElementById('difficulty-preference')?.addEventListener('change', (e) => {
            this.updateSetting('difficultyPreference', e.target.value);
        });

        // Dark mode toggle
        document.getElementById('dark-mode')?.addEventListener('change', (e) => {
            this.updateSetting('darkMode', e.target.checked);
            this.toggleDarkMode(e.target.checked);
        });

        // Sound effects toggle
        document.getElementById('sound-effects')?.addEventListener('change', (e) => {
            this.updateSetting('soundEffects', e.target.checked);
        });

        // Export progress
        document.getElementById('export-progress')?.addEventListener('click', () => {
            this.exportData();
        });

        // Reset progress
        document.getElementById('reset-progress')?.addEventListener('click', () => {
            this.resetProgress();
        });
    }

    setupNavigation() {
        // Set up section switching
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            if (section.id !== 'dashboard') {
                section.classList.remove('active');
            }
        });

        // Update nav button states
        this.updateNavigation();
    }

    navigateToSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === sectionId) {
                btn.classList.add('active');
            }
        });

        this.currentSection = sectionId;

        // Section-specific initialization
        switch (sectionId) {
            case 'vocabulary':
                this.initVocabularySection();
                break;
            case 'writing':
                this.initWritingSection();
                break;
            case 'progress':
                this.initProgressSection();
                break;
            case 'settings':
                this.initSettingsSection();
                break;
        }
    }

    selectLevel(level) {
        const userData = window.storageManager.getUserData();
        userData.currentCEFRLevel = level;
        window.storageManager.updateUserData(userData);

        // Navigate to vocabulary section
        this.navigateToSection('vocabulary');

        // Show notification
        this.showNotification(`Selected ${level} level! Start learning vocabulary.`);
    }

    async loadInitialData() {
        // Wait for vocabulary data to load
        if (window.vocabularyManager && !window.vocabularyManager.vocabularyData) {
            await new Promise(resolve => {
                const checkData = () => {
                    if (window.vocabularyManager.vocabularyData) {
                        resolve();
                    } else {
                        setTimeout(checkData, 100);
                    }
                };
                checkData();
            });
        }

        // Update all UI components
        this.updateUI();
    }

    updateUI() {
        // Update gamification display
        window.gamificationSystem?.updateUI();

        // Update vocabulary stats
        window.vocabularyManager?.displayVocabularyStats();

        // Update progress display
        window.progressManager?.updateProgressDisplay();

        // Update dashboard
        this.updateDashboard();
    }

    updateDashboard() {
        // Update daily challenge
        this.updateDailyChallenge();

        // Update quick action availability
        this.updateQuickActions();

        // Update recent achievements
        this.updateRecentAchievements();
    }

    updateDailyChallenge() {
        const challenge = window.gamificationSystem?.getDailyChallenge();
        const challengeCard = document.getElementById('daily-challenge');

        if (challengeCard && challenge) {
            const progress = Math.min(100, (challenge.current / challenge.target) * 100);

            challengeCard.innerHTML = `
                <div class="action-icon">${challenge.icon}</div>
                <h4>${challenge.name}</h4>
                <p>${challenge.description}</p>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${challenge.current}/${challenge.target}</span>
                </div>
                <div class="challenge-reward">+${challenge.xpReward} XP</div>
            `;
        }
    }

    updateQuickActions() {
        const wordsForReview = window.storageManager?.getWordsForReview()?.length || 0;

        // Update review vocabulary card
        const reviewCard = document.getElementById('review-vocabulary');
        if (reviewCard) {
            const wordText = wordsForReview === 1 ? 'word' : 'words';
            const description = wordsForReview > 0 ?
                `${wordsForReview} ${wordText} ready for review` :
                'Learn new vocabulary first';

            reviewCard.querySelector('p').textContent = description;

            if (wordsForReview === 0) {
                reviewCard.classList.add('disabled');
            } else {
                reviewCard.classList.remove('disabled');
            }
        }
    }

    updateRecentAchievements() {
        const userData = window.storageManager?.getUserData();
        const recentAchievementsEl = document.getElementById('recent-achievements');

        if (!recentAchievementsEl || !userData) return;

        const recentAchievements = userData.achievements.slice(-3).reverse();

        if (recentAchievements.length === 0) {
            recentAchievementsEl.innerHTML = `
                <div class="no-achievements">
                    <p>Complete exercises to earn your first achievements!</p>
                </div>
            `;
        } else {
            recentAchievementsEl.innerHTML = recentAchievements.map(achievement => `
                <div class="achievement-mini">
                    <span class="achievement-icon">${achievement.icon}</span>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-date">${this.formatTimeAgo(achievement.earnedAt)}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    startVocabularyReview() {
        const wordsForReview = window.storageManager?.getWordsForReview();

        if (!wordsForReview || wordsForReview.length === 0) {
            this.showNotification('No words ready for review yet. Learn some vocabulary first!', 'info');
            this.navigateToSection('vocabulary');
            return;
        }

        this.navigateToSection('vocabulary');
        setTimeout(() => {
            window.vocabularyManager?.startFlashcardSession('all', Math.min(10, wordsForReview.length));
        }, 300);
    }

    startWritingExercise() {
        this.navigateToSection('writing');
        setTimeout(() => {
            window.exerciseManager?.showExerciseSelection();
        }, 300);
    }

    startDailyChallenge() {
        const challenge = window.gamificationSystem?.getDailyChallenge();

        if (!challenge) return;

        switch (challenge.id) {
            case 'vocab_review':
                this.startVocabularyReview();
                break;
            case 'perfect_accuracy':
                this.showNotification('Complete any exercise with 100% accuracy to complete this challenge!', 'info');
                this.navigateToSection('vocabulary');
                break;
            case 'study_time':
                this.showNotification('Study for 30 minutes today to complete this challenge!', 'info');
                break;
        }
    }

    startFlashcards(category = 'all') {
        window.vocabularyManager?.startFlashcardSession(category, 10);
    }

    initVocabularySection() {
        // Ensure vocabulary list is visible
        const flashcardContainer = document.getElementById('flashcard-container');
        const vocabularyList = document.getElementById('vocabulary-list');

        if (flashcardContainer) flashcardContainer.classList.add('hidden');
        if (vocabularyList) vocabularyList.style.display = 'grid';
    }

    initWritingSection() {
        // Show exercise selection if no exercise is active
        if (!window.exerciseManager?.currentExercise) {
            window.exerciseManager?.showExerciseSelection();
        }
    }

    initProgressSection() {
        // Refresh progress data
        window.progressManager?.updateProgressDisplay();
    }

    initSettingsSection() {
        // Load current settings values
        const userData = window.storageManager?.getUserData();

        if (userData) {
            const dailyGoal = document.getElementById('daily-goal');
            const difficultyPref = document.getElementById('difficulty-preference');
            const darkMode = document.getElementById('dark-mode');
            const soundEffects = document.getElementById('sound-effects');

            if (dailyGoal) dailyGoal.value = userData.settings.dailyGoal;
            if (difficultyPref) difficultyPref.value = userData.settings.difficultyPreference;
            if (darkMode) darkMode.checked = userData.settings.darkMode;
            if (soundEffects) soundEffects.checked = userData.settings.soundEffects;
        }
    }

    updateSetting(key, value) {
        const userData = window.storageManager.getUserData();
        userData.settings[key] = value;
        window.storageManager.updateUserData(userData);

        this.showNotification('Settings updated successfully!', 'success');
    }

    toggleDarkMode(enabled) {
        document.body.dataset.theme = enabled ? 'dark' : 'light';
    }

    checkFirstVisit() {
        const userData = window.storageManager.getUserData();

        // Check if this is a truly new user (no exercises completed)
        if (userData.exercisesCompleted === 0 && userData.statistics.totalWordsLearned === 0) {
            setTimeout(() => {
                this.showWelcomeMessage();
            }, 1000);
        }
    }

    showWelcomeMessage() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content welcome-modal">
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
                <div class="welcome-content">
                    <h2>Welcome to LearnDeutsch! 🇩🇪</h2>
                    <p>Start your German learning journey with our interactive platform.</p>

                    <div class="welcome-features">
                        <div class="feature">
                            <span class="feature-icon">📚</span>
                            <div>
                                <h4>Vocabulary Learning</h4>
                                <p>Learn German words with spaced repetition flashcards</p>
                            </div>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">✏️</span>
                            <div>
                                <h4>Writing Practice</h4>
                                <p>Build sentences and practice translation</p>
                            </div>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">🏆</span>
                            <div>
                                <h4>Gamification</h4>
                                <p>Earn XP, level up, and unlock achievements</p>
                            </div>
                        </div>
                    </div>

                    <div class="getting-started">
                        <h3>Getting Started:</h3>
                        <ol>
                            <li>Choose your current level (A1 for beginners)</li>
                            <li>Start with vocabulary flashcards</li>
                            <li>Practice writing exercises</li>
                            <li>Track your progress and earn achievements!</li>
                        </ol>
                    </div>

                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Let's Start Learning!
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    exportData() {
        try {
            const data = window.storageManager.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `learndeutsch-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            URL.revokeObjectURL(url);

            this.showNotification('Progress exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export progress', 'error');
        }
    }

    resetProgress() {
        if (window.progressManager?.resetProgress()) {
            this.showNotification('Progress reset successfully', 'success');
        }
    }

    closeModal() {
        const modal = document.getElementById('achievement-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case '1':
                this.navigateToSection('dashboard');
                break;
            case '2':
                this.navigateToSection('vocabulary');
                break;
            case '3':
                this.navigateToSection('writing');
                break;
            case '4':
                this.navigateToSection('progress');
                break;
            case '5':
                this.navigateToSection('settings');
                break;
            case 'Escape':
                this.closeModal();
                break;
        }
    }

    handleBeforeUnload(e) {
        // Save any pending data
        if (window.vocabularyManager?.currentSession && !window.vocabularyManager.currentSession.isComplete) {
            e.preventDefault();
            e.returnValue = 'You have an active vocabulary session. Are you sure you want to leave?';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    updateNavigation() {
        const currentBtn = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (currentBtn) {
            currentBtn.classList.add('active');
        }
    }

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const time = new Date(timestamp).getTime();
        const diff = now - time;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.learnDeutschApp = new LearnDeutschApp();
});

// Also add notification styles to CSS if not already present
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-width: 400px;
    animation: slideInRight 0.3s ease-out;
}

.notification-info {
    background: #3B82F6;
    color: white;
}

.notification-success {
    background: #10B981;
    color: white;
}

.notification-error {
    background: #EF4444;
    color: white;
}

.notification-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.notification-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0.8;
}

.notification-close:hover {
    opacity: 1;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.welcome-modal {
    max-width: 600px;
}

.welcome-features {
    margin: 2rem 0;
}

.feature {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.feature-icon {
    font-size: 2rem;
}

.getting-started {
    margin: 2rem 0;
}

.getting-started ol {
    margin-left: 1rem;
    margin-top: 1rem;
}

.getting-started li {
    margin-bottom: 0.5rem;
}

.heatmap-tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    pointer-events: none;
    z-index: 1000;
    display: none;
}
`;

// Add styles to document if they don't exist
if (!document.getElementById('notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
}