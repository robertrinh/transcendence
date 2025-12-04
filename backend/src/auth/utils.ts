import jwt, { SignOptions } from 'jsonwebtoken'

/**
 * JWT_SECRET: The secret key used to sign tokens. In production, this should
 * be a long random string stored in env.
 * 
 * JWT_EXPIRES_IN: How long until the token expires. After expiration,
 * the user must log in again.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'insert-secret-jwt-here'
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']

/**
 * The data we store inside the JWT token.
 * This is called the "payload": it travels with every request
 * don't ever store sensitive data here
 * JWTs are encoded, NOT encrypted - anyone can decode and read them.
 */
export interface TokenPayload {
	userId: number
	username: string
}

//* Generates a JWT token
export function generateToken(userId: number, username: string): string {
	const payload: TokenPayload = { userId, username }

	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}


export function verifyToken(token: string): TokenPayload | null {
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
		return decoded
	} catch (error) {
		//* token is invalid or expired
		//* throw errors such as: TokenExpiredError, JsonWebTokenError
		return null
	}
}

