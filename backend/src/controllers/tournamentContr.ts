import { ApiError } from '../Errors/errors.js';
import { tournamentService } from '../services/tournamentService.js'
import { FastifyRequest, FastifyReply } from 'fastify';

export const tournamentController = {
	getAllTournaments: async (req: FastifyRequest, reply: FastifyReply) => {
		const tournaments = tournamentService.getAllTournaments();
		return {success: true, data: tournaments }
	},

	getTournamentByID: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number };
		const tournament = tournamentService.getTournamentByID(id);
		if (!tournament)
			throw new ApiError(404, 'Tournament not found');
		return { success: true, data: tournament }
	},

	createTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const {name, description, max_participants } = req.body as {name: string, description: string, max_participants: number };
		const result = tournamentService.createTournament(name, description, max_participants);
		if (result.changes == 0)
			throw new ApiError(404, 'something went wrong creating tournament'); //but when can this actually go wrong except internal server error i guess
		return {success: true, message: 'Tournament successfully cerated!'};
	},

	putTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		
	},

	deleteTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number };
		const result = tournamentService.deleteTournament(id);
		if (result.changes == 0)
			throw new ApiError(404, 'Tournament not found');
		return {success: true, message: 'Tournament deleted'}
	},

	joinTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as {id: number};
		const { user_id } = req.body as { user_id: number };
		tournamentService.joinTournament(id, user_id);
		return {success: true, message: 'Player joined tournament!'}
	},

	leaveTournament: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as {id: number};
		const { user_id } = req.body as { user_id: number };
		tournamentService.leaveTournament(id, user_id);
		return {success: true, message: 'Player left tournament!'}
	},

	getTournamentParticipants: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number };
		const participants = tournamentService.getTournamentParticipants(id);
		if (!participants)
			throw new ApiError(404, 'tournament not found'); 
		return {success: true, participants };
	} 

	
}