import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { db } from '../databaseInit.js';
import { authenticate, requireNonGuest } from '../auth/middleware.js';
import { sendToUser } from '../sseNotify.js';
import {
	friendUsernameBody,
	friendsListResponseSchema,
	friendSuccessResponseSchema,
	friendErrorResponseSchema,
	blockedListResponseSchema,
	friendRequestListResponseSchema,
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

	//* send friend request (reject if already friends or request exists in either direction)
	fastify.post('/add', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'Send friend request',
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
			const requestedId = target.id;

			const alreadyFriends = db.prepare('SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?').get(userId, requestedId) as { 1?: number } | undefined;
			if (alreadyFriends) {
				return reply.status(400).send({ error: 'Already friends' });
			}

			const requestExists = db.prepare(`
				SELECT 1 FROM friend_request
				WHERE (requester_id = ? AND requested_id = ?) OR (requester_id = ? AND requested_id = ?)
			`).get(userId, requestedId, requestedId, userId) as { 1?: number } | undefined;
			if (requestExists) {
				return reply.status(400).send({ error: 'Friend request already exists' });
			}

			const iBlocked = db.prepare('SELECT 1 FROM blocked WHERE user_id = ? AND blocked_id = ?').get(userId, requestedId) as { 1?: number } | undefined;
			const theyBlocked = db.prepare('SELECT 1 FROM blocked WHERE user_id = ? AND blocked_id = ?').get(requestedId, userId) as { 1?: number } | undefined;
			if (iBlocked || theyBlocked) {
				return reply.status(400).send({ error: 'Cannot send request (blocked)' });
			}

			db.prepare('INSERT INTO friend_request (requester_id, requested_id) VALUES (?, ?)').run(userId, requestedId);

			sendToUser(requestedId, {
				type: 'friend_request',
				fromUsername: payload.username,
				message: `${payload.username} wants to be your friend!`,
				timestamp: new Date().toISOString()
			});
			return reply.status(200).send({ success: true });
		} catch (error) {
			console.error('Send friend request error:', error);
			return reply.status(500).send({ error: 'Failed to send friend request' });
		}
	});

	//* Requested_id = "me"
	fastify.get('/requests/incoming', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'List incoming friend requests',
			response: {
				200: friendRequestListResponseSchema,
				500: friendErrorResponseSchema
			}
		},
		preHandler: [authenticate, requireNonGuest]
	}, async (request, reply) => {
		try {
			const payload = request.user!;
			const userId = payload.userId;

			const rows = db.prepare(`
				SELECT u.id, u.username, fr.created_at
				FROM friend_request fr
				JOIN users u ON u.id = fr.requester_id
				WHERE fr.requested_id = ?
			`).all(userId) as { id: number; username: string; created_at: string }[];

			return reply.status(200).send({
				requests: rows.map(r => ({ id: r.id, username: r.username, created_at: r.created_at }))
			});
		} catch (error) {
			console.error('List incoming requests error:', error);
			return reply.status(500).send({ error: 'Failed to list incoming requests' });
		}
	});

	//* Requested_id = "me"
	fastify.get('/requests/outgoing', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'List outgoing friend requests',
			response: {
				200: friendRequestListResponseSchema,
				500: friendErrorResponseSchema
			}
		},
		preHandler: [authenticate, requireNonGuest]
	}, async (request, reply) => {
		try {
			const payload = request.user!;
			const userId = payload.userId;

			const rows = db.prepare(`
				SELECT u.id, u.username, fr.created_at
				FROM friend_request fr
				JOIN users u ON u.id = fr.requested_id
				WHERE fr.requester_id = ?
			`).all(userId) as { id: number; username: string; created_at: string }[];

			return reply.status(200).send({
				requests: rows.map(r => ({ id: r.id, username: r.username, created_at: r.created_at }))
			});
		} catch (error) {
			console.error('List outgoing requests error:', error);
			return reply.status(500).send({ error: 'Failed to list outgoing requests' });
		}
	});

	//* requested_id = me; requester is in body
	fastify.post('/requests/accept', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'Accept friend request',
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
			const fromUsername = String(username).trim();

			const requester = db.prepare('SELECT id FROM users WHERE username = ?').get(fromUsername) as { id: number } | undefined;
			if (!requester) {
				return reply.status(400).send({ error: 'User not found' });
			}
			const requesterId = requester.id;

			const row = db.prepare(`
				SELECT 1 FROM friend_request WHERE requester_id = ? AND requested_id = ?
			`).get(requesterId, userId) as { 1?: number } | undefined;
			if (!row) {
				return reply.status(400).send({ error: 'No such incoming request' });
			}

			const insertFriend = db.prepare('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)');
			insertFriend.run(userId, requesterId);
			insertFriend.run(requesterId, userId);
			db.prepare('DELETE FROM friend_request WHERE requester_id = ? AND requested_id = ?').run(requesterId, userId);

			return reply.status(200).send({ success: true });
		} catch (error) {
			console.error('Accept friend request error:', error);
			return reply.status(500).send({ error: 'Failed to accept friend request' });
		}
	});

	//* requested_id = me
	fastify.post('/requests/decline', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'Decline friend request',
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
			const fromUsername = String(username).trim();

			const requester = db.prepare('SELECT id FROM users WHERE username = ?').get(fromUsername) as { id: number } | undefined;
			if (!requester) {
				return reply.status(400).send({ error: 'User not found' });
			}
			const requesterId = requester.id;

			db.prepare('DELETE FROM friend_request WHERE requester_id = ? AND requested_id = ?').run(requesterId, userId);
			return reply.status(200).send({ success: true });
		} catch (error) {
			console.error('Decline friend request error:', error);
			return reply.status(500).send({ error: 'Failed to decline friend request' });
		}
	});

	//* requester_id = me
	fastify.post('/requests/cancel', {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ['friends'],
			summary: 'Cancel outgoing friend request',
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

			const requested = db.prepare('SELECT id FROM users WHERE username = ?').get(toUsername) as { id: number } | undefined;
			if (!requested) {
				return reply.status(400).send({ error: 'User not found' });
			}
			const requestedId = requested.id;

			db.prepare('DELETE FROM friend_request WHERE requester_id = ? AND requested_id = ?').run(userId, requestedId);
			return reply.status(200).send({ success: true });
		} catch (error) {
			console.error('Cancel friend request error:', error);
			return reply.status(500).send({ error: 'Failed to cancel friend request' });
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

			//* remove friendship in both directions (you are no longer friends when you block)
			const delFriends = db.prepare('DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)');
			delFriends.run(userId, blockedId, blockedId, userId);
			//* remove any pending friend requests between the two
			db.prepare('DELETE FROM friend_request WHERE (requester_id = ? AND requested_id = ?) OR (requester_id = ? AND requested_id = ?)').run(userId, blockedId, blockedId, userId);

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