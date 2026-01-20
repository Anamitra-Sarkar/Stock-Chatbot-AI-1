// ✅ Per-device chat isolation using localStorage
const SESSION_ID_KEY = "stock_ai_session_id";

/**
 * Get or create a unique session ID for this device/browser
 * Uses crypto.randomUUID() for secure unique IDs
 * Persists in localStorage so chat history survives page refresh
 */
export function getSessionId(): string {
  // Check if we already have a session ID
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    // Generate a new UUID for this device
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Clear the current session ID (for testing or reset)
 */
export function clearSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY);
}
