import { db } from '../databaseInit.js';
import { Game } from '../types/database.interfaces.js';

function removeStaleQueueEntries(entry : { player_id: number }) {
    db.prepare('DELETE FROM game_queue WHERE player_id = ?').run(entry.player_id);
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run('idle', entry.player_id); 
    console.log(`removed player ${entry.player_id} from game queue because of timeout`);
}

export function  dbCleanUpJob () {
    setInterval(() => {
        const staleTimeRandom  = Math.floor(Date.now() / 1000) - 45;
        const staleTimeLobby = Math.floor(Date.now() / 1000) - 120;

        const cleanup = db.transaction(() => {
        const staleQueueEntries = db.prepare('SELECT player_id FROM game_queue WHERE lobby_id IS NULL AND joined_at < ?').all(staleTimeRandom) as { player_id: number }[];
        for (const entry of staleQueueEntries) {
            removeStaleQueueEntries(entry);
        }
        const staleQueueEntriesLobby = db.prepare('SELECT player_id FROM game_queue WHERE lobby_id IS NOT NULL AND joined_at < ?').all(staleTimeLobby) as { player_id: number }[];
        for (const entry of staleQueueEntriesLobby) {
            removeStaleQueueEntries(entry);
        }

        const staleGames = db.prepare(`SELECT id, player1_id, player2_id FROM games WHERE status NOT IN ('finished', 'cancelled') AND finished_at IS NULL AND created_at < (datetime('now', '-2 minutes'))`).all() as Game[];
        for (const game of staleGames) {
            db.prepare('UPDATE games SET status = ? WHERE id = ?').run('cancelled', game.id);    
            db.prepare('UPDATE users SET status = ? WHERE id = ? OR id = ?').run('idle', game.player1_id, game.player2_id);
            console.log(`set game: ${game.id} to cancelled because of timeout`);
        }

        const result = db.prepare(`
        UPDATE users SET status = 'idle'
        WHERE status IN ('playing')
        AND id NOT IN (
            SELECT player1_id FROM games WHERE status = 'ready'
            UNION
            SELECT player2_id FROM games WHERE status = 'ready'
        )`).run()
        if (result.changes != 0)
            console.log(`set users to idle because of stuck in game/matched status without an active game`);
        })

        cleanup();
    }, 15000);
}
