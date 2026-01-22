import { db } from '../databaseInit.js'
import { dbError } from '../Errors/dbErrors.js'


export const gamesService = {

	getAllGames: () => {
		return db.prepare('SELECT * FROM games').all();
	},

	addGame: (player1_id: number, player2_id: number) => {
		try {
			return db.prepare('INSERT INTO games (player1_id, player2_id) VALUES (?, ?)').run(player1_id, player2_id);
		} 
		catch (err: any) {
			dbError(err);
		}
	},

	fetchGame: (id: number) =>{
		return db.prepare('SELECT * FROM games WHERE id = ?').get(id);
	},

	removeGame: (id: number) => {
		return db.prepare('DELETE FROM games WHERE id = ?').run(id)
	},

	updateGame: (id:number, score_player1:number, score_player2:number) => {
		return db.prepare(' UPDATE games SET score_player1 = ?, score_player2 = ? WHERE id = ?').run(score_player1, score_player2, id)
	},

	finishGame: (id:number, score_player1:number, score_player2:number, winner_id: number, finished_at: number) =>{
		return db.prepare(' UPDATE games SET winner_id = ?, score_player1 = ?, score_player2 = ?, finished_at = ?, status = ? WHERE id = ?').run(winner_id, score_player1, score_player2, finished_at, 'finished', id)
	}
}