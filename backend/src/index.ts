import dotenv from 'dotenv/config';
import fastify from 'fastify';
import databaseRoutes from './routes/database.js';
import usersRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import genericRoutes from './routes/generic.js';
import gamesRoutes from './routes/games.js';
import tournamentsRoutes from './routes/tournaments.js';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
// import database from './database.js';
import { getMessages } from './controllers/chatcontrollers.js';
import authRoutes from './routes/auth.js';

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path'
import path from 'node:path';

// Store active SSE connections and messages
export const sseConnections = new Map<string, any>();
export const chatMessages: any[] = new Array<any>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const server = fastify({ logger: true });

// For serving Swagger UI
server.register(fastifyStatic, {
    root: path.resolve(__dirname, '../assets')
})

server.register(swagger, {
  openapi: {
    info: {
      title: 'Swagger API',
      description: 'Backend API documentation',
      version: '1.0.0'
    }
  }
})

server.register(swaggerUI, {
  routePrefix: '/docs'
})

server.register(
    genericRoutes, {
        prefix: '/api'
    }
)

//* User logic routes
server.register(
  usersRoutes, {
    prefix: '/api/users'
})

//* Auth routes
server.register(
	authRoutes, {
		prefix: "/api"
	}
)

// Register database routes
server.register(
    databaseRoutes, {
        prefix: '/api/db'
});

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

const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
        console.log('🚀 Backend server running on http://0.0.0.0:3000');
        console.log('📝 API Documentation available at http://localhost:3000/docs');
        console.log('🌐 Frontend should be accessible at http://localhost:8080');
        console.log('📡 SSE Chat endpoint: http://localhost:3000/api/chat/stream');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
