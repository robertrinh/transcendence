import { ApiError } from '../Errors/errors.js';
import { userService } from '../services/userService.js'
import { FastifyRequest, FastifyReply } from 'fastify';

export const userController = {
	getAllUsers: async () => {
		const users = userService.fetchAllUsers();
		return {success: true, users }
	},

	getUserByID: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number }
		const user = userService.fetchUser(id);
		if (!user)
			throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
		return { success: true, user }
	},

	//TODO Password hashing, this is a security hazard lol
	createUser: async (req: FastifyRequest, reply: FastifyReply) => {
		const { username, password } = req.body as { username: string, password: string}
		if (!username || !password) {
			throw new ApiError(400, 'username and password are required');
		} //TODO check for other validations e.g. length or duplicate username, maybe different function?
		userService.addUser(username, password);
		return {success: true, message: 'User created, welcome to the game!'};
	},
	
	//what is this function actually used for? or how should this be made
	updateUser: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number }
		const { username, password } = req.body as { username: string, password: string }
		const result = userService.updateUser(id, username, password);
		if (result.changes == 0)
			throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
		return { 
			success: true, 
			message: 'User updated yagetme!' 
		}
	},

	deleteUser: async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: number }
		const result = userService.deleteUser(id);
		if (result.changes == 0)
			throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
		return { 
			success: true, 
			message: 'User deleted (banished to the shadow realm)' 
		}
	}

}
