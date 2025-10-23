import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { generateChatCompletion } from "@/lib/groq";
import { searchAgricultureNews } from "@/lib/tavily";
import { getUserProfile, buildUserContext, getSearchEnhancementTerms } from "@/lib/user";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get user profile for personalized news search
    const userProfile = await getUserProfile(userId);
    const userContext = buildUserContext(userProfile);
    const enhancedSearchTerms = getSearchEnhancementTerms(userProfile);

    // Search the web using Tavily
    const searchResults = await searchAgricultureNews(query, enhancedSearchTerms);

    // Create context from search results
    const searchContext = searchResults
      .map((result, idx) => 
        `[Source ${idx + 1}] ${result.title}\nURL: ${result.url}\nPublished: ${result.published_date || 'N/A'}\nContent: ${result.content}\n`
      )
      .join('\n---\n');

    // Build prompt for AI
    const prompt = `You are an agricultural news summarizer. You have been provided with REAL search results from the internet about: "${query}"
${userContext}

Below are the actual articles and news content found on the web:

${searchContext}

Your task:
1. Analyze ALL the provided sources above
2. Create a comprehensive, well-organized summary
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
**Search Results:** ${searchResults.length} articles analyzed  
**Generated:** ${new Date().toLocaleString()}

Please provide an accurate summary based ONLY on the real articles provided above. Do not add information not present in the sources.`;

    // Generate response using Groq
    const summary = await generateChatCompletion(prompt, {
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4000,
    });

    return NextResponse.json({
      success: true,
      data: {
        query,
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
