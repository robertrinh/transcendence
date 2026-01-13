import { test } from 'node:test'
import assert from 'node:assert'
import { generateToken, verifyToken } from '../auth/utils.js'
import { authenticate } from '../auth/middleware.js';
import { FastifyRequest, FastifyReply } from 'fastify';

test('generateToken creates valid JWT', () => {
	const token = generateToken(1, 'testuser');
	const parts = token.split('.');
	assert.strictEqual(parts.length, 3, 'Token should have 3 parts');
	assert.ok(token, 'Token should be defined');
});

test('verifyToken returns payload for valid token', () => {
	const token = generateToken(1, 'testuser');
	const payload = verifyToken(token);
	assert.ok(payload, 'Payload should be defined');
	assert.strictEqual(payload?.userId, 1, 'User ID should be 1');
	assert.strictEqual(payload?.username, 'testuser', 'Username should be testuser');
});

test('verifyToken returns null for empty string or invalid token', () => {
	//* test: empty string
	const token = '';
	const payload = verifyToken(token);
	assert.strictEqual(payload, null, 'Payload should be null');

	//* test: verifyToken returns null for invalid token
	const second_token = 'invalid.token';
	const second_payload = verifyToken(second_token);
	assert.strictEqual(second_payload, null, 'Payload should be null');
});

//* Middleware tests
test('authenticate middleware sets request.user for valid token', async () => {
	const token = generateToken(1, 'testuser');
	const request = { headers: { authorization: `Bearer ${token}` } } as FastifyRequest;
	const reply = { 
		code: (code: number) => ({ 
			send: (body: any) => body }) 
	} as FastifyReply;

	await authenticate(request, reply);
	assert.ok(request.user, 'request.user should be defined');
	assert.strictEqual(request.user?.userId, 1, 'User ID should be 1');
	assert.strictEqual(request.user?.username, 'testuser', 'Username should be testuser');
});

test('authenticate returns 401 when no Authorization header', async () => {
	const request = { headers: {} } as FastifyRequest;
	let responseCode: number | undefined;
	let responseBody: any;
	
	const reply = {
		code: (code: number) => {
			responseCode = code;
			return {
				send: (body: any) => {
					responseBody = body;
					return body;
				}
			};
		}
	} as unknown as FastifyReply;
	
	await authenticate(request, reply);
	assert.strictEqual(responseCode, 401);
	assert.strictEqual(responseBody.success, false);
});

test('authenticate returns 401 when Authorization header missing Bearer prefix', async () => {
	const token = generateToken(1, 'testuser');
	const request = { headers: { authorization: token } } as FastifyRequest;  //* No "Bearer "
	let responseCode: number | undefined;
	
	const reply = {
		code: (code: number) => {
			responseCode = code;
			return { send: (body: any) => body };
		}
	} as unknown as FastifyReply;
	
	await authenticate(request, reply);
	assert.strictEqual(responseCode, 401);
});

test('authenticate returns 401 for invalid token', async () => {
	const request = { headers: { authorization: 'Bearer invalid.token.here' } } as FastifyRequest;
	let responseCode: number | undefined;
	
	const reply = {
		code: (code: number) => {
			responseCode = code;
			return { send: (body: any) => body };
		}
	} as unknown as FastifyReply;
	
	await authenticate(request, reply);
	assert.strictEqual(responseCode, 401);
});