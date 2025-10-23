import OpenAI from "openai";

// Singleton Groq client instance
let groqClient = null;

/**
 * Get or create Groq client instance
 * @returns {OpenAI} Groq client configured with API key
 */
export function getGroqClient() {
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return groqClient;
}

/**
 * Generate chat completion using Groq
 * @param {string|Array} messages - Single prompt string or array of message objects
 * @param {Object} options - Optional configuration
 * @returns {Promise<string>} Generated response text
 */
export async function generateChatCompletion(messages, options = {}) {
  const client = getGroqClient();
  
  // Convert string to messages array format
  const formattedMessages = typeof messages === 'string' 
    ? [{ role: "user", content: messages }]
    : messages;

  const completion = await client.chat.completions.create({
    messages: formattedMessages,
    model: options.model || "llama-3.3-70b-versatile",
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens || 4000,
    ...options
  });

  return completion.choices[0].message.content;
}
