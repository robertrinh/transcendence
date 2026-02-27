import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { IDSchema } from '../schemas/generic.schema.js'
import { finishGameSchema, joinLobbySchema } from '../schemas/games.schemas.js'
import { gamesController } from '../controllers/gamesController.js'
import { authenticate } from '../auth/middleware.js'

export default async function gamesRoutes (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    fastify.get('/', {
        schema: {
            tags: ['games'],
            summary: 'Get all games',
        }}, gamesController.getAllGames); 

    fastify.get('/:id', {
        schema: {
            tags: ['games'],
            summary: 'Get game by ID',
            params: IDSchema,
        }}, gamesController.getGameByID);

    fastify.post('/matchmaking', {
        schema: {
            tags: ['games'],
            summary: 'match making',
            security: [{ bearerAuth: [] }],
        }, preHandler: [authenticate]} , gamesController.matchMaking);

    fastify.post('/ready', {
        preHandler: [authenticate]
    }, gamesController.setReady);

    fastify.get('/:id/ready', {
        preHandler: [authenticate]
    }, gamesController.getReadyStatus);

    fastify.post('/cancel', {
        preHandler: [authenticate]
    }, gamesController.cancelGame);

    fastify.get('/matchmaking', {
        schema: {
            tags: ['games'],
            summary: 'Get the matchmaking status, gameData or status',
        }, preHandler: [authenticate]}, gamesController.getMatchmakingStatus);

    fastify.put('/matchmaking/cancel', {
        schema: {
            tags: ['games'],
            summary: 'reset status and remove from queue',
        }, preHandler: [authenticate]}, gamesController.cancelMatchmaking);

    fastify.post('/host', {
        schema: {
            tags: ['games'],
            summary: 'request lobbyID and host a private game',
            security: [{ bearerAuth: [] }],
        }, preHandler: [authenticate]} , gamesController.hostLobby);

    fastify.post('/joinlobby', {
        schema: {
            tags: ['games'],
            summary: 'join private lobby',
            security: [{ bearerAuth: [] }],
            body: joinLobbySchema
        }, preHandler: [authenticate]} , gamesController.joinLobby);

    fastify.get('/queue', {
        schema: {
            tags: ['games'],
            summary: 'Get game queue',
        }}, gamesController.getGameQueue);

    fastify.put('/:id/finish', {
		schema: {
			tags: ['games'],
			summary: 'Finish a game',
			params: IDSchema,
			body: finishGameSchema,
		}}, gamesController.finishGame);

	fastify.get('/leaderboard', {
		schema: {
			tags: ['games'],
			summary: 'Get the leaderboard',
		}}, gamesController.getLeaderboard);
	
	fastify.get('/user', {
		schema: {
			tags: ['games'],
			security: [{ bearerAuth: [] }],
			summary: 'Get all the games the user was a part of',
		}, preHandler: [authenticate]}, gamesController.getGameByUserID);
}
