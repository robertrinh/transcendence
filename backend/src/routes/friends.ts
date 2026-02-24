import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { db } from '../databaseInit.js';
import { authenticate, requireNonGuest } from '../auth/middleware.js';
import {
	friendUsernameBody,
	friendsListResponseSchema,
	friendSuccessResponseSchema,
	friendErrorResponseSchema,
	blockedListResponseSchema,
} from '../schemas/friends.schema.js';

export default async function friendsRoutes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
	//* GET /:list my friends
	fastify.get('/', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'List my friends',
			response: {
				200: friendsListResponseSchema,
				500: friendErrorResponseSchema
			}
		},
		preHandler: [authenticate, requireNonGuest]
	}, async (request, reply) => {
		try {
			const payload = request.user!;
			const userId = payload.userId;

			const rows = db.prepare(`
				SELECT u.id, u.username
				FROM friends f
				JOIN users u ON u.id = f.friend_id
				WHERE f.user_id = ?
			`).all(userId) as { id: number; username: string }[];

			return reply.status(200).send({ friends: rows });
		} catch (error) {
			console.error('List friends error:', error);
			return reply.status(500).send({ error: 'Failed to list friends' });
		}
	});

	fastify.post('/add', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'Add friend',
			body: friendUsernameBody,
			response: {
				200: friendSuccessResponseSchema,
				400: friendErrorResponseSchema,
				500: friendErrorResponseSchema
			}
		},
		preHandler: [authenticate, requireNonGuest]
	}, async (request, reply) => {
		try {
			const payload = request.user!;
			const userId = payload.userId;
			const { username } = request.body as { username: string };

			if (!username || !String(username).trim()) {
				return reply.status(400).send({ error: 'Username is required' });
			}
			const toUsername = String(username).trim();

			if (toUsername === payload.username) {
				return reply.status(400).send({ error: 'Cannot add yourself as a friend' });
			}

			const target = db.prepare('SELECT id FROM users WHERE username = ?').get(toUsername) as { id: number } | undefined;
			if (!target) {
				return reply.status(400).send({ error: 'User not found' });
			}
			const friendId = target.id;

			const existing = db.prepare('SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?').get(userId, friendId) as { 1?: number } | undefined;
			if (existing) {
				return reply.status(400).send({ error: 'Already friends' });
			}

			const insert = db.prepare('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)');
			insert.run(userId, friendId);
			insert.run(friendId, userId);

			return reply.status(200).send({ success: true });
		} catch (error) {
			console.error('Add friend error:', error);
			return reply.status(500).send({ error: 'Failed to add friend' });
		}
	});

	fastify.post('/remove', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'Remove friend',
			body: friendUsernameBody,
			response: {
				200: friendSuccessResponseSchema,
				400: friendErrorResponseSchema,
				500: friendErrorResponseSchema
			}
		},
		preHandler: [authenticate, requireNonGuest]
	}, async (request, reply) => {
		try {
			const payload = request.user!;
			const userId = payload.userId;
			const { username } = request.body as { username: string };

			if (!username || !String(username).trim()) {
				return reply.status(400).send({ error: 'Username is required' });
			}
			const toUsername = String(username).trim();

			const target = db.prepare('SELECT id FROM users WHERE username = ?').get(toUsername) as { id: number } | undefined;
			if (!target) {
				return reply.status(400).send({ error: 'User not found' });
			}
			const friendId = target.id;

			const del = db.prepare('DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)');
			del.run(userId, friendId, friendId, userId);

			return reply.status(200).send({ success: true });
		} catch (error) {
			console.error('Remove friend error:', error);
			return reply.status(500).send({ error: 'Failed to remove friend' });
		}
	});

	//* GET /blocked: list my blocked users
	fastify.get('/blocked', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'List my blocked users',
			response: {
				200: blockedListResponseSchema,
				500: friendErrorResponseSchema
			}
		},
		preHandler: [authenticate]
	}, async (request, reply) => {
		try {
			const payload = request.user!;
			const userId = payload.userId;

			const rows = db.prepare(`
				SELECT u.id, u.username
				FROM blocked b
				JOIN users u ON u.id = b.blocked_id
				WHERE b.user_id = ?
			`).all(userId) as { id: number; username: string }[];

			return reply.status(200).send({ blocked: rows });
		} catch (error) {
			console.error('List blocked error:', error);
			return reply.status(500).send({ error: 'Failed to list blocked users' });
		}
	});


	fastify.post('/block', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'Block user',
			body: friendUsernameBody,
			response: {
				200: friendSuccessResponseSchema,
				400: friendErrorResponseSchema,
				500: friendErrorResponseSchema
			}
		},
		preHandler: [authenticate]
	}, async (request, reply) => {
		try {
			const payload = request.user!;
			const userId = payload.userId;
			const { username } = request.body as { username: string };

			if (!username || !String(username).trim()) {
				return reply.status(400).send({ error: 'Username is required' });
			}
			const toUsername = String(username).trim();

			if (toUsername === payload.username) {
				return reply.status(400).send({ error: 'Cannot block yourself' });
			}

			const target = db.prepare('SELECT id FROM users WHERE username = ?').get(toUsername) as { id: number } | undefined;
			if (!target) {
				return reply.status(400).send({ error: 'User not found' });
			}
			const blockedId = target.id;

			const existing = db.prepare('SELECT 1 FROM blocked WHERE user_id = ? AND blocked_id = ?').get(userId, blockedId) as { 1?: number } | undefined;
			if (existing) {
				return reply.status(400).send({ error: 'User is already blocked' });
			}

			db.prepare('INSERT INTO blocked (user_id, blocked_id) VALUES (?, ?)').run(userId, blockedId);
			return reply.status(200).send({ success: true });
		} catch (error) {
			console.error('Block user error:', error);
			return reply.status(500).send({ error: 'Failed to block user' });
		}
	});


	fastify.post('/unblock', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'Unblock user',
			body: friendUsernameBody,
			response: {
				200: friendSuccessResponseSchema,
				400: friendErrorResponseSchema,
				500: friendErrorResponseSchema
			}
		},
		preHandler: [authenticate]
	}, async (request, reply) => {
		try {
			const payload = request.user!;
			const userId = payload.userId;
			const { username } = request.body as { username: string };

			if (!username || !String(username).trim()) {
				return reply.status(400).send({ error: 'Username is required' });
			}
			const toUsername = String(username).trim();

			const target = db.prepare('SELECT id FROM users WHERE username = ?').get(toUsername) as { id: number } | undefined;
			if (!target) {
				return reply.status(400).send({ error: 'User not found' });
			}
			const blockedId = target.id;

			db.prepare('DELETE FROM blocked WHERE user_id = ? AND blocked_id = ?').run(userId, blockedId);
			return reply.status(200).send({ success: true });
		} catch (error) {
			console.error('Unblock user error:', error);
			return reply.status(500).send({ error: 'Failed to unblock user' });
		}
	});
}