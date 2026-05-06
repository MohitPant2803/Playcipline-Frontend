import { useEffect, useState } from 'react';
import { feedAPI } from '../api/client';

export function useFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    feedAPI.getAll()
      .then(res => {
        setActivities(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { activities, loading, error };
}
