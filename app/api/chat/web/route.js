import { NextResponse } from "next/server";
export const maxDuration = 30;

export async function POST(req) {
    try {
        const { query } = await req.json();
        const apiKey = process.env.TAVILY_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ success: false, error: "Missing TAVILY_API_KEY" });
        }
        if (!query || query.trim().length < 2) {
            return NextResponse.json({ success: false, error: "Missing or invalid query" });
        }
        // Tavily API docs: https://docs.tavily.com/reference/search
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                query,
                max_results: 5,
                include_answer: true,
                include_references: true,
            }),
        });
        const data = await response.json();
        
        // Log full response to see structure
        // console.log("Full Tavily Response:", JSON.stringify(data, null, 2));
        
        if (!data || !data.answer) {
            return NextResponse.json({ success: false, error: "No results from Tavily" });
        }
        
        // Extract references from results array (Tavily returns sources in 'results')
        const references = (data.results || []).map(result => ({
            title: result.title || 'No title',
            url: result.url || '',
            content: result.content || ''
        }));
        
        // console.log("Data from WEB is:", data.answer);
        // console.log("References extracted:", references);
        
        return NextResponse.json({ success: true, answer: data.answer, references });
    } catch (error) {
        console.log("Web API Error",error)
        return NextResponse.json({ success: false, error: error.message });
    }
}
