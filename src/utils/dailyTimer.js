/**
 * Utility functions for managing daily check-in windows
 * Check-ins reset daily at 12:01 AM
 */

/**
 * Get the current daily window (12:01 AM to 12:01 AM next day)
 */
export const getDailyWindowStart = (date = new Date()) => {
  const d = new Date(date);
  const windowStart = new Date(d);
  windowStart.setHours(0, 1, 0, 0); // 12:01 AM
  
  // If we're before 12:01 AM, the window started yesterday
  if (d.getHours() === 0 && d.getMinutes() < 1) {
    windowStart.setDate(windowStart.getDate() - 1);
  }
  
  return windowStart;
};

/**
 * Get the end of the current daily window (12:00 AM next day)
 */
export const getDailyWindowEnd = (date = new Date()) => {
  const windowStart = getDailyWindowStart(date);
  const windowEnd = new Date(windowStart);
  windowEnd.setDate(windowEnd.getDate() + 1);
  return windowEnd;
};

/**
 * Get the next check-in reset time (12:01 AM)
 */
export const getNextCheckInResetTime = (date = new Date()) => {
  const d = new Date(date);
  const nextReset = new Date(d);
  
  if (d.getHours() < 0 || (d.getHours() === 0 && d.getMinutes() < 1)) {
    // Before 12:01 AM, reset is today at 12:01 AM
    nextReset.setHours(0, 1, 0, 0);
  } else {
    // After 12:01 AM, reset is tomorrow at 12:01 AM
    nextReset.setDate(nextReset.getDate() + 1);
    nextReset.setHours(0, 1, 0, 0);
  }
  
  return nextReset;
};

/**
 * Get time remaining until next check-in reset
 * Returns an object with hours, minutes, and seconds
 */
export const getTimeUntilNextReset = (date = new Date()) => {
  const nextReset = getNextCheckInResetTime(date);
  const now = new Date(date);
  const diff = nextReset - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, total: diff };
};

/**
 * Format time remaining as a readable string
 */
export const formatTimeUntilReset = (timeObj) => {
  const { hours, minutes, seconds } = timeObj;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Check if a check-in date is from today
 */
export const isCheckinToday = (lastCheckinDate, currentDate = new Date()) => {
  if (!lastCheckinDate) return false;
  
  const lastCheckin = new Date(lastCheckinDate);
  const windowStart = getDailyWindowStart(currentDate);
  
  return lastCheckin >= windowStart;
};

/**
 * Check if user can check in now
 */
export const canCheckInNow = (lastCheckinDate, currentDate = new Date()) => {
  return !isCheckinToday(lastCheckinDate, currentDate);
};
