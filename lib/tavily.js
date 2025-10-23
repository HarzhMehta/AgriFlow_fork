/**
 * Tavily Search API utilities
 * Centralized functions for web search operations
 */

const TAVILY_API_URL = "https://api.tavily.com/search";

/**
 * Perform a Tavily web search
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results with answer and sources
 */
export async function tavilySearch(query, options = {}) {
  const apiKey = process.env.TAVILY_API_KEY;
  
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY not configured');
  }

  const response = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      max_results: options.max_results || 5,
      include_answer: options.include_answer ?? true,
      include_raw_content: options.include_raw_content ?? false,
      include_references: options.include_references ?? true,
      search_depth: options.search_depth || "basic",
      ...options
    }),
  });

  const data = await response.json();

  if (!data || !data.results || data.results.length === 0) {
    throw new Error('No search results found');
  }

  return data;
}

/**
 * Search for agriculture news
 * @param {string} query - News query
 * @param {string} userContext - Optional user-specific context for search enhancement
 * @returns {Promise<Array>} Array of news articles
 */
export async function searchAgricultureNews(query, userContext = '') {
  const enhancedQuery = `${query} agriculture farming news latest updates${userContext}`;
  
  const data = await tavilySearch(enhancedQuery, {
    max_results: 10,
    include_answer: true,
    include_raw_content: true,
    search_depth: "advanced",
  });

  return data.results.map(result => ({
    title: result.title || 'No title',
    url: result.url || '',
    content: result.content || '',
    score: result.score || 0,
    published_date: result.published_date || null
  }));
}

/**
 * General web search for chat feature
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search answer and references
 */
export async function searchWeb(query) {
  const data = await tavilySearch(query, {
    max_results: 5,
    include_answer: true,
    include_references: true,
  });

  const references = (data.results || []).map(result => ({
    title: result.title || 'No title',
    url: result.url || '',
    content: result.content || ''
  }));

  return {
    answer: data.answer || '',
    references
  };
}
