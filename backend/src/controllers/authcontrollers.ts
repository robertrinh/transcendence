import { FastifyRequest, FastifyReply } from 'fastify';
import { hashPassword, generateSessionId, db } from '../database.js';

interface RegisterRequest {
    username: string;
    password: string;
    email?: string;
}

interface LoginRequest {
    username: string;
    password: string;
}

// Auth service functions
const authService = {
    register: (username: string, password: string, email?: string) => {
        const hashedPassword = hashPassword(password);
        
        try {
            const insertUser = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
            const result = insertUser.run(username, hashedPassword, email || null);
            
            return {
                id: result.lastInsertRowid.toString(),
                username,
                email
            };
        } catch (error: any) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                throw new Error('Username already exists');
            }
            throw error;
        }
    },

    login: (username: string, password: string) => {
        const hashedPassword = hashPassword(password);
        
        const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
            .get(username, hashedPassword) as any;
        
        if (!user) {
            throw new Error('Invalid username or password');
        }

        // Update last login
        db.prepare('UPDATE users SET last_login = ? WHERE id = ?')
            .run(new Date().toISOString(), user.id);

        // Create session
        const sessionId = generateSessionId();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        db.prepare('INSERT INTO user_sessions (id, user_id, username, expires_at) VALUES (?, ?, ?, ?)')
            .run(sessionId, user.id, user.username, expiresAt.toISOString());

        return {
            sessionId,
            user: {
                id: user.id.toString(),
                username: user.username,
                email: user.email
            }
        };
    },

    logout: (sessionId: string) => {
        db.prepare('DELETE FROM user_sessions WHERE id = ?').run(sessionId);
    },

    validateSession: (sessionId: string) => {
        const session = db.prepare(`
            SELECT s.*, u.username, u.email 
            FROM user_sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = ? AND s.expires_at > ?
        `).get(sessionId, new Date().toISOString()) as any;

        if (!session) {
            throw new Error('Invalid or expired session');
        }

        return {
            user: {
                id: session.user_id.toString(),
                username: session.username,
                email: session.email
            }
        };
    }
};

// Route handlers
export const register = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { username, password, email } = request.body as RegisterRequest;

        console.log('Registration attempt:', { username, email });

        if (!username || !password) {
            return reply.status(400).send({ error: 'Username and password are required' });
        }

        if (username.length < 3) {
            return reply.status(400).send({ error: 'Username must be at least 3 characters long' });
        }

        if (password.length < 6) {
            return reply.status(400).send({ error: 'Password must be at least 6 characters long' });
        }

        const user = authService.register(username, password, email);
        console.log('Registration successful:', user);

        return reply.send({
            message: 'User registered successfully',
            user
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        if (error.message === 'Username already exists') {
            return reply.status(409).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Failed to register user' });
    }
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { username, password } = request.body as LoginRequest;

        console.log('Login attempt:', { username, password: '***' });

        if (!username || !password) {
            console.log('Missing username or password');
            return reply.status(400).send({ error: 'Username and password are required' });
        }

        const result = authService.login(username, password);
        console.log('Login successful:', result.user);

        return reply.send({
            message: 'Login successful',
            sessionId: result.sessionId,
            user: result.user
        });
    } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'Invalid username or password') {
            return reply.status(401).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Failed to login' });
    }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { sessionId } = request.body as { sessionId: string };

        if (!sessionId) {
            return reply.status(400).send({ error: 'Session ID is required' });
        }

        authService.logout(sessionId);

        return reply.send({ message: 'Logged out successfully' });
    } catch (error: any) {
        console.error('Logout error:', error);
        return reply.status(500).send({ error: 'Failed to logout' });
    }
};

export const validateSession = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { sessionId } = request.query as { sessionId: string };

        if (!sessionId) {
            return reply.status(400).send({ error: 'Session ID is required' });
        }

        const result = authService.validateSession(sessionId);

        return reply.send({
            valid: true,
            user: result.user
        });
    } catch (error: any) {
        console.error('Session validation error:', error);
        return reply.status(401).send({ 
            valid: false, 
            error: error.message 
        });
    }
};