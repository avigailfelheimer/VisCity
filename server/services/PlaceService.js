import { createPlace, fetchPlaces, getPlaceById, updatePlace, deletePlace } from '../models/PlaceModel.js';
import { NAME_CATEGORY_REQUIRED, PLACE_NOT_FOUND, PLACE_UPDATE_FAILED, INTERNAL_SERVER_ERROR } from '../const/errorConst.js';


const MAX_LIMIT     = 50;
const DEFAULT_LIMIT = 50;

export const validateCategories = (categories) => {
    if (!Array.isArray(categories)) return false;
    return categories.every(c => typeof c === 'string' && c.trim().length > 0);
};

export const getPlaceForAuthorization = async (id) => {
    return await getPlaceById(id);
};

export const addPlace = async (userId, name, description, categories, latitude, longitude, googlePlaceId, openingHours) => {
    if (!name || !validateCategories(categories)) {
        const error = new Error(NAME_CATEGORY_REQUIRED.message);
        error.status = NAME_CATEGORY_REQUIRED.status;
        throw error;
    }

    const created = await createPlace(userId, name, description, categories, latitude, longitude, googlePlaceId, openingHours);
    if (!created) {
        const error = new Error(INTERNAL_SERVER_ERROR.message);
        error.status = INTERNAL_SERVER_ERROR.status;
        throw error;
    }

    return created;
};

export const getPlace = async (placeId) => {
    const place = await getPlaceForAuthorization(placeId);
    if (!place) {
        const error = new Error(PLACE_NOT_FOUND.message);
        error.status = PLACE_NOT_FOUND.status;
        throw error;
    }
    return place;
};

export const editPlace = async (placeId, name, description, categories, latitude, longitude, googlePlaceId, openingHours) => {
    // validate input (defensive)
    if (!name || !validateCategories(categories)) {
        const error = new Error(NAME_CATEGORY_REQUIRED.message);
        error.status = NAME_CATEGORY_REQUIRED.status;
        throw error;
    }

    const updated = await updatePlace(placeId, name, description, categories, latitude, longitude, googlePlaceId, openingHours);
    if (!updated) {
        const error = new Error(PLACE_UPDATE_FAILED.message);
        error.status = PLACE_UPDATE_FAILED.status;
        throw error;
    }

    return updated;
};

export const removePlace = async (placeId) => {
    const deleted = await deletePlace(placeId);
    if (!deleted) {
        const error = new Error(PLACE_NOT_FOUND.message);
        error.status = PLACE_NOT_FOUND.status;
        throw error;
    }
    return deleted;
};


export const getPlaces = async ({ page = 1, limit = DEFAULT_LIMIT, search = '', category = '', open_on = '', created_by = '' } = {}) => {

    // --- pagination ---
    const safePage  = Math.max(1, parseInt(page)  || 1);
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit) || DEFAULT_LIMIT));
    const offset    = (safePage - 1) * safeLimit;

    // --- בניית תנאי סינון ---
    const conditions = [];
    const params     = [];

    if (search?.trim()) {
        conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
        params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // סינון לפי קטגוריה — JSON_CONTAINS בודק אם המערך מכיל את הערך
    if (category?.trim()) {
        conditions.push('JSON_CONTAINS(p.categories, ?, \'$\')');
        params.push(JSON.stringify(category.trim()));  // חייב להיות "\"bar\"" ולא "bar"
    }

    // סינון לפי יוצר המקום — שימוש בעמוד הפרופיל
    if (created_by) {
        conditions.push('p.created_by = ?');
        params.push(created_by);
    }

    // --- שליפה מהמודל ---
    const { places, total } = await fetchPlaces(conditions, params, safeLimit, offset);

    return {
        places,
        total,
        page:       safePage,
        limit:      safeLimit,
        totalPages: Math.ceil(total / safeLimit),
    };
};

