import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { db } from '../database.js'
import bcrypt from 'bcrypt'

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
			}) //TODO need to check if this is correct way
		return { success: true, user }
	})
	
	//* Creates a new user
	fastify.post('/users', async (request, reply) => {
		const { username, password } = request.body as { username: string, password: string}

		if (!username || !password){
			return reply.code(400).send({
				success: false,
				error: 'Username and password are required'
			})
		} //TODO check for other validations e.g. length or duplicate username, maybe different function?
		const hashedPassword = await bcrypt.hash(password, 10)
		const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword)
		return { 
			success: true,
			userID: result.lastInsertRowid, 
			message: 'User created, welcome to the game!',
		}
	})

	//* Updates a user
	fastify.put('/users/:id', async (request, reply) => {
		const { id } = request.params as { id: string }
		const { username, password } = request.body as { username: string, password: string }

		const hashedPassword = await bcrypt.hash(password, 10)
		const result = db.prepare(' UPDATE users SET username = ?, password = ? WHERE id = ?').run(username, hashedPassword, id)
		if (result.changes == 0) 
			return reply.code(404).send({ success: false, error: 'User not found' }) //TODO check
		return { 
			success: true, 
			message: 'User updated yagetme!' 
		}
	})

	//* Deletes a user
	fastify.delete('/users/:id', async (request, reply) => {
		const { id } = request.params as { id: string }
		
		const result = db.prepare('DELETE FROM users WHERE id = ?').run(id)
		if (result.changes == 0)
			return reply.code(404).send({ success: false, error: 'User not found'}) //TODO check
		return { 
			success: true, 
			message: 'User deleted (banished to the shadow realm)' 
		}
	})
}
