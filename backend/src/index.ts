import Fastify from 'fastify'
import databaseRoutes from './database.js'

const fastify = Fastify({
  logger: true
})

fastify.register(
  databaseRoutes, {
    prefix: "/api/db"
})

// API Health check
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
