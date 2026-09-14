import {
    getItinerary,
    addPlace,
    removePlace,
    reorderPlaces,
    setFavoriteFolder
} from '../services/ItineraryService.js';
import { PLACE_ID_REQUIRED, ENTRIES_REQUIRED, ENTRY_FIELDS_REQUIRED } from '../const/errorConst.js';

export const fetchItinerary = async (req, res, next) => {
    try {
        const itinerary = await getItinerary(req.user.id);
        res.status(200).json(itinerary);
    } catch (err) {
        next(err);
    }
};

export const postItineraryPlace = async (req, res, next) => {
    try {
        const { place_id } = req.body;

        if (!place_id) {
            return res.status(PLACE_ID_REQUIRED.status).json({ error: PLACE_ID_REQUIRED.message });
        }

        const entry = await addPlace(req.user.id, place_id);
        res.status(201).json(entry);
    } catch (err) {
        next(err);
    }
};

export const deleteItineraryPlace = async (req, res, next) => {
    try {
        const { favoriteId } = req.params;

        await removePlace(req.user.id, Number(favoriteId));
        res.status(200).json({ success: true, message: 'Place removed from itinerary' });
    } catch (err) {
        next(err);
    }
};

export const patchItineraryFolder = async (req, res, next) => {
    try {
        const { favoriteId } = req.params;
        const { folder_id } = req.body;

        await setFavoriteFolder(req.user.id, Number(favoriteId), folder_id ?? null);
        res.status(200).json({ success: true, message: 'Favorite folder updated successfully' });
    } catch (err) {
        next(err);
    }
};

export const putItineraryOrder = async (req, res, next) => {
    try {
        const { entries } = req.body;

        if (!Array.isArray(entries) || entries.length === 0) {
            return res.status(ENTRIES_REQUIRED.status).json({ error: ENTRIES_REQUIRED.message });
        }

        for (const entry of entries) {
            if (entry.favorite_id === undefined || entry.order_index === undefined) {
                return res.status(ENTRY_FIELDS_REQUIRED.status).json({ error: ENTRY_FIELDS_REQUIRED.message });
            }
        }

        await reorderPlaces(req.user.id, entries);
        res.status(200).json({ success: true, message: 'Itinerary reordered successfully' });
    } catch (err) {
        next(err);
    }
};
