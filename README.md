# AgriFlow

AI-powered agricultural assistant with real-time weather, news, and intelligent farming advice.

## Features

- **AI Chat** - Agriculture-focused conversational AI (Groq Llama 3.3 70B)
- **Live Weather** - Real-time weather forecasts with location support
- **Ag News** - Personalized agricultural news summaries
- **Web Search** - Integrated Tavily search for up-to-date information
- **Multi-language** - Google Translate integration (9 languages)
- **Dark/Light Mode** - Customizable themes
- **User Profiles** - Personalized advice based on crops and location

## Quick Start

```bash
# Clone and install
git clone https://github.com/prathamtomar99/AgriFlow.git
cd AgriFlow
npm install

# Configure environment
cp .env.example .env.local  # Add your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```bash
# Required
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
MONGODB_URI=your_mongodb_uri
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Groq (Llama 3.3 70B)
- **Search**: Tavily API
- **Auth**: Clerk
- **Database**: MongoDB + Mongoose
- **Styling**: Tailwind CSS

## Project Structure

```
app/
├── api/              # API routes (chat, news, profile, weather)
├── page.jsx          # Main chat interface
├── news/             # News page
├── profile/          # User profile
└── layout.js         # Root layout
components/           # React components
├── Sidebar.jsx       # Chat history
├── PromptBox.jsx     # Input area
├── Message.jsx       # Chat messages
├── Weather.jsx       # Weather widget
└── ThemeToggle.jsx   # Theme/language/weather controls
lib/                  # Utilities (groq, tavily, user)
models/               # MongoDB schemas (User, Chat)
```

## Key Features

### Smart Agriculture Chat
- Agriculture-only responses
- File upload with OCR
- Web search integration
- Conversation history

### Weather Integration
- Real-time forecasts
- Location-based data
- 3-day predictions
- Current conditions

### Multi-language Support
- Google Translate widget
- 9 languages supported
- Seamless translation
- Persistent selection

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Debugging utilities
node scripts/check-setup.js              # Verify setup
node scripts/check-profile.js USER_ID    # Check user profile
node scripts/diagnose-user.js USER_ID    # Diagnose issues
```

## Deployment

**Vercel** (Recommended):
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

## License

MIT License

## Contributing

Contributions welcome! Fork, create a feature branch, and submit a PR.

---

Built with ❤️ for farmers | [GitHub](https://github.com/prathamtomar99/AgriFlow)
