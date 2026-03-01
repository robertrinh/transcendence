BEGIN TRANSACTION;
PRAGMA foreign_keys = 1;

CREATE TABLE IF NOT EXISTS avatars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
	created_at DATETIME DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL CHECK(length(username) < 15),
    is_guest BOOLEAN CHECK(is_guest IN (0,1)) DEFAULT 0 NOT NULL,
    nickname TEXT UNIQUE CHECK(length(nickname) < 15),
    display_name TEXT CHECK(length(display_name) < 15),
    password TEXT,
    created_at DATETIME DEFAULT (datetime('now')) NOT NULL,
    avatar_id INTEGER,
    email TEXT CHECK(length(email) < 65),
    status TEXT CHECK (status IN ('idle', 'searching', 'playing')) DEFAULT 'idle' NOT NULL,
    two_factor_secret TEXT,
    two_factor_enabled BOOLEAN CHECK(two_factor_enabled IN (0,1)) DEFAULT 0 NOT NULL,
    is_anonymous BOOLEAN CHECK(is_anonymous IN (0,1)) DEFAULT 0 NOT NULL,
    anonymized_at DATETIME,
    FOREIGN KEY(avatar_id) REFERENCES avatars(id)
);

-- for performance, instead of looping all the user's, it sorts the ones with the anonymous mode. less QUERY search
CREATE INDEX IF NOT EXISTS idx_users_anonymous ON users(is_anonymous);

CREATE TABLE IF NOT EXISTS game_queue (
	player_id INTEGER UNIQUE NOT NULL,
    joined_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL,
    lobby_id TEXT CHECK(length(lobby_id < 11)),
    private BOOLEAN CHECK(private IN (0,1)) DEFAULT 0 NOT NULL,
	FOREIGN KEY(player_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY NOT NULL,
    player1_id INTEGER, --NULL for tournament placeholder games
    player2_id INTEGER, --NULL for tournament placeholder games
	score_player1 INTEGER DEFAULT 0 NOT NULL,
	score_player2 INTEGER DEFAULT 0 NOT NULL,
	winner_id INTEGER CHECK(winner_id IN (player1_id, player2_id, NULL)),
	tournament_id INTEGER,
    round INTEGER,
    status TEXT CHECK (status IN ('pending', 'ready', 'ongoing', 'finished', 'cancelled')) DEFAULT 'pending',
	created_at DATETIME DEFAULT (datetime('now')) NOT NULL,
	finished_at DATETIME,
	FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE SET NULL,
	FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL,
	FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
	FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tournaments (
	id INTEGER PRIMARY KEY,
	name TEXT CHECK(length(name) < 15) NOT NULL,
	description TEXT CHECK(length(description) < 101),
	max_participants INTEGER CHECK(max_participants IN (4, 8, 16)),
    status TEXT CHECK (status IN ('open', 'ongoing', 'finished', 'cancelled')) DEFAULT 'open',
	winner_id INTEGER,
    created_at DATETIME DEFAULT (datetime('now')) NOT NULL,
	start_date DATETIME,
	end_date DATETIME,
	FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- New tables for authentication, chat and messages
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL, --delete later
    created_at DATETIME DEFAULT (datetime('now')) NOT NULL, --some validation for valid date?
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL, --delete later
    message TEXT NOT NULL CHECK(length(message) < 256),
    timestamp DATETIME DEFAULT (datetime('now')) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_users (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL, --delete later
    is_online BOOLEAN CHECK(is_online IN (0,1)) DEFAULT 0 NOT NULL,
    last_seen DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friends (
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    CHECK (user_id != friend_id),
    FOREIGN KEY (friend_id) REFERENCES users (id) ON DELETE CASCADE
	FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friend_request (
    requester_id INTEGER NOT NULL,
    requested_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')) NOT NULL,
    CHECK (requester_id != requested_id),
    FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE
	FOREIGN KEY (requested_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blocked (
    user_id INTEGER NOT NULL,
    blocked_id INTEGER NOT NULL,
    CHECK (user_id != blocked_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tournament_participants (
	tournament_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	user_left BOOLEAN CHECK(user_left IN (0,1)) DEFAULT 0 NOT NULL,
	joined_at DATETIME DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	UNIQUE(tournament_id, user_id)
);

COMMIT;
