import { db } from '../databaseInit.js'
import { dbError } from '../error/dbErrors.js'

export const userService = {

    fetchUser: (id: number) => {
        return db.prepare(`
            SELECT
				id,
				status
			FROM users WHERE id = ?
        `).get(id)
    },

    fetchUserName: (id: number) => {
        if (userService.isUserAnonymous(id)) {
            return 'Anonymous'
        }
        return db.prepare(`SELECT username FROM users WHERE id = @id`).pluck().get({id: id})
    },

    fetchUserNameAndAvatar: (id: number) => {
        if (userService.isUserAnonymous(id)) {
            return { username: 'Anonymous', avatar_url: null }
        }
        const user = db.prepare(`
            SELECT u.username, a.path as avatar_url
            FROM users u
            LEFT JOIN avatars a ON u.avatar_id = a.id
            WHERE u.id = ?
        `).get(id) as any
        if (!user) return { username: 'Unknown', avatar_url: null }
        return { username: user.username, avatar_url: user.avatar_url || null }
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
                u.is_anonymous,
                u.anonymized_at,
                u.is_guest,
                u.two_factor_enabled,
                a.path as avatar_url,
                (SELECT COUNT(*) FROM games WHERE (player1_id = u.id OR player2_id = u.id) AND winner_id = u.id) as wins,
                (SELECT COUNT(*) FROM games WHERE (player1_id = u.id OR player2_id = u.id) AND winner_id != u.id AND winner_id IS NOT NULL) as losses,
                (SELECT COUNT(*) FROM games WHERE (player1_id = u.id OR player2_id = u.id) AND status = 'finished') as total_games
            FROM users u 
            LEFT JOIN avatars a ON u.avatar_id = a.id 
            WHERE u.id = ?
        `).get(id)
    },

    fetchPublicProfile: (username: string) => {
        const user = db.prepare(`
            SELECT 
                u.id, 
                u.username, 
                u.nickname,
                u.display_name,
                u.is_anonymous,
                u.anonymized_at,
                a.path as avatar_url,
                (SELECT COUNT(*) FROM games WHERE (player1_id = u.id OR player2_id = u.id) AND winner_id = u.id) as wins,
                (SELECT COUNT(*) FROM games WHERE (player1_id = u.id OR player2_id = u.id) AND winner_id != u.id AND winner_id IS NOT NULL) as losses,
                (SELECT COUNT(*) FROM games WHERE player1_id = u.id OR player2_id = u.id) as total_games
            FROM users u 
            LEFT JOIN avatars a ON u.avatar_id = a.id 
            WHERE u.username = ?
        `).get(username) as any;

        if (!user) return null;

        const winRate = user.total_games > 0
            ? `${((user.wins / user.total_games) * 100).toFixed(1)}%`
            : '0%';

        // If anonymous, return limited info
        if (user.is_anonymous) {
            return {
                id: user.id,
                username: user.username,
                is_anonymous: true,
                anonymized_at: user.anonymized_at,
                wins: user.wins || 0,
                losses: user.losses || 0,
                total_games: user.total_games || 0,
                winRate
            };
        }

        // Return full profile
        return {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            is_anonymous: false,
            wins: user.wins || 0,
            losses: user.losses || 0,
            total_games: user.total_games || 0,
            winRate
        };
    },

    anonymizeProfile: (id: number) => {
        try {
            // Start transaction
            const transaction = db.transaction(() => {
                // Set user as anonymous
                db.prepare(`
                    UPDATE users 
                    SET is_anonymous = 1,
                        anonymized_at = datetime('now'),
                        email = NULL,
                        nickname = NULL,
                        display_name = NULL,
                        two_factor_secret = NULL,
                        two_factor_enabled = 0
                    WHERE id = ?
                `).run(id);
            });

            transaction();

            // Return updated user
            return db.prepare(`
                SELECT 
                    id, 
                    username, 
                    is_anonymous,
                    anonymized_at
                FROM users 
                WHERE id = ?
            `).get(id);
        } catch (err: any) {
            dbError(err);
            throw err;
        }
    },

    isUserAnonymous: (id: number): boolean => {
        const result = db.prepare('SELECT is_anonymous FROM users WHERE id = ?').get(id) as any;
        return result ? Boolean(result.is_anonymous) : false;
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
            // Delete related data first (cascading)
        const deleteData = db.transaction(() => {
            db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(id);
            db.prepare('DELETE FROM user_sessions WHERE user_id = ?').run(id);
            db.prepare('DELETE FROM tournament_participants WHERE user_id = ?').run(id);
            db.prepare('DELETE FROM games WHERE player1_id = ? OR player2_id = ? OR winner_id = ?').run(id, id, id);
            // Delete the user
            const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
            return result;
        })
        try {
            return deleteData();
        } catch (err: any) {
            dbError(err);
            throw err;
        }
    }
}

/* For route-specific error handling, Fastify supports hooks like preValidation, preHandler, and onError, which can be used to intercept errors at various stages of request processing.
 These hooks can be used to validate input, perform authentication, or handle errors before they reach the final handler. When using TypeScript, the FastifyInstance type can be extended via module augmentation to add custom methods, such as authenticate, which can be used in pre-handlers to enforce authentication.
*/