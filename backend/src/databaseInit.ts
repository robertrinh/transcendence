import Database from 'better-sqlite3';
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

const dbPath = path.resolve('./database/transcendence.db');
console.log('Initializing database at:', dbPath);

// Export the database instance
// Create database connection
export const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export const initializeDatabase = () => {
    console.log('Initializing database schema...');
    
    try {
        const insertDefaults = db.transaction(() => {
            const adminCheck = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin') as { count: number };
            if (adminCheck.count === 0) {
                const adminPassword = bcrypt.hashSync('admin123', 10); // Sync for one-time init
                const insertAdmin = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
                insertAdmin.run('admin', adminPassword, 'admin@transcendence.local');
            }
            const testerCheck = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('tester') as { count: number };
            if (testerCheck.count === 0) {
                const testerPassword = bcrypt.hashSync('tester123', 10); // Sync for one-time init
                const inserttester = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
                inserttester.run('tester', testerPassword, 'tester@transcendence.local');
            }
            const systemCheck = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('System') as { count: number };
            if (systemCheck.count === 0) {
                db.prepare('INSERT INTO users (username, is_guest) VALUES (?, 1)').run('System');
                console.log('System user created (reserved for system messages)');
            }
            const systemLowerCheck = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('system') as { count: number };
            if (systemLowerCheck.count === 0) {
                db.prepare('INSERT INTO users (username, is_guest) VALUES (?, 1)').run('system');
                console.log('system user created (reserved)');
            }
        });

        insertDefaults();

        // Verify tables exist
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[];
        console.log('Database tables created:', tables.map(t => t.name).join(', '));

        // Verify users table has data
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
        console.log(`Users in database: ${userCount.count}`);

        console.log('Database initialization completed successfully!');
        return true;
    } catch (error) {
        console.error('Database initialization failed:', error);
        return false;
    }
};

// Initialize database immediately
const dbInitialized = initializeDatabase();
if (!dbInitialized) {
    console.error('CRITICAL: Database initialization failed! Exiting...');
    process.exit(1);
}
