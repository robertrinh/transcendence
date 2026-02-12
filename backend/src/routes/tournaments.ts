import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { tournamentController } from '../controllers/tournamentContr.js'
import { IDSchema } from '../schemas/generic.schema.js'
import { postTournamentSchemaBody, joinTournamentBody, tournamentResultSchema } from '../schemas/tournament.schema.js';
import { authenticate } from '../auth/middleware.js'

export default async function tournamentsRoutes (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    fastify.get('/', {
		schema: {
			tags: ['tournaments']
		}
	}, tournamentController.getAllTournaments)

    fastify.post('/', {
		schema: {
			security: [{bearerAuth: []}],
			tags: ['tournaments'],
			body: postTournamentSchemaBody
		}, preHandler: [authenticate]}, tournamentController.createTournament)

    fastify.get('/:id', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema
		}
	}, tournamentController.getTournamentByID)

	//add handler for auth token! how to indentify the gameserver? 
    fastify.put('/:id', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema,
			body: tournamentResultSchema
		}
	}, tournamentController.updateTournament)

    fastify.delete('/:id', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema
		}
	}, tournamentController.deleteTournament)

	fastify.post('/:id/join', {
		schema: {
			security: [{bearerAuth: []}],
			tags: ['tournaments'],
			params: IDSchema,
		}, preHandler: [authenticate]}, tournamentController.joinTournament)

	fastify.delete('/:id/leave', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema,
			security: [{bearerAuth: []}],
		}, preHandler: [authenticate]}, tournamentController.leaveTournament)

	fastify.get('/:id/participants', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema
		}
	}, tournamentController.getTournamentParticipants)

	fastify.get('/:id/games', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema
		}
	}, tournamentController.getTournamentGames)
}
