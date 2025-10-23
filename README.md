# AgriFlow

AI-powered agricultural assistant built with Next.js, featuring real-time news, weather forecasts, and intelligent farming advice.

## 🌾 Features

- **AI Chat Assistant**: Agriculture-focused conversational AI using Groq's Llama 3.3 70B
- **Real-time News**: Agricultural news summaries with Tavily search integration
- **User Profiles**: Personalized advice based on crops, location, and climate
- **Web Search**: Integrated Tavily search for up-to-date information
- **Dark/Light Mode**: Theme toggle for better user experience

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.6 with App Router
- **AI Model**: Groq (Llama 3.3 70B Versatile)
- **Search API**: Tavily
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Language**: JavaScript/JSX

## 📁 Project Structure

```
AgriFlow/
├── app/
│   ├── api/                  # API routes
│   │   ├── chat/            # Chat-related endpoints
│   │   │   ├── ai/          # AI chat completion
│   │   │   ├── web/         # Web search
│   │   │   ├── create/      # Create chat
│   │   │   ├── get/         # Get chats
│   │   │   ├── delete/      # Delete chat
│   │   │   ├── rename/      # Rename chat
│   │   │   └── upload/      # File upload
│   │   ├── news/            # News summary API
│   │   ├── user/profile/    # User profile management
│   │   ├── clerk/           # Clerk webhook
│   │   └── debug/profile/   # Debug endpoint
│   ├── (pages)/             # Next.js pages
│   │   ├── page.jsx         # Home/Chat page
│   │   ├── news/            # News page
│   │   ├── profile/         # Profile edit page
│   │   ├── onboarding/      # User onboarding
│   │   ├── debug/           # Debug page
│   │   └── sign-in/sign-up/ # Auth pages
│   ├── layout.js            # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ChatLabel.jsx
│   ├── Message.jsx
│   ├── PromptBox.jsx
│   ├── Sidebar.jsx
│   └── ThemeToggle.jsx
├── lib/                     # Utility functions
│   ├── groq.js             # Groq client utilities
│   ├── tavily.js           # Tavily search utilities
│   └── user.js             # User utilities
├── models/                  # Database models
│   ├── User.js
│   └── Chat.js
├── config/
│   └── db.js               # Database connection
├── context/
│   └── AppContext.jsx      # React context
├── scripts/                 # Utility scripts
│   ├── check-profile.js
│   ├── check-setup.js
│   ├── check-status.js
│   └── diagnose-user.js
├── assets/                  # Static assets
├── public/                  # Public files
└── middleware.ts           # Clerk middleware

```

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/prathamtomar99/AgriFlow.git
cd AgriFlow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```bash
# Groq API
GROQ_API_KEY=your_groq_api_key

# Tavily Search API
TAVILY_API_KEY=your_tavily_api_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# MongoDB
MONGODB_URI=your_mongodb_connection_string
```

4. **Run development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 API Documentation

### Utility Functions

#### `lib/groq.js`
- `getGroqClient()` - Get singleton Groq client instance
- `generateChatCompletion(messages, options)` - Generate AI responses

#### `lib/tavily.js`
- `tavilySearch(query, options)` - General web search
- `searchAgricultureNews(query, userContext)` - Search agriculture news
- `searchWeb(query)` - Quick web search for chat

#### `lib/user.js`
- `getUserProfile(userId)` - Fetch user from database
- `buildUserContext(userProfile)` - Build AI context string
- `getSearchEnhancementTerms(userProfile)` - Get search terms from profile

### API Routes

#### Chat AI (`/api/chat/ai`)
- **Method**: POST
- **Body**: `{ chatId, prompt, filesMeta, searchSelected, deepThinkSelected }`
- **Response**: AI-generated agricultural advice

#### News (`/api/news`)
- **Method**: POST
- **Body**: `{ query, language }`
- **Response**: News summary with sources

#### Web Search (`/api/chat/web`)
- **Method**: POST
- **Body**: `{ query }`
- **Response**: Search results with references

## 🛠️ Development Scripts

Located in `scripts/` directory:

```bash
# Check user profile
node scripts/check-profile.js USER_ID

# Check setup status
node scripts/check-setup.js

# Check system status
node scripts/check-status.js

# Diagnose user issues
node scripts/diagnose-user.js USER_ID
```

## 🎨 Code Architecture

### Separation of Concerns

1. **API Routes** (`app/api/`): Handle HTTP requests
2. **Utilities** (`lib/`): Reusable functions (Groq, Tavily, User)
3. **Components** (`components/`): React UI components
4. **Models** (`models/`): Database schemas
5. **Scripts** (`scripts/`): CLI utilities for debugging

### Key Design Patterns

- **Singleton Pattern**: Groq client instance
- **Factory Pattern**: Utility functions for search/AI
- **Context API**: Global state management
- **Middleware**: Authentication guards

## 🌟 Features in Detail

### 1. Smart Agriculture Chat
- Agriculture-only validation
- Context-aware responses
- File upload support (OCR)
- Web search integration
- Conversation history

### 2. News Summary
- Real-time Tavily search (10 sources)
- Multi-language support (12 languages)
- Personalized based on user crops/location
- Source citations with links

### 3. User Personalization
- Profile with crops, location, climate
- Personalized search results
- Tailored farming advice
- Profile edit functionality

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for AI | Yes |
| `TAVILY_API_KEY` | Tavily API key for search | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `CLERK_SECRET_KEY` | Clerk authentication key | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes |

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🐛 Troubleshooting

### API Key Issues
```bash
# Verify environment variables
node scripts/check-setup.js
```

### User Profile Issues
```bash
# Check user profile status
node scripts/check-profile.js USER_ID
```

### Database Connection
```bash
# Diagnose user and database
node scripts/diagnose-user.js USER_ID
```

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- **Groq** for ultra-fast AI inference
- **Tavily** for real-time web search
- **Clerk** for authentication
- **Next.js** team for the amazing framework

## 📧 Contact

- GitHub: [@prathamtomar99](https://github.com/prathamtomar99)
- Repository: [AgriFlow](https://github.com/prathamtomar99/AgriFlow)

---

**Built with ❤️ for farmers and agriculture enthusiasts**
