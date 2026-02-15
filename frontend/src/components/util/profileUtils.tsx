import { fetchWithAuth, notifyAuthFailure } from '../../config/api';

/** Game history item returned by GET /api/games/user */
export interface GameHistoryItem {
    id: number;
    player1_id: number | null;
    player2_id: number | null;
    score_player1: number | null;
    score_player2: number | null;
    winner_id: number | null;
    status: string;
    created_at: string;
    finished_at?: string | null;
    opponent_username?: string | null;
}

export interface User {
    id: string;
    username: string;
    email?: string;
    nickname?: string;
    display_name?: string;
    avatar_url?: string;
    wins?: number;
    losses?: number;
    total_games?: number;
    winRate?: string;
    is_anonymous?: boolean;
    anonymized_at?: string;
    two_factor_enabled?: boolean;
}

export const fetchUserProfile = async (): Promise<User | null> => {
    try {
        const response = await fetchWithAuth('/api/users/profile/me');
        if (response.ok) {
            const data = await response.json();
            return data.profile;
        }
        if (response.status === 404) {
            // profile not found (e.g. account deleted); 401 already handled by fetchWithAuth
            notifyAuthFailure();
            return null;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        return null;
    }
};

/** Returns all games the user participated in (GET /api/games/user). Stored as array as the API returns a list of matches. */
export const fetchUserGameHistory = async (): Promise<GameHistoryItem[]> => {
    try {
        const response = await fetchWithAuth('/api/games/user');
        if (response.ok) {
            const data = await response.json();
            const list = data.result ?? [];
            return Array.isArray(list) ? list : [];
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch game history:', error);
        return [];
    }
};

export const getAvatarUrl = (avatarPath?: string): string | undefined => {
    if (!avatarPath) return undefined;
    
    // Extract filename from path if it contains /uploads/avatars/
    if (avatarPath.includes('/uploads/avatars/')) {
        const filename = avatarPath.split('/').pop();
        return `/api/avatars/${filename}`;
    }
    
    // If it's already just a filename
    if (!avatarPath.includes('/')) {
        return `/api/avatars/${avatarPath}`;
    }
    
    return `/api/avatars/${avatarPath}`;
};