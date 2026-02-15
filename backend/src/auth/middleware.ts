import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, TokenPayload} from './utils.js';
import { db } from '../databaseInit.js';

declare module 'fastify' {
	interface FastifyRequest {
		user?: TokenPayload;
	}
}

//* When to use middleware:
//* 1. When you need to verify a JWT token
//* 2. When you need to check if a user is authenticated (login)
//* 3. When you need to check if a user is authorized to access a resource (e.g. users routes)
//* 4. When you need to check if a user is authenticated and authorized to access a resource (e.g. admin only, no user)
//* example: as a user, you can only access your own data (like my stats, profile, etc.)
//* as admin, you can access all data (like all users, all games, all tournaments, etc.)
//* adding middleware helps protect routes from unauthorized access!

//* Middleware to verify JWT token for authenticated routes
export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
	const authHeader = request.headers.authorization;
	if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
		return reply.code(401).send({
			success: false,
			error: 'No token provided bruv'
		})
	}
	const token = authHeader.split(' ')[1];
	const payload = verifyToken(token);
	if (!payload) {
		return reply.code(401).send({
			success: false,
			error: 'Invalid or expired token brud'
		})
	}
	
	//* reject tokens for deleted users (e.g. account deleted in another tab)
	const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(payload.userId);
	if (!userExists) {
		return reply.code(401).send({
			success: false,
			error: 'Account no longer exists'
		})
	}
	request.user = payload;
}