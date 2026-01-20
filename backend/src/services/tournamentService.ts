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
			//if status of tourment is 'ongoing'
				//throw apiError(400, 'tournament already started');
			// const active_participants: number = db.prepare('SELECT COUNT(*) FROM tournamnents WHERE id = ?').get(tournament_id);
			//if (active_participants < max_paticipants) {insert into db} else {startTournament} (HOW DOES THIS WORK WITH COMMUNICATING with THE FRONTEND that it is starting?)  
			db.prepare('INSERT INTO tournament_participants (tournament_id, user_id) VALUES (?, ?)').run(tournament_id, user_id); //fails here if tournement exists. checks if player exist or tournament exists
		}
		catch (err:any) {
			dbError(err);
		}
	},

	startTournament: (tournament_id: number) => {
		// const active_participants: number = db.prepare('SELECT COUNT(*) FROM tournamnents WHERE id = ?').get(tournament_id); //if active_participants < min_participants --> throw new ApiError(400, not enough players to start tournament)
		const current_status = db.prepare('SELECT status FROM tournaments WHERE id = ?').get(tournament_id);
		if (current_status != 'open')
			throw new ApiError(400, "tournament not open");
		db.prepare('update tournaments SET status = ongoing WHERE id = ?').get(tournament_id);
		//create first round of games
	},

	leaveTournament: (tournament_id: number, user_id: number) => {
		try {
			const result = db.prepare('DELETE FROM tournament_participants WHERE tournament_id = ? AND user_id = ?').run(tournament_id, user_id);
			if (result.changes == 0)
				throw new ApiError(404, 'player or tournament not found');
		}
		catch (err:any) {
			dbError(err);
		}
	},

	getTournamentParticipants: (tournament_id: number) => {
		try {
			const participants = db.prepare('SELECT * FROM tournament_participants WHERE tournament_id = ?').all(tournament_id);
			return participants;
		}
		catch (err:any) {
			dbError(err);
			return [];
		}
	},

	getTournamentGames: (tournament_id: number) => {
		return db.prepare('SELECT * FROM games WHERE tournament_id = ?').all(tournament_id);
	}
}