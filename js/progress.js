class ProgressManager {
    constructor() {
        this.chartData = {};
        this.initialize();
    }

    initialize() {
        this.updateProgressDisplay();
        this.generateStudyHeatmap();
        this.updateAchievementDisplay();
    }

    updateProgressDisplay() {
        const stats = window.storageManager.getStatistics();

        // Update overview stats
        this.updateOverviewStats(stats.overview);

        // Update vocabulary category breakdown
        this.updateVocabularyBreakdown(stats.vocabularyStats);

        // Update recent activity
        this.updateRecentActivity(stats.recentActivity);
    }

    updateOverviewStats(overview) {
        const elements = {
            'total-study-time': this.formatStudyTime(overview.studyTime * 60), // Convert back to seconds
            'exercises-completed': overview.exercisesCompleted,
            'current-streak-display': overview.streak,
            'longest-streak': overview.longestStreak
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Update progress bars for level advancement
        this.updateLevelProgress(overview.level, overview.xp);
    }

    updateLevelProgress(level, xp) {
        const gamification = window.gamificationSystem;
        const progress = gamification.getProgressToNextLevel(xp, level);

        // Update main header progress
        const headerProgress = document.getElementById('level-progress');
        if (headerProgress) {
            headerProgress.style.width = `${progress.percentage}%`;
            headerProgress.title = `${progress.current}/${progress.required} XP to next level`;
        }

        // Update detailed progress in progress section
        this.updateDetailedLevelProgress(level, xp, progress);
    }

    updateDetailedLevelProgress(level, xp, progress) {
        // Create or update level progress card
        let levelCard = document.getElementById('level-progress-card');

        if (!levelCard) {
            levelCard = document.createElement('div');
            levelCard.id = 'level-progress-card';
            levelCard.className = 'progress-card';

            const progressOverview = document.querySelector('.progress-overview');
            if (progressOverview) {
                progressOverview.insertBefore(levelCard, progressOverview.firstChild);
            }
        }

        const nextLevel = level + 1;
        const xpToNext = progress.required - progress.current;

        levelCard.innerHTML = `
            <h3>Level Progress</h3>
            <div class="level-display">
                <div class="current-level">
                    <span class="level-number">${level}</span>
                    <span class="level-label">Current Level</span>
                </div>
                <div class="level-arrow">→</div>
                <div class="next-level">
                    <span class="level-number">${nextLevel}</span>
                    <span class="level-label">Next Level</span>
                </div>
            </div>
            <div class="level-progress-bar">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
                <div class="progress-text">
                    ${progress.current} / ${progress.required} XP (${xpToNext} more needed)
                </div>
            </div>
            <div class="level-benefits">
                <h4>Next Level Benefits:</h4>
                <ul>
                    <li>🎯 Unlock new exercises</li>
                    <li>🏆 New achievement badges</li>
                    <li>📚 Advanced vocabulary sets</li>
                </ul>
            </div>
        `;
    }

    updateVocabularyBreakdown(vocabularyStats) {
        const container = document.getElementById('vocabulary-breakdown');

        if (!container) {
            // Create vocabulary breakdown section
            const progressOverview = document.querySelector('.progress-overview');
            if (!progressOverview) return;

            const vocabCard = document.createElement('div');
            vocabCard.className = 'progress-card';
            vocabCard.innerHTML = `
                <h3>Vocabulary Progress</h3>
                <div id="vocabulary-breakdown"></div>
            `;
            progressOverview.appendChild(vocabCard);
        }

        const breakdown = document.getElementById('vocabulary-breakdown');
        if (!breakdown) return;

        let html = '';

        if (Object.keys(vocabularyStats).length === 0) {
            html = `
                <div class="vocab-category">
                    <div class="category-header">
                        <h4>Ready to Start!</h4>
                        <span class="category-stats">Begin learning vocabulary</span>
                    </div>
                    <div class="category-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <span class="progress-text">0 / 85 words</span>
                    </div>
                </div>
            `;
        } else {
            Object.entries(vocabularyStats).forEach(([category, stats]) => {
                const percentage = stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0;

                html += `
                    <div class="vocab-category">
                        <div class="category-header">
                            <h4>${this.formatCategoryName(category)}</h4>
                            <span class="category-stats">${stats.mastered} mastered</span>
                        </div>
                        <div class="category-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%"></div>
                            </div>
                            <span class="progress-text">${stats.mastered} / ${stats.total} words</span>
                        </div>
                    </div>
                `;
            });
        }

        breakdown.innerHTML = html;
    }

    formatCategoryName(category) {
        const categoryNames = {
            'greetings': 'Greetings',
            'numbers': 'Numbers',
            'colors': 'Colors',
            'family': 'Family',
            'verbs': 'Basic Verbs'
        };

        return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    updateRecentActivity(recentActivity) {
        // This will be shown in the study calendar heatmap
        this.generateStudyHeatmap(recentActivity);
    }

    generateStudyHeatmap(activityData = null) {
        const heatmapContainer = document.getElementById('study-heatmap');
        if (!heatmapContainer) return;

        // Get last 60 days of activity
        const days = [];
        const today = new Date();

        for (let i = 59; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const userData = window.storageManager.getUserData();
            const activityCount = userData.statistics.dailyActivity[dateStr] || 0;

            days.push({
                date: dateStr,
                count: activityCount,
                level: this.getActivityLevel(activityCount)
            });
        }

        // Create heatmap grid
        heatmapContainer.innerHTML = this.createHeatmapHTML(days);

        // Add tooltips
        this.addHeatmapTooltips();
    }

    getActivityLevel(count) {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 5) return 2;
        if (count <= 10) return 3;
        if (count <= 15) return 4;
        return 5;
    }

    createHeatmapHTML(days) {
        // Create month labels
        const monthLabels = this.createMonthLabels(days);
        const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

        // Group days by weeks
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return `
            <div class="heatmap-labels">
                <div class="month-labels">
                    ${monthLabels}
                </div>
                <div class="heatmap-content">
                    <div class="day-labels">
                        ${dayLabels.map(day => `<span class="day-label">${day}</span>`).join('')}
                    </div>
                    <div class="heatmap-grid">
                        ${weeks.map(week => `
                            <div class="heatmap-week">
                                ${week.map(day => `
                                    <div class="calendar-day level-${day.level}"
                                         data-date="${day.date}"
                                         data-count="${day.count}"
                                         title="${this.formatDateTooltip(day)}">
                                    </div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="heatmap-legend">
                <span>Less</span>
                ${[0, 1, 2, 3, 4, 5].map(level =>
                    `<div class="legend-item level-${level}"></div>`
                ).join('')}
                <span>More</span>
            </div>
        `;
    }

    createMonthLabels(days) {
        const months = [];
        let currentMonth = '';

        days.forEach(day => {
            const date = new Date(day.date);
            const month = date.toLocaleDateString('en', { month: 'short' });

            if (month !== currentMonth) {
                months.push(month);
                currentMonth = month;
            }
        });

        return months.map(month => `<span class="month-label">${month}</span>`).join('');
    }

    formatDateTooltip(day) {
        const date = new Date(day.date);
        const formatted = date.toLocaleDateString('en', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (day.count === 0) {
            return `${formatted} - No activity`;
        } else if (day.count === 1) {
            return `${formatted} - 1 exercise`;
        } else {
            return `${formatted} - ${day.count} exercises`;
        }
    }

    addHeatmapTooltips() {
        // Basic tooltip functionality
        const days = document.querySelectorAll('.calendar-day');

        days.forEach(day => {
            day.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target.title, e);
            });

            day.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(text, element) {
        let tooltip = document.getElementById('heatmap-tooltip');

        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'heatmap-tooltip';
            tooltip.className = 'heatmap-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.textContent = text;
        tooltip.style.display = 'block';

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
    }

    hideTooltip() {
        const tooltip = document.getElementById('heatmap-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    updateAchievementDisplay() {
        // This is handled by gamificationSystem.updateAchievementsDisplay()
        // We just call it to ensure consistency
        if (window.gamificationSystem) {
            window.gamificationSystem.updateAchievementsDisplay();
        }
    }

    formatStudyTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    generateWeeklyReport() {
        const stats = window.storageManager.getStatistics();
        const userData = window.storageManager.getUserData();

        // Get last 7 days activity
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            last7Days.push({
                date: dateStr,
                exercises: userData.statistics.dailyActivity[dateStr] || 0
            });
        }

        const totalExercises = last7Days.reduce((sum, day) => sum + day.exercises, 0);
        const studyDays = last7Days.filter(day => day.exercises > 0).length;

        return {
            totalExercises,
            studyDays,
            averagePerDay: totalExercises / 7,
            currentStreak: stats.overview.streak,
            weeklyGoal: userData.settings.dailyGoal * 7,
            progress: (totalExercises / (userData.settings.dailyGoal * 7)) * 100
        };
    }

    generateMonthlyReport() {
        const stats = window.storageManager.getStatistics();
        const userData = window.storageManager.getUserData();

        // Get last 30 days activity
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            last30Days.push({
                date: dateStr,
                exercises: userData.statistics.dailyActivity[dateStr] || 0
            });
        }

        const totalExercises = last30Days.reduce((sum, day) => sum + day.exercises, 0);
        const studyDays = last30Days.filter(day => day.exercises > 0).length;

        return {
            totalExercises,
            studyDays,
            studyPercentage: (studyDays / 30) * 100,
            averagePerDay: totalExercises / 30,
            newWordsLearned: this.getNewWordsInPeriod(30),
            achievementsEarned: this.getAchievementsInPeriod(30)
        };
    }

    getNewWordsInPeriod(days) {
        const userData = window.storageManager.getUserData();
        const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);

        return userData.wordsLearned.filter(word =>
            word.firstLearned && word.firstLearned > cutoffDate
        ).length;
    }

    getAchievementsInPeriod(days) {
        const userData = window.storageManager.getUserData();
        const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString();

        return userData.achievements.filter(achievement =>
            achievement.earnedAt && achievement.earnedAt > cutoffDate
        ).length;
    }

    exportProgressReport() {
        const weeklyReport = this.generateWeeklyReport();
        const monthlyReport = this.generateMonthlyReport();
        const stats = window.storageManager.getStatistics();

        const report = {
            generatedAt: new Date().toISOString(),
            overview: stats.overview,
            weekly: weeklyReport,
            monthly: monthlyReport,
            achievements: stats.achievements,
            vocabularyProgress: stats.vocabularyStats
        };

        // Create downloadable file
        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `learndeutsch-progress-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    resetProgress() {
        if (!confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            return false;
        }

        if (!confirm('This will delete all your learned vocabulary, statistics, and achievements. Are you absolutely sure?')) {
            return false;
        }

        window.storageManager.resetAllData();

        // Reload the page to reflect changes
        window.location.reload();

        return true;
    }

    // Called by other modules when progress is updated
    onProgressUpdate() {
        this.updateProgressDisplay();
    }
}

// Initialize progress manager
window.progressManager = new ProgressManager();