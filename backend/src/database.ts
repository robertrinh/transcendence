import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import Database from 'better-sqlite3';

//* Needs export as the database instance so it can be used in other routes
export const db = new Database('./database/transcendence.db')

export default async function databaseRoutes (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {

  // example that updates a database table
  fastify.get('/add-avatar', async (request, reply) => {
    const insert = db.prepare('INSERT INTO avatars (path) VALUES (?)')
    insert.run('/avatars/frog')
    return {status: 'OK'}
  })

  /**
   * A request with a query parameter will look for a specific table in the database. Example url: "/api/db/tables?tablename=avatars".
   * Returns all table names if the tablename is not allowed or no parameter is provided.
   */
  fastify.get('/tables', async (request, reply) => {
    const query = request.query as Record<string, unknown>
    const tablename = query.tablename
    if (typeof tablename === 'string') {
      const allowedTables = [
        "users",
        "avatars",
        "games",
        "tournaments"
      ]
      if (allowedTables.indexOf(tablename) !== -1) {
        const select = db.prepare(`SELECT * FROM ${tablename}`).all()
        return {status: 'OK', select}
      }
    }
    const tables = db.prepare("SELECT name FROM sqlite_schema WHERE type='table'").all()
    return {status: 'OK', tables}
  })

  // database test endpoint
  fastify.get('/test', async (request, reply) => {
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
}
