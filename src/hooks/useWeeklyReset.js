import { useEffect, useCallback } from 'react';
import { shouldResetWeekly, getWeekStart } from '../utils/weeklyReset';

/**
 * Hook to handle weekly score resets
 * Checks if a reset is needed and calls the reset callback
 * 
 * @param {Function} onWeeklyReset - Callback function to execute when reset is needed
 * @param {string} lastResetKey - localStorage key for tracking last reset
 */
export const useWeeklyReset = (onWeeklyReset, lastResetKey = 'lastWeeklyReset') => {
  const checkAndReset = useCallback(() => {
    const lastResetDate = localStorage.getItem(lastResetKey);
    
    if (!lastResetDate || shouldResetWeekly(lastResetDate)) {
      // Execute the reset callback
      if (onWeeklyReset) {
        onWeeklyReset();
      }
      
      // Update the last reset date to the current week's start
      const currentWeekStart = getWeekStart();
      localStorage.setItem(lastResetKey, currentWeekStart.toISOString());
    }
  }, [onWeeklyReset, lastResetKey]);

  useEffect(() => {
    // Check on mount
    checkAndReset();

    // Check every hour to catch week boundaries
    const interval = setInterval(checkAndReset, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAndReset]);

  return checkAndReset;
};

/**
 * Hook to track and display week-end countdown
 * Returns formatted time remaining until end of week
 */
export const useWeekEndCountdown = () => {
  const [timeRemaining, setTimeRemaining] = require('react').useState(
    require('../utils/weeklyReset').getTimeUntilWeekEnd()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const { getTimeUntilWeekEnd } = require('../utils/weeklyReset');
      setTimeRemaining(getTimeUntilWeekEnd());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return timeRemaining;
};
