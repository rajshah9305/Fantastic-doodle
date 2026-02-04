export { ONE_YEAR_MS } from "@shared/const";

// Session management for anonymous users
export const SESSION_STORAGE_KEY = "app_session_id";

// Generate a simple session ID
export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}
