import { useEffect, useState } from 'react';
import { challengeAPI } from '../api/client';

export function useChallenge(userChallengeId) {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userChallengeId) {
      challengeAPI.getMyChall()
        .then(res => {
          const found = res.data.find(c => c._id === userChallengeId);
          setChallenge(found);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [userChallengeId]);

  return { challenge, loading };
}
