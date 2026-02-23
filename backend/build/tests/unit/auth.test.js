import { test, mock } from 'node:test';
import assert from 'node:assert';
import { generateToken, verifyToken } from '../../auth/utils.js';
//* Token/utils tests – no DB, no middleware
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
    const token = '';
    const payload = verifyToken(token);
    assert.strictEqual(payload, null, 'Payload should be null');
    const second_token = 'invalid.token';
    const second_payload = verifyToken(second_token);
    assert.strictEqual(second_payload, null, 'Payload should be null');
});
//* Middleware tests – use mocked db so no real DB is touched
test('authenticate middleware', async (t) => {
    // Mock db: prepare().get(userId) returns configurable value (user exists vs deleted)
    let mockUserExists = { id: 1 };
    const mockDb = {
        prepare: (_sql) => ({
            get: (_userId) => mockUserExists,
        }),
    };
    const databaseInitSpecifier = new URL('../../databaseInit.js', import.meta.url).href;
    mock.module(databaseInitSpecifier, {
        namedExports: { db: mockDb },
    });
    const { authenticate } = await import('../../auth/middleware.js');
    await t.test('sets request.user for valid token when user exists', async () => {
        mockUserExists = { id: 1 };
        const token = generateToken(1, 'testuser');
        const request = { headers: { authorization: `Bearer ${token}` } };
        const reply = {
            code: (code) => ({ send: (body) => body }),
        };
        await authenticate(request, reply);
        assert.ok(request.user, 'request.user should be defined');
        assert.strictEqual(request.user?.userId, 1, 'User ID should be 1');
        assert.strictEqual(request.user?.username, 'testuser', 'Username should be testuser');
    });
    await t.test('returns 401 when no Authorization header', async () => {
        mockUserExists = { id: 1 };
        const request = { headers: {} };
        let responseCode;
        let responseBody;
        const reply = {
            code: (code) => {
                responseCode = code;
                return { send: (body) => { responseBody = body; return body; } };
            },
        };
        await authenticate(request, reply);
        assert.strictEqual(responseCode, 401);
        assert.strictEqual(responseBody?.success, false);
    });
    await t.test('returns 401 when Authorization header missing Bearer prefix', async () => {
        mockUserExists = { id: 1 };
        const token = generateToken(1, 'testuser');
        const request = { headers: { authorization: token } };
        let responseCode;
        const reply = {
            code: (code) => {
                responseCode = code;
                return { send: (_body) => ({}) };
            },
        };
        await authenticate(request, reply);
        assert.strictEqual(responseCode, 401);
    });
    await t.test('returns 401 for invalid token', async () => {
        mockUserExists = { id: 1 };
        const request = { headers: { authorization: 'Bearer invalid.token.here' } };
        let responseCode;
        const reply = {
            code: (code) => {
                responseCode = code;
                return { send: (_body) => ({}) };
            },
        };
        await authenticate(request, reply);
        assert.strictEqual(responseCode, 401);
    });
    await t.test('returns 401 when user does not exist (e.g. account deleted)', async () => {
        mockUserExists = undefined; // mock: user no longer in DB
        const token = generateToken(1, 'testuser');
        const request = { headers: { authorization: `Bearer ${token}` } };
        let responseCode;
        let responseBody;
        const reply = {
            code: (code) => {
                responseCode = code;
                return { send: (body) => { responseBody = body; return body; } };
            },
        };
        await authenticate(request, reply);
        assert.strictEqual(responseCode, 401);
        assert.strictEqual(responseBody?.error, 'Account no longer exists');
    });
});
