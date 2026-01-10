import { db } from '../database.js'
import { dbError } from '../Errors/dbErrors.js'

export const userService = {

	fetchAllUsers: () => {
		return db.prepare('SELECT id, username FROM users').all()
	},

	fetchUser: (id: number) => {
		return db.prepare('SELECT id, username FROM users WHERE id = ?').get(id)
	},

	addUser: (username: string, password: string) => {
		try {
			db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, password)
		}
		catch (err: any) {
			dbError(err);
		}
	},

	updateUser: (id: number, username: string, password: string) => {
		return db.prepare(' UPDATE users SET username = ?, password = ? WHERE id = ?').run(username, password, id)
	},

	deleteUser: (id: number) => {
		return db.prepare('DELETE FROM users WHERE id = ?').run(id)
	}
}

/* For route-specific error handling, Fastify supports hooks like preValidation, preHandler, and onError, which can be used to intercept errors at various stages of request processing.
 These hooks can be used to validate input, perform authentication, or handle errors before they reach the final handler. When using TypeScript, the FastifyInstance type can be extended via module augmentation to add custom methods, such as authenticate, which can be used in pre-handlers to enforce authentication.
*/