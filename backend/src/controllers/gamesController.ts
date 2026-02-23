import { ApiError } from '../error/errors.js';
import { gamesService } from '../services/gamesService.js'
import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/userService.js';
import { Player } from '../types/database.interfaces.js'


export const gamesController = {

    getAllGames: async () => {
        const games = gamesService.getAllGames();
        return {success: true, data: games }
    },

    getGameByID: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: number }
        const game = gamesService.fetchGame(id);
        if (!game)
            throw new ApiError(404, 'Game not found');
        return { success: true, data: game }
    },

    getGameQueue: async () => {
        const queue = gamesService.fetchGameQueue();
        return {success: true, data: queue }
    },

    matchMaking: async (req: FastifyRequest, reply: FastifyReply) => {
        const player_id = req.user!.userId;

        const player = userService.fetchUser(player_id) as Player;
        if (player.status === 'playing' || player.status === 'searching')
            throw new ApiError(400, "player already playing");

        const waitingPlayer = gamesService.findWaitingPlayer(player_id);

        if (waitingPlayer) {
            const game = gamesService.createGame(waitingPlayer.player_id, player_id);
            return {success: true, data: game, message: 'Game created, connect to gameserver'}
        }
        else {
            gamesService.addtoGameQueue(player_id);
            return {success: true, message: 'Player added to queue, waiting for other player to join'}
        }
    },

    getMatchmakingStatus: async (req: FastifyRequest, reply: FastifyReply) => {
        const player_id = req.user!.userId;
        const status = gamesService.matchmakingStatus(player_id);
        return {success: true, data: status }
    },

    cancelMatchmaking: async (req: FastifyRequest, reply: FastifyReply) => {
        const result = gamesService.cancelMatchmaking(req.user!.userId);
        return {success: true, message: 'player removed from game queue'}
    },

    hostLobby: async (req: FastifyRequest, reply: FastifyReply) => {
        const player_id = req.user!.userId;
        const player = userService.fetchUser(player_id) as Player;
        if (player.status === 'playing' || player.status === 'searching')
            throw new ApiError(400, "player already playing");
        const queue = gamesService.hostLobby(player_id);
        return {success: true, data: queue, message: 'Player created private game'}
    },

    joinLobby: async (req: FastifyRequest, reply: FastifyReply) => {
        const player_id = req.user!.userId;
        const { lobby_id } = req.body as { lobby_id: string }

        const player = userService.fetchUser(player_id) as Player;
        // look if a game is already there first, create one otherwise
        const foundPrivateGame = gamesService.fetchPrivateGame(lobby_id)
        if (foundPrivateGame) {
            return {success: true, data: foundPrivateGame, message: 'Game found, connect to gameserver'}
        }
        const game_queue = gamesService.fetchlobby(lobby_id);
        if (game_queue === undefined)
            throw new ApiError(404, `Lobby \"${lobby_id}\" not found`)
        if (game_queue.player_id === player_id) {
            return {success: false, message: 'Waiting for your opponent to join...'}
        }
        if (player.status === 'playing') {
            throw new ApiError(400, 'You are already playing a game')
        }
        if (player.status === 'searching') {
            throw new ApiError(400, 'You are already searching for a game')
        }
        const game = gamesService.createGame(game_queue.player_id, player_id, lobby_id);
        return {success: true, data: game, message: 'Game created, connect to gameserver'}
    },

    setReady: async (req: FastifyRequest, reply: FastifyReply) => {
        const player_id = req.user!.userId;
        const { game_id } = req.body as { game_id: number };
        const result = gamesService.setPlayerReady(game_id, player_id);
        return { success: true, data: result };
    },

    getReadyStatus: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: string };
        const result = gamesService.getReadyStatus(Number(id));
        return { success: true, data: result };
    },

    finishGame: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: number }
        const {winner_id, score_player1, score_player2, finished_at } = req.body as {winner_id: number, score_player1: number, score_player2: number, finished_at: string};
        const result = gamesService.finishGame(id, score_player1, score_player2, winner_id, finished_at);
        return {
            success: true,
            message: 'Game finished'
        }
    }
}