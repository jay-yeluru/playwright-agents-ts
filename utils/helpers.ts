// Utility functions for string processing, mathematical functions, or standard non-test-specific tools.

/**
 * Format string by trimming whitespace
 */
export function formatTodoText(text: string): string {
  return text.trim();
}

/**
 * Generate a random alphanumeric string of a given length
 */
export function generateRandomString(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generate a unique todo item string with a timestamp to prevent test collisions
 */
export function generateUniqueTodo(prefix: string = 'Todo Task'): string {
  return `${prefix} - ${Date.now()}`;
}

/**
 * Delay execution for a specified number of milliseconds
 * Note: Use sparingly, prefer Playwright's built-in `waitFor` methods when possible.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
