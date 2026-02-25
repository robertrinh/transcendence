import { db } from '../databaseInit.js'
import { ApiError } from '../error/errors.js'
import { dbError } from '../error/dbErrors.js'
import { Tournament, TournamentParticipant, Game } from '../types/database.interfaces.js';


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
			const user_already_in = db.prepare(
				'SELECT * FROM tournament_participants WHERE tournament_id = @tournament_id AND user_id = @user_id'
			).all({tournament_id: tournament_id, user_id: user_id})
			if (user_already_in.length === 0) {
				db.prepare('INSERT INTO tournament_participants (tournament_id, user_id) VALUES (?, ?)').run(tournament_id, user_id);
			}
        }
        catch (err: any) {
            dbError(err);
        }
    },

    startTournament: (tournament_id: number, participants: TournamentParticipant[]) => {
        const current_status = db.prepare('SELECT status, max_participants FROM tournaments WHERE id = ?').get(tournament_id) as Tournament;
        if (current_status.status != 'open')
            throw new ApiError(400, "tournament not open");

        // Must be full before starting
        if (participants.length < current_status.max_participants)
            throw new ApiError(400, `Need ${current_status.max_participants} players to start. Currently have ${participants.length}.`);

        // Must be a power of 2
        if (participants.length & (participants.length - 1))
            throw new ApiError(400, "Number of participants must be a power of 2");

        // Shuffle participants randomly
        const shuffled = [...participants].sort(() => Math.random() - 0.5);

        const rounds = Math.log2(shuffled.length);

        // Create round 1 games with actual players
        for (let i = 0; i < shuffled.length; i += 2) {
            db.prepare('INSERT INTO games (tournament_id, player1_id, player2_id, round, status) VALUES (?, ?, ?, 1, ?)')
                .run(tournament_id, shuffled[i].user_id, shuffled[i + 1].user_id, 'ready');
        }

        // Create placeholder games for future rounds
        for (let round = 2; round <= rounds; round++) {
            const gamesInRound = Math.pow(2, rounds - round);
            for (let i = 0; i < gamesInRound; i++) {
                db.prepare('INSERT INTO games (tournament_id, player1_id, player2_id, round, status) VALUES (?, NULL, NULL, ?, ?)')
                    .run(tournament_id, round, 'pending');
            }
        }

        db.prepare('UPDATE tournaments SET status = ? WHERE id = ?').run('ongoing', tournament_id);
    },

    // Called when a tournament game finishes — advances winner to next round
    advanceWinner: (game_id: number) => {
        const game = db.prepare('SELECT * FROM games WHERE id = ?').get(game_id) as Game | undefined;
        if (!game || !game.tournament_id || !game.winner_id)
            return;

        const tournament_id = game.tournament_id;
        const currentRound = game.round!;
        const nextRound = currentRound + 1;

        // Check if there are next round games
        const nextRoundGames = db.prepare(
            'SELECT * FROM games WHERE tournament_id = ? AND round = ? ORDER BY id ASC'
        ).all(tournament_id, nextRound) as Game[];

        if (nextRoundGames.length === 0) {
            // This was the final — check if game is finished
            console.log(`🏆 Tournament ${tournament_id} final completed! Winner: ${game.winner_id}`);
            db.prepare('UPDATE tournaments SET status = ?, winner_id = ?, end_date = datetime(\'now\') WHERE id = ?')
                .run('finished', game.winner_id, tournament_id);
            return;
        }

        // Find a next-round game that has an empty slot
        const nextGame = db.prepare(
            'SELECT * FROM games WHERE tournament_id = ? AND round = ? AND (player1_id IS NULL OR player2_id IS NULL) ORDER BY id ASC LIMIT 1'
        ).get(tournament_id, nextRound) as Game | undefined;

        if (nextGame) {
            if (nextGame.player1_id === null) {
                db.prepare('UPDATE games SET player1_id = ? WHERE id = ?')
                    .run(game.winner_id, nextGame.id);
                console.log(`➡️ Winner ${game.winner_id} placed in game ${nextGame.id} as player1`);
            } else {
                db.prepare('UPDATE games SET player2_id = ?, status = ? WHERE id = ?')
                    .run(game.winner_id, 'ready', nextGame.id);
                console.log(`➡️ Winner ${game.winner_id} placed in game ${nextGame.id} as player2 — game is READY`);
            }
        }
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
        catch (err: any) {
            dbError(err);
        }
    },

    getTournamentParticipants: (tournament_id: number) => {
        try {
            const participants = db.prepare('SELECT * FROM tournament_participants WHERE tournament_id = ?').all(tournament_id);
            return participants;
        }
        catch (err: any) {
            dbError(err);
            return [];
        }
    },

    getTournamentGames: (tournament_id: number) => {
        return db.prepare('SELECT * FROM games WHERE tournament_id = ?').all(tournament_id);
    }
}