import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { db } from '../database.js'

export default async function tournamentsRoutes (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    fastify.get('/', async (req, reply) => {

    })

    fastify.post('/', async (req, reply) => {
        
    })

    fastify.get('/:id', async (req, reply) => {
        
    })

    fastify.delete('/:id', async (req, reply) => {
        
    })

    fastify.put('/:id', async (req, reply) => {
        
    })
}
