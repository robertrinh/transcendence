import { ApiError } from '../Errors/errors.js';
import { gamesService } from '../services/gamesService.js'
import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/userService.js';
import { Player } from '../types/database.interfaces.js';


export const gamesController = {

	getAllGames: async () => {
		const games = gamesService.getAllGames();
		return {success: true, data: games }
    },

	getGameQueue: async () => {
		const queue = gamesService.fetchGameQueue();
		return {success: true, data: queue }
    },

	createGame: async (req: FastifyRequest, reply: FastifyReply) => {
		const player_id = req.user!.userId;
		const player = userService.fetchUser(player_id) as Player;
		if (player.status === 'playing')
			throw new ApiError(400, "player already playing");
		const game_queue = gamesService.fetchGameQueue();
		if (game_queue === undefined) {
			gamesService.addtoGameQueue(player_id);
			return {success: true, message: 'Player added to queue'}
		}
		else {
			const result = gamesService.createGame(game_queue.player_id, player_id);
			return {success: true, message: 'Game created, connect to gameserver, i should send game info here i think'}
		}
	},

	getGameByID: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number }
		const game = gamesService.fetchGame(id);
		if (!game)
			throw new ApiError(404, 'Game not found');
		return { success: true, data: game }
	},
	
	deleteGame: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number }
		const result = gamesService.removeGame(id);
		if (result.changes == 0)
			throw new ApiError(404, 'Game not found');
		return { 
			success: true, 
			message: 'Game deleted' 
		}
	},

	//What happens if a player exits mid game? 
	//What are errors that can happen?
	updateGame: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number }
		const {score_player1, score_player2 } = req.body as { score_player1: number, score_player2: number };
		const result = gamesService.updateGame(id, score_player1, score_player2);
		return {
			success: true,
			message: 'Game updated'
		}
	},

	finishGame: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number }
		const {winner_id, score_player1, score_player2, finished_at } = req.body as {winner_id: number, score_player1: number, score_player2: number, finished_at: number };
		const result = gamesService.finishGame(id, score_player1, score_player2, winner_id, finished_at);
		return {
			success: true,
			message: 'Game finished'
		}
	}
	}