import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { db, initializeDatabase } from '../databaseInit.js'

// Database routes plugin
export default async function databaseRoutes (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    
    // Health check endpoint
    fastify.get('/health', {
		schema: {
			tags: ['db']
		}}, async (request, reply) => {
        try {
            const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
            const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
            
            return {
                success: true,
                database: 'healthy',
                tables: tables.length,
                users: userCount.count,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                success: false,
                error: 'Database health check failed',
                message: error.message
            };
        }
    });

    // Reinitialize database endpoint (for debugging)
    fastify.get('/reinit', {
		schema: {
			tags: ['db']
		}}, async (request, reply) => {
        try {
            console.log('🔄 Manual database reinitialization requested...');
            const success = initializeDatabase();
            return {
                success,
                message: success ? 'Database reinitialized successfully' : 'Database reinitialization failed'
            };
        } catch (error: any) {
            return {
                success: false,
                error: 'Reinitialization failed',
                message: error.message
            };
        }
    });

    // Get table data endpoint
    fastify.get('/tables', {
		schema: {
			tags: ['db']
		}}, async (request, reply) => {
        try {
            const query = request.query as Record<string, unknown>;
            const tablename = query.tablename;
            
            if (typeof tablename === 'string') {
                const allowedTables = [
                    'users', 'user_sessions', 'chat_messages', 'chat_users',
                    'avatars', 'games', 'tournaments', 'tournament_participants'
                ];
                
                if (allowedTables.includes(tablename)) {
                    const data = db.prepare(`SELECT * FROM ${tablename} ORDER BY id DESC LIMIT 50`).all();
                    return {
                        success: true,
                        table: tablename,
                        count: data.length,
                        data
                    };
                } else {
                    return {
                        success: false,
                        error: 'Table not allowed',
                        allowedTables
                    };
                }
            }
            
            // Return all table names
            const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
            return {
                success: true,
                tables: tables.map((t: any) => t.name)
            };
        } catch (error: any) {
            return {
                success: false,
                error: 'Failed to get table data',
                message: error.message
            };
        }
    });

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
                'DELETE FROM user_sessions',
                'DELETE FROM users WHERE username != "admin"'
            ];

            const clearData = db.transaction(() => {
                for (const query of clearQueries) {
                    db.prepare(query).run();
                }
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
