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
			tags: ['tournaments'],
			summary: 'Get all tournaments'
		}
	}, tournamentController.getAllTournaments)

    fastify.post('/', {
		schema: {
			security: [{bearerAuth: []}],
			tags: ['tournaments'],
			summary: 'Create a tournament',
			body: postTournamentSchemaBody
		}, preHandler: [authenticate]}, tournamentController.createTournament)

    fastify.get('/:id', {
		schema: {
			tags: ['tournaments'],
			summary: 'Get a tournament by ID',
			params: IDSchema
		}
	}, tournamentController.getTournamentByID)

    fastify.delete('/:id', {
		schema: {
			tags: ['tournaments'],
			summary: 'Delete a tournament by ID',
			params: IDSchema
		}
	}, tournamentController.deleteTournament)

	fastify.post('/:id/join', {
		schema: {
			security: [{bearerAuth: []}],
			tags: ['tournaments'],
			summary: 'Join a tournament',
			params: IDSchema,
		}, preHandler: [authenticate]}, tournamentController.joinTournament)

	fastify.delete('/:id/leave', {
		schema: {
			tags: ['tournaments'],
			summary: 'Leave a tournament',
			params: IDSchema,
			security: [{bearerAuth: []}],
		}, preHandler: [authenticate]}, tournamentController.leaveTournament)

	fastify.get('/:id/participants', {
		schema: {
			tags: ['tournaments'],
			summary: 'Get tournament participants',
			params: IDSchema
		}
	}, tournamentController.getTournamentParticipants)

	fastify.get('/:id/games', {
		schema: {
			tags: ['tournaments'],
			summary: 'Get the games contained in the tournament',
			params: IDSchema
		}
	}, tournamentController.getTournamentGames)

	fastify.post('/extreme', {
		schema: {
			tags: ['tournaments'],
			summary: 'Get the games contained in the tournament',
			security: [{bearerAuth: []}],
		}, preHandler: [authenticate]}, tournamentController.removeFromActiveGame)
}
