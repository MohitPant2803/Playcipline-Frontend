import React, { createContext, useState, useCallback } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [userStats, setUserStats] = useState({
    totalXP: 0,
    level: 1,
    globalStreak: 0,
    weeklyXP: 0
  });

  const [activeChallenges, setActiveChallenges] = useState([]);

  const updateUserStats = useCallback((stats) => {
    setUserStats(prev => ({ ...prev, ...stats }));
  }, []);

  const updateActiveChallenges = useCallback((challenges) => {
    setActiveChallenges(challenges);
  }, []);

  return (
    <UserContext.Provider value={{ userStats, activeChallenges, updateUserStats, updateActiveChallenges }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
