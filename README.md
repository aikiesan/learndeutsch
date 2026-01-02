# LearnDeutsch 🇩🇪

An interactive, gamified German learning platform built with vanilla JavaScript. Learn German from A1 to C2 with vocabulary flashcards, writing exercises, and a comprehensive progression system.

![LearnDeutsch Platform](https://img.shields.io/badge/Language-German-red?style=for-the-badge)
![Built with](https://img.shields.io/badge/Built%20with-Vanilla%20JS-yellow?style=for-the-badge)
![CEFR Levels](https://img.shields.io/badge/CEFR-A1--C2-blue?style=for-the-badge)

## 🌟 Features

### 📚 **Vocabulary Learning**
- **85+ A1 vocabulary words** across 5 categories (Greetings, Numbers, Colors, Family, Basic Verbs)
- **Spaced repetition system** with intelligent review scheduling
- **Interactive flashcards** with example sentences
- **Mastery tracking** with 5-level progression system
- **Category-based filtering** for focused learning

### ✏️ **Writing Practice**
- **Sentence Construction**: Drag-and-drop word building exercises
- **Translation Practice**: English to German translation with hints
- **Free Writing**: Guided writing prompts with word count tracking
- **Real-time feedback** and correct answer explanations

### 🎮 **Gamification System**
- **XP and Leveling**: Earn XP for exercises (5-20 XP each) with progressive leveling
- **Daily Streaks**: Track consecutive study days with bonus rewards
- **Achievement Badges**: 20+ achievements with Bronze/Silver/Gold/Platinum tiers
- **Daily Challenges**: Rotating challenges for bonus XP
- **Progress Tracking**: Detailed statistics and visual progress indicators

### 📊 **Progress Dashboard**
- **Study Calendar**: Visual heatmap of daily activity
- **Statistics Overview**: Study time, accuracy rates, words learned
- **Achievement Gallery**: Showcase of earned badges
- **Vocabulary Breakdown**: Category-wise progress tracking
- **Export Functionality**: Backup your progress data

### ⚙️ **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **German-themed UI**: Black, red, and gold color scheme
- **LocalStorage Persistence**: No backend required, data saved locally
- **Dark Mode Support**: Toggle between light and dark themes
- **Keyboard Shortcuts**: Quick navigation (1-5 keys for sections)

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (recommended) or direct file access

### Installation

1. **Clone or download** this repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/LearnDeutsch.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd LearnDeutsch
   ```

3. **Serve the files** using a local web server:

   **Option A: Using Python (if installed)**
   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option B: Using Node.js (if installed)**
   ```bash
   npx http-server -p 8000
   ```

   **Option C: Using VS Code Live Server**
   - Install the "Live Server" extension
   - Right-click on `index.html` and select "Open with Live Server"

4. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

### Alternative: Direct File Access
If you prefer not to use a local server, you can open `index.html` directly in your browser. However, some features may be limited due to browser security restrictions.

## 🎯 How to Use

### Getting Started
1. **Choose Your Level**: Start with A1 if you're a beginner
2. **Learn Vocabulary**: Begin with flashcard exercises
3. **Practice Writing**: Try sentence construction and translation
4. **Track Progress**: Monitor your advancement in the Progress section
5. **Earn Achievements**: Complete challenges to unlock badges

### Study Workflow
1. **Daily Vocabulary Review**: Study 10-20 flashcards daily
2. **Writing Practice**: Complete 2-3 writing exercises
3. **Progress Check**: Review your statistics weekly
4. **Streak Maintenance**: Study daily to build your streak

### Tips for Effective Learning
- **Consistency**: Study a little each day rather than long sessions
- **Variety**: Mix flashcards with writing exercises
- **Review**: Regularly review words you've learned
- **Goals**: Set realistic daily goals (start with 5-10 words)

## 📁 Project Structure

```
LearnDeutsch/
├── index.html                 # Main HTML file
├── css/
│   ├── main.css              # Core styles and layout
│   ├── components.css        # UI component styles
│   └── themes.css            # Color themes and variables
├── js/
│   ├── app.js               # Main application controller
│   ├── storage.js           # LocalStorage management
│   ├── gamification.js      # XP, achievements, streaks
│   ├── vocabulary.js        # Flashcard and vocabulary system
│   ├── exercises.js         # Writing and practice exercises
│   └── progress.js          # Statistics and progress tracking
├── data/
│   └── vocabulary/
│       └── a1.json          # A1 level vocabulary database
├── assets/
│   ├── images/              # UI images and icons
│   └── icons/               # Achievement badge icons
└── README.md                # This file
```

## 🔧 Technical Details

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Storage**: LocalStorage API for data persistence
- **Styling**: CSS Grid, Flexbox, CSS Custom Properties
- **Architecture**: Modular JavaScript classes with separation of concerns

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance Features
- **Lazy Loading**: Images and content loaded as needed
- **Efficient DOM**: Minimal DOM manipulations
- **Local Storage**: Fast data access without server calls
- **Responsive Images**: Optimized for different screen sizes

## 📈 Learning Progression

### A1 Level (Current)
- **Vocabulary**: 85 essential words
- **Topics**: Greetings, Numbers, Colors, Family, Basic Verbs
- **Skills**: Basic sentence construction, simple translations
- **Estimated Time**: 8-12 hours

### Planned Expansions
- **A2 Level**: 200+ words, past tense, daily activities
- **B1 Level**: 300+ words, complex sentences, opinions
- **Grammar Modules**: Verb conjugations, cases, sentence structure
- **Listening Practice**: Audio exercises and pronunciation
- **Social Features**: Leaderboards and study groups

## 🎮 Gamification Details

### XP System
- **Flashcard**: 5 XP per card
- **Multiple Choice**: 8 XP per exercise
- **Typing**: 12 XP per exercise
- **Writing**: 15 XP per exercise
- **Streak Bonuses**: 50-1000 XP for daily streaks

### Achievement Examples
- 🎯 **First Steps**: Complete first lesson (10 XP)
- 📚 **Vocabulary Master**: Learn 100 words (200 XP)
- 🔥 **Week Warrior**: 7-day study streak (75 XP)
- 👑 **Dedication Master**: 100-day streak (1000 XP)

### Level Progression
- **Level 1-10**: 150-1500 XP (Beginner phase)
- **Level 11-25**: 1650-5625 XP (Intermediate phase)
- **Level 26+**: 5850+ XP (Advanced phase)

## 🚀 Deployment

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to project directory
3. Run `vercel` and follow prompts
4. Your app will be live at the provided URL

### Other Hosting Options
- **Netlify**: Drag and drop the project folder
- **GitHub Pages**: Push to GitHub and enable Pages
- **Firebase Hosting**: Use Firebase CLI for deployment

### Build Optimization
No build process required! The app uses vanilla JavaScript and can be deployed directly.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Adding Content
- **Vocabulary**: Add words to existing categories or create new ones
- **Exercises**: Create new writing prompts or exercise types
- **Translations**: Add support for other interface languages

### Code Improvements
- **Performance**: Optimize loading and rendering
- **Features**: Add new learning modules or gamification elements
- **Accessibility**: Improve keyboard navigation and screen reader support

### Getting Started with Development
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request with clear description

### Code Style
- Use ES6+ features where appropriate
- Follow existing naming conventions
- Comment complex logic
- Maintain mobile responsiveness

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **German vocabulary** sourced from open educational resources
- **Design inspiration** from modern language learning platforms
- **Spaced repetition** algorithm based on proven memory research
- **CEFR framework** for structured language progression

## 📞 Support

Having issues? Here's how to get help:

1. **Check the browser console** for error messages
2. **Verify local server** is running correctly
3. **Clear browser cache** and restart
4. **Disable browser extensions** that might interfere
5. **Try a different browser** to isolate issues

### Common Issues
- **Blank page**: Ensure you're using a local server
- **Data not saving**: Check if LocalStorage is enabled
- **Images not loading**: Verify file paths are correct
- **Exercises not working**: Ensure JavaScript is enabled

## 🔮 Future Roadmap

### Phase 2 (Next Updates)
- [ ] Audio pronunciation with Text-to-Speech
- [ ] A2 vocabulary expansion (200+ words)
- [ ] Grammar learning modules
- [ ] Multiple choice vocabulary exercises

### Phase 3 (Medium Term)
- [ ] B1/B2 level content
- [ ] Listening comprehension exercises
- [ ] Adaptive learning algorithms
- [ ] Social features and leaderboards

### Phase 4 (Long Term)
- [ ] Backend integration and user accounts
- [ ] Mobile app (React Native/Flutter)
- [ ] AI-powered conversation practice
- [ ] Professional certification tracking

---

**Start your German learning journey today with LearnDeutsch!** 🎓

*Viel Erfolg beim Deutschlernen!* (Good luck learning German!)