/**
 * Utility functions for managing weekly leaderboard resets
 */

/**
 * Get the start of the current week (Sunday)
 */
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

/**
 * Get the end of the current week (Saturday 23:59:59)
 */
export const getWeekEnd = (date = new Date()) => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
};

/**
 * Get the time remaining until end of week
 * Returns an object with days, hours, minutes, and seconds
 */
export const getTimeUntilWeekEnd = (date = new Date()) => {
  const weekEnd = getWeekEnd(date);
  const now = new Date(date);
  const diff = weekEnd - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total: diff };
};

/**
 * Format time remaining as a readable string
 */
export const formatTimeRemaining = (timeObj) => {
  const { days, hours, minutes, seconds } = timeObj;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Check if it's time to reset the weekly scores
 */
export const shouldResetWeekly = (lastResetDate) => {
  const now = new Date();
  const lastReset = new Date(lastResetDate);
  const currentWeekStart = getWeekStart(now);

  return lastReset < currentWeekStart;
};
