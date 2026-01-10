import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { tournamentController } from '../controllers/tournamentContr.js'
import { IDSchema, successResponseSchema } from '../schemas/generic.schema.js'
import { postTournamentSchemaBody, joinTournamentBody } from '../schemas/tournament.schema.js';

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
			tags: ['tournaments'],
			body: postTournamentSchemaBody
		}
	}, tournamentController.createTournament)

    fastify.get('/:id', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema
		}
	}, tournamentController.getTournamentByID)

    fastify.put('/:id', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema
		}
	}, tournamentController.putTournament)

    fastify.delete('/:id', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema
		}
	}, tournamentController.deleteTournament)

	fastify.post('/:id/join', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema,
			body: joinTournamentBody
		}
	}, tournamentController.joinTournament)

	fastify.delete('/:id/leave', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema,
			body: joinTournamentBody
		}
	}, tournamentController.leaveTournament)

	fastify.get('/:id/participants', {
		schema: {
			tags: ['tournaments'],
			params: IDSchema
		}
	}, tournamentController.getTournamentParticipants)
}
