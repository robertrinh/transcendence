import { db } from '../database.js'
import { ApiError } from '../Errors/errors.js'
import { dbError } from '../Errors/dbErrors.js';


export const tournamentService = {

	getAllTournaments: () => {
		return db.prepare('SELECT * FROM tournaments').all();
	},

	getTournamentByID: (id: number) => {
		return db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id);
	},

	createTournament: (name: string, description: string, max_participants: number) => {
		return db.prepare('INSERT INTO tournaments (name, description, max_participants) VALUES (?, ?, ?)').run(name, description, max_participants)
	},

	deleteTournament: (id: number) => {
		return db.prepare('DELETE FROM tournaments WHERE id = ?').run(id)
	},

	joinTournament: (tournament_id: number, user_id: number) => {
		try {
			db.prepare('INSERT INTO tournament_participants (tournament_id, user_id) VALUES (?, ?)').run(tournament_id, user_id);
		}
		catch (err:any) {
			dbError(err);
		}
	},

	leaveTournament: (tournament_id: number, user_id: number) => {
		try {
			const result = db.prepare('DELETE FROM tournament_participants WHERE tournament_id = ? AND user_id = ?').run(tournament_id, user_id);
			if (result.changes == 0)
				throw new ApiError(400, 'player or tournament not found');
		}
		catch (err:any) {
			dbError(err);
		}
	},

	getTournamentParticipants: (tournament_id: number) => {
		return db.prepare('SELECT * FROM tournament_participants WHERE tournament_id = ?').all(tournament_id);
	}
}