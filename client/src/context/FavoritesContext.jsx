import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { UserContext } from './userContext';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  setFavoriteFolder,
  getFolders,
  createFolder,
  renameFolder,
  deleteFolder,
} from '../api/favoritesApi';

export const FavoritesContext = createContext(null);

// ממיר רשומה מהשרת למבנה שמשמש את קומפוננטות התצוגה
const mapFavoriteRow = (row) => ({
  favoriteId: row.favorite_id,
  placeId: String(row.place_id),
  name: row.name,
  description: row.description || '',
  image_url: row.image_url || null,
  categories: Array.isArray(row.categories) ? row.categories : [],
  avg_rating: row.avg_rating,
  review_count: row.review_count,
  created_by_username: row.created_by_username || '',
  folderId: row.folder_id || null,
  createdAt: row.created_at,
});

const mapFolderRow = (row) => ({
  id: row.folder_id,
  name: row.name,
  createdAt: row.created_at,
});

/**
 * FavoritesProvider – מנהל את מצב ה"מועדפים" וה"תיקיות" של המשתמש המחובר.
 * כל הנתונים נשמרים בשרת (MySQL) דרך favoritesAPI, לא ב-localStorage.
 * כל הלוגיקה (קריאות API + עדכון מצב מקומי) נמצאת כאן.
 */
export function FavoritesProvider({ children }) {
  const { user } = useContext(UserContext);
  const token = user?.token || null;

  const [favorites, setFavorites] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);

  // טעינה מהשרת בכל החלפת משתמש (התחברות/התנתקות)
  useEffect(() => {
    if (!token) {
      setFavorites([]);
      setFolders([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const [favRows, folderRows] = await Promise.all([
          getFavorites(token),
          getFolders(token),
        ]);
        if (cancelled) return;
        setFavorites(Array.isArray(favRows) ? favRows.map(mapFavoriteRow) : []);
        setFolders(Array.isArray(folderRows) ? folderRows.map(mapFolderRow) : []);
      } catch (err) {
        console.error('שגיאה בטעינת המועדפים מהשרת:', err);
        if (!cancelled) {
          setFavorites([]);
          setFolders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  const isFavorite = useCallback(
    (placeId) => favorites.some((item) => item.placeId === String(placeId)),
    [favorites]
  );

  /**
   * מוסיף/מסיר מקום מהמועדפים (מול השרת).
   * מחזיר true אם נוסף, false אם הוסר, null אם הפעולה לא בוצעה (לא מחובר / שגיאה).
   */
  const toggleFavorite = useCallback(async (place) => {
    if (!token || !place) return null;
    const placeId = String(place.place_id ?? place.id ?? '');
    if (!placeId) return null;

    const existing = favorites.find((item) => item.placeId === placeId);

    try {
      if (existing) {
        await removeFavorite(existing.favoriteId, token);
        setFavorites((prev) => prev.filter((item) => item.placeId !== placeId));
        return false;
      }

      const created = await addFavorite(placeId, token);
      setFavorites((prev) => [
        {
          favoriteId: created.favorite_id,
          placeId,
          name: place.name || '',
          description: place.description || '',
          image_url: place.image_url || null,
          categories: Array.isArray(place.categories) ? place.categories : [],
          avg_rating: place.avg_rating ?? null,
          review_count: place.review_count ?? 0,
          created_by_username: place.created_by_username || '',
          folderId: null,
          createdAt: created.created_at || new Date().toISOString(),
        },
        ...prev,
      ]);
      return true;
    } catch (err) {
      console.error('שגיאה בעדכון המועדפים:', err);
      alert('שגיאה בעדכון המועדפים. נסו שוב.');
      return null;
    }
  }, [token, favorites]);

  /**
   * יצירת תיקייה חדשה. מחזיר את ה-id של התיקייה החדשה (או null בכשל)
   */
  const addFolder = useCallback(async (name) => {
    if (!token) return null;
    const trimmed = (name || '').trim();
    if (!trimmed) return null;

    try {
      const created = await createFolder(trimmed, token);
      const folder = mapFolderRow({
        folder_id: created.folder_id,
        name: created.name || trimmed,
        created_at: created.created_at || new Date().toISOString(),
      });
      setFolders((prev) => [...prev, folder]);
      return folder.id;
    } catch (err) {
      console.error('שגיאה ביצירת תיקייה:', err);
      alert('שגיאה ביצירת התיקייה. נסו שוב.');
      return null;
    }
  }, [token]);

  /**
   * שינוי שם תיקייה
   */
  const renameFolderFn = useCallback(async (folderId, name) => {
    if (!token) return;
    const trimmed = (name || '').trim();
    if (!trimmed) return;

    try {
      await renameFolder(folderId, trimmed, token);
      setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, name: trimmed } : f)));
    } catch (err) {
      console.error('שגיאה בשינוי שם תיקייה:', err);
      alert('שגיאה בשינוי שם התיקייה. נסו שוב.');
    }
  }, [token]);

  /**
   * מחיקת תיקייה. הפריטים שהיו בה עוברים ל"ללא תיקייה"
   */
  const deleteFolderFn = useCallback(async (folderId) => {
    if (!token) return;

    try {
      await deleteFolder(folderId, token);
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      setFavorites((prev) => prev.map((item) => (
        item.folderId === folderId ? { ...item, folderId: null } : item
      )));
    } catch (err) {
      console.error('שגיאה במחיקת תיקייה:', err);
      alert('שגיאה במחיקת התיקייה. נסו שוב.');
    }
  }, [token]);

  /**
   * שיבוץ/הוצאה של מועדף מתיקייה (folderId = null מוציא אותו מכל תיקייה)
   */
  const moveItemToFolder = useCallback(async (placeId, folderId) => {
    if (!token) return;
    const existing = favorites.find((item) => item.placeId === String(placeId));
    if (!existing) return;

    const normalizedFolderId = (folderId === null || folderId === undefined || folderId === '')
      ? null
      : Number(folderId);

    try {
      await setFavoriteFolder(existing.favoriteId, normalizedFolderId, token);
      setFavorites((prev) => prev.map((item) => (
        item.placeId === String(placeId) ? { ...item, folderId: normalizedFolderId } : item
      )));
    } catch (err) {
      console.error('שגיאה בשיבוץ לתיקייה:', err);
      alert('שגיאה בשיבוץ לתיקייה. נסו שוב.');
    }
  }, [token, favorites]);

  const value = useMemo(() => ({
    isEnabled: Boolean(token),
    loading,
    favorites,
    folders,
    isFavorite,
    toggleFavorite,
    addFolder,
    renameFolder: renameFolderFn,
    deleteFolder: deleteFolderFn,
    moveItemToFolder,
  }), [
    token, loading, favorites, folders, isFavorite, toggleFavorite,
    addFolder, renameFolderFn, deleteFolderFn, moveItemToFolder,
  ]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites חייב להיקרא בתוך FavoritesProvider');
  }
  return ctx;
}
