/**
 * Hook for managing daily check-in state and countdown timer
 */
import { useEffect, useState } from 'react';
import { getTimeUntilNextReset, isCheckinToday } from '../utils/dailyTimer';

/**
 * Hook to track daily check-in countdown
 * Shows time remaining until next check-ins are available
 */
export const useDailyCheckInCountdown = () => {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    try {
      return getTimeUntilNextReset();
    } catch (err) {
      console.error('Error initializing check-in timer:', err);
      return { hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeUntilNextReset());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return timeRemaining;
};

/**
 * Hook to check if challenge was checked in today
 */
export const useIsChallengeCheckedToday = (lastCheckinDate) => {
  return isCheckinToday(lastCheckinDate);
};
