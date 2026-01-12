class GamificationSystem {
    constructor() {
        this.achievements = this.initializeAchievements();
        this.xpValues = {
            flashcard: 5,
            multipleChoice: 8,
            typing: 12,
            writing: 15,
            grammar: 20,
            dailyBonus: 50,
            streakBonus: {
                7: 50,
                14: 100,
                30: 200,
                60: 500,
                100: 1000
            }
        };
    }

    initializeAchievements() {
        return [
            // First Steps
            {
                id: 'first_lesson',
                name: 'First Steps',
                description: 'Complete your first vocabulary lesson',
                icon: '👋',
                rarity: 'bronze',
                xpReward: 10,
                condition: (userData) => userData.exercisesCompleted >= 1
            },
            {
                id: 'hello_world',
                name: 'Guten Tag!',
                description: 'Learn your first 5 German words',
                icon: '🎯',
                rarity: 'bronze',
                xpReward: 25,
                condition: (userData) => userData.statistics.totalWordsLearned >= 5
            },

            // Vocabulary Milestones
            {
                id: 'vocab_25',
                name: 'Word Explorer',
                description: 'Learn 25 vocabulary words',
                icon: '📚',
                rarity: 'bronze',
                xpReward: 50,
                condition: (userData) => userData.statistics.totalWordsLearned >= 25
            },
            {
                id: 'vocab_50',
                name: 'Word Collector',
                description: 'Learn 50 vocabulary words',
                icon: '📖',
                rarity: 'silver',
                xpReward: 100,
                condition: (userData) => userData.statistics.totalWordsLearned >= 50
            },
            {
                id: 'vocab_100',
                name: 'Vocabulary Master',
                description: 'Learn 100 vocabulary words',
                icon: '🎓',
                rarity: 'gold',
                xpReward: 200,
                condition: (userData) => userData.statistics.totalWordsLearned >= 100
            },
            {
                id: 'vocab_250',
                name: 'Word Wizard',
                description: 'Learn 250 vocabulary words',
                icon: '🧙‍♂️',
                rarity: 'platinum',
                xpReward: 500,
                condition: (userData) => userData.statistics.totalWordsLearned >= 250
            },

            // Streak Achievements
            {
                id: 'streak_3',
                name: 'Getting Started',
                description: 'Study for 3 days in a row',
                icon: '🔥',
                rarity: 'bronze',
                xpReward: 30,
                condition: (userData) => userData.streak >= 3
            },
            {
                id: 'streak_7',
                name: 'Week Warrior',
                description: 'Study for 7 days in a row',
                icon: '⚔️',
                rarity: 'silver',
                xpReward: 75,
                condition: (userData) => userData.streak >= 7
            },
            {
                id: 'streak_30',
                name: 'Persistent Learner',
                description: 'Study for 30 days in a row',
                icon: '🏆',
                rarity: 'gold',
                xpReward: 300,
                condition: (userData) => userData.streak >= 30
            },
            {
                id: 'streak_100',
                name: 'Dedication Master',
                description: 'Study for 100 days in a row',
                icon: '👑',
                rarity: 'platinum',
                xpReward: 1000,
                condition: (userData) => userData.streak >= 100
            },

            // Exercise Achievements
            {
                id: 'exercises_10',
                name: 'Practice Makes Perfect',
                description: 'Complete 10 exercises',
                icon: '💪',
                rarity: 'bronze',
                xpReward: 50,
                condition: (userData) => userData.exercisesCompleted >= 10
            },
            {
                id: 'exercises_50',
                name: 'Exercise Enthusiast',
                description: 'Complete 50 exercises',
                icon: '🎯',
                rarity: 'silver',
                xpReward: 150,
                condition: (userData) => userData.exercisesCompleted >= 50
            },
            {
                id: 'exercises_100',
                name: 'Training Champion',
                description: 'Complete 100 exercises',
                icon: '🥇',
                rarity: 'gold',
                xpReward: 300,
                condition: (userData) => userData.exercisesCompleted >= 100
            },

            // Accuracy Achievements
            {
                id: 'perfect_session',
                name: 'Perfect Score',
                description: 'Get 100% accuracy in a session',
                icon: '⭐',
                rarity: 'silver',
                xpReward: 75,
                condition: (userData, lastExercise) => lastExercise && lastExercise.score >= 100
            },
            {
                id: 'high_accuracy',
                name: 'Accuracy Expert',
                description: 'Maintain 90% average accuracy',
                icon: '🎯',
                rarity: 'gold',
                xpReward: 200,
                condition: (userData) => userData.statistics.averageAccuracy >= 0.9
            },

            // Writing Achievements
            {
                id: 'first_writing',
                name: 'Writer in Training',
                description: 'Complete your first writing exercise',
                icon: '✏️',
                rarity: 'bronze',
                xpReward: 25,
                condition: (userData, progress) => {
                    return progress.exerciseHistory.some(ex => ex.type === 'writing');
                }
            },
            {
                id: 'writing_master',
                name: 'Writing Champion',
                description: 'Complete 25 writing exercises',
                icon: '📝',
                rarity: 'gold',
                xpReward: 250,
                condition: (userData, progress) => {
                    const writingExercises = progress.exerciseHistory.filter(ex => ex.type === 'writing');
                    return writingExercises.length >= 25;
                }
            },

            // Level Achievements
            {
                id: 'level_5',
                name: 'Rising Star',
                description: 'Reach level 5',
                icon: '🌟',
                rarity: 'bronze',
                xpReward: 100,
                condition: (userData) => userData.level >= 5
            },
            {
                id: 'level_10',
                name: 'Skilled Learner',
                description: 'Reach level 10',
                icon: '🚀',
                rarity: 'silver',
                xpReward: 200,
                condition: (userData) => userData.level >= 10
            },
            {
                id: 'level_25',
                name: 'Expert Student',
                description: 'Reach level 25',
                icon: '💎',
                rarity: 'gold',
                xpReward: 500,
                condition: (userData) => userData.level >= 25
            },

            // Time-based Achievements
            {
                id: 'study_time_1h',
                name: 'Dedicated Hour',
                description: 'Study for 1 hour total',
                icon: '⏰',
                rarity: 'bronze',
                xpReward: 50,
                condition: (userData) => userData.statistics.totalStudyTime >= 3600 // 1 hour in seconds
            },
            {
                id: 'study_time_10h',
                name: 'Time Investment',
                description: 'Study for 10 hours total',
                icon: '⏲️',
                rarity: 'silver',
                xpReward: 200,
                condition: (userData) => userData.statistics.totalStudyTime >= 36000 // 10 hours
            }
        ];
    }

    calculateLevelFromXP(xp) {
        let level = 1;
        let xpNeeded = 0;

        while (xpNeeded <= xp) {
            xpNeeded += this.getXPRequiredForLevel(level);
            if (xpNeeded <= xp) {
                level++;
            }
        }

        return level;
    }

    getXPRequiredForLevel(level) {
        return Math.floor(100 * level * 1.5);
    }

    getXPRequiredForNextLevel(currentLevel) {
        return this.getXPRequiredForLevel(currentLevel);
    }

    getTotalXPForLevel(level) {
        let totalXP = 0;
        for (let i = 1; i < level; i++) {
            totalXP += this.getXPRequiredForLevel(i);
        }
        return totalXP;
    }

    getProgressToNextLevel(currentXP, currentLevel) {
        const totalXPForCurrentLevel = this.getTotalXPForLevel(currentLevel);
        const xpRequiredForNext = this.getXPRequiredForLevel(currentLevel);
        const currentLevelProgress = currentXP - totalXPForCurrentLevel;

        return {
            current: currentLevelProgress,
            required: xpRequiredForNext,
            percentage: Math.min(100, (currentLevelProgress / xpRequiredForNext) * 100)
        };
    }

    addXP(amount, reason = 'exercise') {
        const userData = window.storageManager.getUserData();
        const oldLevel = userData.level;
        const oldXP = userData.xp;

        userData.xp += amount;
        const newLevel = this.calculateLevelFromXP(userData.xp);

        const leveledUp = newLevel > oldLevel;
        if (leveledUp) {
            userData.level = newLevel;
        }

        window.storageManager.updateUserData(userData);

        return {
            oldXP,
            newXP: userData.xp,
            gainedXP: amount,
            oldLevel,
            newLevel,
            leveledUp,
            reason
        };
    }

    checkAchievements(lastExercise = null) {
        const userData = window.storageManager.getUserData();
        const progress = window.storageManager.getProgress();
        const newAchievements = [];

        for (const achievement of this.achievements) {
            // Skip if already earned
            if (userData.achievements.find(a => a.id === achievement.id)) {
                continue;
            }

            // Check if condition is met
            if (achievement.condition(userData, progress, lastExercise)) {
                const earnedAchievement = {
                    ...achievement,
                    earnedAt: new Date().toISOString()
                };

                userData.achievements.push(earnedAchievement);
                newAchievements.push(earnedAchievement);

                // Add XP reward
                this.addXP(achievement.xpReward, `achievement: ${achievement.name}`);
            }
        }

        if (newAchievements.length > 0) {
            window.storageManager.updateUserData(userData);
        }

        return newAchievements;
    }

    getStreakBonus(streak) {
        const bonuses = this.xpValues.streakBonus;
        for (const days of Object.keys(bonuses).sort((a, b) => b - a)) {
            if (streak >= parseInt(days)) {
                return bonuses[days];
            }
        }
        return 0;
    }

    applyStreakBonus() {
        const userData = window.storageManager.getUserData();
        const streak = window.storageManager.updateStreak();

        if (streak !== userData.streak) {
            const bonus = this.getStreakBonus(streak);
            if (bonus > 0) {
                const result = this.addXP(bonus, `${streak}-day streak bonus`);
                return { streakBonus: bonus, xpResult: result };
            }
        }

        return null;
    }

    simulateExerciseCompletion(exerciseType, score, timeSpent, wordIds = []) {
        // Add exercise to history
        const exerciseResult = window.storageManager.addExerciseResult(
            exerciseType,
            score,
            timeSpent,
            wordIds
        );

        // Calculate base XP
        let baseXP = this.xpValues[exerciseType] || this.xpValues.flashcard;

        // Score multiplier (0.5x for <50%, 1x for 50-80%, 1.5x for 80-95%, 2x for 95%+)
        let multiplier = 0.5;
        if (score >= 95) multiplier = 2;
        else if (score >= 80) multiplier = 1.5;
        else if (score >= 50) multiplier = 1;

        const totalXP = Math.floor(baseXP * multiplier);

        // Add XP
        const xpResult = this.addXP(totalXP, exerciseType);

        // Check for achievements
        const newAchievements = this.checkAchievements(exerciseResult);

        // Apply streak bonus if applicable
        const streakResult = this.applyStreakBonus();

        return {
            exercise: exerciseResult,
            xp: xpResult,
            achievements: newAchievements,
            streak: streakResult
        };
    }

    getLeaderboard() {
        // For future implementation when adding social features
        const userData = window.storageManager.getUserData();
        return [
            {
                rank: 1,
                name: 'You',
                level: userData.level,
                xp: userData.xp,
                streak: userData.streak
            }
        ];
    }

    getDailyChallenge() {
        const today = new Date().toISOString().split('T')[0];
        const userData = window.storageManager.getUserData();

        // Simple daily challenge system
        const challenges = [
            {
                id: 'vocab_review',
                name: 'Vocabulary Review',
                description: 'Review 20 vocabulary words',
                icon: '📚',
                target: 20,
                current: 0, // Would track from today's activity
                xpReward: 100
            },
            {
                id: 'perfect_accuracy',
                name: 'Perfect Accuracy',
                description: 'Complete an exercise with 100% accuracy',
                icon: '🎯',
                target: 1,
                current: 0,
                xpReward: 150
            },
            {
                id: 'study_time',
                name: 'Study Marathon',
                description: 'Study for 30 minutes',
                icon: '⏰',
                target: 1800, // 30 minutes in seconds
                current: 0,
                xpReward: 125
            }
        ];

        // Return a random challenge for the day (based on date seed)
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return challenges[dayOfYear % challenges.length];
    }

    displayAchievementNotification(achievement) {
        const modal = document.getElementById('achievement-modal');
        const icon = document.getElementById('achievement-icon');
        const title = document.getElementById('achievement-title');
        const description = document.getElementById('achievement-description');
        const xpReward = document.getElementById('achievement-xp');

        icon.textContent = achievement.icon;
        title.textContent = achievement.name;
        description.textContent = achievement.description;
        xpReward.textContent = achievement.xpReward;

        // EPIC SCREEN SHAKE!
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 600);

        // Play achievement sound based on rarity
        if (achievement.rarity === 'platinum' || achievement.rarity === 'gold') {
            window.soundManager?.play('epic');
        } else if (achievement.rarity === 'silver') {
            window.soundManager?.play('celebration');
        } else {
            window.soundManager?.play('party');
        }

        // Particle explosion based on rarity
        this.triggerParticleExplosion(achievement.rarity);

        // German-themed effects for gold/platinum achievements
        if (achievement.rarity === 'gold' || achievement.rarity === 'platinum') {
            this.triggerPretzelRain();
            icon.classList.add('mega-bounce');
            setTimeout(() => icon.classList.remove('mega-bounce'), 1000);
        } else {
            icon.classList.add('elastic-scale');
            setTimeout(() => icon.classList.remove('elastic-scale'), 800);
        }

        // Rainbow glow for platinum achievements
        if (achievement.rarity === 'platinum') {
            modal.classList.add('rainbow-glow');
            setTimeout(() => modal.classList.remove('rainbow-glow'), 3000);
        }

        modal.classList.remove('hidden');

        // Auto-close after 5 seconds
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 5000);
    }

    triggerParticleExplosion(rarity) {
        const particles = rarity === 'platinum' ? 50 : rarity === 'gold' ? 30 : 20;
        const emojis = rarity === 'platinum' ? ['💎', '👑', '⭐', '✨', '🏆'] :
                       rarity === 'gold' ? ['🥇', '⭐', '✨', '🎉'] :
                       rarity === 'silver' ? ['🥈', '⭐', '✨'] :
                       ['🎯', '✨', '🎉'];

        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const angle = (Math.PI * 2 * i) / particles;
            const velocity = 100 + Math.random() * 200;

            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');

            document.body.appendChild(particle);

            setTimeout(() => particle.remove(), 1500);
        }
    }

    triggerPretzelRain() {
        const pretzels = ['🥨', '🍺', '🇩🇪', '🎉', '🏆'];
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const pretzel = document.createElement('div');
                pretzel.className = 'pretzel-rain';
                pretzel.textContent = pretzels[Math.floor(Math.random() * pretzels.length)];
                pretzel.style.left = Math.random() * 100 + '%';
                document.body.appendChild(pretzel);
                setTimeout(() => pretzel.remove(), 3000);
            }, i * 100);
        }
    }

    updateUI() {
        const userData = window.storageManager.getUserData();
        const progress = this.getProgressToNextLevel(userData.xp, userData.level);

        // Update header stats
        const userLevelEl = document.getElementById('user-level');
        const userXpEl = document.getElementById('user-xp');
        const userStreakEl = document.getElementById('user-streak');
        const levelProgressEl = document.getElementById('level-progress');

        if (userLevelEl) userLevelEl.textContent = userData.level;
        if (userXpEl) userXpEl.textContent = userData.xp;
        if (userStreakEl) userStreakEl.textContent = userData.streak;
        if (levelProgressEl) {
            levelProgressEl.style.width = `${progress.percentage}%`;
        }

        // Update progress stats
        this.updateProgressStats();
        this.updateAchievementsDisplay();
    }

    updateProgressStats() {
        const stats = window.storageManager.getStatistics();

        const elements = {
            'total-study-time': `${Math.floor(stats.overview.studyTime / 60)}h ${stats.overview.studyTime % 60}m`,
            'exercises-completed': stats.overview.exercisesCompleted,
            'current-streak-display': stats.overview.streak,
            'longest-streak': stats.overview.longestStreak,
            'words-learned': stats.overview.wordsLearned,
            'accuracy-rate': `${stats.overview.accuracy}%`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    updateAchievementsDisplay() {
        const userData = window.storageManager.getUserData();
        const achievementsGrid = document.getElementById('achievements-grid');
        const recentAchievements = document.getElementById('recent-achievements');

        if (achievementsGrid) {
            achievementsGrid.innerHTML = '';

            this.achievements.forEach(achievement => {
                const earned = userData.achievements.find(a => a.id === achievement.id);
                const badge = this.createAchievementBadge(achievement, earned);
                achievementsGrid.appendChild(badge);
            });
        }

        if (recentAchievements) {
            recentAchievements.innerHTML = '';

            const recent = userData.achievements
                .slice(-3)
                .reverse()
                .map(achievement => this.createAchievementBadge(achievement, achievement));

            recent.forEach(badge => {
                badge.classList.add('mini');
                recentAchievements.appendChild(badge);
            });
        }
    }

    createAchievementBadge(achievement, earned) {
        const badge = document.createElement('div');
        badge.className = `achievement-badge ${earned ? 'earned' : 'locked'} rarity-${achievement.rarity}`;

        badge.innerHTML = `
            <div class="achievement-badge-icon">${achievement.icon}</div>
            <div class="achievement-badge-name">${achievement.name}</div>
            <div class="achievement-badge-desc">${achievement.description}</div>
            ${earned ? `<div class="achievement-date">Earned: ${new Date(earned.earnedAt).toLocaleDateString()}</div>` : ''}
        `;

        return badge;
    }
}

// Create global instance
window.gamificationSystem = new GamificationSystem();