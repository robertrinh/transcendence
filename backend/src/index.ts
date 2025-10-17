import Fastify from 'fastify'
import cors from '@fastify/cors'
import databaseRoutes from './database.js'
import usersRoutes from './routes/users.js'

const fastify = Fastify({
  logger: true
})

//* CORS (to allow frontend to access backend)
await fastify.register(cors, {
	origin: 'http://localhost:8080',
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
})

//* Database utility routes (e.g. testing/debugging)
fastify.register(
  databaseRoutes, {
    prefix: "/api/db"
})

//* User logic routes
fastify.register(
  usersRoutes, {
    prefix: "/api"
})

//* API Health check
fastify.get('/api/health', async (request, reply) => {
  return { status: 'OK', message: 'Backend API is running', database: 'SQLite3 is connected' }
})

// Start server
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Backend API listening at ${address}`)
})
