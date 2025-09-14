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

fastify.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})