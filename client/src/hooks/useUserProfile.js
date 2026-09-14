import { useState, useEffect } from 'react';
import { getUserById } from '../api/usersApi';

export function useUserProfile(user) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await getUserById(user.id, user.token);
        if (active) setProfile(data);
      } catch {
        if (active) setError('שגיאה בטעינת הפרופיל. אנא נסו שוב.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();
    return () => { active = false; };
  }, [user]);

  return { profile, loading, error };
}
