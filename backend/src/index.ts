import fastify from 'fastify';
import dotenv from 'dotenv/config';
import databaseRoutes from './routes/database.js';
import { getMessages } from './controllers/chatcontrollers.js';
import usersRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import gamesRoutes from './routes/games.js';
import tournamentsRoutes from './routes/tournaments.js';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
// import database from './database.js';
import authRoutes from './routes/auth.js';
import multipart from '@fastify/multipart';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import twofaRoutes from './routes/2fa.js';

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path'
import path from 'node:path';

const server = fastify({ logger: true });

// Register multipart
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
    security: [{ bearerAuth: [] }] // Apply globally to all routes
  }
})

server.register(swaggerUI, {
  routePrefix: '/docs'
})

//* User logic routes
server.register(
  usersRoutes, {
    prefix: '/api/users'
})

// Register static file serving for avatars
await server.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'uploads', 'avatars'),
    prefix: '/api/avatars/',
});

// Auth routes
server.register(
    authRoutes, {
        prefix: "/api"
    }
);

// Root endpoint
server.get('/', async (request, reply) => {
    return { 
        message: 'ft_transcendence Backend API',
        status: 'running',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth/*',
            chat: '/api/chat/*',
            chatStream: '/api/chat/stream (SSE with token query param)'
        }
    };
});

//* 2FA routes
server.register(
	twofaRoutes, {
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
        console.log('📡 SSE Chat endpoint: http://localhost:3000/api/chat/stream?token=YOUR_JWT_TOKEN');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();