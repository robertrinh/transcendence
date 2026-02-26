import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { verifyToken } from '../auth/utils.js';  // NEW: Import token verification
import { db } from '../databaseInit.js'
import { userService } from '../services/userService.js';
import { authenticate } from '../auth/middleware.js';
import { register as sseRegister, unregister as sseUnregister, get as sseGet, getConnectionCount, getAllConnections, sendToConnections, broadcast as sseBroadcast, getConnectionIdsForUser } from '../sseNotify.js';

const chatMessages: any[] = [];

//  SSE endpoint - get token from query parameter
export default async function chatRoutes (
    	fastify: FastifyInstance,
    	options: FastifyPluginOptions
    ) {
    fastify.get('/stream', {
        schema: {
            tags: ['chat'],
            summary: 'Server-Sent Events (SSE) endpoint'
        }}, async (request, reply) => {
    try {
        //  Get token from query parameter (EventSource limitation)
        const token = (request.query as any).token;
        
        if (!token) {
            console.error('No token provided in query parameter');
            return reply.status(401).send({ error: 'No token provided' });
        }

        const payload = verifyToken(token as string);

        if (!payload) {
            console.error('Invalid or expired token');
            return reply.status(401).send({ error: 'Invalid or expired token' });
        }

        if (userService.isUserAnonymous(payload.userId)) {
            console.log(`Anonymous user ${payload.username} attempted to connect to chat`);
            return reply.status(403).send({ error: 'Anonymous users cannot access chat' });
        }

        const connectionId = Date.now().toString() + Math.random().toString();
        console.log(`[SSE] Connected: ${payload.username} (id=${payload.userId}), connection=${connectionId}, connections=${getConnectionCount() + 1}`);

        // Set SSE headers
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Store connection with user info from token
        sseRegister(connectionId, {
            response: reply.raw,
            userId: payload.userId,
            username: payload.username,
            connectedAt: new Date()
        });

        // Build online users and guest usernames (frontend shows "(guest)" and disables send request for these)
        const connections = getAllConnections().filter(conn => conn.username);
        const onlineUsers = connections.map(conn => conn.username);
        const guestIds = new Set(
            (db.prepare('SELECT id FROM users WHERE is_guest = 1').all() as { id: number }[]).map(r => r.id)
        );
        const guestUsernames = connections.filter(conn => guestIds.has(conn.userId)).map(conn => conn.username);

        // Send initial connection success
        reply.raw.write(`data: ${JSON.stringify({
            type: 'connected',
            connectionId,
            userId: payload.userId,
            username: payload.username,
            onlineUsers,
            guestUsernames,
            timestamp: new Date().toISOString()
        })}\n\n`);

        // Send recent messages
        if (chatMessages.length > 0) {
            const recentMessages = chatMessages.slice(-20);
            reply.raw.write(`data: ${JSON.stringify({
                type: 'history',
                messages: recentMessages
            })}\n\n`);
        }

        // Handle client disconnect
        request.raw.on('close', () => {
            const connection = sseGet(connectionId);
            if (connection && connection.username) {
                sseBroadcast({
                    type: 'user_left',
                    userId: connection.userId,
                    username: connection.username,
                    message: `${connection.username} left the chat`,
                    timestamp: new Date().toISOString()
                }, connectionId);
            }
            sseUnregister(connectionId);
            console.log(`[SSE] Closed: ${connectionId}, connections=${getConnectionCount()}`);
        });

        request.raw.on('error', (error: any) => {
            console.error(`[SSE] Error ${connectionId}:`, error?.message ?? error);
            sseUnregister(connectionId);
        });

        return reply.hijack();
    } catch (error) {
        console.error('SSE stream error:', error);
        return reply.status(500).send({ error: 'Failed to establish SSE connection' });
    }
});

//  Join chat endpoint with JWT verification
fastify.post('/join', {
        schema: {
            tags: ['chat'],
            summary: 'Join chat endpoint with JWT verification'
        }, preHandler: [authenticate]},
        async (request, reply) => {
    try {
        const payload = request.user!;
        const userExistsJoin = db.prepare('SELECT id FROM users WHERE id = ?').get(payload.userId);
        if (!userExistsJoin) {
            return reply.status(401).send({ error: 'Account no longer exists' });
        }

        if (userService.isUserAnonymous(payload.userId)) {
            return reply.status(403).send({ 
                error: 'Anonymous users cannot access chat' 
            });
        }

        const { connectionId } = request.body as any;
        
        const connection = sseGet(connectionId);
        if (!connection) {
            return reply.status(400).send({ error: 'Invalid connection' });
        }
        if (connection.userId !== payload.userId) {
            return reply.status(403).send({ error: 'Connection does not belong to this user' });
        }

        connection.userId = payload.userId;
        connection.username = payload.username;
        const guestRow = db.prepare('SELECT is_guest FROM users WHERE id = ?').get(payload.userId) as { is_guest?: number } | undefined;
        const isGuest = guestRow?.is_guest === 1;
        console.log(`[Chat] Joined: ${payload.username} (id=${payload.userId})`);
        sseBroadcast({
            type: 'user_joined',
            userId: payload.userId,
            username: payload.username,
            isGuest,
            message: `${payload.username} joined the chat`,
            timestamp: new Date().toISOString()
        }, connectionId);

        return { success: true };
    } catch (error) {
        console.error('Join chat error:', error);
        return reply.status(500).send({ error: 'Failed to join chat' });
    }
});

//  Send message endpoint with JWT verification
fastify.post('/send', {
        schema: {
            tags: ['chat'],
            summary: 'Send message endpoint with JWT verification'
        }, preHandler: [authenticate]}, async (request, reply) => {
    try {
        const payload = request.user!;
        const userExistsSend = db.prepare('SELECT id FROM users WHERE id = ?').get(payload.userId);
        if (!userExistsSend) {
            return reply.status(401).send({ error: 'Account no longer exists' });
        }

        if (userService.isUserAnonymous(payload.userId)) {
            return reply.status(403).send({ 
                error: 'Anonymous users cannot send messages' 
            });
        }

        const { connectionId, message, isPrivate, toUser } = request.body as any;
        
        if (!message || !message.trim()) {
            return reply.status(400).send({ error: 'Message cannot be empty' });
        }
		
		if (message.length > 1000) {
			return reply.status(400).send({ error: 'Message cannot be longer than 1000 characters' });
		}

        const connection = sseGet(connectionId);
        if (!connection) {
            console.warn(`[Chat] Invalid connection: ${connectionId}`);
            return reply.status(400).send({ error: 'Invalid connection' });
        }
        if (connection.userId !== payload.userId) {
            return reply.status(403).send({ error: 'Connection does not belong to this user' });
        }

        const isPrivateMessage = Boolean(isPrivate && toUser);
        if (isPrivate && (!toUser || !String(toUser).trim())) {
            return reply.status(400).send({ error: 'Recipient required for private message' });
        }

        if (isPrivateMessage) {
			//* check for valid recipient andsend only to sender
            const toUsername = String(toUser).trim();
            if (toUsername === payload.username) {
                return reply.status(400).send({ error: 'Cannot send a private message to yourself' });
            }
            const targetRow = db.prepare('SELECT id FROM users WHERE username = ?').get(toUsername) as { id: number } | undefined;
            if (!targetRow) {
                return reply.status(400).send({ error: 'User not found' });
            }
            const targetUserId = targetRow.id;

            const messageData = {
                type: 'message',
                id: Date.now().toString(),
                userId: payload.userId,
                username: payload.username,
                message: message.trim(),
                timestamp: new Date().toISOString(),
                isPrivate: true,
                toUser: toUsername
            };

            try {
                const insertMessage = db.prepare(`
                    INSERT INTO chat_messages (user_id, username, message, timestamp) 
                    VALUES (?, ?, ?, ?)
                `);
                insertMessage.run(payload.userId, payload.username, message.trim(), new Date().toISOString());
            } catch (dbError: any) {
                console.error('Error saving message to database:', dbError);
                if (dbError?.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                    return reply.status(401).send({ error: 'Account no longer exists' });
                }
                return reply.status(500).send({ error: 'Failed to save message' });
            }

            //* send to sender and recipient(s); only deliver to recipient if they still have sender as friend (no delivery if they unfriended)
            let recipientConnectionIds: string[] = [];
            const recipientHasSenderAsFriend = db.prepare(
                'SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?'
            ).get(targetUserId, payload.userId) as { 1?: number } | undefined;
            if (recipientHasSenderAsFriend) {
                recipientConnectionIds = getConnectionIdsForUser(targetUserId);
            }
            const connectionIdsToSend = [connectionId, ...recipientConnectionIds];
            sendToConnections(connectionIdsToSend, messageData);

            return { success: true, messageId: messageData.id };
        }

        //* public message
        const messageData = {
            type: 'message',
            id: Date.now().toString(),
            userId: payload.userId,
            username: payload.username,
            message: message.trim(),
            timestamp: new Date().toISOString()
        };

        try {
            const insertMessage = db.prepare(`
                INSERT INTO chat_messages (user_id, username, message, timestamp) 
                VALUES (?, ?, ?, ?)
            `);
            insertMessage.run(payload.userId, payload.username, message.trim(), new Date().toISOString());
        } catch (dbError: any) {
            console.error('Error saving message to database:', dbError);
            if (dbError?.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                return reply.status(401).send({ error: 'Account no longer exists' });
            }
            return reply.status(500).send({ error: 'Failed to save message' });
        }

        chatMessages.push(messageData);
        sseBroadcast(messageData);

        return { success: true, messageId: messageData.id };
    } catch (error) {
        console.error('Error sending message:', error);
        return reply.status(500).send({ error: 'Failed to send message' });
    }
});
}