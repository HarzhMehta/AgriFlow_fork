import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import User from "@/models/User";

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { query, language = 'English' } = await req.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get user profile for personalized news search
    let userProfile = null;
    let userContext = '';
    let enhancedSearchTerms = '';
    
    if (userId) {
      try {
        await connectDB();
        userProfile = await User.findById(userId);
        
        if (userProfile && userProfile.profileCompleted) {
          // Build user context for AI
          userContext = `\n\n[User Profile]
Farmer: ${userProfile.username || 'Unknown'}
Location: ${userProfile.location || 'Not specified'}
Field Size: ${userProfile.fieldSize || 'Not specified'}
Crops: ${userProfile.cropsGrown && userProfile.cropsGrown.length > 0 ? userProfile.cropsGrown.join(', ') : 'Not specified'}
Climate: ${userProfile.climate || 'Not specified'}

Note: Prioritize news relevant to this farmer's location, crops, and climate conditions.`;

          // Build enhanced search query with location and crops
          const locationTerm = userProfile.location ? ` ${userProfile.location}` : '';
          const cropsTerm = userProfile.cropsGrown && userProfile.cropsGrown.length > 0 
            ? ` ${userProfile.cropsGrown.join(' ')}` 
            : '';
          enhancedSearchTerms = `${locationTerm}${cropsTerm}`;
        }
      } catch (error) {
        console.log('Error fetching user profile:', error);
        // Continue without user context if there's an error
      }
    }

    // Step 1: Search the web using Tavily
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (!tavilyApiKey) {
      return NextResponse.json(
        { success: false, error: 'TAVILY_API_KEY not configured' },
        { status: 500 }
      );
    }

    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tavilyApiKey}`,
      },
      body: JSON.stringify({
        query: `${query} agriculture farming news latest updates${enhancedSearchTerms}`,
        max_results: 10,
        include_answer: true,
        include_raw_content: true,
        search_depth: "advanced",
      }),
    });

    
    const tavilyData = await tavilyResponse.json();
    console.log(tavilyData)

    if (!tavilyData || !tavilyData.results || tavilyData.results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No search results found' },
        { status: 404 }
      );
    }

    // Step 2: Extract content from search results
    const searchResults = tavilyData.results.map(result => ({
      title: result.title || 'No title',
      url: result.url || '',
      content: result.content || '',
      score: result.score || 0,
      published_date: result.published_date || null
    }));

    // Step 3: Create comprehensive context from search results
    const searchContext = searchResults
      .map((result, idx) => 
        `[Source ${idx + 1}] ${result.title}\nURL: ${result.url}\nPublished: ${result.published_date || 'N/A'}\nContent: ${result.content}\n`
      )
      .join('\n---\n');

    // Enhanced prompt using REAL search results
    const prompt = `You are an agricultural news summarizer. You have been provided with REAL search results from the internet about: "${query}"
${userContext}

Below are the actual articles and news content found on the web:

${searchContext}

Your task:
1. Analyze ALL the provided sources above
2. Create a comprehensive, well-organized summary in ${language} language
3. Include key points from multiple sources
4. Mention specific dates, statistics, and facts from the articles
5. Cite sources by number [Source 1], [Source 2], etc.
6. Focus on agricultural relevance and impact
${userProfile && userProfile.profileCompleted ? `7. **IMPORTANT**: Highlight information specifically relevant to the user's location (${userProfile.location}), crops (${userProfile.cropsGrown?.join(', ')}), and climate (${userProfile.climate})` : ''}

Format your response as follows:

# ${query}

## 📌 Key Highlights
[Main points from the articles in bullet format - cite sources]

## 📰 Recent Developments
[Latest news with dates and specific details - cite sources]

## 🌾 Agricultural Impact
[How this affects farming/agriculture - cite sources]

## 💡 Expert Insights & Analysis
[Expert opinions and interpretations from the articles - cite sources]

## 🔗 Sources
${searchResults.map((r, i) => `[${i + 1}] ${r.title}\n   ${r.url}\n   Published: ${r.published_date || 'N/A'}`).join('\n\n')}

---
**Language:** ${language}  
**Search Results:** ${searchResults.length} articles analyzed  
**Generated:** ${new Date().toLocaleString()}

Please provide an accurate summary based ONLY on the real articles provided above. Do not add information not present in the sources.`;

    // Generate response using Groq
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4000,
    });

    const summary = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      data: {
        query,
        language,
        summary,
        sources: searchResults,
        resultsCount: searchResults.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating news summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate news summary: ' + error.message },
      { status: 500 }
    );
  }
}
