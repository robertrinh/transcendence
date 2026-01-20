import { ApiError } from '../Errors/errors.js';
import { tournamentService } from '../services/tournamentService.js'
import { FastifyRequest, FastifyReply } from 'fastify';

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
		return { success: true, data: tournament }
	},

	//this endpoint can be called if a player clicks "join tournament" and no tournament exist currently
	createTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const {name, description, max_participants } = req.body as {name: string, description: string, max_participants: number };
		const result = tournamentService.createTournament(name, description, max_participants);
		if (result.changes == 0)
			throw new ApiError(404, 'something went wrong creating tournament'); //but when can this actually go wrong except internal server error i guess
		return {success: true, message: 'Tournament successfully cerated!'};
	},

	//add checks:
		// - tournament exists
		// - tournament status == open
		// - tournament max_participants not reached 
		// - user not already joined
	joinTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as {id: number};
		const { user_id } = req.body as { user_id: number };

		tournamentService.joinTournament(id, user_id);
		return {success: true, message: 'Player joined tournament!'}
	},

	// check:
	// - min amount participants reached
	// - status == open
	// todo:
	// - put status = ongoing
	// - create first rounds games
	startTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as {id: number};
		tournamentService.startTournament(id);
	},

	// //update or finish depending on body that contains the status of the tournament (ongoing or finished)
	// putTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		
	// },

	deleteTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number };
		const result = tournamentService.deleteTournament(id);
		if (result.changes == 0)
			throw new ApiError(404, 'Tournament not found');
		return {success: true, message: 'Tournament deleted'}
	},

	//can a player leave when tournament_status == ongoing? --> what happens then - maybe it means immediate win for the opponent? 
	leaveTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as {id: number};
		const { user_id } = req.body as { user_id: number };
		tournamentService.leaveTournament(id, user_id);
		return {success: true, message: 'Player left tournament!'}
	},

	//make the errors explicit.
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