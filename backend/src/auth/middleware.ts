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

const extractVerifyToken = (request: FastifyRequest, reply: FastifyReply) => {
	const authHeader = request.headers.authorization;
	if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
		reply.code(401).send({
			success: false,
			error: 'No token provided bruv'
		})
		return null;
	}
	const token = authHeader.split(' ')[1];
	const payload = verifyToken(token);
	if (!payload) {
		reply.code(401).send({
			success: false,
			error: 'Invalid or expired token'
		})
		return null;
	}
	const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(payload.userId);
	if (!userExists) {
		reply.code(401).send({
			success: false,
			error: 'Account no longer exists'
		})
		return null;	
	}
	return payload;
}

//* Middleware to verify JWT token for authenticated routes
export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
	const payload = extractVerifyToken(request, reply);
	if (!payload)
		return;
	//* reject pending 2FA tokens, must complete 2FA first
	if (payload.twoFactorPending) {
		return reply.code(403).send({
			success: false,
			error: '2FA verification required'
		})
	}
	request.user = payload;
}

//* middleware for 2FA verification endpoint: ONLY accepts pending tokens
export const authenticatePendingOnly = async (request: FastifyRequest, reply: FastifyReply) => {
	const payload = extractVerifyToken(request, reply);
	if (!payload)
		return;
	if (!payload.twoFactorPending) {
		return reply.code(403).send({
			success: false,
			error: 'This endpoint requires a pending 2FA token'
		})
	}
	request.user = payload;
}

//* reject guests for routes that require a full account (profile update, avatar, delete, anonymize)
//TODO (tournament create/join/leave)
export const requireNonGuest = async (request: FastifyRequest, reply: FastifyReply) => {
	if (!request.user?.userId) {
		return reply.code(401).send({
			success: false,
			error: 'Authentication required'
		});
	}
	const row = db.prepare('SELECT is_guest FROM users WHERE id = ?').get(request.user.userId) as { is_guest?: number } | undefined;
	if (!row) {
		return reply.code(401).send({
			success: false,
			error: 'Account no longer exists'
		});
	}
	if (row.is_guest) {
		return reply.code(403).send({
			success: false,
			error: 'Guest accounts cannot use this feature. Register for a full account.'
		});
	}
};