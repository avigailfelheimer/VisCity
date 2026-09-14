// ===== Auth Service Errors =====

export const USER_NOT_FOUND = {
    message: 'User not found',
    status: 404
};

export const ITEM_NOT_FOUND = {
    message: 'Item not found',
    status: 404
};

export const INCORRECT_PASSWORD = {
    message: 'Incorrect password',
    status: 401
};

export const EMAIL_ALREADY_IN_USE = {
    message: 'Email already in use',
    status: 409
};

export const DB_NO_PASSWORD_RECORD = {
    message: 'Internal server error',
    status: 500
};

// ===== Auth Middleware Errors =====

export const NO_TOKEN = {
    message: 'No token provided',
    status: 401
};

export const TOKEN_EXPIRED = {
    message: 'Token expired',
    status: 401
};

export const INVALID_TOKEN = {
    message: 'Invalid token',
    status: 401
};

export const ACCESS_DENIED = {
    message: 'Access denied',
    status: 403
};

export const INSUFFICIENT_PERMISSIONS = {
    message: 'Insufficient permissions',
    status: 403
};

// ===== Place Service Errors =====

export const PLACE_NOT_FOUND = {
    message: 'Place not found',
    status: 404
};

export const UNAUTHORIZED_PLACE_MODIFICATION = {
    message: 'Only the place creator or an admin can modify this place',
    status: 403
};

// ===== Review Service Errors =====

export const REVIEW_NOT_FOUND = {
    message: 'Review not found',
    status: 404
};

export const INVALID_RATING = {
    message: 'Rating must be between 1 and 5',
    status: 400
};

export const RATING_MUST_BE_NUMBER = {
    message: 'Rating must be a number',
    status: 400
};

export const RATING_REQUIRED = {
    message: 'Rating is required',
    status: 400
};

export const UNAUTHORIZED_REVIEW_MODIFICATION = {
    message: 'Only the review creator or an admin can modify this review',
    status: 403
};

export const CANNOT_VOTE_OWN_REVIEW = {
    message: 'You cannot vote on your own review',
    status: 403
};

export const REVIEW_ALREADY_STARRED = {
    message: 'User already posted a starred review for this place',
    status: 409
};

// ===== Itinerary Service Errors =====

export const ITINERARY_ENTRY_NOT_FOUND = {
    message: 'Itinerary entry not found',
    status: 404
};

export const ITINERARY_PLACE_ALREADY_EXISTS = {
    message: 'Place is already in your itinerary',
    status: 409
};

export const UNAUTHORIZED_ITINERARY_MODIFICATION = {
    message: 'Only the itinerary owner can modify it',
    status: 403
};

// ===== Favorite Folders Errors =====

export const FOLDER_NOT_FOUND = {
    message: 'Folder not found',
    status: 404
};

export const FOLDER_NAME_REQUIRED = {
    message: 'Folder name is required',
    status: 400
};

export const UNAUTHORIZED_FOLDER_MODIFICATION = {
    message: 'Only the folder owner can modify it',
    status: 403
};

// ===== Media Service Errors =====

export const MEDIA_NOT_FOUND = {
    message: 'Media not found',
    status: 404
};

export const INVALID_MEDIA_TYPE = {
    message: 'Invalid media type. Allowed: image, video, audio',
    status: 400
};

export const MEDIA_UPLOAD_FAILED = {
    message: 'File upload failed',
    status: 500
};

export const UNAUTHORIZED_MEDIA_DELETION = {
    message: 'Only the media uploader or an admin can delete this media',
    status: 403
};

export const STALE_SESSION = {
    message: 'החשבון שלך לא נמצא במערכת. אנא התחברו מחדש.',
    status: 401
};

// ===== General Errors =====

export const INTERNAL_SERVER_ERROR = {
    message: 'Internal server error',
    status: 500
};

export const ROUTE_NOT_FOUND = {
    message: 'Route not found',
    status: 404
};

export const FETCH_FAILED = {
    message: 'Failed to fetch items',
    status: 500
};

export const FETCH_ITEM_FAILED = {
    message: 'Failed to fetch item',
    status: 500
};

export const DELETE_FAILED = {
    message: 'Failed to delete item',
    status: 500
};

// ===== Validation / Request Errors =====

export const NO_FILE_UPLOADED = {
    message: 'No file uploaded',
    status: 400
};

export const NAME_CATEGORY_REQUIRED = {
    message: 'name is required and categories must be an array of strings',
    status: 400
};

export const FILE_SIZE_EXCEEDED = {
    message: 'File size exceeds the 50MB limit',
    status: 400
};

export const PLACE_ID_REQUIRED = {
    message: 'place_id is required',
    status: 400
};

export const PLACE_ID_REQUIRED_PARAM = {
    message: 'Place ID is required',
    status: 400
};

export const REVIEW_ID_REQUIRED = {
    message: 'Review ID is required',
    status: 400
};

export const ENTRIES_REQUIRED = {
    message: 'entries must be a non-empty array',
    status: 400
};

export const ENTRY_FIELDS_REQUIRED = {
    message: 'Each entry must have favorite_id and order_index',
    status: 400
};

export const PLACE_UPDATE_FAILED = {
    message: 'Failed to update place',
    status: 500
};