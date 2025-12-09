import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { register, login, logout, validateSession } from '../controllers/authcontrollers.js';

export default async function authenticationRoutes (
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
    // Authentication routes
    fastify.post('/register', register);
    fastify.post('/login', login);
    fastify.post('/logout', logout);
    fastify.get('/validate', validateSession);
}
