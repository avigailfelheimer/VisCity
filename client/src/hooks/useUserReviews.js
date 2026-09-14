import { useState, useEffect } from 'react';
import { getUserReviews } from '../api/usersApi';

export function useUserReviews(userId, token) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      if (!userId || !token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await getUserReviews(userId, token);
        if (active) setReviews(data ?? []);
      } catch {
        if (active) setError('שגיאה בטעינת התגובות שלך. אנא נסו שוב.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, [userId, token]);

  return { reviews, loading, error };
}
