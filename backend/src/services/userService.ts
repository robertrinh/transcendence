import { db } from '../databaseInit.js'
import { dbError } from '../Errors/dbErrors.js'

export const userService = {

    fetchAllUsers: () => {
        return db.prepare(`
            SELECT 
                u.id,
                u.status,
                u.username, 
                u.nickname,
                u.display_name,
                a.path as avatar_url,
                u.created_at
            FROM users u 
            LEFT JOIN avatars a ON u.avatar_id = a.id
            ORDER BY u.created_at DESC
        `).all()
    },

    fetchUser: (id: number) => {
        return db.prepare(`
            SELECT 
                u.id, 
                u.status,
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
    },

    fetchOwnProfile: (id:number) => {
        return db.prepare(`
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
    },
    // for profile view
    fetchPublicProfile: (username: string) => {
        return db.prepare(`
            SELECT 
            u.id, 
            u.username, 
            u.nickname,
            u.display_name,
            a.path as avatar_url,
            (SELECT COUNT(*) FROM games WHERE (player1_id = u.id OR player2_id = u.id) AND winner_id = u.id) as wins,
            (SELECT COUNT(*) FROM games WHERE (player1_id = u.id OR player2_id = u.id) AND winner_id != u.id AND winner_id IS NOT NULL) as losses,
            (SELECT COUNT(*) FROM games WHERE player1_id = u.id OR player2_id = u.id) as total_games
        FROM users u 
        LEFT JOIN avatars a ON u.avatar_id = a.id 
        WHERE u.username = ?
        `).get(username)
    },

    addUser: async (username: string, hashedPassword: string) => {
        try {
            db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword)
        }
        catch (err: any) {
            dbError(err);
        }
    },

    updateProfile: (updates: string[], values: any[], id: number) => {
        values.push(id);
        return db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values)
    },

    uploadAvatar: (fileName: string, id: number) => {
        const avatarResult = db.prepare('INSERT INTO avatars (path, name) VALUES (?, ?)').run(fileName, fileName) 
        db.prepare('UPDATE users SET avatar_id = ? WHERE id = ?').run(avatarResult.lastInsertRowid, id)
    },

    deleteUser: (id: number) => {
        return db.prepare('DELETE FROM users WHERE id = ?').run(id)
    }
}

/* For route-specific error handling, Fastify supports hooks like preValidation, preHandler, and onError, which can be used to intercept errors at various stages of request processing.
 These hooks can be used to validate input, perform authentication, or handle errors before they reach the final handler. When using TypeScript, the FastifyInstance type can be extended via module augmentation to add custom methods, such as authenticate, which can be used in pre-handlers to enforce authentication.
*/