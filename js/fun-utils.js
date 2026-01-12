// Fun Utilities - Making German learning RIDICULOUSLY fun!

class FunUtils {
    constructor() {
        this.mascot = null;
        this.initMascot();
    }

    // Funny German-themed loading messages
    getRandomLoadingMessage() {
        const messages = [
            "🥨 Baking fresh pretzels...",
            "🍺 Pouring the perfect beer...",
            "🚗 Engineering German cars...",
            "🏰 Building a castle...",
            "🎵 Tuning the accordion...",
            "📚 Alphabetizing die, der, das...",
            "🥾 Polishing lederhosen...",
            "🎄 Growing a Christmas tree...",
            "⚽ Training with Bayern Munich...",
            "🧀 Aging Swiss... wait, German cheese!",
            "🌭 Grilling the perfect wurst...",
            "🎭 Rehearsing Wagner operas...",
            "🏔️ Climbing the Alps...",
            "🕰️ Precision-timing everything...",
            "🔧 Over-engineering this button..."
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Funny motivational phrases
    getMotivationalPhrase(context = 'default') {
        const phrases = {
            correct: [
                "Wunderbar! You're a German genius!",
                "Ausgezeichnet! Even Goethe is impressed!",
                "Fantastisch! You deserve a pretzel!",
                "Genial! That's more German than a cuckoo clock!",
                "Toll! You're basically fluent now!",
                "Bravo! Time for a beer garden celebration!",
                "Hervorragend! You could teach Beethoven!",
                "Super! Even the grammar nazis approve!",
                "Spitze! Your brain is like a BMW engine!"
            ],
            wrong: [
                "Oof! That was more confusing than der/die/das!",
                "Nein! But hey, even Einstein made mistakes!",
                "Oops! Not quite, but close like Austria to Germany!",
                "Hoppla! Try again, you beautiful Kartoffel!",
                "Nope! But don't worry, German is weird anyway!",
                "Falsch! But you're still cooler than lederhosen!",
                "Not this time! Even Germans get this wrong!",
                "Schade! But failure is just success in rehearsal!"
            ],
            streak: [
                "🔥 You're on fire like a Bavarian sausage!",
                "🔥 Hotter than a Berlin summer!",
                "🔥 Your streak is longer than the autobahn!",
                "🔥 More consistent than German engineering!",
                "🔥 Burning brighter than Oktoberfest lanterns!"
            ],
            start: [
                "Ready to speak German like a boss?",
                "Time to become a word-collecting wizard!",
                "Let's make German fun again!",
                "Guten Tag! Let's learn some fancy words!",
                "Warning: May cause excessive confidence!"
            ]
        };

        const contextPhrases = phrases[context] || phrases.default || phrases.start;
        return contextPhrases[Math.floor(Math.random() * contextPhrases.length)];
    }

    // Silly German puns and tooltips
    getRandomTooltip() {
        const tooltips = [
            "💡 Fun fact: 'Backpfeifengesicht' means 'a face that needs punching'",
            "💡 Germans have a word for everything. EVERYTHING.",
            "💡 The longest German word has 63 letters. We won't torture you with that.",
            "💡 'Schadenfreude' - enjoying others' misfortune. Very German!",
            "💡 Germans put nouns together like LEGO. Hence: Donaudampfschifffahrt!",
            "💡 'Kummerspeck' = grief bacon (weight gained from emotional eating)",
            "💡 'Verschlimmbessern' = making things worse by trying to improve them",
            "💡 Germans are so efficient they have 4 words for eating!",
            "💡 'Fernweh' = feeling homesick for places you've never been",
            "💡 Mark Twain said learning German takes 30 years. You'll do it faster!"
        ];
        return tooltips[Math.floor(Math.random() * tooltips.length)];
    }

    // Initialize mascot character
    initMascot() {
        // Create mascot container
        const mascot = document.createElement('div');
        mascot.id = 'german-mascot';
        mascot.className = 'mascot bounce-in float';
        mascot.innerHTML = '🥨'; // Pretzel mascot!
        mascot.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            font-size: 4rem;
            cursor: pointer;
            z-index: 9999;
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
            transition: all 0.3s ease;
        `;

        // Add to page
        document.body.appendChild(mascot);
        this.mascot = mascot;

        // Mascot interactions
        mascot.addEventListener('click', () => this.mascotReact('click'));
        mascot.addEventListener('mouseenter', () => this.mascotReact('hover'));

        // Random reactions
        this.startRandomReactions();

        return mascot;
    }

    mascotReact(type) {
        if (!this.mascot) return;

        const reactions = {
            click: ['🥨', '😄', '🎉', '👍', '🍺', '🎯', '💪'],
            hover: ['😊', '🥨', '👋', '😎'],
            correct: ['🎉', '🥳', '🏆', '⭐', '💯'],
            wrong: ['😅', '🤔', '😬', '💭', '🤷'],
            thinking: ['🤔', '💭', '🧐', '📚'],
            celebrate: ['🎊', '🥳', '🎉', '🍾', '🏆']
        };

        const emojis = reactions[type] || reactions.click;
        const originalEmoji = this.mascot.innerHTML;

        // Change to reaction
        this.mascot.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
        this.mascot.classList.add('elastic-scale');

        // Show speech bubble
        if (type === 'click') {
            this.showSpeechBubble(this.getRandomTooltip());
        }

        // Return to original after delay
        setTimeout(() => {
            this.mascot.innerHTML = '🥨';
            this.mascot.classList.remove('elastic-scale');
        }, 2000);
    }

    showSpeechBubble(text) {
        // Remove existing bubble
        const existing = document.getElementById('mascot-speech');
        if (existing) existing.remove();

        const bubble = document.createElement('div');
        bubble.id = 'mascot-speech';
        bubble.className = 'speech-bubble bounce-in';
        bubble.textContent = text;
        bubble.style.cssText = `
            position: fixed;
            bottom: 200px;
            right: 40px;
            background: white;
            border: 3px solid #8B5E3C;
            border-radius: 20px;
            padding: 15px 20px;
            max-width: 280px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 0.9rem;
            line-height: 1.4;
        `;

        // Add speech bubble tail
        const tail = document.createElement('div');
        tail.style.cssText = `
            position: absolute;
            bottom: -10px;
            right: 50px;
            width: 0;
            height: 0;
            border-left: 15px solid transparent;
            border-right: 15px solid transparent;
            border-top: 15px solid #8B5E3C;
        `;
        bubble.appendChild(tail);

        document.body.appendChild(bubble);

        // Auto-remove after 5 seconds
        setTimeout(() => bubble.remove(), 5000);

        // Click to dismiss
        bubble.addEventListener('click', () => bubble.remove());
    }

    startRandomReactions() {
        // Mascot does random things every 30-60 seconds
        setInterval(() => {
            if (Math.random() > 0.5) {
                this.mascotReact('thinking');
            }
        }, 45000);
    }

    // Enhanced confetti with German flair
    triggerGermanConfetti(type = 'default') {
        const emojis = {
            default: ['🎉', '⭐', '✨', '🎊'],
            german: ['🥨', '🍺', '🇩🇪', '🏰', '🎵', '⚽', '🎄'],
            achievement: ['🏆', '👑', '💎', '🥇', '🥈', '🥉'],
            celebration: ['🎉', '🥳', '🎊', '🍾', '🎈', '🎁']
        };

        const confettiEmojis = emojis[type] || emojis.default;
        const count = 50;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti circle';
                confetti.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.animationDelay = Math.random() * 0.3 + 's';
                confetti.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';

                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 3000);
            }, i * 20);
        }

        // Trigger mascot celebration
        if (this.mascot) {
            this.mascotReact('celebrate');
        }
    }

    // Beer mug clink animation for correct answers
    triggerBeerClink() {
        // Play beer sound!
        window.soundManager?.play('bier');

        const beer = document.createElement('div');
        beer.textContent = '🍺';
        beer.className = 'beer-clink';
        beer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 6rem;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(beer);

        setTimeout(() => {
            beer.style.opacity = '0';
            beer.style.transition = 'opacity 0.3s ease-out';
        }, 800);

        setTimeout(() => beer.remove(), 1100);
    }

    // Add wiggle to cards
    addWiggleToCards() {
        document.querySelectorAll('.path-card, .summary-card, .level-card').forEach(card => {
            card.classList.add('wiggle-hover');
        });
    }

    // Disco mode (secret Easter egg)
    activateDiscoMode() {
        document.body.classList.add('disco-mode');
        this.showSpeechBubble('🕺 DISCO MODE ACTIVATED! 🎉');

        setTimeout(() => {
            document.body.classList.remove('disco-mode');
        }, 10000);
    }

    // Update motivational phrase in hero
    updateMotivationalPhrase() {
        const phraseEl = document.getElementById('motivational-phrase');
        if (phraseEl) {
            phraseEl.textContent = this.getMotivationalPhrase('start');
        }
    }

    // Enhanced loading state
    showFunnyLoading(element) {
        if (!element) return;

        const message = this.getRandomLoadingMessage();
        element.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="spin" style="font-size: 3rem; margin-bottom: 20px;">🥨</div>
                <div style="font-size: 1.1rem; color: #8B5E3C;">${message}</div>
            </div>
        `;
    }
}

// Create global instance
window.funUtils = new FunUtils();

// Initialize fun stuff when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.funUtils.addWiggleToCards();
    window.funUtils.updateMotivationalPhrase();

    // Easter egg: Type "disco" during quiz to activate disco mode
    let secretCode = '';
    document.addEventListener('keypress', (e) => {
        secretCode += e.key;
        if (secretCode.includes('disco')) {
            window.funUtils.activateDiscoMode();
            secretCode = '';
        }
        // Reset after 2 seconds
        setTimeout(() => secretCode = '', 2000);
    });
});
