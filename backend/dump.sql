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
    is_guest BOOLEAN DEFAULT 0,
    nickname TEXT UNIQUE,
    display_name TEXT,
    password TEXT,
    created_at DATETIME DEFAULT (datetime('now')),
    avatar_id INTEGER,
    email TEXT,
    status TEXT CHECK (status IN ('idle', 'searching', 'matched', 'playing')) DEFAULT 'idle',
    last_login DATETIME,
    two_factor_secret TEXT,              -- 2FA TOTP secret key
    two_factor_enabled BOOLEAN DEFAULT 0, -- to check if 2FA is enabled
    is_anonymous BOOLEAN DEFAULT 0,
    anonymized_at DATETIME,
    FOREIGN KEY(avatar_id) REFERENCES avatars(id)
);

CREATE TABLE IF NOT EXISTS game_queue (
	player_id INTEGER PRIMARY KEY,
    joined_at INTEGER DEFAULT (strftime('%s','now')),
    lobby_id TEXT,
    private BOOLEAN DEFAULT 0,
	UNIQUE(player_id)
);
-- for performance, instead of looping all the user's, it sorts the ones with the anonymous mode. less QUERY search
CREATE INDEX IF NOT EXISTS idx_users_anonymous ON users(is_anonymous);

CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY,
    player1_id INTEGER, --NULL for tournament placeholder games
    player2_id INTEGER, --NULL for tournament placeholder games
	score_player1 INTEGER DEFAULT 0,
	score_player2 INTEGER DEFAULT 0,
	winner_id INTEGER,
	tournament_id INTEGER, --NULL for single game
    round INTEGER, --NULL for single game
    status TEXT CHECK (status IN ('pending', 'ready', 'ongoing', 'finished', 'cancelled')) DEFAULT 'pending',
	created_at DATETIME DEFAULT (datetime('now')),
	finished_at DATETIME,
	FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE SET NULL,
	FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL,
	FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
	FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL

);

CREATE TABLE IF NOT EXISTS tournaments (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	description TEXT,
	max_participants INTEGER DEFAULT 8,
    status TEXT CHECK (status IN ('open', 'ongoing', 'finished', 'cancelled')) DEFAULT 'open',
	winner_id INTEGER,
    created_at DATETIME DEFAULT (datetime('now')),
	start_date DATETIME, --necessary?
	end_date DATETIME
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
	id INTEGER PRIMARY KEY AUTOINCREMENT, --what is this? 
	tournament_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	joined_at DATETIME DEFAULT (datetime('now')),
	FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	UNIQUE(tournament_id, user_id)
);

COMMIT;
