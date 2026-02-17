import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { db, initializeDatabase } from '../databaseInit.js'

// Database routes plugin
export default async function databaseRoutes (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    // Database test endpoint
    fastify.get('/test', {
		schema: {
			tags: ['db']
		}}, async (request, reply) => {
        try {
            const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
            const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
            const messageCount = db.prepare('SELECT COUNT(*) as count FROM chat_messages').get() as { count: number };
            
            return {
                success: true,
                tables: tables.map((t: any) => t.name),
                stats: {
                    users: userCount.count,
                    messages: messageCount.count
                },
                message: `Database is working! Found ${userCount.count} users and ${messageCount.count} messages.`
            };
        } catch (error: any) {
            return {
                success: false,
                error: 'Database test failed',
                message: error.message
            };
        }
    });
}
