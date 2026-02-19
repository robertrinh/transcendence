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
			tags: ['db'],
            summary: 'To test if the database is up'
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

    // Clear all data endpoint (for development)
    fastify.delete('/clear', {
		schema: {
			tags: ['db']
		}}, async (request, reply) => {
        try {
            const clearQueries = [
                'DELETE FROM tournament_participants',
                'DELETE FROM tournaments',
                'DELETE FROM games',
                'DELETE FROM chat_users',
                'DELETE FROM chat_messages',
                'DELETE FROM user_sessions'
            ];

            const clearData = db.transaction(() => {
                for (const query of clearQueries) {
                    db.prepare(query).run();
                }
                db.prepare('DELETE FROM users WHERE username != ? AND username != ?').run('admin', 'tester'); // Keep admin and tester user
                db.prepare('UPDATE users SET status = ? WHERE username = ? OR username = ?').run('idle', 'admin', 'tester'); // Set admin and tester to offline
            });

            clearData();

            return {
                success: true,
                message: 'All data cleared (except admin user)'
            };
        } catch (error: any) {
            return {
                success: false,
                error: 'Failed to clear data',
                message: error.message
            };
        }
    });
}
