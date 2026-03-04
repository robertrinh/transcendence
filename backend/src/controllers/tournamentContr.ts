import { ApiError } from '../error/errors.js';
import { tournamentService } from '../services/tournamentService.js'
import { FastifyRequest, FastifyReply } from 'fastify';
import { Tournament, TournamentParticipant } from '../types/database.interfaces.js';
import { systemBroadcast } from '../sseNotify.js';
import { db } from '../databaseInit.js'

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

	getActiveTournament: async (req: FastifyRequest, reply: FastifyReply) => {
        const user_id = req.user!.userId;
        const activeTournament = tournamentService.hasActiveTournament(user_id);
        if (!activeTournament) {
            return { success: true, data: null }
        }
        return {
            success: true,
            data: {
                id: activeTournament.id,
                name: activeTournament.name,
                max_participants: activeTournament.max_participants,
                status: activeTournament.status
            }
        }
    },

	//this endpoint can be called if a player clicks "join tournament" and NO open tournament exist currently
	//add a alternative in frontend when clicking join tournament for how many participants. 4 8 so its fixed size tournament
	//returns the id of the tournament to be used when polling from the frontend to check if tournament is starting
	createTournament: async (req: FastifyRequest, reply: FastifyReply) => {
        const user_id = req.user!.userId;
        const { name, description, max_participants } = req.body as { name: string, description: string, max_participants: number };
        const trimmedName = typeof name === 'string' ? name.trim() : '';
        if (!trimmedName) {
            throw new ApiError(400, 'Tournament name is required')
        }
        if (trimmedName.length >= 16) {
            throw new ApiError(400, 'Tournament name cannot be longer than 15 characters')
        }
        if (description !== undefined && description !== null && String(description).length >= 101) {
            throw new ApiError(400, 'Tournament description cannot be longer than 100 characters')
        }
        const allowedSizes = [4, 8];
        if (typeof max_participants !== 'number' || !allowedSizes.includes(max_participants)) {
            throw new ApiError(400, 'max_participants must be 4, 8')
        }
		const activeTour = tournamentService.hasActiveTournament(user_id);
        if (activeTour) {
            throw new ApiError(409, 'You already have an active tournament', 'ACTIVE_TOURNAMENT_EXISTS');
        }
        const result = tournamentService.createTournament(trimmedName, description ?? '', max_participants, user_id);
        if (result.changes == 0)
            throw new ApiError(404, 'something went wrong creating tournament')
		systemBroadcast(`Tournament "${trimmedName}" opened!`)
        tournamentService.joinTournament(result.lastInsertRowid as number, user_id);
        return { success: true, data: { id: result.lastInsertRowid, max_participants }, message: 'Tournament successfully created and creator joined!' };
    },

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
	},
}