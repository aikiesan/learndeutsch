// Shared Utility Functions for LearnDeutsch
// Consolidates duplicated code from multiple modules

const LearnDeutschUtils = {
    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - The array to shuffle
     * @returns {Array} - A new shuffled array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Format a timestamp as a relative time string (e.g., "2 hours ago")
     * @param {number} timestamp - Unix timestamp in milliseconds
     * @returns {string} - Human-readable relative time
     */
    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    },

    /**
     * Escape HTML special characters to prevent XSS attacks
     * @param {string} text - The text to escape
     * @returns {string} - HTML-escaped text
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        return text.replace(/[&<>"'`=/]/g, char => htmlEntities[char]);
    },

    /**
     * Escape text for use in JavaScript string literals (onclick handlers, etc.)
     * @param {string} text - The text to escape
     * @returns {string} - Escaped text safe for JS strings
     */
    escapeJs(text) {
        if (typeof text !== 'string') return text;
        return text
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    },

    /**
     * Create a debounced version of a function
     * @param {Function} func - The function to debounce
     * @param {number} wait - Milliseconds to wait before calling
     * @returns {Function} - Debounced function
     */
    debounce(func, wait = 150) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Calculate string similarity using Levenshtein distance
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @param {boolean} caseSensitive - Whether comparison is case-sensitive (default: false)
     * @returns {number} - Similarity ratio between 0 and 1
     */
    calculateSimilarity(str1, str2, caseSensitive = false) {
        const s1 = caseSensitive ? str1 : str1.toLowerCase();
        const s2 = caseSensitive ? str2 : str2.toLowerCase();

        if (s1 === s2) return 1;
        if (s1.length === 0 || s2.length === 0) return 0;

        const distance = this.levenshteinDistance(s1, s2);
        const maxLength = Math.max(s1.length, s2.length);
        return 1 - (distance / maxLength);
    },

    /**
     * Calculate Levenshtein distance between two strings
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} - Edit distance
     */
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
    },

    /**
     * Format study time from seconds to human-readable string
     * @param {number} totalSeconds - Total seconds
     * @returns {string} - Formatted time string (e.g., "2h 30m")
     */
    formatStudyTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    },

    /**
     * Time constants in milliseconds
     */
    TIME: {
        SECOND: 1000,
        MINUTE: 60000,
        HOUR: 3600000,
        DAY: 86400000,
        WEEK: 604800000
    },

    /**
     * Review intervals for spaced repetition (in milliseconds)
     */
    REVIEW_INTERVALS: [
        86400000,      // 1 day
        259200000,     // 3 days
        604800000,     // 7 days
        1209600000,    // 14 days
        2592000000     // 30 days
    ],

    /**
     * Show a custom alert dialog (replacement for window.alert)
     * @param {string} message - The message to display
     * @param {string} type - The type of alert: 'info', 'warning', 'error', 'success'
     * @returns {Promise} - Resolves when dialog is closed
     */
    showAlert(message, type = 'info') {
        return new Promise((resolve) => {
            const icons = {
                info: 'ℹ️',
                warning: '⚠️',
                error: '❌',
                success: '✅'
            };

            const overlay = document.createElement('div');
            overlay.className = 'dialog-overlay';
            overlay.innerHTML = `
                <div class="dialog-box dialog-${type}">
                    <div class="dialog-icon">${icons[type]}</div>
                    <div class="dialog-message">${this.escapeHtml(message)}</div>
                    <div class="dialog-buttons">
                        <button class="btn btn-primary dialog-ok">OK</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const closeDialog = () => {
                overlay.classList.add('dialog-closing');
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 200);
            };

            overlay.querySelector('.dialog-ok').addEventListener('click', closeDialog);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeDialog();
            });

            // Focus the OK button for keyboard accessibility
            overlay.querySelector('.dialog-ok').focus();
        });
    },

    /**
     * Show a custom confirm dialog (replacement for window.confirm)
     * @param {string} message - The message to display
     * @param {Object} options - Options for the dialog
     * @param {string} options.confirmText - Text for confirm button (default: 'Yes')
     * @param {string} options.cancelText - Text for cancel button (default: 'Cancel')
     * @param {boolean} options.danger - Show as danger/destructive action
     * @returns {Promise<boolean>} - Resolves true if confirmed, false if cancelled
     */
    showConfirm(message, options = {}) {
        return new Promise((resolve) => {
            const { confirmText = 'Yes', cancelText = 'Cancel', danger = false } = options;

            const overlay = document.createElement('div');
            overlay.className = 'dialog-overlay';
            overlay.innerHTML = `
                <div class="dialog-box ${danger ? 'dialog-danger' : ''}">
                    <div class="dialog-icon">${danger ? '⚠️' : '❓'}</div>
                    <div class="dialog-message">${this.escapeHtml(message)}</div>
                    <div class="dialog-buttons">
                        <button class="btn btn-secondary dialog-cancel">${this.escapeHtml(cancelText)}</button>
                        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} dialog-confirm">${this.escapeHtml(confirmText)}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const closeDialog = (result) => {
                overlay.classList.add('dialog-closing');
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 200);
            };

            overlay.querySelector('.dialog-confirm').addEventListener('click', () => closeDialog(true));
            overlay.querySelector('.dialog-cancel').addEventListener('click', () => closeDialog(false));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeDialog(false);
            });

            // Focus the cancel button by default for destructive actions
            overlay.querySelector(danger ? '.dialog-cancel' : '.dialog-confirm').focus();
        });
    }
};

// Make available globally
window.utils = LearnDeutschUtils;
