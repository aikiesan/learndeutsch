class StorageManager {
    constructor() {
        this.storagePrefix = 'learnDeutsch_';
        this.initialize();
    }

    initialize() {
        if (!this.getItem('initialized')) {
            this.initializeDefaultData();
            this.setItem('initialized', true);
        }
    }

    initializeDefaultData() {
        const defaultUserData = {
            level: 1,
            xp: 0,
            streak: 0,
            lastStudyDate: null,
            longestStreak: 0,
            currentCEFRLevel: 'A1',
            studyTime: 0,
            exercisesCompleted: 0,
            wordsLearned: [],
            achievements: [],
            settings: {
                dailyGoal: 10,
                difficultyPreference: 'balanced',
                darkMode: false,
                soundEffects: true
            },
            statistics: {
                totalWordsLearned: 0,
                totalExercises: 0,
                averageAccuracy: 0,
                totalStudyTime: 0,
                vocabularyByCategory: {},
                dailyActivity: {}
            }
        };

        this.setItem('userData', defaultUserData);

        const defaultProgress = {
            vocabulary: {
                A1: { learned: 0, total: 150 },
                A2: { learned: 0, total: 200 },
                B1: { learned: 0, total: 250 }
            },
            exerciseHistory: [],
            reviewSchedule: []
        };

        this.setItem('progress', defaultProgress);
    }

    setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(this.storagePrefix + key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.storagePrefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(this.storagePrefix + key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    getUserData() {
        return this.getItem('userData');
    }

    updateUserData(updates) {
        const userData = this.getUserData();
        const updatedData = { ...userData, ...updates };
        return this.setItem('userData', updatedData);
    }

    getProgress() {
        return this.getItem('progress');
    }

    updateProgress(updates) {
        const progress = this.getProgress();
        const updatedProgress = { ...progress, ...updates };
        return this.setItem('progress', updatedProgress);
    }

    addVocabularyProgress(wordId, category, difficulty, correct) {
        const userData = this.getUserData();
        const progress = this.getProgress();

        const existingWord = userData.wordsLearned.find(w => w.id === wordId);

        if (existingWord) {
            existingWord.timesReviewed++;
            existingWord.lastReviewed = Date.now();
            if (correct) {
                existingWord.correctCount++;
                existingWord.masteryLevel = Math.min(5, existingWord.masteryLevel + 1);
            } else {
                existingWord.incorrectCount++;
                existingWord.masteryLevel = Math.max(0, existingWord.masteryLevel - 1);
            }
        } else {
            const newWord = {
                id: wordId,
                category: category,
                difficulty: difficulty,
                timesReviewed: 1,
                correctCount: correct ? 1 : 0,
                incorrectCount: correct ? 0 : 1,
                masteryLevel: correct ? 1 : 0,
                lastReviewed: Date.now(),
                firstLearned: Date.now()
            };
            userData.wordsLearned.push(newWord);
            userData.statistics.totalWordsLearned++;
        }

        const today = new Date().toISOString().split('T')[0];
        if (!userData.statistics.dailyActivity[today]) {
            userData.statistics.dailyActivity[today] = 0;
        }
        userData.statistics.dailyActivity[today]++;

        this.updateUserData(userData);
        return true;
    }

    addExerciseResult(exerciseType, score, timeSpent, wordIds = []) {
        const userData = this.getUserData();
        const progress = this.getProgress();

        const exerciseResult = {
            id: Date.now(),
            type: exerciseType,
            score: score,
            timeSpent: timeSpent,
            wordsStudied: wordIds,
            completedAt: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };

        progress.exerciseHistory.push(exerciseResult);
        userData.exercisesCompleted++;
        userData.studyTime += timeSpent;
        userData.statistics.totalExercises++;
        userData.statistics.totalStudyTime += timeSpent;

        const allScores = progress.exerciseHistory.map(ex => ex.score);
        userData.statistics.averageAccuracy = allScores.reduce((a, b) => a + b, 0) / allScores.length;

        this.updateUserData(userData);
        this.updateProgress(progress);

        return exerciseResult;
    }

    updateStreak() {
        const userData = this.getUserData();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        if (userData.lastStudyDate === today) {
            return userData.streak;
        }

        if (userData.lastStudyDate === yesterday) {
            userData.streak++;
        } else if (userData.lastStudyDate !== null) {
            userData.streak = 1;
        } else {
            userData.streak = 1;
        }

        userData.lastStudyDate = today;
        userData.longestStreak = Math.max(userData.longestStreak, userData.streak);

        this.updateUserData(userData);
        return userData.streak;
    }

    getWordsForReview(limit = 10) {
        const userData = this.getUserData();
        const now = Date.now();

        const reviewIntervals = [
            24 * 60 * 60 * 1000,      // 1 day
            3 * 24 * 60 * 60 * 1000,  // 3 days
            7 * 24 * 60 * 60 * 1000,  // 7 days
            14 * 24 * 60 * 60 * 1000, // 14 days
            30 * 24 * 60 * 60 * 1000  // 30 days
        ];

        const wordsForReview = userData.wordsLearned.filter(word => {
            if (word.masteryLevel >= 5) return false; // Already mastered

            const interval = reviewIntervals[Math.min(word.masteryLevel, reviewIntervals.length - 1)];
            const nextReviewTime = word.lastReviewed + interval;

            return now >= nextReviewTime;
        });

        wordsForReview.sort((a, b) => {
            if (a.masteryLevel !== b.masteryLevel) {
                return a.masteryLevel - b.masteryLevel; // Lower mastery first
            }
            return a.lastReviewed - b.lastReviewed; // Older reviews first
        });

        return wordsForReview.slice(0, limit);
    }

    exportData() {
        const userData = this.getUserData();
        const progress = this.getProgress();

        const exportData = {
            userData,
            progress,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(exportData, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (data.userData) {
                this.setItem('userData', data.userData);
            }

            if (data.progress) {
                this.setItem('progress', data.progress);
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    resetAllData() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.storagePrefix)) {
                keys.push(key);
            }
        }

        keys.forEach(key => localStorage.removeItem(key));
        this.initialize();
    }

    getStatistics() {
        const userData = this.getUserData();
        const progress = this.getProgress();

        const today = new Date().toISOString().split('T')[0];
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        });

        const recentActivity = last30Days.map(date => ({
            date,
            exercises: userData.statistics.dailyActivity[date] || 0
        }));

        const vocabularyStats = userData.wordsLearned.reduce((stats, word) => {
            if (!stats[word.category]) {
                stats[word.category] = { total: 0, mastered: 0 };
            }
            stats[word.category].total++;
            if (word.masteryLevel >= 4) {
                stats[word.category].mastered++;
            }
            return stats;
        }, {});

        return {
            overview: {
                level: userData.level,
                xp: userData.xp,
                streak: userData.streak,
                longestStreak: userData.longestStreak,
                wordsLearned: userData.statistics.totalWordsLearned,
                exercisesCompleted: userData.statistics.totalExercises,
                studyTime: Math.round(userData.statistics.totalStudyTime / 60), // Convert to minutes
                accuracy: Math.round(userData.statistics.averageAccuracy * 100) / 100
            },
            recentActivity,
            vocabularyStats,
            achievements: userData.achievements
        };
    }
}

// Create global instance
window.storageManager = new StorageManager();