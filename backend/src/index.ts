// import dotenv from 'dotenv/config';
// import fastify from 'fastify';
// import databaseRoutes from './database.js';
// import { getMessages } from './controllers/chatcontrollers.js';
// import usersRoutes from './routes/users.js';
// import authRoutes from './routes/auth.js';

// const server = fastify({ logger: true });

// //* User logic routes
// server.register(
//   usersRoutes, {
//     prefix: "/api"
// })

// //* Auth routes
// server.register(
// 	authRoutes, {
// 		prefix: "/api"
// 	}
// )

// // Health check
// server.get('/api/health', async (request, reply) => {
//     return { 
//         status: 'OK', 
//         timestamp: new Date().toISOString(),
//         backend: 'running',
//         database: 'connected',
//         activeConnections: sseConnections.size,
//         totalMessages: chatMessages.length
//     };
// });

// // Store active SSE connections and messages
// const sseConnections = new Map<string, any>();
// const chatMessages: any[] = [];

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

// // Register database routes
// await server.register(databaseRoutes, { prefix: '/api/db' });


// // Chat status endpoint
// server.get('/api/chat/status', async (request, reply) => {
//     const activeUsers = Array.from(sseConnections.values())
//         .filter(conn => conn.username)
//         .map(conn => ({
//             username: conn.username,
//             connectedAt: conn.connectedAt
//         }));
    
//     return {
//         activeConnections: sseConnections.size,
//         activeUsers,
//         timestamp: new Date().toISOString()
//     };
// });

// // Root endpoint
// server.get('/', async (request, reply) => {
//     return { 
//         message: 'ft_transcendence Backend API',
//         status: 'running',
//         endpoints: {
//             health: '/api/health',
//             auth: '/api/auth/*',
//             chat: '/api/chat/*',
//             // database: '/api/db/*',
//             chatStream: '/api/chat/stream (SSE)'
//         }
//     };
// });

// const start = async () => {
//     try {
//         await server.listen({ port: 3000, host: '0.0.0.0' });
//         console.log('🚀 Backend server running on http://0.0.0.0:3000');
//         console.log('📝 API Documentation available at http://localhost:3000');
//         console.log('🌐 Frontend should be accessible at http://localhost:8080');
//         console.log('📡 SSE Chat endpoint: http://localhost:3000/api/chat/stream');
//     } catch (err) {
//         server.log.error(err);
//         process.exit(1);
//     }
// };

// start();

// import fastify from 'fastify';
// import dotenv from 'dotenv/config';
// import databaseRoutes from './database.js';
// import { getMessages } from './controllers/chatcontrollers.js';
// import usersRoutes from './routes/users.js';
// import authRoutes from './routes/auth.js';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import multipart from '@fastify/multipart';                    // NEW: add multipart
// import fastifyStatic from '@fastify/static';                   // NEW: add static serve


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const server = fastify({ logger: true });

// // Register multipart FIRST                                    // NEW
// await server.register(multipart, {
//     limits: { fileSize: 5 * 1024 * 1024 }                     // NEW: 5MB limit
// });

// // // Register static file serving for uploads
// // server.register(import('@fastify/static'), {
// //     root: path.join(__dirname, '..', 'uploads'),
// //     prefix: '/uploads/',
// // });

// await server.register(fastifyStatic, {
//     root: path.join(__dirname, '..', 'uploads', 'avatars'),   // FIXED: point to avatars folder
//     prefix: '/api/avatars/',                                  // FIXED: serve at /api/avatars/
// })

// //* User logic routes
// server.register(
//   usersRoutes, {
//     prefix: "/api"
// })

// //* Auth routes
// server.register(
//     authRoutes, {
//         prefix: "/api"
//     }
// )

// // Health check
// server.get('/api/health', async (request, reply) => {
//     return { 
//         status: 'OK', 
//         timestamp: new Date().toISOString(),
//         backend: 'running',
//         database: 'connected',
//         activeConnections: sseConnections.size,
//         totalMessages: chatMessages.length
//     };
// });

// // Store active SSE connections and messages
// const sseConnections = new Map<string, any>();
// const chatMessages: any[] = [];

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

// // Register database routes
// await server.register(databaseRoutes, { prefix: '/api/db' });

// // Chat status endpoint
// server.get('/api/chat/status', async (request, reply) => {
//     const activeUsers = Array.from(sseConnections.values())
//         .filter(conn => conn.username)
//         .map(conn => ({
//             username: conn.username,
//             connectedAt: conn.connectedAt
//         }));
    
//     return {
//         activeConnections: sseConnections.size,
//         activeUsers,
//         timestamp: new Date().toISOString()
//     };
// });

// // Root endpoint
// server.get('/', async (request, reply) => {
//     return { 
//         message: 'ft_transcendence Backend API',
//         status: 'running',
//         endpoints: {
//             health: '/api/health',
//             auth: '/api/auth/*',
//             chat: '/api/chat/*',
//             // database: '/api/db/*',
//             chatStream: '/api/chat/stream (SSE)'
//         }
//     };
// });

// const start = async () => {
//     try {
//         await server.listen({ port: 3000, host: '0.0.0.0' });
//         console.log('🚀 Backend server running on http://0.0.0.0:3000');
//         console.log('📝 API Documentation available at http://localhost:3000');
//         console.log('🌐 Frontend should be accessible at http://localhost:8080');
//         console.log('📡 SSE Chat endpoint: http://localhost:3000/api/chat/stream');
//     } catch (err) {
//         server.log.error(err);
//         process.exit(1);
//     }
// };

// start();

// import fastify from 'fastify';
// import dotenv from 'dotenv/config';
// import databaseRoutes from './database.js';
// import { getMessages } from './controllers/chatcontrollers.js';
// import usersRoutes from './routes/users.js';
// import authRoutes from './routes/auth.js';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import multipart from '@fastify/multipart';
// import fastifyStatic from '@fastify/static';
// import { verifyToken } from './auth/utils.js';  // NEW: Import token verification

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const server = fastify({ logger: true });

// // Register multipart
// await server.register(multipart, {
//     limits: { fileSize: 5 * 1024 * 1024 }
// });

// // Register static file serving for avatars
// await server.register(fastifyStatic, {
//     root: path.join(__dirname, '..', 'uploads', 'avatars'),
//     prefix: '/api/avatars/',
// });

// // User logic routes
// server.register(
//     usersRoutes, {
//         prefix: "/api"
//     }
// );

// // Auth routes
// server.register(
//     authRoutes, {
//         prefix: "/api"
//     }
// );

// // Health check
// server.get('/api/health', async (request, reply) => {
//     return { 
//         status: 'OK', 
//         timestamp: new Date().toISOString(),
//         backend: 'running',
//         database: 'connected',
//         activeConnections: sseConnections.size,
//         totalMessages: chatMessages.length
//     };
// });

// // Store active SSE connections and messages
// const sseConnections = new Map<string, any>();
// const chatMessages: any[] = [];

// // NEW: SSE endpoint for real-time chat with JWT verification
// server.get('/api/chat/stream', async (request, reply) => {
//     try {
//         // NEW: Verify JWT token
//         const authHeader = request.headers.authorization;
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return reply.status(401).send({ error: 'No token provided' });
//         }

//         const token = authHeader.split(' ')[1];
//         const payload = verifyToken(token);

//         if (!payload) {
//             return reply.status(401).send({ error: 'Invalid or expired token' });
//         }

//         console.log(`New SSE connection from user: ${payload.username} (ID: ${payload.userId})`);

//         const connectionId = Date.now().toString() + Math.random().toString();
//         console.log(`SSE connectionId: ${connectionId}`);

//         // Set SSE headers
//         reply.raw.writeHead(200, {
//             'Content-Type': 'text/event-stream',
//             'Cache-Control': 'no-cache',
//             'Connection': 'keep-alive',
//             'Access-Control-Allow-Origin': '*',
//             'Access-Control-Allow-Headers': 'Cache-Control'
//         });

//         // Store connection with user info from token
//         sseConnections.set(connectionId, {
//             response: reply.raw,
//             userId: payload.userId,        // NEW: From token
//             username: payload.username,    // NEW: From token
//             connectedAt: new Date()
//         });

//         // Send initial connection success
//         reply.raw.write(`data: ${JSON.stringify({
//             type: 'connected',
//             connectionId,
//             userId: payload.userId,        // NEW: Send back to frontend
//             username: payload.username,    // NEW: Send back to frontend
//             timestamp: new Date().toISOString()
//         })}\n\n`);

//         // Send recent messages
//         if (chatMessages.length > 0) {
//             const recentMessages = chatMessages.slice(-20);
//             reply.raw.write(`data: ${JSON.stringify({
//                 type: 'history',
//                 messages: recentMessages
//             })}\n\n`);
//         }

//         // Handle client disconnect
//         request.raw.on('close', () => {
//             console.log(`SSE connection closed: ${connectionId}`);
//             const connection = sseConnections.get(connectionId);
//             if (connection?.username) {
//                 broadcastSSE({
//                     type: 'user_left',
//                     username: connection.username,
//                     message: `${connection.username} left the chat`,
//                     timestamp: new Date().toISOString()
//                 }, connectionId);
//             }
//             sseConnections.delete(connectionId);
//         });

//         request.raw.on('error', (error: any) => {
//             console.error(`SSE connection error: ${connectionId}`, error);
//             sseConnections.delete(connectionId);
//         });

//         return reply.hijack();
//     } catch (error) {
//         console.error('SSE stream error:', error);
//         return reply.status(500).send({ error: 'Failed to establish SSE connection' });
//     }
// });

// // NEW: Join chat endpoint with JWT verification
// server.post('/api/chat/join', async (request, reply) => {
//     try {
//         // NEW: Verify JWT token
//         const authHeader = request.headers.authorization;
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return reply.status(401).send({ error: 'No token provided' });
//         }

//         const token = authHeader.split(' ')[1];
//         const payload = verifyToken(token);

//         if (!payload) {
//             return reply.status(401).send({ error: 'Invalid or expired token' });
//         }

//         const { connectionId } = request.body as any;
        
//         const connection = sseConnections.get(connectionId);
//         if (connection) {
//             connection.userId = payload.userId;      // NEW: From token
//             connection.username = payload.username;  // NEW: From token
            
//             console.log(`User ${payload.username} (ID: ${payload.userId}) joined chat via connection ${connectionId}`);
            
//             // Broadcast user joined
//             broadcastSSE({
//                 type: 'user_joined',
//                 userId: payload.userId,
//                 username: payload.username,
//                 message: `${payload.username} joined the chat`,
//                 timestamp: new Date().toISOString()
//             }, connectionId);
//         }
        
//         return { success: true };
//     } catch (error) {
//         console.error('Join chat error:', error);
//         return reply.status(500).send({ error: 'Failed to join chat' });
//     }
// });

// // NEW: Send message endpoint with JWT verification
// server.post('/api/chat/send', async (request, reply) => {
//     try {
//         // NEW: Verify JWT token
//         const authHeader = request.headers.authorization;
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return reply.status(401).send({ error: 'No token provided' });
//         }

//         const token = authHeader.split(' ')[1];
//         const payload = verifyToken(token);

//         if (!payload) {
//             return reply.status(401).send({ error: 'Invalid or expired token' });
//         }

//         const { connectionId, message } = request.body as any;
        
//         const connection = sseConnections.get(connectionId);
//         if (!connection) {
//             return reply.status(400).send({ error: 'Invalid connection' });
//         }

//         const messageData = {
//             type: 'message',
//             id: Date.now().toString(),
//             userId: payload.userId,        // NEW: From token
//             username: payload.username,    // NEW: From token
//             message: message.trim(),
//             timestamp: new Date().toISOString()
//         };

//         // Save to memory
//         chatMessages.push(messageData);

//         // Save to database
//         try {
//             const { db } = await import('./database.js');
//             const insertMessage = db.prepare(`
//                 INSERT INTO chat_messages (user_id, username, message, timestamp) 
//                 VALUES (?, ?, ?, ?)
//             `);
//             insertMessage.run(payload.userId, payload.username, message.trim(), new Date().toISOString());
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

// // Register database routes
// await server.register(databaseRoutes, { prefix: '/api/db' });

// // Chat status endpoint
// server.get('/api/chat/status', async (request, reply) => {
//     const activeUsers = Array.from(sseConnections.values())
//         .filter(conn => conn.username)
//         .map(conn => ({
//             username: conn.username,
//             connectedAt: conn.connectedAt
//         }));
    
//     return {
//         activeConnections: sseConnections.size,
//         activeUsers,
//         timestamp: new Date().toISOString()
//     };
// });

// // Root endpoint
// server.get('/', async (request, reply) => {
//     return { 
//         message: 'ft_transcendence Backend API',
//         status: 'running',
//         endpoints: {
//             health: '/api/health',
//             auth: '/api/auth/*',
//             chat: '/api/chat/*',
//             chatStream: '/api/chat/stream (SSE)'
//         }
//     };
// });

// const start = async () => {
//     try {
//         await server.listen({ port: 3000, host: '0.0.0.0' });
//         console.log('🚀 Backend server running on http://0.0.0.0:3000');
//         console.log('📝 API Documentation available at http://localhost:3000');
//         console.log('🌐 Frontend should be accessible at http://localhost:8080');
//         console.log('📡 SSE Chat endpoint: http://localhost:3000/api/chat/stream');
//     } catch (err) {
//         server.log.error(err);
//         process.exit(1);
//     }
// };

// start();

import fastify from 'fastify';
import dotenv from 'dotenv/config';
import databaseRoutes from './database.js';
import { getMessages } from './controllers/chatcontrollers.js';
import usersRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { verifyToken } from './auth/utils.js';  // NEW: Import token verification

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = fastify({ logger: true });

// Register multipart
await server.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Register static file serving for avatars
await server.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'uploads', 'avatars'),
    prefix: '/api/avatars/',
});

// User logic routes
server.register(
    usersRoutes, {
        prefix: "/api"
    }
);

// Auth routes
server.register(
    authRoutes, {
        prefix: "/api"
    }
);

// Health check
server.get('/api/health', async (request, reply) => {
    return { 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        backend: 'running',
        database: 'connected',
        activeConnections: sseConnections.size,
        totalMessages: chatMessages.length
    };
});

// Store active SSE connections and messages
const sseConnections = new Map<string, any>();
const chatMessages: any[] = [];

// CHANGED: SSE endpoint - get token from query parameter
server.get('/api/chat/stream', async (request, reply) => {
    try {
        // CHANGED: Get token from query parameter (EventSource limitation)
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
            if (connection?.username) {
                console.log(`🚪 Broadcasting user_left for ${connection.username}`);
                broadcastSSE({
                    type: 'user_left',
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

// CHANGED: Join chat endpoint with JWT verification
server.post('/api/chat/join', async (request, reply) => {
    try {
        // CHANGED: Get token from Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        if (!payload) {
            return reply.status(401).send({ error: 'Invalid or expired token' });
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

// CHANGED: Send message endpoint with JWT verification
server.post('/api/chat/send', async (request, reply) => {
    try {
        // CHANGED: Get token from Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        if (!payload) {
            return reply.status(401).send({ error: 'Invalid or expired token' });
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

        // Save to memory
        chatMessages.push(messageData);

        // Save to database
        try {
            const { db } = await import('./database.js');
            const insertMessage = db.prepare(`
                INSERT INTO chat_messages (user_id, username, message, timestamp) 
                VALUES (?, ?, ?, ?)
            `);
            insertMessage.run(payload.userId, payload.username, message.trim(), new Date().toISOString());
            console.log(`✅ Message saved to database`);
        } catch (dbError) {
            console.error('Error saving message to database:', dbError);
        }

        // Broadcast to all connections
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
server.get('/api/chat/messages', getMessages);

// Register database routes
await server.register(databaseRoutes, { prefix: '/api/db' });

// Chat status endpoint
server.get('/api/chat/status', async (request, reply) => {
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

// Root endpoint
server.get('/', async (request, reply) => {
    return { 
        message: 'ft_transcendence Backend API',
        status: 'running',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth/*',
            chat: '/api/chat/*',
            chatStream: '/api/chat/stream (SSE with token query param)'
        }
    };
});

const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
        console.log('🚀 Backend server running on http://0.0.0.0:3000');
        console.log('📝 API Documentation available at http://localhost:3000');
        console.log('🌐 Frontend should be accessible at http://localhost:8080');
        console.log('📡 SSE Chat endpoint: http://localhost:3000/api/chat/stream?token=YOUR_JWT_TOKEN');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();