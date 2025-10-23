# Setup Guide

Complete setup instructions for DeepSeek Chat App.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- MongoDB account ([Sign up](https://mongodb.com/atlas))
- API keys (see below)

## Step 1: Clone & Install

```bash
git clone https://github.com/prathamtomar99/DeepSeek-Clone.git
cd deepseek
npm install
```

**If errors occur:**
```bash
npm install --legacy-peer-deps
```

**Manual install (if needed):**
```bash
npm install @langchain/community @langchain/core langchain tesseract.js @google/generative-ai
npm install axios mongoose openai svix prismjs react-hot-toast react-markdown
```

## Step 2: Get API Keys

### Clerk (Authentication) - Required

1. Go to [clerk.com](https://clerk.com) → Sign up
2. Create application → **API Keys**
3. Copy these keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)
4. **Webhooks** → Add Endpoint → URL: `https://your-domain.com/api/clerk`
5. Subscribe to: `user.created`, `user.updated`
6. Copy `SIGNING_SECRET` (starts with `whsec_`)

### MongoDB (Database) - Required

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Sign up
2. Create free cluster → **Connect** → **Connect your application**
3. Copy connection string
4. Replace `<password>` with your database password

### Groq (AI Chat) - Required

1. Go to [console.groq.com](https://console.groq.com) → Sign up
2. **API Keys** → Create new key
3. Copy key (starts with `gsk_`)

### Google Gemini (Image Processing) - Optional

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. **Create API Key**
3. Copy key (starts with `AIzaSy`)

*Without this, images uploads work but won't extract text*

## Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
SIGNING_SECRET=whsec_your_secret_here

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/deepseek

# Groq AI
GROQ_API_KEY=gsk_your_key_here

# Optional: Gemini Vision
GOOGLE_API_KEY=AIzaSy_your_key_here
```

## Step 4: Verify Setup

```bash
npm run verify
```

This checks:
- ✅ Node.js version (18+)
- ✅ Dependencies installed
- ✅ Environment variables configured
- ✅ Project structure

## Step 5: Run

```bash
npm run dev
```

Open **http://localhost:3000**

## Troubleshooting

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Peer dependency conflicts
```bash
npm install --legacy-peer-deps
```

### Permission errors (macOS/Linux)
```bash
sudo chown -R $(whoami) ~/.npm
```

### Clerk auth not working
- Clear browser cache
- Check both public + secret keys are correct
- Verify keys match your Clerk application

### MongoDB connection failed
- Whitelist your IP: MongoDB Atlas → Network Access → Add IP (0.0.0.0/0 for all)
- Check connection string format
- Verify database user has read/write permissions

### Gemini Vision not working
- API key must be active
- Billing enabled (free tier is fine)
- If missing, uploads still work with placeholder text

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
# Or use different port
npm run dev -- -p 3001
```

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Add all environment variables in project settings
4. Deploy!
5. **Important:** Update Clerk webhook URL to your Vercel domain

### Other Platforms

- **Netlify**: Add env vars → Deploy
- **Railway**: Import repo → Add env vars → Deploy
- **Self-hosted**: `npm run build && npm start` with PM2 or Docker

## Testing Checklist

After setup, test these:

- [ ] Sign up with Clerk
- [ ] Create new chat
- [ ] Send message → Get AI response
- [ ] Upload TXT file → Check extraction
- [ ] Upload image → Check Gemini analysis (if enabled)
- [ ] Say "previous message" → Check context works
- [ ] Reload page → Check chat persists

## Need Help?

- **Installation issues**: Check "Troubleshooting" section above
- **API errors**: Verify all keys in `.env`
- **Feature questions**: See [README.md](README.md)
- **Want to contribute**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Found a bug**: Create an issue on GitHub

---

**Setup complete?** Start coding! 🚀
