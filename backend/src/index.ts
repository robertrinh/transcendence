import fastify from 'fastify';
import databaseRoutes from './routes/database.js';
import usersRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import gamesRoutes from './routes/games.js';
import tournamentsRoutes from './routes/tournaments.js';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import authRoutes from './routes/auth.js';
import multipart from '@fastify/multipart';
import { dbCleanUpJob } from './error/backupCleanup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import twofaRoutes from './routes/2fa.js';

import { fileURLToPath } from 'node:url';
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
  routePrefix: '/api/docs'
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
        const devBackendURL = `http://${process.env.HOST}:${process.env.BACKEND_PORT}`
        const devFrontendURL = `http://${process.env.HOST}:${process.env.FRONTEND_PORT}`
        const prodURL = `https://${process.env.HOST}:${process.env.NGINX_PORT}`
        console.log(
            `Development access points:\n` + 
            `\t - 🚀 Backend server running on ${devBackendURL}\n` +
            `\t - 📝 API Documentation available at ${devBackendURL}/api/docs\n` +
            `\t - 🌐 Frontend should be accessible at ${devFrontendURL}\n` +
            `\t - 📡 SSE Chat endpoint: ${devBackendURL}/api/chat/stream?token=YOUR_JWT_TOKEN\n` + 
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
        console.log(
            `Production access points:\n` + 
            `\t - 📝 API Documentation available at ${prodURL}/api/docs\n` +
            `\t - 🌐 Frontend should be accessible at ${prodURL}\n` +
            `\t - 📡 SSE Chat endpoint: ${prodURL}/api/chat/stream?token=YOUR_JWT_TOKEN\n` + 
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
        dbCleanUpJob();
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();