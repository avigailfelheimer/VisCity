import multer from 'multer';
import path from 'path';
import { INVALID_MEDIA_TYPE, MEDIA_UPLOAD_FAILED, FILE_SIZE_EXCEEDED } from '../const/errorConst.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const MIME_TO_MEDIA_TYPE = {
    'image/jpeg':  'image',
    'image/png':   'image',
    'image/gif':   'image',
    'image/webp':  'image',
    'audio/mpeg':  'audio',
    'audio/mp3':   'audio',
    'audio/wav':   'audio',
    'audio/ogg':   'audio',
};

const fileFilter = (req, file, cb) => {
    if (!MIME_TO_MEDIA_TYPE[file.mimetype]) {
        const error = new Error(INVALID_MEDIA_TYPE.message);
        error.status = INVALID_MEDIA_TYPE.status;
        return cb(error, false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024  // 50MB מקסימום
    }
});


export const buildMediaUrl = (req, filename) => {
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

export const resolveMediaType = (mimetype) => {
    return MIME_TO_MEDIA_TYPE[mimetype] || null;
};

export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(FILE_SIZE_EXCEEDED.status).json({ error: FILE_SIZE_EXCEEDED.message });
        }
        return res.status(400).json({ error: err.message });
    }
    if (err?.status) {
        return res.status(err.status).json({ error: err.message });
    }
    res.status(MEDIA_UPLOAD_FAILED.status).json({ error: MEDIA_UPLOAD_FAILED.message });
};

export default upload;
