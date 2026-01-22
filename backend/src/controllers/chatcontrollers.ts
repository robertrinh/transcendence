import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../databaseInit.js';

interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: Date;
    roomId?: string;
}

interface User {
    id: string;
    username: string;
    isOnline: boolean;
    lastSeen: Date;
}

interface DbChatMessage {
    id: number;
    user_id: number;
    username: string;
    message: string;
    timestamp: string;
    room_id: string | null;
}

interface DbChatUser {
    user_id: number;
    username: string;
    is_online: number;
    last_seen: string;
}

class ChatService {
    addMessage(userId: string, username: string, message: string, roomId?: string): ChatMessage {
        const stmt = db.prepare(`
            INSERT INTO chat_messages (user_id, username, message, room_id)
            VALUES (?, ?, ?, ?)
        `);
        
        const result = stmt.run(userId, username, message, roomId || null);
        
        const newMessage: ChatMessage = {
            id: result.lastInsertRowid.toString(),
            userId,
            username,
            message,
            timestamp: new Date(),
            roomId
        };
        
        return newMessage;
    }

    getMessages(roomId?: string, limit: number = 50): ChatMessage[] {
        let query = `
            SELECT id, user_id, username, message, timestamp, room_id 
            FROM chat_messages 
            WHERE (? IS NULL OR room_id = ? OR (room_id IS NULL AND ? IS NULL))
            ORDER BY timestamp DESC 
            LIMIT ?
        `;
        
        const stmt = db.prepare(query);
        const rows = stmt.all(roomId || null, roomId || null, roomId || null, limit) as DbChatMessage[];
        
        return rows.map((row) => ({
            id: row.id.toString(),
            userId: row.user_id.toString(),
            username: row.username,
            message: row.message,
            timestamp: new Date(row.timestamp),
            roomId: row.room_id || undefined
        })).reverse();
    }

    addUser(userId: string, username: string): User {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO chat_users (user_id, username, is_online, last_seen)
            VALUES (?, ?, 1, datetime('now'))
        `);
        
        stmt.run(userId, username);
        
        return {
            id: userId,
            username,
            isOnline: true,
            lastSeen: new Date()
        };
    }

    removeUser(userId: string): void {
        const stmt = db.prepare(`
            UPDATE chat_users 
            SET is_online = 0, last_seen = datetime('now') 
            WHERE user_id = ?
        `);
        
        stmt.run(userId);
    }

    getOnlineUsers(): User[] {
        const stmt = db.prepare(`
            SELECT user_id, username, is_online, last_seen 
            FROM chat_users 
            WHERE is_online = 1
        `);
        
        const rows = stmt.all() as DbChatUser[];
        
        return rows.map((row) => ({
            id: row.user_id.toString(),
            username: row.username,
            isOnline: Boolean(row.is_online),
            lastSeen: new Date(row.last_seen)
        }));
    }
}

const chatService = new ChatService();

export const sendMessage = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userId, username, message, roomId } = request.body as any;
        
        console.log('Received message:', { userId, username, message, roomId });

        if (!userId || !username || !message) {
            return reply.status(400).send({ error: 'Missing required fields' });
        }
        
        const newMessage = chatService.addMessage(userId, username, message, roomId);
        console.log('Message saved:', newMessage);
        
        return reply.status(201).send(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        return reply.status(500).send({ error: 'Failed to send message' });
    }
};

export const getMessages = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const query = request.query as any;
        const roomId = query.roomId;
        const limit = parseInt(query.limit) || 50;

        const messages = chatService.getMessages(roomId, limit);
        console.log(`Retrieved ${messages.length} messages`);
        
        return reply.send(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        return reply.status(500).send({ error: 'Failed to get messages' });
    }
};

export const joinChat = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userId, username } = request.body as any;

        if (!userId || !username) {
            return reply.status(400).send({ error: 'Missing required fields' });
        }

        const user = chatService.addUser(userId, username);
        console.log('User joined:', user);
        
        return reply.send(user);
    } catch (error) {
        console.error('Error joining chat:', error);
        return reply.status(500).send({ error: 'Failed to join chat' });
    }
};

export const leaveChat = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const params = request.params as any;
        const userId = params.userId;
        chatService.removeUser(userId);
        console.log('User left:', userId);
        
        return reply.send({ message: 'Left chat successfully' });
    } catch (error) {
        console.error('Error leaving chat:', error);
        return reply.status(500).send({ error: 'Failed to leave chat' });
    } 
};

export const getOnlineUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const users = chatService.getOnlineUsers();
        console.log(`Retrieved ${users.length} online users`);
        
        return reply.send(users);
    } catch (error) {
        console.error('Error getting online users:', error);
        return reply.status(500).send({ error: 'Failed to get online users' });
    }
};



//IS THIS NEEDED OR OLD CODE?
// // SSE endpoint for real-time chat
// server.get('/api/chat/stream', async (request, reply) => {
//     const connectionId = Date.now().toString() + Math.random().toString();
//     console.log(`New SSE connection: ${connectionId}`);

//     // Set SSE headers
//     reply.raw.writeHead(200, {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         'Connection': 'keep-alive',
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Headers': 'Cache-Control'
//     });

//     // Store connection
//     sseConnections.set(connectionId, {
//         response: reply.raw,
//         userId: null,
//         username: null,
//         connectedAt: new Date()
//     });

//     // Send initial connection success
//     reply.raw.write(`data: ${JSON.stringify({
//         type: 'connected',
//         connectionId,
//         timestamp: new Date().toISOString()
//     })}\n\n`);

//     // Send recent messages
//     if (chatMessages.length > 0) {
//         const recentMessages = chatMessages.slice(-20); // Last 20 messages
//         reply.raw.write(`data: ${JSON.stringify({
//             type: 'history',
//             messages: recentMessages
//         })}\n\n`);
//     }

//     // Handle client disconnect
//     request.raw.on('close', () => {
//         console.log(`SSE connection closed: ${connectionId}`);
//         const connection = sseConnections.get(connectionId);
//         if (connection?.username) {
//             broadcastSSE({
//                 type: 'user_left',
//                 username: connection.username,
//                 message: `${connection.username} left the chat`,
//                 timestamp: new Date().toISOString()
//             }, connectionId);
//         }
//         sseConnections.delete(connectionId);
//     });

//     request.raw.on('error', (error: any) => {
//         console.error(`SSE connection error: ${connectionId}`, error);
//         sseConnections.delete(connectionId);
//     });

//     // Don't return - keep connection open
//     return reply.hijack();
// });

// // Join chat endpoint
// server.post('/api/chat/join', async (request, reply) => {
//     const { connectionId, userId, username } = request.body as any;
    
//     const connection = sseConnections.get(connectionId);
//     if (connection) {
//         connection.userId = userId;
//         connection.username = username;
        
//         console.log(`User ${username} joined chat via connection ${connectionId}`);
        
//         // Broadcast user joined
//         broadcastSSE({
//             type: 'user_joined',
//             username,
//             message: `${username} joined the chat`,
//             timestamp: new Date().toISOString()
//         }, connectionId);
//     }
    
//     return { success: true };
// });

// // Send message endpoint
// server.post('/api/chat/send', async (request, reply) => {
//     try {
//         const { connectionId, message } = request.body as any;
        
//         const connection = sseConnections.get(connectionId);
//         if (!connection || !connection.username) {
//             return reply.status(400).send({ error: 'Invalid connection or user not joined' });
//         }

//         const messageData = {
//             type: 'message',
//             id: Date.now().toString(),
//             userId: connection.userId,
//             username: connection.username,
//             message: message.trim(),
//             timestamp: new Date().toISOString()
//         };

//         // Save to memory (and database)
//         chatMessages.push(messageData);

//         // Save to database
//         try {
//             const { db } = await import('./database.js');
//             const insertMessage = db.prepare(`
//                 INSERT INTO chat_messages (user_id, username, message, timestamp) 
//                 VALUES (?, ?, ?, ?)
//             `);
//             insertMessage.run(connection.userId, connection.username, message.trim(), new Date().toISOString());
//         } catch (dbError) {
//             console.error('Error saving message to database:', dbError);
//         }

//         // Broadcast to all connections
//         broadcastSSE(messageData);

//         return { success: true, messageId: messageData.id };
//     } catch (error) {
//         console.error('Error sending message:', error);
//         return reply.status(500).send({ error: 'Failed to send message' });
//     }
// });

// // Function to broadcast messages via SSE
// function broadcastSSE(message: any, excludeConnectionId?: string) {
//     const messageString = `data: ${JSON.stringify(message)}\n\n`;
    
//     for (const [connectionId, connection] of sseConnections) {
//         if (excludeConnectionId && connectionId === excludeConnectionId) {
//             continue;
//         }
        
//         try {
//             if (!connection.response.destroyed) {
//                 connection.response.write(messageString);
//             } else {
//                 sseConnections.delete(connectionId);
//             }
//         } catch (error) {
//             console.error('Error broadcasting SSE message:', error);
//             sseConnections.delete(connectionId);
//         }
//     }
// }

// // Get messages (HTTP endpoint for initial load)
// server.get('/api/chat/messages', getMessages);