import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { db } from '../database.js'
import bcrypt from 'bcrypt'
import { authenticate } from '../auth/middleware.js'

//* curl http://localhost:3000/api/db/tables?tablename=users for testing hashed passwords

export default async function usersRoutes (
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {

	//* Gets ALL users
	fastify.get('/users', async (request, reply) => {
		const users = db.prepare('SELECT id, username FROM users').all()
		return { success: true, users }
	})

	//* Gets a single userID
	fastify.get('/users/:id', async (request, reply) => {
		const { id } = request.params as { id: string }
		const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id)

		if (!user)
			return reply.code(404).send({
				success: false,
				error: 'User not found'
			})
		return { success: true, user }
	})
	
	//* Updates a user
	fastify.put('/users/:id', {preHandler: [authenticate]}, async (request, reply) => {
		const { userId } = request.user! as { userId: number };
		const { id } = request.params as { id: string }
		const { username, password } = request.body as { username: string, password: string }

		//* check if user is trying to update their OWN username
		if (userId !== Number(id)) {
			return reply.code(403).send({
				success: false,
				error: 'HANDS OFF FAM! Stay in your own lane! you cannot update other users!'
			})
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const result = db.prepare(' UPDATE users SET username = ?, password = ? WHERE id = ?').run(username, hashedPassword, id)
		if (result.changes == 0) 
			return reply.code(404).send({ success: false, error: 'User not found' })
		return { 
			success: true, 
			message: 'User updated yagetme!' 
		}
	})

	//* Deletes a user
	fastify.delete('/users/:id', {preHandler: [authenticate]}, async (request, reply) => {
		const { userId } = request.user! as { userId: number };
		const { id } = request.params as { id: string }

		//* check if user is trying to delete their own account
		if (userId !== Number(id)) {
			return reply.code(403).send({
				success: false,
				error: 'You have no power here! You cannot delete other users!'
			})
		}
		
		if (request.user!.userId !== Number(id)) {
			return reply.code(403).send({ success: false, error: 'Stay away from other profiles!! You cannot banish others to the shadow realm'})
		}	
		const result = db.prepare('DELETE FROM users WHERE id = ?').run(id)
		if (result.changes == 0)
			return reply.code(404).send({ success: false, error: 'User not found'})
		return { 
			success: true, 
			message: 'User deleted (banished to the shadow realm)' 
		}
	})
}
