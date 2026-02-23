import { db } from '../databaseInit.js';
//MAYBE REMOVE THIS FOR PRODUCTION? 
// Database routes plugin
export default async function databaseRoutes(fastify, options) {
    // Database test endpoint
    fastify.get('/test', {
        schema: {
            tags: ['db'],
            summary: 'To test if the database is up'
        }
    }, async (request, reply) => {
        try {
            const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
            const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
            const messageCount = db.prepare('SELECT COUNT(*) as count FROM chat_messages').get();
            return {
                success: true,
                tables: tables.map((t) => t.name),
                stats: {
                    users: userCount.count,
                    messages: messageCount.count
                },
                message: `Database is working! Found ${userCount.count} users and ${messageCount.count} messages.`
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Database test failed',
                message: error.message
            };
        }
    });
}
