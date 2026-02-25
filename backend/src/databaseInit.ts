import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
	return bcrypt.hash(password, 10);
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
	return bcrypt.compare(password, hashedPassword);
}

// Ensure database directory exists
const dbDir = path.resolve('./database');
if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
    console.log('Created database directory:', dbDir);
}

// Database path
const dbPath = path.resolve('./database/transcendence.db');
console.log('Initializing database at:', dbPath);

// Export the database instance
// Create database connection
export const db = new Database(dbPath);

// Reserved for system messages (chat join/leave, etc.)
export const SYSTEM_USERNAME = 'System';

// Enable foreign keys and WAL mode for better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Database initialization function
export const initializeDatabase = () => {
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
                const adminPassword = bcrypt.hashSync('admin123', 10); // Sync for one-time init
                const insertAdmin = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
                insertAdmin.run('admin', adminPassword, 'admin@transcendence.local');
                console.log('✅ Default admin user created (username: admin, password: admin123)');
            }
            const testerCheck = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('tester') as { count: number };
            if (testerCheck.count === 0) {
                const testerPassword = bcrypt.hashSync('tester123', 10); // Sync for one-time init
                const inserttester = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
                inserttester.run('tester', testerPassword, 'tester@transcendence.local');
                console.log('✅ Default tester user created (username: tester, password: tester123)');
            }
            // System user: reserved for chat/tournament system messages;
            const systemCheck = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get(SYSTEM_USERNAME) as { count: number };
            if (systemCheck.count === 0) {
                db.prepare('INSERT INTO users (username, is_guest) VALUES (?, 1)').run(SYSTEM_USERNAME);
                console.log('✅ System user created (reserved for system messages)');
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
