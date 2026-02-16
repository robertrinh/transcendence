import { fetchWithAuth, notifyAuthFailure } from '../../config/api';

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