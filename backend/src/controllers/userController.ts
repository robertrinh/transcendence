import { ApiError } from '../Errors/errors.js';
import { userService } from '../services/userService.js'
import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { pipeline } from 'stream/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const uploadsDir = path.resolve('./uploads/avatars')
try {
    if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true })
        console.log('Created uploads directory:', uploadsDir)
    }
} catch (error) {
    console.warn('Could not create uploads directory, will try at runtime:', error)
}

export const userController = {

    getAllUsers: async () => {
        const users = userService.fetchAllUsers();
        return {success: true, users }
    },

    createUser: async (req: FastifyRequest, reply: FastifyReply) => {
        const { username, password } = req.body as { username: string, password: string}
        const hashedPassword = await bcrypt.hash(password, 10)
        userService.addUser(username, hashedPassword);
        return {success: true, message: 'User created, welcome to the game!'};
    },

    // GET OWN PROFILE - Always full data
    getMyProfile: async (req: FastifyRequest, reply: FastifyReply) => {
        const user_id = req.user!.userId;
        const profile = userService.fetchOwnProfile(user_id);
        
        if (!profile) {
            throw new ApiError(404, 'Profile not found');
        }
        
        // Return full profile even if anonymous
        return { success: true, profile };
    },

    // GET PUBLIC PROFILE - Limited if anonymous
    getUserProfileByUsername: async (req: FastifyRequest, reply: FastifyReply) => {
        const { username } = req.params as { username: string };
        const user = userService.fetchPublicProfile(username);

        if (!user) {
            throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
        }

        // Service already handles anonymous logic
        return { success: true, profile: user };
    },

    //ANONYMIZE PROFILE
    anonymizeProfile: async (req: FastifyRequest, reply: FastifyReply) => {
        const userId = req.user!.userId;
        
        // Check if already anonymous
        if (userService.isUserAnonymous(userId)) {
            throw new ApiError(400, 'Profile is already anonymized', 'ALREADY_ANONYMOUS');
        }

        const result = userService.anonymizeProfile(userId);
        
        if (!result) {
            throw new ApiError(500, 'Failed to anonymize profile', 'ANONYMIZE_FAILED');
        }

        return {
            success: true,
            message: 'Profile anonymized successfully.',
            user: result
        };
    },
    
    updateProfile: async (req: FastifyRequest, reply: FastifyReply) => {
        const { nickname, display_name, email, password } = req.body as { 
            nickname?: string, 
            display_name?: string, 
            email?: string, 
            password?: string
        }
        const userId = req.user!.userId

        const updates: string[] = []
        const values: any[] = []
        
        if (nickname !== undefined) {
            updates.push('nickname = ?')
            values.push(nickname)
        }
        if (display_name !== undefined) {
            updates.push('display_name = ?')
            values.push(display_name)
        }
        if (email !== undefined) {
            updates.push('email = ?')
            values.push(email)
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10)
            updates.push('password = ?')
            values.push(hashedPassword)
        }
        if (updates.length === 0) {
            return reply.code(400).send({
                success: false,
                error: 'No fields to update'
            })
        }
        const result = userService.updateProfile(updates, values, userId);
        if (result.changes == 0)
            throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
        return { 
            success: true, 
            message: 'User updated yagetme!' 
        }
    },

    uploadAvatar: async (req: FastifyRequest, reply: FastifyReply) => {
       try {
            if (!existsSync(uploadsDir)) {
                try {
                    mkdirSync(uploadsDir, { recursive: true })
                    console.log('Created uploads directory at runtime:', uploadsDir)
                } catch (dirError) {
                    console.error('Failed to create uploads directory:', dirError)
                    return reply.code(500).send({ 
                        success: false, 
                        error: 'Server configuration error - uploads not available' 
                    })
                }
            }
            const data = await req.file()
            
            if (!data) {
                return reply.code(400).send({ success: false, error: 'No file uploaded' })
            }

            const allowedTypes = ['image/jpg']
            if (!allowedTypes.includes(data.mimetype)) {
                return reply.code(400).send({ 
                    success: false, 
                    error: 'Only JPG files are allowed' 
                })
            }

            const fileExtension = '.jpg'
            const fileName = `${randomUUID()}${fileExtension}`
            const filePath = path.join(uploadsDir, fileName)

            await pipeline(data.file, createWriteStream(filePath))

            userService.uploadAvatar(fileName, req.user!.userId)

            return {
                success: true,
                message: 'Avatar uploaded successfully',
                avatar_url: fileName
            }
        } catch (error) {
            console.error('Avatar upload error:', error)
            throw new ApiError(500, 'Failed to upload avatar')
        }
    },

   deleteUser: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).userId;
            const { password } = request.body as { password?: string };

            if (!password) {
                return reply.status(400).send({
                    error: 'Password is required to delete account'
                });
            }
			
            // Get user with password hash - cast as any to access password property
            const user = userService.fetchUser(userId) as { id: number; username: string; password: string };
            if (!user) {
                return reply.status(404).send({
                    error: 'User not found'
                });
            }

            // Verify password before deletion
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return reply.status(403).send({
                    error: 'Invalid password'
                });
            }

            // Delete user and related data
            const deleteResult = userService.deleteUser(userId);
            console.log('✅ User deleted:', userId, deleteResult);

            return reply.status(200).send({
                success: true,
                message: 'Account deleted successfully'
            });
        } catch (error: any) {
            console.error('❌ Error deleting user:', error.message, error.stack);
            return reply.status(500).send({
                error: 'Failed to delete account',
                details: error.message
            });
        }
    }
}