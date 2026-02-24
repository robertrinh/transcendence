import { ApiError } from '../error/errors.js';
import { gamesService } from '../services/gamesService.js';
import { userService } from '../services/userService.js';
export const gamesController = {
    getAllGames: async () => {
        const games = gamesService.getAllGames();
        return { success: true, data: games };
    },
    getGameByID: async (req, reply) => {
        const { id } = req.params;
        const game = gamesService.fetchGame(id);
        if (!game)
            throw new ApiError(404, 'Game not found');
        return { success: true, data: game };
    },
    getGameQueue: async () => {
        const queue = gamesService.fetchGameQueue();
        return { success: true, data: queue };
    },
    matchMaking: async (req, reply) => {
        const player_id = req.user.userId;
        const player = userService.fetchUser(player_id);
        if (player.status === 'playing' || player.status === 'searching')
            throw new ApiError(400, "player already playing");
        const waitingPlayer = gamesService.findWaitingPlayer(player_id);
        if (waitingPlayer) {
            const game = gamesService.createGame(waitingPlayer.player_id, player_id);
            return { success: true, data: game, message: 'Game created, connect to gameserver' };
        }
        else {
            gamesService.addtoGameQueue(player_id);
            return { success: true, message: 'Player added to queue, waiting for other player to join' };
        }
    },
    getMatchmakingStatus: async (req, reply) => {
        const player_id = req.user.userId;
        const status = gamesService.matchmakingStatus(player_id);
        return { success: true, data: status };
    },
    cancelMatchmaking: async (req, reply) => {
        const result = gamesService.cancelMatchmaking(req.user.userId);
        return { success: true, message: 'player removed from game queue' };
    },
    hostLobby: async (req, reply) => {
        const player_id = req.user.userId;
        const player = userService.fetchUser(player_id);
        if (player.status === 'playing' || player.status === 'searching')
            throw new ApiError(400, "player already playing");
        const queue = gamesService.hostLobby(player_id);
        return { success: true, data: queue, message: 'Player created private game' };
    },
    joinLobby: async (req, reply) => {
        const player_id = req.user.userId;
        const { lobby_id } = req.body;
        const player = userService.fetchUser(player_id);
        // look if a game is already there first, create one otherwise
        const foundPrivateGame = gamesService.fetchPrivateGame(lobby_id);
        if (foundPrivateGame) {
            return { success: true, data: foundPrivateGame, message: 'Game found, connect to gameserver' };
        }
        const game_queue = gamesService.fetchlobby(lobby_id);
        if (game_queue === undefined)
            throw new ApiError(404, `Lobby \"${lobby_id}\" not found`);
        if (game_queue.player_id === player_id) {
            return { success: false, message: 'Waiting for your opponent to join...' };
        }
        if (player.status === 'playing') {
            throw new ApiError(400, 'You are already playing a game');
        }
        if (player.status === 'searching') {
            throw new ApiError(400, 'You are already searching for a game');
        }
        const game = gamesService.createGame(game_queue.player_id, player_id, lobby_id);
        return { success: true, data: game, message: 'Game created, connect to gameserver' };
    },
    setReady: async (req, reply) => {
        const player_id = req.user.userId;
        const { game_id } = req.body;
        const result = gamesService.setPlayerReady(game_id, player_id);
        return { success: true, data: result };
    },
    getReadyStatus: async (req, reply) => {
        const { id } = req.params;
        const result = gamesService.getReadyStatus(Number(id));
        return { success: true, data: result };
    },
    finishGame: async (req, reply) => {
        const { id } = req.params;
        const { winner_id, score_player1, score_player2, finished_at } = req.body;
        const result = gamesService.finishGame(id, score_player1, score_player2, winner_id, finished_at);
        return {
            success: true,
            message: 'Game finished'
        };
    }
};
