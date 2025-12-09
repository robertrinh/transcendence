import fastify, {preHandlerHookHandler} from 'fastify';
import databaseRoutes from './routes/database.js';
import usersRoutes from './routes/users.js';
import authenticationRoutes from './routes/authentication.js';
import chatRoutes from './routes/chat.js';
import genericRoutes from './routes/generic.js';

// Store active SSE connections and messages
export const sseConnections = new Map<string, any>();
export const chatMessages: any[] = new Array<any>;

const server = fastify({ logger: true });

    }

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

// Register database routes
server.register(
    databaseRoutes, {
        prefix: '/api/db'
});

server.register(
    authenticationRoutes, {
        prefix: '/api/auth'
    }
)

server.register(
    chatRoutes, {
        prefix: '/api/chat'
    }
)

const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
        console.log('🚀 Backend server running on http://0.0.0.0:3000');
        console.log('📝 API Documentation available at http://localhost:3000');
        console.log('🌐 Frontend should be accessible at http://localhost:8080');
        console.log('📡 SSE Chat endpoint: http://localhost:3000/api/chat/stream');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
