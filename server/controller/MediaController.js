import { saveMedia, getPlaceMedia, removeMedia } from '../services/MediaService.js';
import { buildMediaUrl, resolveMediaType } from '../middleWare/uploadMiddleware.js';
import { NO_FILE_UPLOADED } from '../const/errorConst.js';

export const postMedia = async (req, res, next) => {
    try {
        const { placeId } = req.params;

        if (!req.file) {
            return res.status(NO_FILE_UPLOADED.status).json({ error: NO_FILE_UPLOADED.message });
        }

        const mediaType = resolveMediaType(req.file.mimetype);
        const mediaUrl  = buildMediaUrl(req, req.file.filename);

        const media = await saveMedia(Number(placeId), req.user.id, mediaType, mediaUrl);
        res.status(201).json(media);
    } catch (err) {
        next(err);
    }
};

export const fetchMedia = async (req, res, next) => {
    try {
        const { placeId } = req.params;
        const media = await getPlaceMedia(Number(placeId));
        res.status(200).json(media);
    } catch (err) {
        next(err);
    }
};

export const deleteMediaItem = async (req, res, next) => {
    try {
        const { mediaId } = req.params;

        await removeMedia(Number(mediaId), req.user);
        res.status(200).json({ success: true, message: 'Media deleted successfully' });
    } catch (err) {
        next(err);
    }
};
