import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { IDSchema, successResponseSchema } from '../schemas/generic.schema.js'
import { updateScoreSchema, finishGameSchema } from '../schemas/games.schemas.js'
import { gamesController } from '../controllers/gamesController.js'
import { authenticate } from '../auth/middleware.js'



//TODO: add param and response in the schema for swaggerUI 
export default async function gamesRoutes (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    fastify.get('/', {
		schema: {
			tags: ['games'],
			summary: 'Get all games',
		}}, gamesController.getAllGames); 

    fastify.post('/', {
		schema: {
			tags: ['games'],
			summary: 'match making',
			security: [{ bearerAuth: [] }],
		}, preHandler: [authenticate]} , gamesController.createGame);
	
    fastify.get('/:id', {
		schema: {
			tags: ['games'],
			summary: 'Get game by ID',
			params: IDSchema,
		}}, gamesController.getGameByID);

	fastify.get('/queue', {
		schema: {
			tags: ['games'],
			summary: 'Get the game queue',
		}}, gamesController.getGameQueue);

    fastify.delete('/:id', {
		schema: {
			tags: ['games'],
			summary: 'Delete a game by ID',
			params: IDSchema,
		}}, gamesController.deleteGame);

	//updating score, liveee update from the game
	fastify.put('/:id', {
		schema: {
			tags: ['games'],
			summary: 'Update current game',
			params:IDSchema,
			body: updateScoreSchema,
		}}, gamesController.updateGame);

	//finishing game, update status to finished
    fastify.put('/:id/finish', {
		schema: {
			tags: ['games'],
			summary: 'Finish a game, log the game results',
			params: IDSchema,
			body: finishGameSchema,
		}}, gamesController.finishGame);
}
