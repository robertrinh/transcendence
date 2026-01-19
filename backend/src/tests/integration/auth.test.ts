import { test } from 'node:test'
import assert from 'node:assert'

//* what sort of tests?
//* registration tests
//* login tests
//* Token validation tests
//! 2fa tests difficult because of time based, hard to test

const BASE_URL = 'http://localhost:3000/api'

//* Shared test user data
//* testuser stays persistent throughout the tests
//* so don't need to create a new user for each test
const testuser = {
	username: `testuser_${Date.now()}`,
	password: 'testpassword',
	email: `testuser_${Date.now()}@test.com`
}

//* JWT token is used to authenticate the user for the tests
let token: string | undefined; //* let syntax: variable that can be reassigned

/**
 * @brief Helper function to make API requests with common headers and format the response as JSON.
 * @param endpoint the endpoint to test
 * @param options The options for the request, e.g. method, body, headers, etc.
 * @details options? syntax: options is optional, so we can pass in body, headers, etc.
 * @details ...options syntax: passes through the options to the fetch request.
 */
async function api(endpoint: string, options?: RequestInit) {
	return fetch(`${BASE_URL}${endpoint}`, {
		headers: { 'Content-Type': 'application/json', ...options?.headers },
		...options
	})
}

//* ======================== Registration tests ========================
test('POST /auth/register: successful registration', async () => {
	const response = await api('/auth/register', {
		method: 'POST',
		body: JSON.stringify(testuser)
	})

	const data = await response.json()

	assert.strictEqual(response.status, 200)
	assert.strictEqual(data.success, true)
	assert.ok(data.token, 'Should return a token')
	assert.strictEqual(data.user.username, testuser.username)

	//* store the JWT token for other registration tests
	token = data.token
})

test('POST /auth/register: missing required fields', async () => {
	const response = await api('/auth/register', {
		method: 'POST',
		body: JSON.stringify({ username: testuser.username })
	})

	const data = await response.json()

	assert.strictEqual(response.status, 400)
	assert.strictEqual(data.success, false)
	assert.strictEqual(data.error, 'Username, password and/or email are required')
})

test('POST /auth/register: username already exists', async () => {
	const response = await api('/auth/register', {
		method: 'POST',
		body: JSON.stringify({username: testuser.username, password: testuser.password, email: testuser.email})
	})
		const data = await response.json()

		assert.strictEqual(response.status, 400)
		assert.strictEqual(data.success, false)
		assert.strictEqual(data.error, 'Username already exists')
	})

test('POST /auth/register: password too short', async () => {
	const response = await api('/auth/register', {
		method: 'POST',
		body: JSON.stringify({username: testuser.username, password: 'short', email: testuser.email})
	})
		const data = await response.json()

		assert.strictEqual(response.status, 400)
		assert.strictEqual(data.success, false)
		assert.strictEqual(data.error, 'Password must be at least 6 characters long')
	})

test('POST /auth/register: username too short', async () => {
	const response = await api('/auth/register', {
		method: 'POST',
		body: JSON.stringify({username: 'sh', password: testuser.password, email: testuser.email})
	})
		const data = await response.json()

		assert.strictEqual(response.status, 400)
		assert.strictEqual(data.success, false)
		assert.strictEqual(data.error, 'Username must be at least 3 characters long')
	})

//* ======================== Login tests ========================

test('POST /auth/login: successful login', async () => {
	const response = await api('/auth/login', {
		method: 'POST',
		body: JSON.stringify({username: testuser.username, password: testuser.password})
	})

	const data = await response.json()

	assert.strictEqual(response.status, 200)
	assert.strictEqual(data.success, true)
	assert.ok(data.token, 'Should return a token')
	assert.strictEqual(data.user.username, testuser.username)

	//* store the JWT token for future login tests (it's different from registration token)
	token = data.token
})

test('POST /auth/login: missing required fields', async () => {
	const response = await api('/auth/login', {
		method: 'POST',
		body: JSON.stringify({username: testuser.username})
	})

	const data = await response.json()

	assert.strictEqual(response.status, 400)
	assert.strictEqual(data.success, false)
	assert.strictEqual(data.error, 'Username and/or password are required')
})

test('POST /auth/login: invalid username', async () => {
	const response = await api('/auth/login', {
		method: 'POST',
		body: JSON.stringify({username: 'invalid', password: testuser.password})
	})

	const data = await response.json()

	assert.strictEqual(response.status, 401)
	assert.strictEqual(data.success, false)
	assert.strictEqual(data.error, 'Invalid username or password')
})

test('POST /auth/login: invalid password', async () => {
	const response = await api('/auth/login', {
		method: 'POST',
		body: JSON.stringify({username: testuser.username, password: 'lol'})
	})

	const data = await response.json()

	assert.strictEqual(response.status, 401)
	assert.strictEqual(data.success, false)
	assert.strictEqual(data.error, 'Invalid username or password')
})

test('POST /auth/logout: successful logout', async () => {
	const response = await api('/auth/logout', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${token}`
		}
	})
	const data = await response.json()

	assert.strictEqual(response.status, 200)
	assert.strictEqual(data.success, true)
	assert.strictEqual(data.message, 'Logged out successfully')
})

//* ======================== Token validation tests ========================

test('GET /auth/validate: valid token', async () => {
	const response = await api('auth/validate', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`
		}
	})
	const data = await response.json()

	assert.strictEqual(response.status, 200)
	assert.strictEqual(data.success, true)
	assert.strictEqual(data.user.username, testuser.username)
})

test('GET /auth/validate: invalid token', async () => {
	const response = await api('auth/validate', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer no.token.lol`	
		}
	})

	const data = await response.json()

	assert.strictEqual(response.status, 401)
	assert.strictEqual(data.success, false)
	assert.strictEqual(data.error, 'Invalid or expired token')
})

test('GET /auth/validate: no token provided', async () => {
	const response = await api('auth/validate', {
		method: 'GET',
		headers: {
			'Authorization': ''
		}
	})

	const data = await response.json()

	assert.strictEqual(response.status, 401)
	assert.strictEqual(data.success, false)
	assert.strictEqual(data.error, 'No token provided')
})
