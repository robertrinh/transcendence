import { FastifyInstance, FastifyPluginOptions } from 'fastify';


export default async function genericRoutes (
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
    // Health check
    fastify.get('/api/health', (request, reply) => {
        reply.status(200).send({ message: 'API is healthy' });
    });
}
