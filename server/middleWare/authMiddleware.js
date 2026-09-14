import jwt from 'jsonwebtoken';
import {
    NO_TOKEN,
    TOKEN_EXPIRED,
    INVALID_TOKEN,
    ACCESS_DENIED,
    INSUFFICIENT_PERMISSIONS,
    INTERNAL_SERVER_ERROR,
    PLACE_ID_REQUIRED_PARAM,
    ITEM_NOT_FOUND,
} from '../const/errorConst.js';

const SECRET = process.env.JWT_SECRET;

// const ROLE_HIERARCHY = {
//     'user': 1,
//     'admin': 2
// };

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(NO_TOKEN.status).json({ error: NO_TOKEN.message });

        const decoded = jwt.verify(token, SECRET);
        if (decoded.id === undefined) {
            return res.status(INVALID_TOKEN.status).json({ error: INVALID_TOKEN.message });
        }

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError')
            return res.status(TOKEN_EXPIRED.status).json({ error: TOKEN_EXPIRED.message });
        if (err.name === 'JsonWebTokenError')
            return res.status(INVALID_TOKEN.status).json({ error: INVALID_TOKEN.message });

        res.status(INTERNAL_SERVER_ERROR.status).json({ error: INTERNAL_SERVER_ERROR.message });//500
    }
};

// export const requireRole = (role) => (req, res, next) => {
//     try {
//         if (!req.user) return res.status(ACCESS_DENIED.status).json({ error: ACCESS_DENIED.message });

//         // Special-case: treat the account with username 'admin1' as administrator
//         // if (req.user.username === 'admin1') 
//         if (req.user.role === 'admin') return next();
//         const requiredLevel = ROLE_HIERARCHY[role];
//         const userLevel = ROLE_HIERARCHY[req.user.role];

//         if (!userLevel || userLevel < requiredLevel) {
//             return res.status(INSUFFICIENT_PERMISSIONS.status).json({ error: INSUFFICIENT_PERMISSIONS.message });
//         }

//         next();
//     } catch (err) {
//         res.status(INTERNAL_SERVER_ERROR.status).json({ error: INTERNAL_SERVER_ERROR.message });
//     }
// };
export const requireRole = (role) => (req, res, next) => {
    try {
        if (!req.user) {
            return res
                .status(ACCESS_DENIED.status)
                .json({ error: ACCESS_DENIED.message });
        }

        if (req.user.role === role || req.user.role === 'admin') {
            return next();
        }

        return res
            .status(INSUFFICIENT_PERMISSIONS.status)
            .json({ error: INSUFFICIENT_PERMISSIONS.message });

    } catch (err) {
        return res
            .status(INTERNAL_SERVER_ERROR.status)
            .json({ error: INTERNAL_SERVER_ERROR.message });
    }
};

export const authorizeOwnership = (options) => {
    const {
        getById,
        paramName,
        ownerField,
    } = options;

    return async (req, res, next) => {
        try {
            const id = req.params[paramName];

            if (!id) {
                return res.status(PLACE_ID_REQUIRED_PARAM.status)
                    .json({ error: PLACE_ID_REQUIRED_PARAM.message });
            }

            const item = await getById(id);

            if (!item) {
                return res.status(ITEM_NOT_FOUND.status)
                    .json({ error: ITEM_NOT_FOUND.message });
            }

            const isOwner =
                req.user?.id != null &&
                item?.[ownerField] != null &&
                Number(req.user.id) === Number(item[ownerField]);            // const isAdmin = req.user.role === 'admin' || req.user.username === 'admin1';
            const isAdmin = req.user.role === 'admin';

            if (!isOwner && !isAdmin) {
                return res.status(ACCESS_DENIED.status)
                    .json({ error: ACCESS_DENIED.message });
            }

            next();
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};
