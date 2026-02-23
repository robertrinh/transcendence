import { db } from '../databaseInit.js';
class ChatService {
    addMessage(userId, username, message, roomId) {
        const stmt = db.prepare(`
            INSERT INTO chat_messages (user_id, username, message, room_id)
            VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(userId, username, message, roomId || null);
        const newMessage = {
            id: result.lastInsertRowid.toString(),
            userId,
            username,
            message,
            timestamp: new Date(),
            roomId
        };
        return newMessage;
    }
    addUser(userId, username) {
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
    removeUser(userId) {
        const stmt = db.prepare(`
            UPDATE chat_users 
            SET is_online = 0, last_seen = datetime('now') 
            WHERE user_id = ?
        `);
        stmt.run(userId);
    }
    getOnlineUsers() {
        const stmt = db.prepare(`
            SELECT user_id, username, is_online, last_seen 
            FROM chat_users 
            WHERE is_online = 1
        `);
        const rows = stmt.all();
        return rows.map((row) => ({
            id: row.user_id.toString(),
            username: row.username,
            isOnline: Boolean(row.is_online),
            lastSeen: new Date(row.last_seen)
        }));
    }
}
const chatService = new ChatService();
export const sendMessage = async (request, reply) => {
    try {
        const { userId, username, message, roomId } = request.body;
        console.log('Received message:', { userId, username, message, roomId });
        if (!userId || !username || !message) {
            return reply.status(400).send({ error: 'Missing required fields' });
        }
        const newMessage = chatService.addMessage(userId, username, message, roomId);
        console.log('Message saved:', newMessage);
        return reply.status(201).send(newMessage);
    }
    catch (error) {
        console.error('Error sending message:', error);
        return reply.status(500).send({ error: 'Failed to send message' });
    }
};
export const joinChat = async (request, reply) => {
    try {
        const { userId, username } = request.body;
        if (!userId || !username) {
            return reply.status(400).send({ error: 'Missing required fields' });
        }
        const user = chatService.addUser(userId, username);
        console.log('User joined:', user);
        return reply.send(user);
    }
    catch (error) {
        console.error('Error joining chat:', error);
        return reply.status(500).send({ error: 'Failed to join chat' });
    }
};
export const leaveChat = async (request, reply) => {
    try {
        const params = request.params;
        const userId = params.userId;
        chatService.removeUser(userId);
        console.log('User left:', userId);
        return reply.send({ message: 'Left chat successfully' });
    }
    catch (error) {
        console.error('Error leaving chat:', error);
        return reply.status(500).send({ error: 'Failed to leave chat' });
    }
};
export const getOnlineUsers = async (request, reply) => {
    try {
        const users = chatService.getOnlineUsers();
        console.log(`Retrieved ${users.length} online users`);
        return reply.send(users);
    }
    catch (error) {
        console.error('Error getting online users:', error);
        return reply.status(500).send({ error: 'Failed to get online users' });
    }
};
