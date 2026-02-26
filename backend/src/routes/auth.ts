import { FastifyInstance, FastifyPluginOptions, FastifyReply } from 'fastify'
import { db } from '../databaseInit.js'
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from '../auth/utils.js'

async function registerGuest(
	reply: FastifyReply, username: string
) {
	const result = db.prepare(
		'INSERT INTO users (username, is_guest) VALUES (?, ?)')
		.run(username, 1)
	const token = generateToken(Number(result.lastInsertRowid), username)
	return reply.code(200).send({
		success: true,
		token: token,
		user: { id: result.lastInsertRowid, username: username },
		message: 'Guest registration successful for ' + username
	})
}

async function registerUser(
	reply: FastifyReply, username: string,
	password: string | undefined, email: string | undefined
) {
	if (!email) {
		return reply.code(400).send({
			success: false,
			error: 'Email is required'
		})
	}
	if (!password) {
		return reply.code(400).send({
			success: false,
			error: 'Password is required'
		})
	}
	if (password.length < 6) {
		return reply.code(400).send({
			success: false,
			error: 'Password must be at least 6 characters long'
		})
	}
	const hashedPassword = await bcrypt.hash(password, 10)
	const result = db.prepare(
		'INSERT INTO users (username, password, email) VALUES (?, ?, ?)')
		.run(username, hashedPassword, email || null)
	const token = generateToken(Number(result.lastInsertRowid), username)
	return reply.code(200).send({
		success: true,
		token: token,
		user: { id: result.lastInsertRowid, username: username },
		message: 'Registration successful for ' + username
	})
}


export default async function authRoutes (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
	fastify.post('/auth/login', {
		schema: {
			tags: ['auth'],
			summary: 'Login as a user'
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

		if (is2faEnabled?.two_factor_enabled === 1) {
			const pendingToken = generateToken(user.id, user.username, true)
			return reply.code(200).send({
				success: true,
				requires2FA: true,
				token: pendingToken,
				user: { id: user.id, username: user.username },
				message: '2FA verification required'
			})
		}
		
		const token = generateToken(user.id, user.username)
		return reply.code(200).send({ 
			success: true,
			token: token,
			user: { id: user.id, username: user.username },
			message: 'Login successful! Welcome back, ' + user.username + '!'
		})
	})

	fastify.post('/auth/register', {
		schema: {
			tags: ['auth'],
			summary: 'Register a new user or guest'
		}}, async (request, reply) => {
		const { username, isGuest, password, email } = request.body as { 
			username?: string,
			isGuest?: boolean,
			password?: string,
			email?: string 
		}
		if (!username) {
			return reply.code(400).send({
				success: false,
				error: 'Username is required'
			})
		}
		if (username.length < 3) {
			return reply.code(400).send({
				success: false,
				error: 'Username must be at least 3 characters long'
			})
		}
		//* check if username exists
		const existingUser = db.prepare(
			'SELECT id FROM users WHERE username = ?')
			.get(username)
		if (existingUser) {
			return reply.code(400).send({
				success: false,
				error: 'Username already exists'
			})
		}
		//* simplified guest flow: true only when handleGuest is called, default = false
		if (isGuest === true) {
			return await registerGuest(reply, username)
		}
		return await registerUser(reply, username, password, email)
	})

	fastify.post('/auth/logout', {
		schema: {
			tags: ['auth'],
			summary: 'Logout as a user'
		}}, async (request, reply) => {
			return { success: true, message: 'Logged out successfully' }
		})
		
	fastify.get('/auth/validate', {
		schema: {
			tags: ['auth'],
			summary: 'Validate JWT token'
		}}, async (request, reply) => {
		const authHeader = request.headers.authorization
		if (!authHeader?.startsWith('Bearer ')) {
			return reply.code(401).send({ success: false, error: 'No token provided' })
		}
		
		const token = authHeader.split(' ')[1]
		const payload = verifyToken(token)
		if (!payload) {
			return reply.code(401).send({ success: false, error: 'Invalid or expired token' })
		}

		//* reject pending 2FA tokens, must complete 2FA first
		if (payload.twoFactorPending) {
			return reply.code(403).send({ success: false, error: '2FA verification required' })
		}

		//* reject tokens for deleted users (e.g. account deleted in another tab)
		const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(payload.userId)
		if (!userExists) {
			return reply.code(401).send({ success: false, error: 'Account no longer exists' })
		}
		return reply.code(200).send({ success: true, user: payload })
	})
}
