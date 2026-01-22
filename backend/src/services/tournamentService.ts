import { db } from '../database.js'
import { ApiError } from '../Errors/errors.js'
import { dbError } from '../Errors/dbErrors.js'
import { Tournament,  TournamentParticipant, Game } from '../types/tournament.types.js';


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
			db.prepare('INSERT INTO tournament_participants (tournament_id, user_id) VALUES (?, ?)').run(tournament_id, user_id); //fails here if tournement doesnt exists. checks if player exist or tournament exists
		}
		catch (err:any) {
			dbError(err);
		}
	},

	startTournament: (tournament_id: number, participants: TournamentParticipant[]) => {
		//do i neeed checks if it always comes through joinTournament? : CHECK
		const current_status = db.prepare('SELECT status FROM tournaments WHERE id = ?').get(tournament_id) as Tournament;
		if (current_status.status != 'open')
			throw new ApiError(400, "tournament not open");

		const rounds  = Math.log2(participants.length);
		for (let i = 0; i < participants.length; i += 2)
		{
			db.prepare('INSERT INTO games (tournament_id, player1_id, player2_id, round, status) VALUES (?, ?, ?, 1, ?)').run(tournament_id, participants[i].user_id, participants[i + 1].user_id, 'ready')
		}
		for (let round = 2; round <= rounds; round++)
		{
			let gamesInRound: number = Math.pow(2, rounds - round);
			for (let i = 0; i < gamesInRound; i++)
			{
				db.prepare('INSERT INTO games (tournament_id, player1_id, player2_id, round, status) VALUES (?, NULL, NULL, ?, ?)').run(tournament_id, round, 'pending')
			}
			//if tournament cancels, delete these games! : TODO (something on delete cascade in the database??)
		}
		db.prepare('update tournaments SET status = ? WHERE id = ?').run('ongoing', tournament_id);
	},

	//or in a try catch statement? : CHECK
	//only GAMESERVER allowed! auth token!! : TODO
	//how to let frontend know next round of games is ready? : CHECK
	recordResult: (tournament_id: number, game_id: number, score1: number, score2: number, winner_id: number) => {
		const game = db.prepare('SELECT * FROM games WHERE id = ?').get(game_id) as Game | undefined;
		if (!game)
			throw new ApiError(404, 'game not found');
		db.prepare('UPDATE games SET score_player1 = ?, score_player2 = ?, winner_id = ?, status = ? WHERE id = ?').run(score1, score2, winner_id, 'finished', game_id);

		const nextGame = db.prepare('SELECT * FROM games WHERE tournament_id = ? AND round = ? AND (player1_id IS NULL OR player2_id IS NULL)').get(tournament_id, game.round! +1) as Game | undefined;
		if (nextGame)
		{
			if (nextGame.player1_id === null)
				db.prepare('UPDATE games SET player1_id = ? WHERE id =?').run(winner_id, nextGame.id);
			else
				db.prepare('UPDATE games SET player2_id = ?, status = ? WHERE id =?').run(winner_id, 'ready', nextGame.id);
			return {nextGame: nextGame, tournamentFinished: false, message: 'next round in tournament ready'}
		}
		else {
			db.prepare('UPDATE tournaments SET status = ?, winner_id = ?, end_date = ? WHERE id = ?').run('finished', winner_id, Date(), tournament_id);
			return {nextGame: null, tournamentFinished: true, message: 'tournament finished' }
		}
	},

	finishTournament: (tournament_id: number) => {

	},

	leaveTournament: (tournament_id: number, user_id: number) => {
		try {
			const status = db.prepare('SELECT status FROM tournaments WHERE id = ?').get(tournament_id) as Tournament;
			if (status.status !== 'open')
				throw new ApiError(400, 'tournament already started');
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