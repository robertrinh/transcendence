import { db } from '../databaseInit.js'
import { dbError } from '../Errors/dbErrors.js'
import { ApiError } from '../Errors/errors.js';
import { Player, Queue, Game, GameHistoryItem, LeaderBoard } from '../types/database.interfaces.js'

const TIMEOUT_MATCHMAKING = 30000 //in millisec

export const gamesService = {

	getAllGames: () => {
		return db.prepare('SELECT * FROM games').all();
	},

	fetchGame: (id: number | bigint) =>{
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

	fetchGameQueue: () =>{
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
			return db.prepare('SELECT * FROM games WHERE player1_id = ? OR player2_id = ? ORDER BY created_at DESC LIMIT 1').get(player_id, player_id); //return gamedata
		}
		if (player.status === 'searching') {
			const queue = db.prepare('SELECT joined_at FROM game_queue WHERE player_id = ?').get(player_id) as Queue;
			if (Date.now() - queue.joined_at * 1000 > TIMEOUT_MATCHMAKING) {
				db.prepare('UPDATE users SET status = ? WHERE id = ?').run('idle', player_id); //timed out!!!!
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

	fetchlobby: (lobby_id: string ) => {
		return db.prepare('SELECT * FROM game_queue WHERE lobby_id = ?').get(lobby_id) as Queue;
	},

	finishGame: (id:number, score_player1:number, score_player2:number, winner_id: number, finished_at: string) =>{
		const gameObj = gamesService.fetchGame(id) as Game;
		if (gameObj.status !== 'ready') //check this
			throw new ApiError(400, 'game not ongoing');
		try {
			db.prepare('UPDATE users SET status = ? WHERE id = ? OR id = ?').run('idle', gameObj.player1_id, gameObj.player2_id);
			return db.prepare(' UPDATE games SET winner_id = ?, score_player1 = ?, score_player2 = ?, finished_at = ?, status = ? WHERE id = ?').run(winner_id, score_player1, score_player2, finished_at, 'finished', id)
		}
		catch (err:any) {
			dbError(err);
		}
	},

	getLeaderboard: () => {
		return db.prepare(`WITH player_games AS (
			SELECT 
				player1_id AS player_id,
				winner_id
			FROM games WHERE status = 'finished'
			UNION ALL
			SELECT 
				player2_id AS player_id,
				winner_id 
			FROM games WHERE status = 'finished'
			)
			SELECT 
				users.username,
				SUM (CASE player_id
					WHEN winner_id
						THEN 1
					ELSE 0
				END) as wins, 
				SUM (CASE player_id
					WHEN winner_id
						THEN 0
					ELSE 1
				END) as losses 
			FROM player_games 
			JOIN users ON player_id = users.id
			GROUP BY player_id
			ORDER BY wins DESC`).all() as LeaderBoard[]
	},
	
	getGameByUserID: (player_id: number) => {
		return db.prepare(
			`WITH view_own AS (
				SELECT
					games.id,
					games.created_at,
					games.finished_at,
					@player_id AS own_id,
					CASE
						WHEN games.player1_id = @player_id
							THEN games.player2_id
						ELSE games.player1_id
					END opp_id,
					CASE
						WHEN games.player1_id = @player_id
							THEN games.score_player1
						ELSE games.score_player2
					END score_own,
					CASE
						WHEN games.player1_id != @player_id
							THEN games.score_player1
						ELSE games.score_player2
					END score_opp
				FROM games
				WHERE (games.player1_id = @player_id OR games.player2_id = @player_id) AND games.status = 'finished'
			),
			view_winner AS (
				SELECT
					view_own.id,
					users_own.username AS username_own,
					CASE users_opp.is_anonymous
						WHEN 1
							THEN 'Anonymous'
						ELSE users_opp.username
					END username_opp,
					view_own.score_own,
					view_own.score_opp,
					view_own.created_at,
					view_own.finished_at
				FROM view_own
				LEFT JOIN users users_own ON view_own.own_id = users_own.id
				LEFT JOIN users users_opp ON view_own.opp_id = users_opp.id
			)
			SELECT
				id,
				username_own,
				username_opp AS username_opponent,
				score_own,
				score_opp AS score_opponent,
				CASE
					WHEN score_own > score_opp
						THEN username_own
					ELSE username_opp
				END username_winner,
				created_at,
				finished_at
			FROM view_winner`
		).all({player_id: player_id}) as GameHistoryItem[]
	}

}

function generateLobbyId(): string {
	const hex = '0123456789abcdef';
	let output = '';
	for (let i = 0; i < 10; ++i) {
		output += hex.charAt(Math.floor(Math.random() * hex.length));
	}
	return output;
}