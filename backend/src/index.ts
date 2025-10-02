import Fastify from 'fastify'
import FastifyStatic from '@fastify/static'
import { initDatabase } from './database.js'

const fastify = Fastify({
  logger: true
})

const db = initDatabase()

const path = "/app/"
fastify.register(FastifyStatic, {
	root: path
})

fastify.get('/', async function (request, reply) {
	return reply.sendFile('index.html')
})

// API Health check
fastify.get('/api/health', async (request, reply) => {
  return { status: 'OK', message: 'Backend API is running', database: 'SQLite3 is connected' }
})

// database test endpoint
fastify.get('/api/db/test', async (request, reply) => {
  try {
    // Check user existence and count
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get()
    
    return { 
      success: true,
      tables: tables.map(t => t.name),
      userCount: userCount.count,
      message: `Database is working! Found ${userCount.count} users.`
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'Database test failed', 
      message: error.message 
    }
  }
})

// graceful shutdown
fastify.addHook('onClose', async () => {
	db.close()
	console.log('Database connection is closed')
})

// Start server
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Backend API listening at ${address}`)
})