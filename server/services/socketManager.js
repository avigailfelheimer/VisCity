import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

//object of events
export const SOCKET_EVENTS = {
    NEW_EVENT:       'event:new',
    EVENT_UPDATED:   'event:updated',
    EVENT_CANCELLED: 'event:cancelled',

    PLACE_APPROVED:  'place:approved',
    PLACE_POPULAR:   'place:popular',   // נשלח כשמקום מגיע לסף reviews/favorites

    MEDIA_UPLOADED:  'media:uploaded',
};

const AUTHENTICATED_EVENTS = new Set([
    SOCKET_EVENTS.PLACE_APPROVED,
]);

let io = null;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token) {
            socket.user = null;
            return next();
        }

        try {
            socket.user = jwt.verify(token, SECRET);
            next();
        } catch {
            // טוקן פגום / פג תוקף — לא מאפשרים חיבור
            next(new Error('Invalid or expired token'));
        }
    });

    io.on('connection', (socket) => {
        // הצטרפות לחדר של מקום — ציבורי, גם guest יכול לקבל עדכוני מדיה ואירועים
        socket.on('join:place', (placeId) => {
            socket.join(`place:${placeId}`);
        });

        socket.on('leave:place', (placeId) => {
            socket.leave(`place:${placeId}`);
        });
    });

    return io;
};


export const getConnectedUsers = () => {
    if (!io) return [];
    const users = [];
    io.sockets.sockets.forEach((socket) => {
        if (socket.user) users.push({ id: socket.user.id, role: socket.user.role, username: socket.user.username });
    });
    return users;
};


export const broadcastToAll = (event, payload) => {
    if (!io) return;
    io.emit(event, payload);
};


export const broadcastToPlace = (placeId, event, payload) => {
    if (!io) return;
    io.to(`place:${placeId}`).emit(event, payload);
};


export const broadcastToAuthenticated = (event, payload) => {
    if (!io) return;
    io.sockets.sockets.forEach((socket) => {
        if (socket.user) {
            socket.emit(event, payload);
        }
    });
};
