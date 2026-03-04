import { FastifyInstance, FastifyPluginOptions, FastifyReply } from 'fastify'
import { db, comparePassword } from '../databaseInit.js'
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from '../auth/jwt.js'
import { validatePassword, MAX_PASSWORD_LENGTH } from '../auth/password.js'
import { validateEmail } from '../auth/email.js'
import { loginBodySchema, registerBodySchema } from '../schemas/auth.schema.js'

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
		user: { id: result.lastInsertRowid, username: username, is_guest: true },
		message: 'Guest registration successful for ' + username
	})
}

async function registerUser(
	reply: FastifyReply, username: string,
	password: string | undefined, email: string | undefined
) {
	if (username.length > 15){
		return reply.code(400).send({
			success: false,
			error: 'Username can not be longer then 15 characters'
		})
	}
	if (!email) {
		return reply.code(400).send({
			success: false,
			error: 'Email is required'
		})
	}
	if (email.length >= 66) {
		return reply.code(400).send({
			success: false,
			error: 'Email cannot be longer than 65 characters'
		})
	}
	const emailValidation = validateEmail(email)
	if (!emailValidation.valid) {
		return reply.code(400).send({
			success: false,
			error: emailValidation.error
		})
	}
	if (!password) {
		return reply.code(400).send({
			success: false,
			error: 'Password is required'
		})
	}
	const passwordValidation = validatePassword(password)
	if (!passwordValidation.valid) {
		return reply.code(400).send({
			success: false,
			error: passwordValidation.error
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
			summary: 'Login as a user',
			body: loginBodySchema
		}}, async (request, reply) => {
		const { username, password } = request.body as { username: string, password: string}
		if (!username || !password) {
			return reply.code(400).send({
				success: false,
				error: 'Username and/or password are required'
			})
		}
		if (username.length >= 16) {
			return reply.code(400).send({
				success: false,
				error: 'Username cannot be longer than 15 characters'
			})
		}
		if (password.length > MAX_PASSWORD_LENGTH) {
			return reply.code(400).send({
				success: false,
				error: 'Password cannot be longer than 50 characters'
			})
		}
		const user = db.prepare('SELECT id, username, password FROM users WHERE username = ?').get(username) as { id: number, username: string, password: string } | undefined
		if (!user)
			return reply.code(401).send({
				success: false,
				error: 'Invalid username or password'
			})
		const checkPassword = await comparePassword(password, user.password)
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
			summary: 'Register a new user or guest',
			body: registerBodySchema
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
		if (username.length >= 16) {
			return reply.code(400).send({
				success: false,
				error: 'Username cannot be longer than 15 characters'
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
