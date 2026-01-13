// Enhanced Analytics - Time-of-day analysis, Category mastery, Learning velocity

class AnalyticsManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Track current session start time
        this.sessionStartTime = new Date();
        this.trackSessionStart();
    }

    // Track when user starts a session (for time-of-day analysis)
    trackSessionStart() {
        const hour = new Date().getHours();
        const userData = window.storageManager.getUserData();

        if (!userData.analytics) {
            userData.analytics = {
                timeOfDay: {},  // Hour -> {exercises: X, correct: Y}
                categoryMastery: {},  // Category -> {attempts: X, correct: Y, lastPracticed: date}
                learningVelocity: [],  // Array of {date, wordsLearned, timeSpent}
                accuracyByHour: {}
            };
        }

        if (!userData.analytics.timeOfDay[hour]) {
            userData.analytics.timeOfDay[hour] = {
                exercises: 0,
                correct: 0,
                total: 0
            };
        }

        window.storageManager.updateUserData({ analytics: userData.analytics });
    }

    // Record exercise completion with time-of-day data
    recordExercise(isCorrect, category) {
        const hour = new Date().getHours();
        const userData = window.storageManager.getUserData();
        const analytics = userData.analytics || this.initializeAnalytics();

        // Update time-of-day stats
        if (!analytics.timeOfDay[hour]) {
            analytics.timeOfDay[hour] = { exercises: 0, correct: 0, total: 0 };
        }
        analytics.timeOfDay[hour].exercises++;
        analytics.timeOfDay[hour].total++;
        if (isCorrect) {
            analytics.timeOfDay[hour].correct++;
        }

        // Update category mastery
        if (!analytics.categoryMastery[category]) {
            analytics.categoryMastery[category] = {
                attempts: 0,
                correct: 0,
                lastPracticed: new Date().toISOString()
            };
        }
        analytics.categoryMastery[category].attempts++;
        if (isCorrect) {
            analytics.categoryMastery[category].correct++;
        }
        analytics.categoryMastery[category].lastPracticed = new Date().toISOString();

        window.storageManager.updateUserData({ analytics });
    }

    initializeAnalytics() {
        return {
            timeOfDay: {},
            categoryMastery: {},
            learningVelocity: [],
            accuracyByHour: {}
        };
    }

    // Get best time of day for learning (highest accuracy)
    getBestTimeOfDay() {
        const userData = window.storageManager.getUserData();
        const timeOfDay = userData.analytics?.timeOfDay || {};

        let bestHour = null;
        let bestAccuracy = 0;

        Object.entries(timeOfDay).forEach(([hour, stats]) => {
            if (stats.total >= 5) {  // Need at least 5 exercises for meaningful data
                const accuracy = stats.correct / stats.total;
                if (accuracy > bestAccuracy) {
                    bestAccuracy = accuracy;
                    bestHour = parseInt(hour);
                }
            }
        });

        if (bestHour === null) return null;

        return {
            hour: bestHour,
            accuracy: (bestAccuracy * 100).toFixed(1),
            timeRange: this.formatTimeRange(bestHour)
        };
    }

    formatTimeRange(hour) {
        const start = `${hour}:00`;
        const end = `${hour + 1}:00`;
        const period = hour < 12 ? 'AM' : 'PM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}${period} - ${displayHour + 1}${period}`;
    }

    // Get category mastery breakdown
    getCategoryMastery() {
        const userData = window.storageManager.getUserData();
        const categoryMastery = userData.analytics?.categoryMastery || {};

        return Object.entries(categoryMastery).map(([category, stats]) => {
            const accuracy = stats.attempts > 0 ? (stats.correct / stats.attempts * 100).toFixed(1) : 0;
            const mastery = this.calculateMasteryLevel(stats.attempts, stats.correct);

            return {
                category,
                attempts: stats.attempts,
                accuracy: parseFloat(accuracy),
                mastery,
                lastPracticed: stats.lastPracticed
            };
        }).sort((a, b) => b.accuracy - a.accuracy);
    }

    calculateMasteryLevel(attempts, correct) {
        const accuracy = correct / attempts;
        const experienceWeight = Math.min(attempts / 20, 1);  // Max out at 20 attempts

        const masteryScore = (accuracy * 0.7 + experienceWeight * 0.3) * 100;

        if (masteryScore >= 90) return { level: 'Master', emoji: '👑', color: '#FFD700' };
        if (masteryScore >= 75) return { level: 'Expert', emoji: '⭐', color: '#4CAF50' };
        if (masteryScore >= 60) return { level: 'Proficient', emoji: '💪', color: '#2196F3' };
        if (masteryScore >= 40) return { level: 'Learning', emoji: '📚', color: '#FF9800' };
        return { level: 'Beginner', emoji: '🌱', color: '#9E9E9E' };
    }

    // Calculate learning velocity (words per day over time)
    updateLearningVelocity(wordsLearned) {
        const userData = window.storageManager.getUserData();
        const analytics = userData.analytics || this.initializeAnalytics();
        const today = new Date().toISOString().split('T')[0];

        // Find or create today's entry
        let todayEntry = analytics.learningVelocity.find(entry => entry.date === today);

        if (!todayEntry) {
            todayEntry = {
                date: today,
                wordsLearned: 0,
                timeSpent: 0
            };
            analytics.learningVelocity.push(todayEntry);
        }

        todayEntry.wordsLearned = wordsLearned;

        // Keep only last 30 days
        analytics.learningVelocity = analytics.learningVelocity
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 30);

        window.storageManager.updateUserData({ analytics });
    }

    // Get learning velocity trend
    getLearningVelocity() {
        const userData = window.storageManager.getUserData();
        const velocity = userData.analytics?.learningVelocity || [];

        if (velocity.length < 2) return null;

        // Calculate average words per day for last 7 days vs previous 7 days
        const last7Days = velocity.slice(0, 7);
        const previous7Days = velocity.slice(7, 14);

        const avgLast7 = last7Days.reduce((sum, day) => sum + day.wordsLearned, 0) / last7Days.length;
        const avgPrevious7 = previous7Days.length > 0
            ? previous7Days.reduce((sum, day) => sum + day.wordsLearned, 0) / previous7Days.length
            : 0;

        const trend = avgPrevious7 > 0 ? ((avgLast7 - avgPrevious7) / avgPrevious7 * 100).toFixed(1) : 0;

        return {
            avgWordsPerDay: avgLast7.toFixed(1),
            trend: parseFloat(trend),
            trending: trend > 5 ? 'up' : trend < -5 ? 'down' : 'stable'
        };
    }

    // Render enhanced stats dashboard
    renderEnhancedStats() {
        const container = document.getElementById('enhanced-stats-container');
        if (!container) return;

        const bestTime = this.getBestTimeOfDay();
        const categoryMastery = this.getCategoryMastery();
        const velocity = this.getLearningVelocity();
        const timeOfDayChart = this.getTimeOfDayChart();

        container.innerHTML = `
            <div class="enhanced-stats">
                <h2 class="stats-title">📊 Detailed Analytics</h2>

                <!-- Best Time of Day -->
                ${bestTime ? `
                    <div class="stat-card best-time-card">
                        <h3>⏰ Your Best Learning Time</h3>
                        <div class="best-time-display">
                            <div class="time-range">${bestTime.timeRange}</div>
                            <div class="accuracy-rate">${bestTime.accuracy}% accuracy</div>
                            <p class="tip">💡 Tip: You're most accurate during this time!</p>
                        </div>
                    </div>
                ` : `
                    <div class="stat-card">
                        <h3>⏰ Your Best Learning Time</h3>
                        <p>Complete more exercises to discover your peak learning hours!</p>
                    </div>
                `}

                <!-- Time of Day Activity Chart -->
                <div class="stat-card">
                    <h3>🕐 Activity by Time of Day</h3>
                    <div class="time-of-day-chart">
                        ${this.renderTimeOfDayChart(timeOfDayChart)}
                    </div>
                </div>

                <!-- Category Mastery -->
                <div class="stat-card category-mastery-card">
                    <h3>📚 Category Mastery</h3>
                    ${categoryMastery.length > 0 ? `
                        <div class="mastery-list">
                            ${categoryMastery.map(cat => `
                                <div class="mastery-item">
                                    <div class="mastery-header">
                                        <span class="mastery-emoji">${cat.mastery.emoji}</span>
                                        <span class="category-name">${cat.category}</span>
                                        <span class="mastery-badge" style="background: ${cat.mastery.color};">
                                            ${cat.mastery.level}
                                        </span>
                                    </div>
                                    <div class="mastery-stats">
                                        <div class="stat-item">
                                            <span class="stat-label">Accuracy:</span>
                                            <span class="stat-value">${cat.accuracy}%</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Attempts:</span>
                                            <span class="stat-value">${cat.attempts}</span>
                                        </div>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${cat.accuracy}%; background: ${cat.mastery.color};"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>Start practicing to see your category mastery!</p>'}
                </div>

                <!-- Learning Velocity -->
                ${velocity ? `
                    <div class="stat-card velocity-card">
                        <h3>🚀 Learning Velocity</h3>
                        <div class="velocity-display">
                            <div class="velocity-number">${velocity.avgWordsPerDay}</div>
                            <div class="velocity-label">words per day (7-day avg)</div>
                            <div class="trend-indicator trend-${velocity.trending}">
                                ${velocity.trending === 'up' ? '📈' : velocity.trending === 'down' ? '📉' : '➡️'}
                                ${velocity.trend > 0 ? '+' : ''}${velocity.trend}% vs last week
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        this.addEnhancedStatsStyles();
    }

    getTimeOfDayChart() {
        const userData = window.storageManager.getUserData();
        const timeOfDay = userData.analytics?.timeOfDay || {};

        // Create 24-hour array
        const hours = Array.from({ length: 24 }, (_, hour) => {
            const stats = timeOfDay[hour] || { exercises: 0, correct: 0, total: 0 };
            return {
                hour,
                exercises: stats.exercises || 0,
                accuracy: stats.total > 0 ? (stats.correct / stats.total * 100).toFixed(1) : 0
            };
        });

        return hours;
    }

    renderTimeOfDayChart(hours) {
        const maxExercises = Math.max(...hours.map(h => h.exercises), 1);

        return `
            <div class="hourly-chart">
                ${hours.map(hour => {
                    const height = (hour.exercises / maxExercises * 100);
                    const displayHour = hour.hour > 12 ? hour.hour - 12 : hour.hour === 0 ? 12 : hour.hour;
                    const period = hour.hour < 12 ? 'AM' : 'PM';

                    return `
                        <div class="hour-bar" title="${displayHour}${period}: ${hour.exercises} exercises, ${hour.accuracy}% accuracy">
                            <div class="bar-fill" style="height: ${height}%;">
                                ${hour.exercises > 0 ? `<span class="bar-count">${hour.exercises}</span>` : ''}
                            </div>
                            <div class="hour-label">${displayHour}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    addEnhancedStatsStyles() {
        if (document.getElementById('enhanced-stats-styles')) return;

        const style = document.createElement('style');
        style.id = 'enhanced-stats-styles';
        style.textContent = `
            .enhanced-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }

            .stats-title {
                grid-column: 1 / -1;
                font-size: 2rem;
                color: var(--primary-color);
                margin-bottom: 10px;
            }

            .stat-card {
                background: var(--bg-card);
                padding: 25px;
                border-radius: 15px;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
            }

            .stat-card:hover {
                transform: translateY(-3px);
                box-shadow: var(--shadow-lg);
            }

            .stat-card h3 {
                font-size: 1.3rem;
                margin-bottom: 20px;
                color: var(--primary-color);
            }

            .best-time-display {
                text-align: center;
            }

            .time-range {
                font-size: 2.5rem;
                font-weight: bold;
                color: var(--primary-color);
                margin-bottom: 10px;
            }

            .accuracy-rate {
                font-size: 1.5rem;
                color: #4CAF50;
                margin-bottom: 15px;
            }

            .tip {
                background: rgba(33, 150, 243, 0.1);
                padding: 10px;
                border-radius: 8px;
                font-size: 0.95rem;
                color: var(--text-secondary);
            }

            .hourly-chart {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                height: 200px;
                gap: 2px;
                padding: 10px 0;
            }

            .hour-bar {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                height: 100%;
            }

            .bar-fill {
                width: 100%;
                background: linear-gradient(to top, var(--primary-color), var(--accent-color));
                border-radius: 4px 4px 0 0;
                transition: all 0.3s ease;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 5px;
                position: relative;
            }

            .hour-bar:hover .bar-fill {
                background: linear-gradient(to top, var(--accent-color), var(--primary-color));
                transform: scaleY(1.05);
            }

            .bar-count {
                font-size: 0.75rem;
                color: white;
                font-weight: bold;
            }

            .hour-label {
                font-size: 0.7rem;
                color: var(--text-secondary);
                margin-top: 5px;
            }

            .mastery-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .mastery-item {
                background: var(--bg-secondary);
                padding: 15px;
                border-radius: 10px;
                transition: all 0.3s ease;
            }

            .mastery-item:hover {
                transform: translateX(5px);
                box-shadow: var(--shadow-sm);
            }

            .mastery-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }

            .mastery-emoji {
                font-size: 1.5rem;
            }

            .category-name {
                flex-grow: 1;
                font-weight: bold;
                font-size: 1.1rem;
            }

            .mastery-badge {
                padding: 4px 12px;
                border-radius: 20px;
                color: white;
                font-size: 0.85rem;
                font-weight: bold;
            }

            .mastery-stats {
                display: flex;
                gap: 20px;
                margin-bottom: 10px;
            }

            .stat-item {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }

            .stat-label {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }

            .stat-value {
                font-size: 1.1rem;
                font-weight: bold;
                color: var(--text-primary);
            }

            .velocity-display {
                text-align: center;
                padding: 20px;
            }

            .velocity-number {
                font-size: 3rem;
                font-weight: bold;
                color: var(--primary-color);
                margin-bottom: 5px;
            }

            .velocity-label {
                font-size: 1rem;
                color: var(--text-secondary);
                margin-bottom: 15px;
            }

            .trend-indicator {
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: bold;
                display: inline-block;
            }

            .trend-up {
                background: rgba(76, 175, 80, 0.2);
                color: #4CAF50;
            }

            .trend-down {
                background: rgba(244, 67, 54, 0.2);
                color: #F44336;
            }

            .trend-stable {
                background: rgba(158, 158, 158, 0.2);
                color: #9E9E9E;
            }

            @media (max-width: 768px) {
                .enhanced-stats {
                    grid-template-columns: 1fr;
                }

                .hourly-chart {
                    height: 150px;
                }

                .hour-label:nth-child(even) {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize
window.analyticsManager = new AnalyticsManager();
