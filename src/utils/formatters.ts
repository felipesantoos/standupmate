/**
 * Utility Functions - Formatters
 * 
 * Pure functions for formatting data.
 * No side effects, easily testable.
 */

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return formatDate(date);
}

/**
 * Parse time string to minutes
 * Examples: "2h 30min" → 150, "1h" → 60, "45min" → 45
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || timeStr.trim() === '') return 0;

  let total = 0;
  
  // Parse hours
  const hoursMatch = timeStr.match(/(\d+)\s*h/);
  if (hoursMatch) {
    total += parseInt(hoursMatch[1]) * 60;
  }

  // Parse minutes
  const minutesMatch = timeStr.match(/(\d+)\s*min/);
  if (minutesMatch) {
    total += parseInt(minutesMatch[1]);
  }

  return total;
}

/**
 * Format minutes to time string
 * Examples: 150 → "2h 30min", 60 → "1h", 45 → "45min"
 */
export function formatMinutesToTime(minutes: number): string {
  if (minutes === 0) return '0min';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

