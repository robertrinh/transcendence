import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { sseConnections, chatMessages } from '../index.js';

export default async function genericRoutes (
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
    // Health check
    fastify.get('/health', async (request, reply) => {
        return { 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            backend: 'running',
            database: 'connected',
            activeConnections: sseConnections.size,
            totalMessages: chatMessages.length
        };
    });

    // Root endpoint
    fastify.get('/', async (request, reply) => {
        return { 
            message: 'ft_transcendence Backend API',
            status: 'running',
            endpoints: {
                health: '/api/health',
                auth: '/api/auth/*',
                chat: '/api/chat/*',
                database: '/api/db/*',
                chatStream: '/api/chat/stream (SSE)'
            }
        };
    });
}
