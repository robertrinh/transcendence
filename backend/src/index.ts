import fastify from 'fastify';
import { dbCleanUpJob } from './error/backupCleanup.js';
import { registerRoutes } from './registerRoutes.js';

export const server = fastify({ logger: true });

const start = async () => {
    try {
		await registerRoutes();
        await server.listen({ port: 3000, host: '0.0.0.0' });
        const devBackendURL = `http://${process.env.HOST}:${process.env.BACKEND_PORT}`
        const devFrontendURL = `http://${process.env.HOST}:${process.env.FRONTEND_PORT}`
        const prodURL = `https://${process.env.HOST}:${process.env.NGINX_PORT}`
        console.log(
            `Development access points:\n` + 
            `\t - Backend server running on ${devBackendURL}\n` +
            `\t - API Documentation available at ${devBackendURL}/api/docs\n` +
            `\t - Frontend should be accessible at ${devFrontendURL}\n` +
            `\t - SSE Chat endpoint: ${devBackendURL}/api/chat/stream?token=YOUR_JWT_TOKEN\n` + 
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
        console.log(
            `Production access points:\n` + 
            `\t - API Documentation available at ${prodURL}/api/docs\n` +
            `\t - Frontend should be accessible at ${prodURL}\n` +
            `\t - SSE Chat endpoint: ${prodURL}/api/chat/stream?token=YOUR_JWT_TOKEN\n` + 
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
        dbCleanUpJob();
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();