import { server } from './index.js';
import usersRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import gamesRoutes from './routes/games.js';
import tournamentsRoutes from './routes/tournaments.js';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import authRoutes from './routes/auth.js';
import multipart from '@fastify/multipart';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import twofaRoutes from './routes/2fa.js';
import friendsRoutes from './routes/friends.js';

import { fileURLToPath } from 'node:url';
import path from 'node:path';


export async function registerRoutes() {

	await server.register(multipart, {
		limits: { fileSize: 5 * 1024 * 1024 }
	});
	
	server.register(swagger, {
	openapi: {
		info: {
		title: 'Swagger API',
		description: 'Backend API documentation',
		version: '1.0.0'
		},
		components: {
		securitySchemes: {
			bearerAuth: {
			type: 'http',
			scheme: 'bearer',
			bearerFormat: 'JWT',
			description: 'Enter your JWT token'
			}
		}
		},
		security: [{ bearerAuth: [] }]
	}
	})
	
	server.register(swaggerUI, {
	routePrefix: '/api/docs'
	})
	
	server.register(
	usersRoutes, {
		prefix: '/api/users'
	})
	
	// Register static file serving for avatars
	await server.register(fastifyStatic, {
		root: path.join(__dirname, '..', 'uploads', 'avatars'),
		prefix: '/api/avatars/',
	});
	
	server.register(
		authRoutes, {
			prefix: "/api"
		}
	);
	
	server.register(
		twofaRoutes, {
			prefix: "/api"
		}
	)
	
	server.register(
		chatRoutes, {
			prefix: '/api/chat'
		}
	)
	
	server.register(
		gamesRoutes, {
			prefix: '/api/games'
		}
	)
	
	server.register(
		tournamentsRoutes, {
			prefix: '/api/tournaments'
		}
	)
	
	server.register(
		friendsRoutes, {
			prefix: '/api/friends'
		}
	)
}