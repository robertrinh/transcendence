import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { IDSchema, successResponseSchema } from '../schemas/generic.schema.js'
import { postGameSchemaBody, updateScoreSchema, finishGameSchema } from '../schemas/games.schemas.js'
import { gamesController } from '../controllers/gamesController.js'


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
			summary: 'Create a new game',
			body: postGameSchemaBody,
		}}, gamesController.createGame);
	
    fastify.get('/:id', {
		schema: {
			tags: ['games'],
			summary: 'Get game by ID',
			params: IDSchema,
		}}, gamesController.getGameByID);

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
			summary: 'Finish a game',
			params: IDSchema,
			body: finishGameSchema,
		}}, gamesController.finishGame);
}
