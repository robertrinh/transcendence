import { joinChat } from '../controllers/chatcontrollers.js';
import { db } from '../databaseInit.js'
import { dbError } from '../Errors/dbErrors.js'
import { ApiError } from '../Errors/errors.js';
import { Player, Game, Queue } from '../types/database.interfaces.js';


export const gamesService = {

	getAllGames: () => {
		return db.prepare('SELECT * FROM games').all();
	},

	addtoGameQueue: (player: number) => {
		const result = db.prepare('INSERT INTO game_queue (player_id) VALUES (?)').run(player);
		db.prepare('UPDATE users SET status = ? WHERE id = ?').run('searching', player);
		return result;
	},

	matchmakingStatus: (player_id: number) => {
		const player = db.prepare('SELECT status FROM users WHERE id = ?').get(player_id) as Player;
		if (player.status === 'matched') {
			db.prepare('UPDATE users SET status = ? WHERE id = ?').run('playing', player_id);
			return db.prepare('SELECT * FROM games WHERE player1_id = ? OR player2_id = ? ORDER BY created_at DESC').get(player_id, player_id); //return gamedata
		}
		if (player.status === 'searching') {
			const queue = db.prepare('SELECT joined_at FROM game_queue WHERE player_id = ?').get(player_id) as Queue;
			if (Date.now() - queue.joined_at * 1000 > 30000) { //timeout global 
				db.prepare('UPDATE users SET status = ? WHERE id = ?').run('idle', player_id); //timed out!!!!
				db.prepare('DELETE FROM game_queue WHERE player_id = ?').run(player_id);
				return db.prepare('SELECT status FROM users WHERE id = ?').get(player_id) as Player;
			}
		}
		return player;
	},

	createGame: (player: number, new_player: number) => {
		if (player === new_player)
			throw new ApiError(400, "duplicate player");
		try {
			const game_created = db.prepare('INSERT INTO games (player1_id, player2_id, status) VALUES(?, ?, ?) RETURNING *').run(player, new_player, 'ready');
			db.prepare('UPDATE users SET status = ? WHERE id = ? OR id = ?').run('matched', player, new_player);
			db.prepare('DELETE FROM game_queue WHERE player_id = ?').run(player);
			return game_created;
		}
		catch (err: any) {
			dbError(err);
		}
			
	},

	hostLobby: async (player_id: number) => {
		const hex = '0123456789abcdef';
		let output = '';
		for (let i = 0; i < 10; ++i) {
			output += hex.charAt(Math.floor(Math.random() * hex.length));
		}
		const queue = db.prepare('INSERT INTO game_queue (player_id, private, lobby_id) VALUES(?, ?, ?) RETURNING *').get(player_id, 1, output) as Queue;
		db.prepare('UPDATE users SET status = ? WHERE id = ?').run('searching', player_id)
		return queue;
		// return db.prepare('SELECT * FROM game_queue WHERE player_id = ?').get(player_id) as Queue;
	},

	fetchlobby: (lobby_id: string ) => {
		return db.prepare('SELECT * FROM game_queue WHERE lobby_id = ?').get(lobby_id) as Queue;
	},

	cancelMatchmaking: (player_id: number) => {
		db.prepare('UPDATE users SET status = ? WHERE id = ?').run('idle', player_id)
		return db.prepare('DELETE FROM game_queue WHERE player_id = ?').run(player_id)
	},

	fetchGame: (id: number | bigint) =>{
		return db.prepare('SELECT * FROM games WHERE id = ?').get(id);
	},

	fetchGameQueue: () =>{
		return db.prepare('SELECT * FROM game_queue').all() as Queue[];
	},

	removeGame: (id: number) => {
		return db.prepare('DELETE FROM games WHERE id = ?').run(id)
	},

	updateGame: (id:number, score_player1:number, score_player2:number) => {
		return db.prepare(' UPDATE games SET score_player1 = ?, score_player2 = ? WHERE id = ?').run(score_player1, score_player2, id)
	},

	finishGame: (id:number, score_player1:number, score_player2:number, winner_id: number, finished_at: number) =>{
		const gameObj = gamesService.fetchGame(id) as Game;
		if (gameObj.status !== 'ready')
			throw new ApiError(400, 'game not ongoing');
		try {
			db.prepare('UPDATE users SET status = ? WHERE id = ? OR id = ?').run('finished', gameObj.player1_id, gameObj.player2_id);
			return db.prepare(' UPDATE games SET winner_id = ?, score_player1 = ?, score_player2 = ?, finished_at = ?, status = ? WHERE id = ?').run(winner_id, score_player1, score_player2, finished_at, 'finished', id)
		}
		catch (err:any) {
			dbError(err);
		}
	}
}