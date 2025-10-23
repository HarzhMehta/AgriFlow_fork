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
    const { userId: requestUserId } = getAuth(req);
    const { location, userId } = await req.json();

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location is required' },
        { status: 400 }
      );
    }

    // Get user profile for personalized weather advice
    let userProfile = null;
    let userContext = '';
    
    const userIdToFetch = userId || requestUserId;
    
    if (userIdToFetch) {
      try {
        await connectDB();
        userProfile = await User.findById(userIdToFetch);
        
        if (userProfile && userProfile.profileCompleted) {
          userContext = `\n\n[User Profile]
Farmer: ${userProfile.username || 'Unknown'}
Location: ${userProfile.location || location}
Field Size: ${userProfile.fieldSize || 'Not specified'}
Crops: ${userProfile.cropsGrown && userProfile.cropsGrown.length > 0 ? userProfile.cropsGrown.join(', ') : 'Not specified'}
Climate: ${userProfile.climate || 'Not specified'}

Note: Tailor weather advice specifically for these crops and farming conditions.`;
        }
      } catch (error) {
        console.log('Error fetching user profile:', error);
        // Continue without user context if there's an error
      }
    }

    // Step 1: Get real weather data using Tavily search
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (!tavilyApiKey) {
      return NextResponse.json(
        { success: false, error: 'TAVILY_API_KEY not configured' },
        { status: 500 }
      );
    }

    const currentDate = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tavilyApiKey}`,
      },
      body: JSON.stringify({
        query: `${location} weather forecast today ${currentDate} temperature humidity 7 day forecast`,
        max_results: 8,
        include_answer: true,
        include_raw_content: true,
        search_depth: "advanced",
      }),
    });

    const tavilyData = await tavilyResponse.json();
    // console.log(tavilyData);
    if (!tavilyData || !tavilyData.results || tavilyData.results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No weather data found for this location' },
        { status: 404 }
      );
    }

    // Step 2: Extract weather information from search results
    const weatherResults = tavilyData.results.map(result => ({
      title: result.title || 'No title',
      url: result.url || '',
      content: result.content || '',
      score: result.score || 0
    }));

    // Step 3: Create comprehensive context from weather search results
    const weatherContext = weatherResults
      .map((result, idx) => 
        `[Source ${idx + 1}] ${result.title}\nURL: ${result.url}\nWeather Info: ${result.content}\n`
      )
      .join('\n---\n');

    // Enhanced prompt for weather information using REAL data
    const prompt = `You are an agricultural weather assistant. You have been provided with REAL weather data from the internet for: "${location}"
${userContext}

Below is the actual weather information found on the web:

${weatherContext}

Your task:
1. Analyze ALL the provided weather sources above
2. Extract current weather conditions (temperature, humidity, precipitation, wind)
3. Compile a 7-day weather forecast from the sources
4. Create agricultural advisory based on REAL weather data
${userProfile && userProfile.cropsGrown && userProfile.cropsGrown.length > 0 ? `5. **IMPORTANT**: Provide specific advice for these crops: ${userProfile.cropsGrown.join(', ')}` : '5. Include general farming advice'}
6. Mention any weather alerts or warnings mentioned in sources
7. Suggest farming activities based on the ACTUAL forecast
8. Cite sources using [Source 1], [Source 2], etc.

Format your response as:

# 🌤️ Weather Report: ${location}
**Date:** ${new Date().toLocaleDateString()}

## Current Conditions
- **Temperature:** [Extract from sources]
- **Conditions:** [Extract from sources]
- **Humidity:** [Extract from sources]
- **Wind Speed:** [Extract from sources]
- **Precipitation:** [Extract from sources]

## 7-Day Forecast
| Day | Temp (°C) | Conditions | Rain |
|-----|-----------|------------|------|
[Extract 7-day forecast from sources - cite sources]

## 🌾 Agricultural Advisory
### ✅ Recommended Activities:
- [Based on REAL weather data - cite sources]
- [Activity 2 - cite sources]
- [Activity 3 - cite sources]

### ⚠️ Precautions:
- [Warning based on actual forecast - cite sources]
- [Warning 2 if any - cite sources]

### ⏰ Best Time for:
- **💧 Irrigation:** [Based on humidity/rain forecast - cite sources]
- **🌾 Spraying:** [Based on wind/rain forecast - cite sources]
- **🚜 Harvesting:** [Based on weather conditions - cite sources]

## 🌍 Seasonal Context
[Information from sources about current season]

## 🚨 Weather Alerts
[Any warnings mentioned in sources - cite sources]

## 🔗 Sources
${weatherResults.map((r, i) => `[${i + 1}] ${r.title}\n   ${r.url}`).join('\n\n')}

---
**Note:** Based on real-time weather data from multiple sources.

Please provide accurate weather information based ONLY on the sources provided above. Cite sources for all weather data and recommendations.`;

    // Generate response using Groq
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4000,
    });

    const weatherInfo = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      data: {
        location,
        weatherInfo,
        sources: weatherResults,
        resultsCount: weatherResults.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating weather info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate weather info: ' + error.message },
      { status: 500 }
    );
  }
}
