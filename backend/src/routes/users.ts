// import { FastifyInstance, FastifyPluginOptions } from 'fastify'
// import { db } from '../database.js'
// import bcrypt from 'bcrypt'
// import { authenticate } from '../auth/middleware.js'

// //* curl http://localhost:3000/api/db/tables?tablename=users for testing hashed passwords

// export default async function usersRoutes (
// 	fastify: FastifyInstance,
// 	options: FastifyPluginOptions
// ) {

// 	//* Gets ALL users
// 	fastify.get('/users', async (request, reply) => {
// 		const users = db.prepare('SELECT id, username FROM users').all()
// 		return { success: true, users }
// 	})

// 	//* Gets a single userID
// 	fastify.get('/users/:id', async (request, reply) => {
// 		const { id } = request.params as { id: string }
// 		const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id)

// 		if (!user)
// 			return reply.code(404).send({
// 				success: false,
// 				error: 'User not found'
// 			}) //TODO need to check if this is correct way
// 		return { success: true, user }
// 	})
	
// 	//* Updates a user
// 	fastify.put('/users/:id', async (request, reply) => {
// 		const { id } = request.params as { id: string }
// 		const { username, password } = request.body as { username: string, password: string }

// 		const hashedPassword = await bcrypt.hash(password, 10)
// 		const result = db.prepare(' UPDATE users SET username = ?, password = ? WHERE id = ?').run(username, hashedPassword, id)
// 		if (result.changes == 0) 
// 			return reply.code(404).send({ success: false, error: 'User not found' }) //TODO check
// 		return { 
// 			success: true, 
// 			message: 'User updated yagetme!' 
// 		}
// 	})

// 	//* Deletes a user
// 	fastify.delete('/users/:id', async (request, reply) => {
// 		const { id } = request.params as { id: string }
		
// 		const result = db.prepare('DELETE FROM users WHERE id = ?').run(id)
// 		if (result.changes == 0)
// 			return reply.code(404).send({ success: false, error: 'User not found'}) //TODO check
// 		return { 
// 			success: true, 
// 			message: 'User deleted (banished to the shadow realm)' 
// 		}
// 	})

// 	// ADD THESE NEW ENDPOINTS AFTER YOUR EXISTING DELETE ROUTE:

// //* Get current user's profile (authenticated)
// fastify.get('/profile/me', { preHandler: authenticate }, async (request, reply) => {
//     const user = db.prepare(`
//         SELECT 
//             u.id, 
//             u.username, 
//             u.nickname,
//             u.email,
//             u.created_at,
//             a.path as avatar_url,
//         FROM users u 
//         LEFT JOIN avatars a ON u.avatar_id = a.id 
//         WHERE u.id = ?
//     `).get(request.user!.userId)

//     if (!user) {
//         return reply.code(404).send({ success: false, error: 'User not found' })
//     }

//     // const winRate = user.total_games > 0 ? ((user.wins / user.total_games) * 100).toFixed(1) : '0'
    
//     // return { 
//     //     success: true, 
//     //     user: {
//     //         ...user,
//     //         winRate: `${winRate}%`
//     //     }
//     // }
// })

// //* Update user profile - simple version
// fastify.put('/profile/me', { preHandler: authenticate }, async (request, reply) => {
//     const { nickname, email } = request.body as { 
//         nickname?: string, 
//         email?: string 
//         // display_name?: string, 
//     }
//     const userId = request.user!.userId

//     // Check nickname uniqueness if provided
//     if (nickname) {
//         const existingUser = db.prepare('SELECT id FROM users WHERE nickname = ? AND id != ?').get(nickname, userId)
//         if (existingUser) {
//             return reply.code(400).send({
//                 success: false,
//                 error: 'Nickname already exists'
//             })
//         }
//     }

//     // Build update query dynamically
//     const updates: string[] = []
//     const values: any[] = []
    
//     if (nickname !== undefined) {
//         updates.push('nickname = ?')
//         values.push(nickname)
//     }
//     // if (display_name !== undefined) {
//     //     updates.push('display_name = ?')
//     //     values.push(display_name)
//     // }
//     if (email !== undefined) {
//         updates.push('email = ?')
//         values.push(email)
//     }
    
//     if (updates.length === 0) {
//         return reply.code(400).send({
//             success: false,
//             error: 'No fields to update'
//         })
//     }
    
//     values.push(userId)
//     const result = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values)
    
//     if (result.changes === 0) {
//         return reply.code(404).send({ success: false, error: 'User not found' })
//     }
    
//     return { success: true, message: 'Profile updated successfully' }
// })
// }

import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { db } from '../database.js'
import bcrypt from 'bcrypt'
import { authenticate } from '../auth/middleware.js'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { pipeline } from 'stream/promises'
import path from 'path'
import { randomUUID } from 'crypto'

//* curl http://localhost:3000/api/db/tables?tablename=users for testing hashed passwords

// Ensure uploads directory exists
const uploadsDir = path.resolve('./uploads/avatars')
try {
    if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true })
        console.log('Created uploads directory:', uploadsDir)
    }
} catch (error) {
    console.warn('Could not create uploads directory, will try at runtime:', error)
    // Directory will be created when first upload happens
}

export default async function usersRoutes (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {

    // Register multipart for file uploads
    fastify.register(import('@fastify/multipart'), {
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    })

    //* Gets ALL users
    fastify.get('/users', async (request, reply) => {
        const users = db.prepare(`
            SELECT 
                u.id, 
                u.username, 
                u.nickname,
                u.display_name,
                a.path as avatar_url,
                u.created_at
            FROM users u 
            LEFT JOIN avatars a ON u.avatar_id = a.id
            ORDER BY u.created_at DESC
        `).all()
        return { success: true, users }
    })

    //* Get user by ID
    fastify.get('/users/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        const user = db.prepare(`
            SELECT 
                u.id, 
                u.username, 
                u.nickname,
                u.display_name,
                u.email,
                u.created_at,
                a.path as avatar_url,
                (SELECT COUNT(*) FROM games WHERE (player1_id = u.id OR player2_id = u.id) AND winner_id = u.id) as wins,
                (SELECT COUNT(*) FROM games WHERE (player1_id = u.id OR player2_id = u.id) AND winner_id != u.id AND winner_id IS NOT NULL) as losses,
                (SELECT COUNT(*) FROM games WHERE player1_id = u.id OR player2_id = u.id) as total_games
            FROM users u 
            LEFT JOIN avatars a ON u.avatar_id = a.id 
            WHERE u.id = ?
        `).get(id)

        if (!user)
            return reply.code(404).send({
                success: false,
                error: 'User not found'
            })
        
        // Calculate win rate
        // const winRate = user.total_games > 0 ? ((user.wins / user.total_games) * 100).toFixed(1) : '0'
        
        // return { 
        //     success: true, 
        //     user: {
        //         ...user,
        //         winRate: `${winRate}%`
        //     }
        // }
    })

    //* Get current user's profile (authenticated)
    fastify.get('/profile/me', { preHandler: authenticate }, async (request, reply) => {
        const user = db.prepare(`
            SELECT 
                u.id, 
                u.username, 
                u.nickname,
                u.display_name,
                u.email,
                u.created_at,
                a.path as avatar_url,
                (SELECT COUNT(*) FROM games WHERE (player1_id = u.id OR player2_id = u.id) AND winner_id = u.id) as wins,
                (SELECT COUNT(*) FROM games WHERE (player1_id = u.id OR player2_id = u.id) AND winner_id != u.id AND winner_id IS NOT NULL) as losses,
                (SELECT COUNT(*) FROM games WHERE player1_id = u.id OR player2_id = u.id) as total_games
            FROM users u 
            LEFT JOIN avatars a ON u.avatar_id = a.id 
            WHERE u.id = ?
        `).get(request.user!.userId)

        if (!user) {
            return reply.code(404).send({ success: false, error: 'User not found' })
        }

        // const winRate = user.total_games > 0 ? ((user.wins / user.total_games) * 100).toFixed(1) : '0'
        
        // return { 
        //     success: true, 
        //     user: {
        //         ...user,
        //         winRate: `${winRate}%`
        //     }
        // }
    })

    //* Update user profile
    fastify.put('/profile/me', { preHandler: authenticate }, async (request, reply) => {
        const { nickname, display_name, email } = request.body as { 
            nickname?: string, 
            display_name?: string, 
            email?: string 
        }
        const userId = request.user!.userId

        // Check if nickname is provided and if it's unique
        if (nickname) {
            if (nickname.length < 3) {
                return reply.code(400).send({
                    success: false,
                    error: 'Nickname must be at least 3 characters long'
                })
            }

            const existingUser = db.prepare('SELECT id FROM users WHERE nickname = ? AND id != ?').get(nickname, userId)
            if (existingUser) {
                return reply.code(400).send({
                    success: false,
                    error: 'Nickname already exists'
                })
            }
        }

        // Build update query dynamically
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
        
        if (updates.length === 0) {
            return reply.code(400).send({
                success: false,
                error: 'No fields to update'
            })
        }
        
        values.push(userId)
        const result = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values)
        
        if (result.changes === 0) {
            return reply.code(404).send({ success: false, error: 'User not found' })
        }
        
        return { success: true, message: 'Profile updated successfully' }
    })

    //* Upload avatar
    fastify.post('/profile/avatar', { preHandler: authenticate }, async (request, reply) => {
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
            const data = await request.file()
            
            if (!data) {
                return reply.code(400).send({ success: false, error: 'No file uploaded' })
            }

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
            if (!allowedTypes.includes(data.mimetype)) {
                return reply.code(400).send({ 
                    success: false, 
                    error: 'Only JPG and PNG files are allowed' 
                })
            }

            // Generate unique filename
            const fileExtension = data.mimetype === 'image/png' ? '.png' : '.jpg'
            const fileName = `${randomUUID()}${fileExtension}`
            const filePath = path.join(uploadsDir, fileName)

            // Save file
            await pipeline(data.file, createWriteStream(filePath))

            // Save avatar to database
            const avatarPath = `/uploads/avatars/${fileName}`
            const insertAvatar = db.prepare('INSERT INTO avatars (path, name) VALUES (?, ?)')
            const avatarResult = insertAvatar.run(avatarPath, data.filename || 'avatar')
            
            // Update user's avatar_id
            const updateUser = db.prepare('UPDATE users SET avatar_id = ? WHERE id = ?')
            updateUser.run(avatarResult.lastInsertRowid, request.user!.userId)

            return {
                success: true,
                message: 'Avatar uploaded successfully',
                avatarUrl: avatarPath
            }
        } catch (error) {
            console.error('Avatar upload error:', error)
            return reply.code(500).send({ 
                success: false, 
                error: 'Failed to upload avatar' 
            })
        }
    })

    //* Delete user
    fastify.delete('/users/:id', { preHandler: authenticate }, async (request, reply) => {
        const { id } = request.params as { id: string }
        
        const result = db.prepare('DELETE FROM users WHERE id = ?').run(id)
        if (result.changes == 0)
            return reply.code(404).send({ success: false, error: 'User not found'})
        return { 
            success: true, 
            message: 'User deleted (banished to the shadow realm)' 
        }
    })
}