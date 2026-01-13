// Advanced Progress Tracking - Visual Journey Map & Milestones
// Journey from Tourist → Local → Native Speaker with German cities!

class ProgressMapManager {
    constructor() {
        this.milestones = this.defineMilestones();
        this.germanCities = this.defineGermanCities();
        this.journeyStages = this.defineJourneyStages();
        this.initialize();
    }

    initialize() {
        // Check for milestone achievements on load
        this.checkMilestones();
    }

    // Define progression milestones with funny German-themed messages
    defineMilestones() {
        return [
            {
                id: 'first_word',
                threshold: 1,
                type: 'words',
                title: 'First German Word!',
                message: 'Your journey begins! Das ist gut! 🎉',
                icon: '🌱',
                xpReward: 50
            },
            {
                id: 'tourist',
                threshold: 20,
                type: 'words',
                title: 'Tourist Status',
                message: 'You can now ask "Wo ist die Toilette?"! 🚽',
                icon: '🎒',
                xpReward: 100,
                cityUnlocked: 'Munich'
            },
            {
                id: 'order_beer',
                threshold: 50,
                type: 'words',
                title: 'Beer Ordering Expert',
                message: 'You can order beer in 5 different ways! Ein Bier, bitte! 🍺',
                icon: '🍺',
                xpReward: 150
            },
            {
                id: 'survive',
                threshold: 100,
                type: 'words',
                title: 'Survival Mode Unlocked',
                message: 'You can now survive in Germany! Herzlichen Glückwunsch! 🎯',
                icon: '✈️',
                xpReward: 250,
                cityUnlocked: 'Berlin'
            },
            {
                id: 'conversationalist',
                threshold: 200,
                type: 'words',
                title: 'Conversationalist',
                message: 'You can have basic conversations! People will understand you! 💬',
                icon: '💬',
                xpReward: 500,
                cityUnlocked: 'Hamburg'
            },
            {
                id: 'intermediate',
                threshold: 350,
                type: 'words',
                title: 'Intermediate Champion',
                message: 'Impressive! You\'re officially past beginner stage! 🏆',
                icon: '🎓',
                xpReward: 750,
                cityUnlocked: 'Frankfurt'
            },
            {
                id: 'fluent',
                threshold: 500,
                type: 'words',
                title: 'Approaching Fluency',
                message: 'Wow! You\'re basically a German word-collecting machine! 🤖',
                icon: '🚀',
                xpReward: 1000,
                cityUnlocked: 'Cologne'
            },
            {
                id: 'master',
                threshold: 750,
                type: 'words',
                title: 'German Master',
                message: 'You can probably teach German now! Du bist fantastisch! 👑',
                icon: '👑',
                xpReward: 1500,
                cityUnlocked: 'Stuttgart'
            },
            {
                id: 'legend',
                threshold: 1000,
                type: 'words',
                title: 'German Legend',
                message: 'LEGENDARY! Even Mark Twain would be impressed! 💎',
                icon: '💎',
                xpReward: 2500,
                cityUnlocked: 'Dresden'
            },
            // Exercise-based milestones
            {
                id: 'dedicated',
                threshold: 50,
                type: 'exercises',
                title: 'Dedicated Learner',
                message: '50 exercises complete! Consistency is key! 🔥',
                icon: '📚',
                xpReward: 200
            },
            {
                id: 'warrior',
                threshold: 100,
                type: 'exercises',
                title: 'Study Warrior',
                message: '100 exercises! You\'re unstoppable! ⚔️',
                icon: '⚔️',
                xpReward: 400
            },
            {
                id: 'machine',
                threshold: 250,
                type: 'exercises',
                title: 'Learning Machine',
                message: '250 exercises! Are you even human? 🤖',
                icon: '🦾',
                xpReward: 800
            },
            // Streak milestones
            {
                id: 'week_streak',
                threshold: 7,
                type: 'streak',
                title: 'Week Warrior',
                message: '7 days in a row! That\'s German dedication! 🔥',
                icon: '🔥',
                xpReward: 300
            },
            {
                id: 'month_streak',
                threshold: 30,
                type: 'streak',
                title: 'Monthly Master',
                message: '30 day streak! You\'re officially obsessed! 🎯',
                icon: '🎯',
                xpReward: 1000
            }
        ];
    }

    // Define German cities with unlock requirements
    defineGermanCities() {
        return [
            {
                name: 'Munich',
                icon: '🥨',
                wordsRequired: 20,
                description: 'Home of Oktoberfest and pretzels!',
                unlocked: false
            },
            {
                name: 'Berlin',
                icon: '🏛️',
                wordsRequired: 100,
                description: 'The vibrant capital city!',
                unlocked: false
            },
            {
                name: 'Hamburg',
                icon: '⚓',
                wordsRequired: 200,
                description: 'The gateway to the world!',
                unlocked: false
            },
            {
                name: 'Frankfurt',
                icon: '🏦',
                wordsRequired: 350,
                description: 'Financial powerhouse!',
                unlocked: false
            },
            {
                name: 'Cologne',
                icon: '⛪',
                wordsRequired: 500,
                description: 'Famous for its cathedral!',
                unlocked: false
            },
            {
                name: 'Stuttgart',
                icon: '🚗',
                wordsRequired: 750,
                description: 'Home of Mercedes and Porsche!',
                unlocked: false
            },
            {
                name: 'Dresden',
                icon: '🏰',
                wordsRequired: 1000,
                description: 'The Florence of the Elbe!',
                unlocked: false
            }
        ];
    }

    // Define journey stages (Tourist → Local → Native Speaker)
    defineJourneyStages() {
        return [
            {
                id: 'tourist',
                name: 'Tourist',
                icon: '🎒',
                wordsMin: 0,
                wordsMax: 99,
                description: 'Learning the basics for travel',
                color: '#FFB74D'
            },
            {
                id: 'resident',
                name: 'Resident',
                icon: '🏠',
                wordsMin: 100,
                wordsMax: 299,
                description: 'Can handle daily situations',
                color: '#81C784'
            },
            {
                id: 'local',
                name: 'Local',
                icon: '🚲',
                wordsMin: 300,
                wordsMax: 599,
                description: 'Comfortable in most situations',
                color: '#64B5F6'
            },
            {
                id: 'fluent',
                name: 'Fluent Speaker',
                icon: '💼',
                wordsMin: 600,
                wordsMax: 999,
                description: 'Professional proficiency',
                color: '#BA68C8'
            },
            {
                id: 'native',
                name: 'Native Level',
                icon: '👑',
                wordsMin: 1000,
                wordsMax: Infinity,
                description: 'Basically German now!',
                color: '#FFD700'
            }
        ];
    }

    // Get current journey stage based on words learned
    getCurrentStage(wordsLearned) {
        return this.journeyStages.find(stage =>
            wordsLearned >= stage.wordsMin && wordsLearned <= stage.wordsMax
        ) || this.journeyStages[0];
    }

    // Get unlocked cities
    getUnlockedCities(wordsLearned) {
        return this.germanCities.map(city => ({
            ...city,
            unlocked: wordsLearned >= city.wordsRequired
        }));
    }

    // Check for newly achieved milestones
    checkMilestones() {
        const userData = window.storageManager.getUserData();
        const wordsLearned = userData.statistics?.totalWordsLearned || 0;
        const exercisesCompleted = userData.exercisesCompleted || 0;
        const streak = userData.streak || 0;
        const achievedMilestones = userData.achievedMilestones || [];

        this.milestones.forEach(milestone => {
            // Skip if already achieved
            if (achievedMilestones.includes(milestone.id)) return;

            let isAchieved = false;
            switch (milestone.type) {
                case 'words':
                    isAchieved = wordsLearned >= milestone.threshold;
                    break;
                case 'exercises':
                    isAchieved = exercisesCompleted >= milestone.threshold;
                    break;
                case 'streak':
                    isAchieved = streak >= milestone.threshold;
                    break;
            }

            if (isAchieved) {
                this.celebrateMilestone(milestone);
                achievedMilestones.push(milestone.id);

                // Save achievement
                window.storageManager.updateUserData({
                    achievedMilestones: achievedMilestones,
                    xp: userData.xp + milestone.xpReward
                });
            }
        });
    }

    // EPIC milestone celebration!
    celebrateMilestone(milestone) {
        console.log('🎉 Milestone achieved:', milestone.title);

        // Play epic sound
        window.soundManager?.play('epic');

        // Screen shake!
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 600);

        // German confetti explosion!
        if (window.funUtils) {
            window.funUtils.triggerGermanConfetti('celebration');
        }

        // Show milestone modal
        this.showMilestoneModal(milestone);

        // Particle explosion
        this.triggerMilestoneParticles(milestone);
    }

    showMilestoneModal(milestone) {
        // Create milestone modal
        const modal = document.createElement('div');
        modal.className = 'milestone-modal';
        modal.innerHTML = `
            <div class="milestone-overlay"></div>
            <div class="milestone-content mega-bounce">
                <div class="milestone-icon rainbow-glow">${milestone.icon}</div>
                <h2 class="milestone-title">${milestone.title}</h2>
                <p class="milestone-message">${milestone.message}</p>
                ${milestone.cityUnlocked ? `
                    <div class="city-unlocked">
                        <span class="unlock-badge">🔓 City Unlocked!</span>
                        <div class="city-name">${milestone.cityUnlocked}</div>
                    </div>
                ` : ''}
                <div class="xp-reward-big">+${milestone.xpReward} XP</div>
                <button class="btn-primary milestone-close">Awesome!</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Close button
        modal.querySelector('.milestone-close').addEventListener('click', () => {
            modal.remove();
        });

        // Auto-close after 8 seconds
        setTimeout(() => modal.remove(), 8000);

        // Add styles
        this.addMilestoneStyles();
    }

    triggerMilestoneParticles(milestone) {
        const particles = 60;
        const emojis = [milestone.icon, '⭐', '✨', '🎉', '🎊', '💫'];

        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const angle = (Math.PI * 2 * i) / particles;
            const velocity = 150 + Math.random() * 250;

            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');

            document.body.appendChild(particle);

            setTimeout(() => particle.remove(), 1500);
        }
    }

    addMilestoneStyles() {
        if (document.getElementById('milestone-styles')) return;

        const style = document.createElement('style');
        style.id = 'milestone-styles';
        style.textContent = `
            .milestone-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .milestone-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                animation: fadeIn 0.3s ease-out;
            }

            .milestone-content {
                position: relative;
                background: linear-gradient(135deg, #FAF6F1 0%, #F5EDE4 100%);
                border-radius: 20px;
                padding: 50px 40px;
                text-align: center;
                max-width: 500px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                z-index: 1;
            }

            .milestone-icon {
                font-size: 6rem;
                margin-bottom: 20px;
                display: inline-block;
            }

            .milestone-title {
                font-size: 2.5rem;
                font-weight: bold;
                color: #8B5E3C;
                margin-bottom: 15px;
            }

            .milestone-message {
                font-size: 1.3rem;
                color: #5D4037;
                margin-bottom: 25px;
                line-height: 1.5;
            }

            .city-unlocked {
                background: linear-gradient(135deg, #FFD700 0%, #FFA000 100%);
                padding: 20px;
                border-radius: 15px;
                margin: 25px 0;
                animation: elasticScale 0.8s ease-out;
            }

            .unlock-badge {
                display: block;
                font-size: 1rem;
                font-weight: bold;
                color: white;
                margin-bottom: 10px;
            }

            .city-name {
                font-size: 2rem;
                font-weight: bold;
                color: white;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .xp-reward-big {
                font-size: 2rem;
                font-weight: bold;
                color: #4CAF50;
                margin: 25px 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .milestone-close {
                padding: 15px 40px;
                font-size: 1.2rem;
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);
    }

    // Render progress map in the UI
    renderProgressMap() {
        const container = document.getElementById('progress-map-container');
        if (!container) return;

        const userData = window.storageManager.getUserData();
        const wordsLearned = userData.statistics?.totalWordsLearned || 0;
        const currentStage = this.getCurrentStage(wordsLearned);
        const unlockedCities = this.getUnlockedCities(wordsLearned);
        const nextStage = this.journeyStages.find(s => s.wordsMin > wordsLearned);

        container.innerHTML = `
            <div class="journey-map">
                <h2 class="map-title">Your German Journey</h2>

                <!-- Current Stage -->
                <div class="current-stage" style="background: ${currentStage.color};">
                    <div class="stage-icon">${currentStage.icon}</div>
                    <div class="stage-info">
                        <h3>${currentStage.name}</h3>
                        <p>${currentStage.description}</p>
                        <div class="stage-progress">
                            <strong>${wordsLearned}</strong> words learned
                        </div>
                    </div>
                </div>

                <!-- Progress to next stage -->
                ${nextStage ? `
                    <div class="next-stage-progress">
                        <p>Next stage: <strong>${nextStage.name}</strong></p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min((wordsLearned / nextStage.wordsMin) * 100, 100)}%"></div>
                        </div>
                        <p class="progress-text">${nextStage.wordsMin - wordsLearned} words to go</p>
                    </div>
                ` : '<p class="max-level">🎉 Maximum level achieved!</p>'}

                <!-- German Cities Map -->
                <div class="cities-map">
                    <h3>German Cities Unlocked</h3>
                    <div class="cities-grid">
                        ${unlockedCities.map(city => `
                            <div class="city-card ${city.unlocked ? 'unlocked' : 'locked'}">
                                <div class="city-icon">${city.unlocked ? city.icon : '🔒'}</div>
                                <div class="city-name">${city.name}</div>
                                <div class="city-desc">${city.description}</div>
                                ${!city.unlocked ? `
                                    <div class="unlock-requirement">
                                        ${city.wordsRequired} words needed
                                    </div>
                                ` : '<div class="unlocked-badge">✓ Unlocked!</div>'}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- All Journey Stages -->
                <div class="journey-stages">
                    <h3>Journey Progression</h3>
                    ${this.journeyStages.map((stage, index) => {
                        const isCompleted = wordsLearned >= stage.wordsMin;
                        const isCurrent = currentStage.id === stage.id;
                        return `
                            <div class="stage-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                                <div class="stage-number">${index + 1}</div>
                                <div class="stage-icon-small">${stage.icon}</div>
                                <div class="stage-details">
                                    <div class="stage-name">${stage.name}</div>
                                    <div class="stage-range">${stage.wordsMin}${stage.wordsMax < Infinity ? `-${stage.wordsMax}` : '+'} words</div>
                                </div>
                                ${isCompleted ? '<div class="check-mark">✓</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.addProgressMapStyles();
    }

    addProgressMapStyles() {
        if (document.getElementById('progress-map-styles')) return;

        const style = document.createElement('style');
        style.id = 'progress-map-styles';
        style.textContent = `
            .journey-map {
                padding: 30px;
                background: var(--bg-card);
                border-radius: 15px;
                box-shadow: var(--shadow-lg);
            }

            .map-title {
                font-size: 2rem;
                color: var(--primary-color);
                margin-bottom: 30px;
                text-align: center;
            }

            .current-stage {
                padding: 30px;
                border-radius: 15px;
                display: flex;
                align-items: center;
                gap: 25px;
                margin-bottom: 30px;
                color: white;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }

            .stage-icon {
                font-size: 5rem;
                animation: float 3s ease-in-out infinite;
            }

            .stage-info h3 {
                font-size: 2rem;
                margin-bottom: 10px;
            }

            .stage-progress {
                margin-top: 15px;
                font-size: 1.2rem;
            }

            .next-stage-progress {
                background: var(--bg-secondary);
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
                text-align: center;
            }

            .cities-map {
                margin: 40px 0;
            }

            .cities-map h3 {
                font-size: 1.5rem;
                margin-bottom: 20px;
                color: var(--primary-color);
            }

            .cities-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
            }

            .city-card {
                background: var(--bg-secondary);
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                transition: all 0.3s ease;
                border: 3px solid transparent;
            }

            .city-card.unlocked {
                background: linear-gradient(135deg, rgba(129, 199, 132, 0.2) 0%, rgba(129, 199, 132, 0.1) 100%);
                border-color: #81C784;
            }

            .city-card.unlocked:hover {
                transform: translateY(-5px) scale(1.05);
                box-shadow: var(--shadow-lg);
            }

            .city-card.locked {
                opacity: 0.6;
                filter: grayscale(0.5);
            }

            .city-icon {
                font-size: 3rem;
                margin-bottom: 10px;
            }

            .city-name {
                font-size: 1.2rem;
                font-weight: bold;
                margin-bottom: 8px;
                color: var(--text-primary);
            }

            .city-desc {
                font-size: 0.9rem;
                color: var(--text-secondary);
                margin-bottom: 10px;
            }

            .unlock-requirement {
                font-size: 0.85rem;
                color: var(--text-muted);
                font-style: italic;
            }

            .unlocked-badge {
                color: #4CAF50;
                font-weight: bold;
            }

            .journey-stages {
                margin-top: 40px;
            }

            .journey-stages h3 {
                font-size: 1.5rem;
                margin-bottom: 20px;
                color: var(--primary-color);
            }

            .stage-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: var(--bg-secondary);
                border-radius: 10px;
                margin-bottom: 10px;
                border-left: 4px solid transparent;
                transition: all 0.3s ease;
            }

            .stage-item.completed {
                background: rgba(129, 199, 132, 0.1);
                border-left-color: #81C784;
            }

            .stage-item.current {
                background: rgba(255, 183, 77, 0.2);
                border-left-color: #FFB74D;
                animation: pulse 2s ease-in-out infinite;
            }

            .stage-number {
                width: 35px;
                height: 35px;
                background: var(--primary-color);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }

            .stage-icon-small {
                font-size: 2rem;
            }

            .stage-details {
                flex-grow: 1;
            }

            .stage-name {
                font-weight: bold;
                margin-bottom: 5px;
            }

            .stage-range {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .check-mark {
                color: #4CAF50;
                font-size: 1.5rem;
                font-weight: bold;
            }

            @media (max-width: 768px) {
                .current-stage {
                    flex-direction: column;
                    text-align: center;
                }

                .cities-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize on page load
window.progressMapManager = new ProgressMapManager();
