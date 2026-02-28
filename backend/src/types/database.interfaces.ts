//to be able to get a type on returns from the database!

export interface Tournament {
	id: number;
	name: string;
	description: string;
	max_participants: number;
	status: 'open' | 'ongoing' | 'finished' | 'canceled';
	winner_id: number | null;
	created_at: string;
	start_date: string;
	end_date?: string;
}

export interface TournamentParticipant {
	id: number;
	tournament_id: number;
	user_id: number;
	joined_at: string;
}

export interface Game {
	id: number;
	player1_id: number | null;
	player2_id: number | null;
	score_player1: number | null;
	score_player2: number | null;
	winner_id: number | null;
	tournament_id: number | null;
	round: number | null;
	status: 'pending' | 'ready' | 'ongoing' | 'finished' | 'cancelled';
	created_at: string;
	finished_at?: string;
}

export interface Player {
	id: number;
	status: 'searching' | 'playing';
}

export interface Queue {
	player_id: number;
	joined_at: number;
	lobby_id: string;
	private: boolean;
}

export interface LeaderBoard {
	username: string;
	wins: number;
	losses: number;
}

export interface GameHistoryItem {
    id: number;
	username_own?: string | null;
    username_opponent?: string | null;
	username_winner: string | null;
    score_own: number | null;
    score_opponent: number | null;
    created_at: string;
    finished_at?: string | null;
}