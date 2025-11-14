PRAGMA foreign_keys=ON;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS avatars (
    id INTEGER PRIMARY KEY,
    path TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- Fixed: was missing comma
    created_at TEXT DEFAULT (datetime('now')),
    avatar_id INTEGER,
    email TEXT,              -- Added for auth
    last_login TEXT,         -- Added for auth tracking
    FOREIGN KEY(avatar_id) REFERENCES avatars(id)
);

-- CREATE TABLE IF NOT EXISTS users (
--     id INTEGER PRIMARY KEY,
--     username TEXT,
--     password TEXT,
--     created_at TEXT,
--     avatar_id INTEGER,
--     FOREIGN KEY(avatar_id) REFERENCES avatars(id)
-- );

CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY,
    player_one_id INTEGER,
    player_two_id INTEGER,
    created_at TEXT,
    player_one_score INTEGER,
    player_two_score INTEGER,
    FOREIGN KEY (player_one_id) REFERENCES users(id),
    FOREIGN KEY (player_two_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY,
    game_id INTEGER,
    round_type TEXT,
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- New tables for authentication, chat and messages
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT DEFAULT (datetime('now')),
    room_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS chat_users (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    is_online BOOLEAN DEFAULT 1,
    last_seen TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

COMMIT;