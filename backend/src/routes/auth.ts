import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { db } from '../database.js'
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from '../auth/utils.js'

export default async function authRoutes (
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
	fastify.post('/auth/login', {
		schema: {
			tags: ['auth']
		}}, async (request, reply) => {
		const { username, password } = request.body as { username: string, password: string}
		if (!username || !password) {
			return reply.code(400).send({
				success: false,
				error: 'Username and/or password are required'
			})
		}
		const user = db.prepare('SELECT id, username, password FROM users WHERE username = ?').get(username) as { id: number, username: string, password: string } | undefined
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
		
		//* Check if 2fa is enabled
		const is2faEnabled = db.prepare('SELECT two_factor_enabled FROM users WHERE id = ?').get(user.id) as { two_factor_enabled: number } | undefined
		const token = generateToken(user.id, user.username)

		if (is2faEnabled?.two_factor_enabled === 1) {
			return reply.code(200).send({
				success: true,
				requires2FA: true,
				token: token,
				user: { id: user.id, username: user.username },
				message: '2FA verification required'
			})
		}
		return reply.code(200).send({ 
			success: true,
			token: token,
			user: { id: user.id, username: user.username },
			message: 'Login successful! Welcome back, ' + user.username + '!'
		})
	})

	fastify.post('/auth/register', {
		schema: {
			tags: ['auth']
		}}, async (request, reply) => {
		const { username, password, email } = request.body as { username: string, password: string, email: string }
		if (!username || !password || !email) {
			return reply.code(400).send({
				success: false,
				error: 'Username, password and/or email are required'
			})
		}
		if (username.length < 3) {
			return reply.code(400).send({
				success: false,
				error: 'Username must be at least 3 characters long'
			})
		}
		if (password.length < 6) {
			return reply.code(400).send({
				success: false,
				error: 'Password must be at least 6 characters long'
			})
		}
		
		//* check if username exists
		const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
		if (existingUser) {
			return reply.code(400).send({
				success: false,
				error: 'Username already exists'
			})
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const result = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)').run(username, hashedPassword, email || null)
		const token = generateToken(Number(result.lastInsertRowid), username)
		return reply.code(200).send({
			success: true,
			token: token,
			user: { id: result.lastInsertRowid, username: username },
			message: 'Registration successful for ' + username
		})
	})

		fastify.post('/auth/logout', {
		schema: {
			tags: ['auth']
		}}, async (request, reply) => {
			return { success: true, message: 'Logged out successfully' }
		})
		
	fastify.get('/auth/validate', async (request, reply) => {
		const authHeader = request.headers.authorization
		if (!authHeader?.startsWith('Bearer ')) {
			return reply.code(401).send({ success: false, error: 'No token provided' })
		}
		
		const token = authHeader.split(' ')[1]
		const payload = verifyToken(token)
		if (!payload) {
			return reply.code(401).send({ success: false, error: 'Invalid or expired token' })
		}
		
		return reply.code(200).send({ success: true, user: payload })
	})
}
