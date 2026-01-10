import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { register, login, logout, validateSession } from '../controllers/authcontrollers.js';

export default async function authenticationRoutes (
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
    // Authentication routes
    fastify.post('/register', {
		schema: {
			tags: ['auth']
		}}, register);
    fastify.post('/login', {
		schema: {
			tags: ['auth']
		}}, login);
    fastify.post('/logout', {
		schema: {
			tags: ['auth']
		}}, logout);
    fastify.get('/validate', {
		schema: {
			tags: ['auth']
		}}, validateSession);
}
