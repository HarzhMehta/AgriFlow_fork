// Test script to verify research agent setup
import 'dotenv/config';

console.log('\n🔍 Research Agent Setup Verification\n');
console.log('=' .repeat(50));

// Check required environment variables
const required = {
    'GROQ3': process.env.GROQ3,
    'TAVILY_API_KEY': process.env.TAVILY_API_KEY,
    'MONGODB_URI': process.env.MONGODB_URI,
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL
};

let allPresent = true;

for (const [key, value] of Object.entries(required)) {
    const status = value ? '✅' : '❌';
    const display = value ? `${value.substring(0, 20)}...` : 'NOT SET';
    console.log(`${status} ${key.padEnd(25)} ${display}`);
    if (!value) allPresent = false;
}

console.log('=' .repeat(50));

if (allPresent) {
    console.log('\n✅ All required environment variables are set!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Enable "Deep Think" mode in chat');
    console.log('   3. Ask a research question about agriculture');
} else {
    console.log('\n❌ Missing required environment variables!');
    console.log('\n📝 Please add missing variables to .env.local:');
    console.log('   - Check .env.example for reference');
    console.log('   - GROQ3: Get from https://console.groq.com');
    console.log('   - TAVILY_API_KEY: Get from https://tavily.com');
}

console.log('\n');
