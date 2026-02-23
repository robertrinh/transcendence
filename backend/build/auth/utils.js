import jwt from 'jsonwebtoken';
/**
 * JWT_SECRET: The secret key used to sign tokens. In production, this should
 * be a long random string stored in env.
 *
 * JWT_EXPIRES_IN: How long until the token expires. After expiration,
 * the user must log in again.
 */
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN);
const PENDING_TOKEN_EXPIRES_IN = '5m';
export function generateToken(userId, username, twoFactorPending = false) {
    const payload = { userId, username };
    if (twoFactorPending) {
        payload.twoFactorPending = true;
        return jwt.sign(payload, JWT_SECRET, { expiresIn: PENDING_TOKEN_EXPIRES_IN });
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.log('Token expired at:', error.expiredAt);
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            console.log('Invalid token:', error.message);
        }
        return null;
    }
}
