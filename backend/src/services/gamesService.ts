import { db } from '../databaseInit.js'
import { dbError } from '../error/dbErrors.js'
import { ApiError } from '../error/errors.js';
import { Player, Queue, Game } from '../types/database.interfaces.js'
import { tournamentService } from './tournamentService.js'

const TIMEOUT_MATCHMAKING = 30000 //in millisec

// In-memory ready state (game_id -> Set of player_ids who are ready)
const readyPlayers: Map<number, Set<number>> = new Map();

export const gamesService = {

    getAllGames: () => {
        return db.prepare('SELECT * FROM games').all();
    },

    fetchGame: (id: number | bigint) => {
        return db.prepare('SELECT * FROM games WHERE id = ?').get(id);
    },

    fetchPrivateGame: (lobby_id: string) => {
        return db.prepare('SELECT * FROM games WHERE lobby_id = ?').get(lobby_id)
    },

    addtoGameQueue: (player: number) => {
        const result = db.prepare('INSERT INTO game_queue (player_id) VALUES (?)').run(player);
        db.prepare('UPDATE users SET status = ? WHERE id = ?').run('searching', player);
        return result;
    },

    fetchGameQueue: () => {
        return db.prepare('SELECT * FROM game_queue').all() as Queue[];
    },

    findWaitingPlayer: (player_id: number) => {
        return db.prepare('SELECT player_id, joined_at FROM game_queue WHERE player_id != ? AND private = 0 ORDER BY joined_at ASC LIMIT 1 ').get(player_id) as Queue | undefined;
    },

    addGame: (player1_id: number, player2_id: number) => {
        try {
            return db.prepare('INSERT INTO games (player1_id, player2_id) VALUES (?, ?)').run(player1_id, player2_id);
        }
        catch (err: any) {
            dbError(err);
        }
    },

    createGame: (player: number, new_player: number, lobby_id?: string) => {
        if (player === new_player)
            throw new ApiError(400, "duplicate player");
        try {
            let game_created: Game;
            if (lobby_id === undefined) {
                game_created = db.prepare('INSERT INTO games (player1_id, player2_id, status) VALUES(?, ?, ?) RETURNING *')
                    .get(player, new_player, 'ready') as Game;
            }
            else {
                game_created = db.prepare('INSERT INTO games (lobby_id, player1_id, player2_id, status) VALUES(?, ?, ?, ?) RETURNING *')
                    .get(lobby_id, player, new_player, 'ready') as Game;
            }
            db.prepare('UPDATE users SET status = ? WHERE id = ? OR id = ?').run('playing', player, new_player);
            db.prepare('DELETE FROM game_queue WHERE player_id = ?').run(player);
            return game_created;
        }
        catch (err: any) {
            dbError(err);
        }
    },

    matchmakingStatus: (player_id: number) => {
        const player = db.prepare('SELECT status FROM users WHERE id = ?').get(player_id) as Player;
        if (player.status === 'playing') {
            db.prepare('UPDATE users SET status = ? WHERE id = ?').run('playing', player_id);
            return db.prepare('SELECT * FROM games WHERE player1_id = ? OR player2_id = ? ORDER BY created_at DESC LIMIT 1').get(player_id, player_id);
        }
        if (player.status === 'searching') {
            const queue = db.prepare('SELECT joined_at FROM game_queue WHERE player_id = ?').get(player_id) as Queue;
            if (Date.now() - queue.joined_at * 1000 > TIMEOUT_MATCHMAKING) {
                db.prepare('UPDATE users SET status = ? WHERE id = ?').run('idle', player_id);
                db.prepare('DELETE FROM game_queue WHERE player_id = ?').run(player_id);
                return db.prepare('SELECT status FROM users WHERE id = ?').get(player_id) as Player;
            }
        }
        return player;
    },

    cancelMatchmaking: (player_id: number) => {
        db.prepare('UPDATE users SET status = ? WHERE id = ?').run('idle', player_id)
        return db.prepare('DELETE FROM game_queue WHERE player_id = ?').run(player_id)
    },

    hostLobby: (player_id: number) => {
        const lobby_id = generateLobbyId();
        const queue = db.prepare('INSERT INTO game_queue (player_id, private, lobby_id) VALUES(?, ?, ?) RETURNING *').get(player_id, 1, lobby_id) as Queue;
        db.prepare('UPDATE users SET status = ? WHERE id = ?').run('searching', player_id)
        return queue;
    },

    fetchlobby: (lobby_id: string) => {
        return db.prepare('SELECT * FROM game_queue WHERE lobby_id = ?').get(lobby_id) as Queue;
    },

    setPlayerReady: (game_id: number, player_id: number) => {
        const game = db.prepare('SELECT * FROM games WHERE id = ?').get(game_id) as Game | undefined;
        if (!game)
            throw new ApiError(404, 'Game not found');
        if (game.player1_id !== player_id && game.player2_id !== player_id)
            throw new ApiError(403, 'Player not in this game');

        if (!readyPlayers.has(game_id))
            readyPlayers.set(game_id, new Set());
        readyPlayers.get(game_id)!.add(player_id);

        const allReady = readyPlayers.get(game_id)!.has(game.player1_id!)
            && readyPlayers.get(game_id)!.has(game.player2_id!);

        return {
            game_id,
            player1_ready: readyPlayers.get(game_id)!.has(game.player1_id!),
            player2_ready: readyPlayers.get(game_id)!.has(game.player2_id!),
            all_ready: allReady,
        };
    },

    getReadyStatus: (game_id: number) => {
        const game = db.prepare('SELECT * FROM games WHERE id = ?').get(game_id) as Game | undefined;
        if (!game)
            throw new ApiError(404, 'Game not found');

        const readySet = readyPlayers.get(game_id) || new Set();

        return {
            game_id,
            player1_id: game.player1_id,
            player2_id: game.player2_id,
            player1_ready: readySet.has(game.player1_id!),
            player2_ready: readySet.has(game.player2_id!),
            all_ready: readySet.has(game.player1_id!) && readySet.has(game.player2_id!),
        };
    },

    finishGame: (id: number, score_player1: number, score_player2: number, winner_id: number, finished_at: string) => {
        const gameObj = gamesService.fetchGame(id) as Game;
        if (!gameObj)
            throw new ApiError(404, 'Game not found');

        db.prepare('UPDATE games SET score_player1 = ?, score_player2 = ?, winner_id = ?, finished_at = ?, status = ? WHERE id = ?')
            .run(score_player1, score_player2, winner_id, finished_at, 'finished', id);

        // Reset player status back to idle (not 'online' — schema only allows idle/searching/playing)
        if (gameObj.player1_id)
            db.prepare('UPDATE users SET status = ? WHERE id = ?').run('idle', gameObj.player1_id);
        if (gameObj.player2_id)
            db.prepare('UPDATE users SET status = ? WHERE id = ?').run('idle', gameObj.player2_id);

        // Advance winner in tournament if applicable
        if (gameObj.tournament_id) {
            tournamentService.advanceWinner(id);
        }
    },
}

function generateLobbyId(): string {
    const hex = '0123456789abcdef';
    let output = '';
    for (let i = 0; i < 10; ++i) {
        output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return output;
}