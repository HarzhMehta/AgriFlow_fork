import { NextResponse } from "next/server";
import { searchWeb } from "@/lib/tavily";

export const maxDuration = 30;

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing or invalid query" 
      });
    }

    const { answer, references } = await searchWeb(query);
    
    return NextResponse.json({ 
      success: true, 
      answer, 
      references 
    });

  } catch (error) {
    console.error("Web API Error", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}
