import fs from 'fs/promises';
import path from 'path';
import {
    createMedia,
    getMediaByPlaceId,
    getMediaById,
    deleteMedia
} from '../models/MediaModel.js';
import { getPlaceById } from '../models/PlaceModel.js';
import {
    PLACE_NOT_FOUND,
    MEDIA_NOT_FOUND,
    UNAUTHORIZED_MEDIA_DELETION
} from '../const/errorConst.js';

/**
 * שמירת מדיה שהועלתה — URL כבר נבנה ב-controller לאחר שה-middleware העלה את הקובץ
 */
export const saveMedia = async (placeId, userId, mediaType, mediaUrl) => {
    const place = await getPlaceById(placeId);
    if (!place) {
        const error = new Error(PLACE_NOT_FOUND.message);
        error.status = PLACE_NOT_FOUND.status;
        throw error;
    }

    return await createMedia(placeId, userId, mediaType, mediaUrl);
};

/**
 * שליפת כל המדיה של מקום
 */
export const getPlaceMedia = async (placeId) => {
    const place = await getPlaceById(placeId);
    if (!place) {
        const error = new Error(PLACE_NOT_FOUND.message);
        error.status = PLACE_NOT_FOUND.status;
        throw error;
    }

    return await getMediaByPlaceId(placeId);
};

/**
 * מחיקת מדיה
 * - בדיקת בעלות: רק המעלה עצמו או admin
 * - מחיקת הקובץ מהדיסק (generic — להחלפה בקריאת S3/Cloudinary)
 * - מחיקת הרשומה מה-DB
 */
export const removeMedia = async (mediaId, requestingUser) => {
    const media = await getMediaById(mediaId);
    if (!media) {
        const error = new Error(MEDIA_NOT_FOUND.message);
        error.status = MEDIA_NOT_FOUND.status;
        throw error;
    }

    const isOwner = media.user_id === requestingUser.id;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwner && !isAdmin) {
        const error = new Error(UNAUTHORIZED_MEDIA_DELETION.message);
        error.status = UNAUTHORIZED_MEDIA_DELETION.status;
        throw error;
    }

    // מחיקת הקובץ מהדיסק (generic — החלף בקריאת API לשירות אחסון חיצוני)
    try {
        const filename = path.basename(media.media_url);
        await fs.unlink(path.join('uploads', filename));
    } catch {
        // הקובץ לא קיים בדיסק — ממשיכים למחיקת הרשומה מה-DB
    }

    return await deleteMedia(mediaId);
};
