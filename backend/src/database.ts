import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import Database from 'better-sqlite3';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

// import { FastifyInstance, FastifyPluginOptions } from 'fastify'
// import Database from 'better-sqlite3';
// // chat related, need to confirm credibility
// import crypto from 'crypto';

// const db = new Database('./database/db.sqlite')

// // enabling foreing keys
// db.pragma('foreing_keys = ON');

// // Utility functions for authentication
// export const hashPassword = (password: string): string => {
//     return crypto.createHash('sha256').update(password).digest('hex');
// };

// export const generateSessionId = (): string => {
//     return crypto.randomUUID();
// };

// // Export the database instance for use in other modules
// export { db };

// export default async function databaseRoutes (
//   fastify: FastifyInstance,
//   options: FastifyPluginOptions
// ) {

//   // example that updates a database table
//   fastify.get('/add-avatar', async (request, reply) => {
//     const insert = db.prepare('INSERT INTO avatars (path) VALUES (?)')
//     insert.run('/avatars/frog')
//     return {status: 'OK'}
//   })

//   /**
//    * A request with a query parameter will look for a specific table in the database. Example url: "/api/db/tables?tablename=avatars".
//    * Returns all table names if the tablename is not allowed or no parameter is provided.
//    */
//   fastify.get('/tables', async (request, reply) => {
//     const query = request.query as Record<string, unknown>
//     const tablename = query.tablename
//     if (typeof tablename === 'string') {
//       const allowedTables = [
//         "users",
//         "avatars",
//         "games",
//         "tournaments",
//         "user_sessions", // for auth
//         "chat_messages", // chat
//         "chat_users"     // chat
//       ]
//       if (allowedTables.indexOf(tablename) !== -1) {
//         const select = db.prepare(`SELECT * FROM ${tablename}`).all()
//         return {status: 'OK', select}
//       }
//     }
//     const tables = db.prepare("SELECT name FROM sqlite_schema WHERE type='table'").all()
//     return {status: 'OK', tables}
//   })

//   // database test endpoint
//   fastify.get('/test', async (request, reply) => {
//     try {
//       // Check user existence and count
//       const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
//       const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get()
      
//       return { 
//         success: true,
//         tables: tables.map(t => t.name),
//         userCount: userCount.count,
//         message: `Database is working! Found ${userCount.count} users.`
//       }
//     } catch (error) {
//       return { 
//         success: false, 
//         error: 'Database test failed', 
//         message: error.message 
//       }
//     }
//   })
    
//   // New auth test endpoint
//   fastify.get('/auth-test', async (request, reply) => {
//     try {
//       const sessionCount = db.prepare("SELECT COUNT(*) as count FROM user_sessions").get()
//       const onlineUsers = db.prepare("SELECT COUNT(*) as count FROM chat_users WHERE is_online = 1").get()
      
//       return { 
//         success: true,
//         sessionCount: sessionCount.count,
//         onlineUsers: onlineUsers.count,
//         message: `Auth system working! ${sessionCount.count} active sessions, ${onlineUsers.count} users online.`
//       }
//     } catch (error) {
//       return { 
//         success: false, 
//         error: 'Auth test failed', 
//         message: error.message 
//       }
//     }
//   })
// }


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
        // Create tables with proper schema
        // const createQueries = [
        //     // Users table
        //     `CREATE TABLE IF NOT EXISTS users (
        //         id INTEGER PRIMARY KEY AUTOINCREMENT,
        //         username TEXT UNIQUE NOT NULL,
        //         password TEXT NOT NULL,
        //         email TEXT,
        //         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        //         last_login DATETIME
        //     )`,
            
        //     // User sessions table
        //     `CREATE TABLE IF NOT EXISTS user_sessions (
        //         id TEXT PRIMARY KEY,
        //         user_id INTEGER NOT NULL,
        //         username TEXT NOT NULL,
        //         expires_at DATETIME NOT NULL,
        //         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        //         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        //     )`,
            
        //     // Chat messages table
        //     `CREATE TABLE IF NOT EXISTS chat_messages (
        //         id INTEGER PRIMARY KEY AUTOINCREMENT,
        //         user_id INTEGER NOT NULL,
        //         username TEXT NOT NULL,
        //         message TEXT NOT NULL,
        //         room_id TEXT DEFAULT 'general',
        //         timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        //         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        //     )`,
            
        //     // Chat users table (for online status)
        //     `CREATE TABLE IF NOT EXISTS chat_users (
        //         user_id INTEGER PRIMARY KEY,
        //         username TEXT NOT NULL,
        //         is_online BOOLEAN DEFAULT 0,
        //         last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        //         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        //     )`,
            
        //     // Avatars table
        //     `CREATE TABLE IF NOT EXISTS avatars (
        //         id INTEGER PRIMARY KEY AUTOINCREMENT,
        //         path TEXT NOT NULL UNIQUE,
        //         name TEXT,
        //         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        //     )`,
            
        //     // Games table
        //     `CREATE TABLE IF NOT EXISTS games (
        //         id INTEGER PRIMARY KEY AUTOINCREMENT,
        //         player1_id INTEGER,
        //         player2_id INTEGER,
        //         winner_id INTEGER,
        //         score_player1 INTEGER DEFAULT 0,
        //         score_player2 INTEGER DEFAULT 0,
        //         status TEXT DEFAULT 'pending',
        //         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        //         finished_at DATETIME,
        //         FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE SET NULL,
        //         FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL,
        //         FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
        //     )`,
            
        //     // Tournaments table
        //     `CREATE TABLE IF NOT EXISTS tournaments (
        //         id INTEGER PRIMARY KEY AUTOINCREMENT,
        //         name TEXT NOT NULL,
        //         description TEXT,
        //         max_participants INTEGER DEFAULT 8,
        //         status TEXT DEFAULT 'open',
        //         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        //         start_date DATETIME,
        //         end_date DATETIME
        //     )`,
            
        //     // Tournament participants table
        //     `CREATE TABLE IF NOT EXISTS tournament_participants (
        //         id INTEGER PRIMARY KEY AUTOINCREMENT,
        //         tournament_id INTEGER NOT NULL,
        //         user_id INTEGER NOT NULL,
        //         joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        //         FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
        //         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        //         UNIQUE(tournament_id, user_id)
        //     )`
        // ];

        // // Execute all table creation queries in a transaction
        // const createTables = db.transaction(() => {
        //     for (const query of createQueries) {
        //         console.log(`Creating table: ${query.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown'}`);
        //         db.prepare(query).run();
        //     }
        // });

        // createTables();

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