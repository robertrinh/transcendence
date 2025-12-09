import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import Database from 'better-sqlite3';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

// Utility functions for authentication (MOVED TO TOP)
export const hashPassword = (password: string): string => {
    return createHash('sha256').update(password).digest('hex');
};

export const generateSessionId = (): string => {
    return randomUUID();
};

// Ensure database directory exists
const dbDir = path.resolve('./database');
if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
    console.log('Created database directory:', dbDir);
}

// Database path
const dbPath = path.resolve('./database/transcendence.db');
console.log('Initializing database at:', dbPath);

// Create database connection
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Database initialization function
const initializeDatabase = () => {
    console.log('🚀 Initializing database schema...');
    
    try {
        // Insert default data
        const insertDefaults = db.transaction(() => {
            // Insert default avatars
            const avatarCheck = db.prepare('SELECT COUNT(*) as count FROM avatars').get() as { count: number };
            if (avatarCheck.count === 0) {
                const insertAvatar = db.prepare('INSERT INTO avatars (path, name) VALUES (?, ?)');
                insertAvatar.run('/avatars/default.png', 'Default Avatar');
                insertAvatar.run('/avatars/robot.png', 'Robot Avatar');
                insertAvatar.run('/avatars/alien.png', 'Alien Avatar');
                console.log('✅ Default avatars inserted');
            }

            // Create a test user for development (password is 'admin123')
            const adminCheck = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin') as { count: number };
            if (adminCheck.count === 0) {
                const adminPassword = hashPassword('admin123'); // Now this function is available!
                const insertAdmin = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
                insertAdmin.run('admin', adminPassword, 'admin@transcendence.local');
                console.log('✅ Default admin user created (username: admin, password: admin123)');
            }
        });

        insertDefaults();

        // Verify tables exist
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[];
        console.log('📋 Database tables created:', tables.map(t => t.name).join(', '));

        // Verify users table has data
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
        console.log(`👥 Users in database: ${userCount.count}`);

        console.log('✅ Database initialization completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
};

// Initialize database immediately
const dbInitialized = initializeDatabase();

if (!dbInitialized) {
    console.error('❌ CRITICAL: Database initialization failed! Exiting...');
    process.exit(1);
}

// Export the database instance
export { db };

// Database routes plugin
export default async function databaseRoutes (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    
    // Health check endpoint
    fastify.get('/health', async (request, reply) => {
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
    fastify.get('/reinit', async (request, reply) => {
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
    fastify.get('/tables', async (request, reply) => {
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
    fastify.get('/test', async (request, reply) => {
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
    fastify.delete('/clear', async (request, reply) => {
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