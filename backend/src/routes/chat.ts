import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { getMessages } from '../controllers/chatcontrollers.js';
import { verifyToken } from '../auth/utils.js';  // NEW: Import token verification
import { db } from '../databaseInit.js'
import { userService } from '../services/userService.js';

// Store active SSE connections and messages
const sseConnections = new Map<string, any>();
const chatMessages: any[] = [];

//  SSE endpoint - get token from query parameter
export default async function chatRoutes (
    	fastify: FastifyInstance,
    	options: FastifyPluginOptions
    ) {
    fastify.get('/stream', async (request, reply) => {
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
            // console.log(`🚫 Anonymous user ${payload.username} attempted to connect to chat`);
            return reply.status(403).send({ error: 'Anonymous users cannot access chat' });
        }

        console.log(`✅ New SSE connection from user: ${payload.username} (ID: ${payload.userId})`);

        const connectionId = Date.now().toString() + Math.random().toString();
        console.log(`📡 SSE connectionId: ${connectionId}`);

        // Set SSE headers
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Store connection with user info from token
        sseConnections.set(connectionId, {
            response: reply.raw,
            userId: payload.userId,
            username: payload.username,
            connectedAt: new Date()
        });

        console.log(`👥 Active connections: ${sseConnections.size}`);

        // Send initial connection success
        reply.raw.write(`data: ${JSON.stringify({
            type: 'connected',
            connectionId,
            userId: payload.userId,
            username: payload.username,
            onlineUsers: Array.from(sseConnections.values())
                .filter(conn => conn.username)
                .map(conn => conn.username),
            timestamp: new Date().toISOString()
        })}\n\n`);

        // Send recent messages
        if (chatMessages.length > 0) {
            const recentMessages = chatMessages.slice(-20);
            console.log(`📨 Sending ${recentMessages.length} recent messages`);
            reply.raw.write(`data: ${JSON.stringify({
                type: 'history',
                messages: recentMessages
            })}\n\n`);
        }

        // Handle client disconnect
        request.raw.on('close', () => {
            console.log(`❌ SSE connection closed: ${connectionId}`);
            const connection = sseConnections.get(connectionId);
            if (connection && connection.username) {
                console.log(`🚪 Broadcasting user_left for ${connection.username}`);
                broadcastSSE({
                    type: 'user_left',
                    userId: connection.userId,
                    username: connection.username,
                    message: `${connection.username} left the chat`,
                    timestamp: new Date().toISOString()
                }, connectionId);
            }
            sseConnections.delete(connectionId);
            console.log(`👥 Active connections: ${sseConnections.size}`);
        });

        request.raw.on('error', (error: any) => {
            console.error(`⚠️ SSE connection error: ${connectionId}`, error);
            sseConnections.delete(connectionId);
        });

        return reply.hijack();
    } catch (error) {
        console.error('SSE stream error:', error);
        return reply.status(500).send({ error: 'Failed to establish SSE connection' });
    }
});

//  Join chat endpoint with JWT verification
fastify.post('/join', async (request, reply) => {
    try {
        //  Get token from Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        if (!payload) {
            return reply.status(401).send({ error: 'Invalid or expired token' });
        }

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
        
        const connection = sseConnections.get(connectionId);
        if (connection) {
            connection.userId = payload.userId;
            connection.username = payload.username;
            
            console.log(`🎯 User ${payload.username} (ID: ${payload.userId}) joined chat via connection ${connectionId}`);
            
            // Broadcast user joined
            broadcastSSE({
                type: 'user_joined',
                userId: payload.userId,
                username: payload.username,
                message: `${payload.username} joined the chat`,
                timestamp: new Date().toISOString()
            }, connectionId);
        } else {
            console.warn(`⚠️ Connection not found: ${connectionId}`);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Join chat error:', error);
        return reply.status(500).send({ error: 'Failed to join chat' });
    }
});

//  Send message endpoint with JWT verification
fastify.post('/send', async (request, reply) => {
    try {
        //  Get token from Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        if (!payload) {
            return reply.status(401).send({ error: 'Invalid or expired token' });
        }

        const userExistsSend = db.prepare('SELECT id FROM users WHERE id = ?').get(payload.userId);
        if (!userExistsSend) {
            return reply.status(401).send({ error: 'Account no longer exists' });
        }

        if (userService.isUserAnonymous(payload.userId)) {
            return reply.status(403).send({ 
                error: 'Anonymous users cannot send messages' 
            });
        }

        const { connectionId, message } = request.body as any;
        
        if (!message || !message.trim()) {
            return reply.status(400).send({ error: 'Message cannot be empty' });
        }

        const connection = sseConnections.get(connectionId);
        if (!connection) {
            console.warn(`⚠️ Invalid connection: ${connectionId}`);
            return reply.status(400).send({ error: 'Invalid connection' });
        }

        const messageData = {
            type: 'message',
            id: Date.now().toString(),
            userId: payload.userId,
            username: payload.username,
            message: message.trim(),
            timestamp: new Date().toISOString()
        };

        console.log(`💬 New message from ${payload.username}: "${message.trim()}"`);

        //* save to database first; if user was deleted, do not broadcast
        try {
            const insertMessage = db.prepare(`
                INSERT INTO chat_messages (user_id, username, message, timestamp) 
                VALUES (?, ?, ?, ?)
            `);
            insertMessage.run(payload.userId, payload.username, message.trim(), new Date().toISOString());
            console.log(`✅ Message saved to database`);
        } catch (dbError: any) {
            console.error('Error saving message to database:', dbError);
            if (dbError?.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                return reply.status(401).send({ error: 'Account no longer exists' });
            }
            return reply.status(500).send({ error: 'Failed to save message' });
        }

        //* save to memory and broadcast only after successful DB write
        chatMessages.push(messageData);
        console.log(`📡 Broadcasting message to ${sseConnections.size} connections`);
        broadcastSSE(messageData);

        return { success: true, messageId: messageData.id };
    } catch (error) {
        console.error('Error sending message:', error);
        return reply.status(500).send({ error: 'Failed to send message' });
    }
});

// Function to broadcast messages via SSE
function broadcastSSE(message: any, excludeConnectionId?: string) {
    const messageString = `data: ${JSON.stringify(message)}\n\n`;
    let broadcastCount = 0;
    
    for (const [connectionId, connection] of sseConnections) {
        if (excludeConnectionId && connectionId === excludeConnectionId) {
            continue;
        }
        
        try {
            if (!connection.response.destroyed) {
                connection.response.write(messageString);
                broadcastCount++;
            } else {
                sseConnections.delete(connectionId);
            }
        } catch (error) {
            console.error(`Error broadcasting to ${connectionId}:`, error);
            sseConnections.delete(connectionId);
        }
    }
    
    console.log(`✅ Message broadcasted to ${broadcastCount} connections`);
}

// Get messages (HTTP endpoint for initial load)
fastify.get('/messages', getMessages);

// Register database routes
// await fastify.register(databaseRoutes, { prefix: '/api/db' });

// Chat status endpoint
fastify.get('/status', async (request, reply) => {
    const activeUsers = Array.from(sseConnections.values())
        .filter(conn => conn.username)
        .map(conn => ({
            username: conn.username,
            connectedAt: conn.connectedAt
        }));
    
    return {
        activeConnections: sseConnections.size,
        activeUsers,
        timestamp: new Date().toISOString()
    };
});
}