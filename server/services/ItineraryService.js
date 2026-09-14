import {
    getItineraryByUserId,
    addToItinerary,
    getItineraryEntry,
    getItineraryEntryById,
    removeFromItinerary,
    reorderItinerary,
    updateFavoriteFolder
} from '../models/ItineraryModel.js';
import { getPlaceById } from '../models/PlaceModel.js';
import { getFolderById } from '../models/FavoriteFolderModel.js';
import {
    PLACE_NOT_FOUND,
    ITINERARY_ENTRY_NOT_FOUND,
    ITINERARY_PLACE_ALREADY_EXISTS,
    UNAUTHORIZED_ITINERARY_MODIFICATION,
    FOLDER_NOT_FOUND,
    UNAUTHORIZED_FOLDER_MODIFICATION
} from '../const/errorConst.js';

/**
 * שליפת המסלול המלא של המשתמש
 */
export const getItinerary = async (userId) => {
    return await getItineraryByUserId(userId);
};

/**
 * הוספת מקום למסלול
 * - מוודא שהמקום קיים
 * - מוודא שלא כבר במסלול
 */
export const addPlace = async (userId, placeId) => {
    const place = await getPlaceById(placeId);
    if (!place) {
        const error = new Error(PLACE_NOT_FOUND.message);
        error.status = PLACE_NOT_FOUND.status;
        throw error;
    }

    const existing = await getItineraryEntry(userId, placeId);
    if (existing) {
        const error = new Error(ITINERARY_PLACE_ALREADY_EXISTS.message);
        error.status = ITINERARY_PLACE_ALREADY_EXISTS.status;
        throw error;
    }

    return await addToItinerary(userId, placeId);
};

/**
 * הסרת מקום מהמסלול
 * - מוודא שהרשומה קיימת ושייכת למשתמש
 */
export const removePlace = async (userId, favoriteId) => {
    const entry = await getItineraryEntryById(favoriteId);
    if (!entry) {
        const error = new Error(ITINERARY_ENTRY_NOT_FOUND.message);
        error.status = ITINERARY_ENTRY_NOT_FOUND.status;
        throw error;
    }

    if (entry.user_id !== userId) {
        const error = new Error(UNAUTHORIZED_ITINERARY_MODIFICATION.message);
        error.status = UNAUTHORIZED_ITINERARY_MODIFICATION.status;
        throw error;
    }

    return await removeFromItinerary(favoriteId);
};

/**
 * שיבוץ/הוצאה של מועדף מתיקייה (folderId = null מוציא אותו מכל תיקייה)
 * - מוודא שהרשומה שייכת למשתמש
 * - מוודא שהתיקייה (אם נשלחה) שייכת למשתמש
 */
export const setFavoriteFolder = async (userId, favoriteId, folderId) => {
    const entry = await getItineraryEntryById(favoriteId);
    if (!entry) {
        const error = new Error(ITINERARY_ENTRY_NOT_FOUND.message);
        error.status = ITINERARY_ENTRY_NOT_FOUND.status;
        throw error;
    }

    if (entry.user_id !== userId) {
        const error = new Error(UNAUTHORIZED_ITINERARY_MODIFICATION.message);
        error.status = UNAUTHORIZED_ITINERARY_MODIFICATION.status;
        throw error;
    }

    if (folderId !== null) {
        const folder = await getFolderById(folderId);
        if (!folder) {
            const error = new Error(FOLDER_NOT_FOUND.message);
            error.status = FOLDER_NOT_FOUND.status;
            throw error;
        }

        if (folder.user_id !== userId) {
            const error = new Error(UNAUTHORIZED_FOLDER_MODIFICATION.message);
            error.status = UNAUTHORIZED_FOLDER_MODIFICATION.status;
            throw error;
        }
    }

    return await updateFavoriteFolder(favoriteId, folderId);
};

/**
 * עדכון סדר המסלול
 * - מקבל מערך של { favorite_id, order_index }
 * - מוודא שכל הרשומות שייכות למשתמש
 */
export const reorderPlaces = async (userId, entries) => {
    for (const { favorite_id } of entries) {
        const entry = await getItineraryEntryById(favorite_id);
        if (!entry) {
            const error = new Error(ITINERARY_ENTRY_NOT_FOUND.message);
            error.status = ITINERARY_ENTRY_NOT_FOUND.status;
            throw error;
        }
        if (entry.user_id !== userId) {
            const error = new Error(UNAUTHORIZED_ITINERARY_MODIFICATION.message);
            error.status = UNAUTHORIZED_ITINERARY_MODIFICATION.status;
            throw error;
        }
    }

    return await reorderItinerary(userId, entries);
};
