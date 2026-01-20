import { tavily } from "@tavily/core";

// Initialize Tavily client (only if API key is provided)
const tavilyClient = process.env.TAVILY_API_KEY 
  ? tavily({ apiKey: process.env.TAVILY_API_KEY })
  : null;

// ✅ INTELLIGENT SEARCH TRIGGER
// Determines if a user query is time-sensitive and needs real-time search
export function needsRealTimeSearch(userMessage: string): boolean {
  const timeSensitivePattern = /\b(today|now|latest|current|this week|recent|news|time|date|this month|tonight|yesterday|tomorrow|market today|earnings today|policy change|rate hike|rate cut|breaking)\b/i;
  return timeSensitivePattern.test(userMessage);
}

// ✅ GET CURRENT TIME CONTEXT
// Provides explicit time information to prevent hallucinations
export function getCurrentTimeContext(): string {
  const now = new Date();
  const utcTime = now.toUTCString();
  const localTime = now.toLocaleString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
  
  return `Current system time (UTC): ${utcTime}\nCurrent local time: ${localTime}`;
}

// ✅ TAVILY SEARCH (Baby Version)
// Performs real-time search with concise, factual results
export async function performTavilySearch(query: string): Promise<string | null> {
  if (!tavilyClient) {
    console.warn("Tavily API key not configured - skipping search");
    return null;
  }

  try {
    console.log(`[Tavily] Searching for: "${query}"`);
    
    const response = await tavilyClient.search(query, {
      searchDepth: "basic", // Low depth as requested
      maxResults: 5, // Top 3-5 results
      includeAnswer: false, // We want snippets, not pre-generated answer
      includeRawContent: false, // Concise mode
    });

    if (!response.results || response.results.length === 0) {
      console.log("[Tavily] No results found");
      return null;
    }

    // Format results as concise context
    const searchContext = response.results
      .slice(0, 5)
      .map((result, idx) => {
        return `${idx + 1}. ${result.content}`;
      })
      .join('\n\n');

    console.log(`[Tavily] Found ${response.results.length} results`);
    return searchContext;
  } catch (error) {
    console.error("[Tavily] Search error:", error);
    return null;
  }
}

// ✅ BUILD AUGMENTED SYSTEM PROMPT
// Injects search context and time information into the system prompt
export function buildAugmentedPrompt(
  basePrompt: string,
  searchContext: string | null,
  timeContext: string,
  needsSearch: boolean
): string {
  let augmentedPrompt = basePrompt;

  // Add time context if query is time-sensitive
  if (needsSearch) {
    augmentedPrompt += `\n\n--- CURRENT TIME CONTEXT ---\n${timeContext}\n`;
  }

  // Add search results if available
  if (searchContext) {
    augmentedPrompt += `\n--- REAL-TIME SEARCH CONTEXT ---\nUse the following up-to-date information to answer the user's question accurately:\n\n${searchContext}\n\nIMPORTANT: Base your answer on the search context above. Do not mention "Tavily" or "search" unless specifically asked. Present the information naturally as if you have direct knowledge.\n`;
  }

  return augmentedPrompt;
}
