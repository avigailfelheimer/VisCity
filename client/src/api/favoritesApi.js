import { getData, create, deleteItem, patchItem } from './client';

/**
 * שליפת כל המועדפים של המשתמש המחובר (כולל פרטי תצוגה ותיקייה)
 */
export const getFavorites = (token) => getData('/itinerary', token);

/**
 * הוספת מקום למועדפים — { place_id }
 */
export const addFavorite = (placeId, token) =>
  create('/itinerary', { place_id: placeId }, token);

/**
 * הסרת מועדף לפי favorite_id
 */
export const removeFavorite = (favoriteId, token) =>
  deleteItem(`/itinerary/${favoriteId}`, token);

/**
 * שיבוץ/הוצאה של מועדף מתיקייה — folderId = null מוציא מכל תיקייה
 */
export const setFavoriteFolder = (favoriteId, folderId, token) =>
  patchItem(`/itinerary/${favoriteId}`, { folder_id: folderId }, token);

/**
 * שליפת כל תיקיות המועדפים של המשתמש המחובר
 */
export const getFolders = (token) => getData('/itinerary/folders', token);

/**
 * יצירת תיקייה חדשה — { name }
 */
export const createFolder = (name, token) =>
  create('/itinerary/folders', { name }, token);

/**
 * שינוי שם תיקייה
 */
export const renameFolder = (folderId, name, token) =>
  patchItem(`/itinerary/folders/${folderId}`, { name }, token);

/**
 * מחיקת תיקייה (הפריטים בה עוברים אוטומטית ל"ללא תיקייה")
 */
export const deleteFolder = (folderId, token) =>
  deleteItem(`/itinerary/folders/${folderId}`, token);