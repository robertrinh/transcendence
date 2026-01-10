import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { userController } from '../controllers/userController.js'
import { IDSchema } from '../schemas/generic.schema.js'
import { userBody } from '../schemas/users.schema.js'

export default async function usersRoutes (
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {

	fastify.get('/', {
		schema: {
			tags: ['users'],
			summary: 'Get all users',
		}}, userController.getAllUsers);

	fastify.get('/:id', {
		schema: {
			tags: ['users'],
			summary: 'Get a user by ID',
			params: IDSchema
		}}, userController.getUserByID);
	
	//TODO Password hashing, this is a security hazard lol
	fastify.post('/', {
		schema: {
			tags: ['users'],
			summary: 'Create new user',
			body: userBody
		}}, userController.createUser);

	fastify.put('/:id', {
		schema: {
			tags: ['users'],
			summary: 'Update user',
			params: IDSchema,
			body: userBody
		}}, userController.updateUser);

	fastify.delete('/:id', {
		schema: {
			tags: ['users'],
			summary: 'Delete user',
			params: IDSchema
		}}, userController.deleteUser);
}