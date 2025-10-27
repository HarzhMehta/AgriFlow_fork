export const maxDuration = 60;
import { ChatOpenAI } from "@langchain/openai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { tool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import connectDB from "@/config/db";
import User from "@/models/User";

// Initialize Groq LLM using ChatOpenAI interface with custom base URL
// Using GROQ3 API key to avoid rate limits
const llm = new ChatOpenAI({
    modelName: "llama-3.3-70b-versatile",
    temperature: 0.3,
    configuration: {
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ3,
    },
    maxTokens: 2000,
});

// Tool 1: Get current time
const getCurrentTimeTool = tool(
    async () => {
        return `Current time: ${new Date().toISOString()}`;
    },
    {
        name: "get_current_time",
        description: "Get current date and time. Use this when you need to know the current date or time for context.",
        schema: z.object({}),
    }
);

// Tool 2: Tavily Web Search
const tavilySearchTool = new TavilySearchResults({
    maxResults: 5,
    apiKey: process.env.TAVILY_API_KEY,
    name: "ask_to_web",
    description: "Search the web for real-time information about agriculture, farming techniques, crop data, weather patterns, market prices, pest control, and any other farming-related information. Use this tool when you need current, up-to-date information.",
    // Note: We are relying on the default object output: [{ title, url, content }, ...]
});

// Simplified research function
async function performResearch(query, userContext, chatHistory) {
    // Step 1: Decide if we need web search
    const needsSearchPrompt = `You are a research planner. Does this agricultural query require searching the web for current, real-time information?

Query: "${query}"

User Context: ${userContext}

Answer ONLY: YES or NO`;

    const searchDecision = await llm.invoke([{ role: "user", content: needsSearchPrompt }]);
    const needsSearch = searchDecision.content.trim().toUpperCase().includes('YES');

    console.log(`[Research Agent] Needs web search: ${needsSearch}`);

    let searchResultsContext = '';
    let sources = [];
    
    // Step 2: Perform web search if needed
    if (needsSearch) {
        try {
            // TavilySearchResults returns an array of objects by default
            const results = await tavilySearchTool.invoke(query);
            console.log(`[Research Agent] Raw Tavily results:`, JSON.stringify(results, null, 2));
            
            // Handle different possible return formats from Tavily
            let processedResults = [];
            
            if (typeof results === 'string') {
                // Tavily returned a string - try to parse it
                try {
                    const parsed = JSON.parse(results);
                    processedResults = Array.isArray(parsed) ? parsed : [parsed];
                } catch {
                    console.log('[Research Agent] Tavily returned non-JSON string');
                    searchResultsContext = results;
                }
            } else if (Array.isArray(results)) {
                processedResults = results;
            } else if (typeof results === 'object' && results !== null) {
                // Single object result
                processedResults = [results];
            }
            
            console.log(`[Research Agent] Processed ${processedResults.length} search results`);
            
            if (processedResults.length > 0) {
                // Build context for the LLM
                searchResultsContext = processedResults.map((r, idx) => 
                    `[Source ${idx + 1}]\nTitle: ${r.title || r.name || 'Untitled'}\nURL: ${r.url || r.link || 'No URL'}\nContent: ${r.content || r.snippet || r.description || 'No content'}`
                ).join('\n\n');
                
                // Build structured sources list for final formatting
                sources = processedResults.map((r, idx) => ({
                    number: idx + 1,
                    title: r.title || r.name || 'Untitled',
                    url: r.url || r.link || '#'
                })).filter(s => s.url !== '#'); // Only include sources with valid URLs
                
                console.log(`[Research Agent] Extracted ${sources.length} valid sources with URLs`);
            } else {
                 console.log('[Research Agent] Web search returned no usable results.');
                 searchResultsContext = 'Web search was attempted but returned no usable results.';
            }
        } catch (error) {
            console.error('[Research Agent] Search error:', error);
            searchResultsContext = 'Web search encountered an error.';
        }
    }

    // Step 3: Generate comprehensive report
    const reportPrompt = `You are an expert Agricultural Research AI Assistant. Generate a comprehensive, well-structured research report.

${userContext}

${chatHistory.length > 0 ? `Recent Conversation:\n${chatHistory.map(m => `${m instanceof HumanMessage ? 'User' : 'Assistant'}: ${m.content.substring(0, 300)}`).join('\n')}\n` : ''}

${searchResultsContext ? `Web Research Results:\n${searchResultsContext}\n` : ''}

User Query: ${query}

Generate a comprehensive report based *only* on the provided context and user query. Follow this structure exactly:

## Title
[Create an informative title]

## Executive Summary
- Provide 3-5 concise bullet points highlighting key findings
- Tailor to the farmer's location, crops, and climate

## Key Findings
[Present the most important discoveries from your research]

## Detailed Analysis
### [Topic 1]
[In-depth analysis]
### [Topic 2]
[In-depth analysis]

## Practical Recommendations
- Actionable steps the farmer can take
- Consider local conditions and resources
- Include timelines if applicable

**IMPORTANT**: If you use information from the 'Web Research Results', you **MUST** cite it using the [Source X] tag (e.g., "The market price for corn is down [Source 1].").

Do NOT include a "Sources" section. It will be added automatically.
Format your response in clear Markdown. Be thorough, evidence-based, and farmer-focused.`;

    // Get the main body of the report from the LLM
    const report = await llm.invoke([{ role: "user", content: reportPrompt }]);
    let reportContent = report.content;

    // Step 4: Manually build and append the sources section
    let formattedSources = "## Sources\n";
    if (sources.length > 0) {
        formattedSources += sources.map(s => 
            `[${s.number}]: [${s.title}](${s.url})`
        ).join('\n');
    } else if (needsSearch) {
        formattedSources += "Web search was conducted, but no specific articles were cited.";
    } else {
        formattedSources += "This report was generated based on general knowledge and did not require external web searches.";
    }

    // Combine the report body and the guaranteed sources list
    const finalReportContent = reportContent + "\n\n" + formattedSources;
    
    return {
        content: finalReportContent,
        usedWebSearch: needsSearch,
        sourcesCount: sources.length,
        sources: sources // Return the structured sources for metadata
    };
}

// Main POST handler
export async function POST(req) {
    try {
        const { userId, query, conversationHistory = [] } = await req.json();

        if (!userId) {
            return Response.json({
                success: false,
                message: "User not authenticated",
            });
        }

        // Connect to database and get user profile
        await connectDB();
        const userProfile = await User.findById(userId);

        // Build detailed user context for personalized research
        let userContext = '';
        if (userProfile && userProfile.profileCompleted) {
            const crops = userProfile.cropsGrown && userProfile.cropsGrown.length > 0 
                ? userProfile.cropsGrown.join(', ') 
                : 'Not specified';
            
            const strategies = userProfile.farmingStrategy 
                ? (Array.isArray(userProfile.farmingStrategy) 
                    ? userProfile.farmingStrategy.join(', ') 
                    : userProfile.farmingStrategy)
                : 'Not specified';

            userContext = `[Farmer Profile]
Farmer Name: ${userProfile.username || 'Unknown'}
Location: ${userProfile.location || 'Not specified'}
Field Size: ${userProfile.fieldSize || 'Not specified'}
Climate: ${userProfile.climate || 'Not specified'}
Crops Currently Growing: ${crops}
Farming Strategies: ${strategies}
Soil Type: ${userProfile.soilType || 'Not specified'}
Irrigation Method: ${userProfile.irrigationMethod || 'Not specified'}

IMPORTANT: All research and recommendations must be tailored to this farmer's specific location, climate, crops, and field size. Consider local conditions, seasons, and available resources.`;
        } else {
            userContext = '[Farmer Profile]\nProfile not completed. Provide general agriculture advice applicable to various conditions.';
        }

        console.log(`[Research Agent] Starting research for query: "${query.substring(0, 100)}..."`);
        console.log(`[Research Agent] User: ${userProfile?.username || 'Unknown'}, Location: ${userProfile?.location || 'Unknown'}`);

        // Format conversation history as proper BaseMessage objects
        const chatHistory = conversationHistory.slice(-6).map(msg => {
            if (msg.role === 'user' || msg.role === 'human') {
                return new HumanMessage(msg.content);
            } else {
                return new AIMessage(msg.content);
            }
        });

        // Perform research
        const researchResult = await performResearch(query, userContext, chatHistory);

        console.log(`[Research Agent] Research completed. Used web search: ${researchResult.usedWebSearch}, Sources: ${researchResult.sourcesCount}`);

        // Format the final response
        const formattedResponse = {
            role: 'assistant',
            content: researchResult.content, // This now includes the guaranteed sources list
            timestamp: Date.now(),
            metadata: {
                researchMode: true,
                usedWebSearch: researchResult.usedWebSearch,
                sourcesCount: researchResult.sourcesCount,
                sources: researchResult.sources // Pass structured sources in metadata
            }
        };

        return Response.json({
            success: true,
            data: formattedResponse,
            metadata: {
                researchAgent: true,
                usedWebSearch: researchResult.usedWebSearch,
                sourcesCount: researchResult.sourcesCount
            }
        });

    } catch (error) {
        console.error('[Research Agent] Error:', error);
        return Response.json({ 
            success: false, 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
