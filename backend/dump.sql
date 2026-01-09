PRAGMA foreign_keys=ON;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS avatars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
	name TEXT,
	created_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    nickname TEXT UNIQUE,
    display_name TEXT,
    password TEXT NOT NULL,  -- Fixed: was missing comma
    created_at DATETIME DEFAULT (datetime('now')),
    avatar_id INTEGER,
    email TEXT,              -- Added for auth
    last_login DATETIME,         -- Added for auth tracking
    FOREIGN KEY(avatar_id) REFERENCES avatars(id)
);

CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY,
    player1_id INTEGER,
    player2_id INTEGER,
	winner_id INTEGER,
	score_player1 INTEGER DEFAULT 0,
	score_player2 INTEGER DEFAULT 0,
	status TEXT DEFAULT 'pending',
	created_at DATETIME DEFAULT (datetime('now')),
	finished_at DATETIME,
	FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE SET NULL,
	FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL,
	FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tournaments (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	game_id INTEGER,
	name TEXT NOT NULL,
	description TEXT,
	max_participants INTEGER DEFAULT 8,
	status TEXT DEFAULT 'open',
	created_at DATETIME DEFAULT (datetime('now')),
	start_date DATETIME,
	end_date DATETIME,
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- New tables for authentication, chat and messages
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT (datetime('now')),
    room_id TEXT DEFAULT 'general',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_users (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    is_online BOOLEAN DEFAULT 0,
    last_seen DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tournament_participants (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	tournament_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	joined_at DATETIME DEFAULT (datetime('now')),
	FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	UNIQUE(tournament_id, user_id)
);

COMMIT;
