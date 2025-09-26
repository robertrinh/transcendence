import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

export function initDatabase() : Database.database {
	const dbPath = process.env.DB_PATH || 'app/database/transcendence.db'
	const dbDir = path.dirname(dbPath)

	// Check if database dir exists
	if (!existsSync(dbDir)) {
		mkdirSync(dbDir, { recursive: true })
		console.log('Database directory created')
	}

	const db = new Database(dbPath)
	db.pragma('foreign_keys = ON')
	db.pragma('journal_mode = WAL')

	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT null,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	//TODO Add more tables in time!

	console.log(`Database initialized at: ${dbPath}`)
	console.log(`Using Docker volume: transcendence_database`)
	return db
}
