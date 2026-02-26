import { ApiError } from '../error/errors.js';
import { tournamentService } from '../services/tournamentService.js'
import { FastifyRequest, FastifyReply } from 'fastify';
import { Tournament, TournamentParticipant } from '../types/database.interfaces.js';
import { systemBroadcast } from '../sseNotify.js';

export const tournamentController = {
	getAllTournaments: async (req: FastifyRequest, reply: FastifyReply) => {
		const tournaments = tournamentService.getAllTournaments();
		if (tournaments.length == 0)
			throw new ApiError(404, 'No tournament found');
		return {success: true, data: tournaments }
	},

	getTournamentByID: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number };
		const tournament = tournamentService.getTournamentByID(id);
		if (!tournament)
			throw new ApiError(404, 'Tournament not found');
		
		const participants = tournamentService.getTournamentParticipants(id);
		const games = tournamentService.getTournamentGames(id);
		return { success: true, data: tournament, games, participants }
	},

	//this endpoint can be called if a player clicks "join tournament" and NO open tournament exist currently
	//add a alternative in frontend when clicking join tournament for how many participants. 2 4 8 or 16 so its fixed size tournament
	//returns the id of the tournament to be used when polling from the frontend to check if tournament is starting
	createTournament: async (req: FastifyRequest, reply: FastifyReply) => {
        const user_id = req.user!.userId;
        const {name, description, max_participants } = req.body as {name: string, description: string, max_participants: number };
        const result = tournamentService.createTournament(name, description, max_participants);
        if (result.changes == 0)
            throw new ApiError(404, 'something went wrong creating tournament');
		systemBroadcast(`Tournament "${name}" opened!`)
        tournamentService.joinTournament(result.lastInsertRowid as number, user_id); 
        return {success: true, data: { id: result.lastInsertRowid, max_participants }, message: 'Tournament successfully created and creator joined!'};
    },

	//player clicks "join tournament" and an open tournament exists --> player will be added AND start Tournament if full
	joinTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as {id: number};
		const user_id = req.user!.userId;

		const tournament = tournamentService.getTournamentByID(id) as Tournament;
		const participants = tournamentService.getTournamentParticipants(id);

		if (participants.length >= tournament.max_participants || tournament.status !== 'open')
			throw new ApiError(400, 'tournament full');
		tournamentService.joinTournament(id, user_id);

		if (participants.length + 1 === tournament.max_participants) {
			const allParticipants = tournamentService.getTournamentParticipants(id) as TournamentParticipant[];
			tournamentService.startTournament(id, allParticipants);
			return {success: true, message: 'tournament full, starting!'}
		}
		return {success: true, message: 'Player joined tournament!'}
	},

	deleteTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number };
		const result = tournamentService.deleteTournament(id);
		if (result.changes == 0)
			throw new ApiError(404, 'Tournament not found');
		return {success: true, message: 'Tournament deleted'}
	},

	leaveTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as {id: number};
		const user_id = req.user!.userId;
		tournamentService.leaveTournament(id, user_id);
		return {success: true, message: 'Player left tournament!'}
	},

	getTournamentParticipants: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number };
		const participants = tournamentService.getTournamentParticipants(id);
		if (participants.length === 0)
			throw new ApiError(404, 'tournament not found or no participants'); 
		return {success: true, participants };
	},

	getTournamentGames: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number };
		const games = tournamentService.getTournamentGames(id);
		if (games.length === 0)
			throw new ApiError(404, 'tournament not found or no games found'); 
		return {success: true, games };
	}
}