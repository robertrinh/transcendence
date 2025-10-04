PRAGMA foreign_keys=ON;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS avatars (
    id INTEGER PRIMARY KEY,
    path TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT
    password TEXT,
    created_at TEXT,
    avatar_id INTEGER,
    FOREIGN KEY(avatar_id) REFERENCES avatars(id)
);

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
COMMIT;