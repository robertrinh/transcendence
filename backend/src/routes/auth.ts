import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { db } from '../database.js'
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from '../auth/utils.js'

export default async function authRoutes (
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
	fastify.post('/auth/login', async (request, reply) => {
		const { username, password } = request.body as { username: string, password: string}
		if (!username || !password) {
			return reply.code(400).send({
				success: false,
				error: 'Username and/or password are required'
			})
		}
		const user = db.prepare('SELECT id, username, password FROM users WHERE username = ?').get(username)
		if (!user)
			return reply.code(401).send({
				success: false,
				error: 'Invalid username or password'
			})
		const checkPassword = await bcrypt.compare(password, user.password)
		if (!checkPassword)
			return reply.code(401).send({
				success: false,
				error: 'Invalid username or password'
			})
		const token = generateToken(user.id, user.username)
		return { 
			success: true,
			token: token,
			user: { id: user.id, username: user.username },
			message: 'Login successful! Welcome back, ' + user.username + '!'
		}
	})
}
