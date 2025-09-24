import Fastify from 'fastify'
import FastifyStatic from '@fastify/static'

const fastify = Fastify({
  logger: true
})

const path = "/app/"
fastify.register(FastifyStatic, {
	root: path
})

fastify.get('/', async function (request, reply) {
	return reply.sendFile('index.html')
})

// Setup a API route
fastify.get('/api/health', async (request, reply) => {
  return { status: 'OK', message: 'Backend API is running' }
})


// Start server
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Backend API listening at ${address}`)
})