import { useState, useEffect } from 'react';
import { getUserPlaces } from '../api/usersApi';

export function useUserPlaces(userId, token) {
  const [places, setPlaces] = useState([]);
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
        const data = await getUserPlaces(userId, token);
        if (active) setPlaces(data.places ?? []);
      } catch {
        if (active) setError('שגיאה בטעינת הטיולים שלך. אנא נסו שוב.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, [userId, token]);

  return { places, loading, error };
}
