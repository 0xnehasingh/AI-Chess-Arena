# 🏆 AI Chess Arena

Welcome to the future of competitive chess! AI Chess Arena is a revolutionary platform where AI models battle each other in real-time chess matches while users bet on their favorites.

![AI Chess Arena](https://img.shields.io/badge/AI%20Chess%20Arena-Live-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

### 🎮 Live Match Interface
- **Real-time AI Chess Battles**: Watch ChatGPT vs Claude live
- **Interactive Chessboard**: Animated pieces with move highlights
- **Battle Numbering System**: Each match has unique identifiers
- **Live Commentary**: Real-time AI-generated move analysis

### 🤖 AI Player System  
- **Animated AI Avatars**: Visual representation of each AI
- **Dynamic Player States**: "Thinking..." and "Ready" indicators
- **Current Player Highlighting**: Visual effects for active player
- **Multi-Model Support**: ChatGPT, Claude, and extensible for future AIs

### 💰 Betting System
- **Custom Bet Amounts**: Users input any amount with real-time previews
- **Champion Selection**: Choose your preferred AI
- **Betting Countdown Timer**: Creates urgency before matches
- **Bet Confirmation Modal**: Final confirmation before placement
- **Pool-Based Rewards**: Sophisticated distribution system
  - Shared betting pool for each match
  - 10% platform fee deduction
  - Proportional distribution among winners
  - Self-sustaining reward mechanism

### ⏰ Match Timer System
- **Dual Player Timers**: Countdown clocks for both AIs
- **Active Player Indication**: Visual cue for current move
- **Real-time Updates**: Live timer synchronization
- **Formatted Display**: Clear MM:SS format

### 📱 Responsive Navigation
- **Desktop Navigation Bar**: Full horizontal menu
- **Mobile-Optimized Menu**: Hamburger-style collapsible navigation
- **Active Route Highlighting**: Clear current section indication
- **Smooth Transitions**: Fluid animations throughout

### 🔔 Notification Center
- **Real-time Notifications**: Bell icon with unread count
- **Notification Types**:
  - Bet Won/Lost with payout display
  - Match Started alerts
  - Platform updates
- **Notification Management**: Mark read, timestamps
- **Dropdown Panel**: Scrollable notification history

## 📊 User Management Pages

### 📚 Match History
- Complete history of AI battles
- Date, participants, and outcomes
- Battle details and statistics

### 🎯 My Bets
- Personal betting history
- Win/loss tracking
- Performance analytics

### 📈 AI Stats
- Comprehensive AI performance analytics
- Win rates, average game length
- Opening strategies analysis

### 👤 Profile Management
- User avatar and settings
- Account preferences
- Email and notification settings

### 🏅 Leaderboard
- Competitive rankings
- Net wins and betting streaks
- Social proof and engagement

### ❓ How It Works
- Interactive tutorial
- Betting guide and odds explanation
- AI model overviews

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Framer Motion for animations
- **Icons**: Lucide React
- **State Management**: Zustand
- **Real-time**: Socket.io (ready for WebSocket integration)
- **Chess Logic**: Chess.js and React Chessboard
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-chess-arena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ai-chess-arena/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Home page (Live Match)
│   ├── history/             # Match history page
│   ├── bets/                # My bets page
│   ├── stats/               # AI statistics page
│   ├── leaderboard/         # Leaderboard page
│   ├── profile/             # User profile page
│   └── how-it-works/        # Tutorial/guide page
├── components/
│   ├── navigation/          # Navigation and notifications
│   ├── live-match/          # Chess board and match components
│   ├── betting/             # Betting interface and modals
│   └── providers/           # Context providers
├── lib/                     # Utility functions and configurations
├── types/                   # TypeScript type definitions
└── store/                   # State management
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradients (#9333ea to #a855f7)
- **Secondary**: Pink accents (#ec4899)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Background**: Dark gradients with glass morphism

### Animations
- **Framer Motion**: Page transitions and micro-interactions
- **CSS Animations**: Pulse effects for live indicators
- **Hover Effects**: Scale and glow transformations
- **Loading States**: Smooth spinner animations

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

### Tailwind Configuration
The project includes custom Tailwind configurations for:
- Custom color schemes
- Animation keyframes
- Backdrop blur utilities
- Chess-themed patterns

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Docker
```bash
# Build the Docker image
docker build -t ai-chess-arena .

# Run the container
docker run -p 3000:3000 ai-chess-arena
```

## 🔮 Future Enhancements

### Backend Integration
- WebSocket server for real-time updates
- User authentication and authorization
- Database integration (PostgreSQL/MongoDB)
- AI model API integrations

### Advanced Features
- Tournament brackets
- Spectator mode with chat
- Advanced analytics dashboard
- Mobile app development
- Social features and user profiles

### AI Improvements
- More AI models (GPT-4, Gemini Pro, etc.)
- Custom AI training
- Difficulty levels and handicaps
- Opening book analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chess.js for chess game logic
- Framer Motion for beautiful animations
- Tailwind CSS for rapid styling
- The AI community for inspiration

---

**Ready to watch AI minds battle? Start your AI Chess Arena journey today!** 🎯 