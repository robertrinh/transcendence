import { db } from '../databaseInit.js'
import { dbError } from '../Errors/dbErrors.js'
import { ApiError } from '../Errors/errors.js';
import { Player, Game } from '../types/database.interfaces.js';


export const gamesService = {

	getAllGames: () => {
		return db.prepare('SELECT * FROM games').all();
	},

	addtoGameQueue: (player: number) => {
		return db.prepare('INSERT INTO game_queue (player_id) VALUES (?)').run(player);
	},

	createGame: (player: number, new_player: number) => {
		if (player === new_player)
			throw new ApiError(400, "duplicate player");
		try {
			const game_created = db.prepare('INSERT INTO games (player1_id, player2_id, status) VALUES(?, ?, ?) RETURNING *').run(player, new_player, 'ready');
			db.prepare('UPDATE users SET status = ? WHERE id = ? OR id = ?').run('playing', player, new_player);
			db.prepare('DELETE FROM game_queue WHERE player_id = ?').run(player);
			return game_created;
		}
		catch (err: any) {
			dbError(err);
		}
		
	},

	fetchGame: (id: number | bigint) =>{
		return db.prepare('SELECT * FROM games WHERE id = ?').get(id);
	},

	fetchGameQueue: () =>{
		return db.prepare('SELECT * FROM game_queue').get() as Player;
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