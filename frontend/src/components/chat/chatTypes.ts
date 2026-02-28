import type { User } from '../util/profileUtils';

export interface Message {
    id: string;
    username: string;
    message: string;
    timestamp: Date;
    isPrivate?: boolean;
    toUser?: string;
}

export interface Friend {
    id: string;
    username: string;
    isOnline: boolean;
}

export interface FriendRequest {
    id: number;
    username: string;
    created_at: string;
}

export interface ChatMiniWindowProps {
    user: User;
    navigateToUserProfile?: (username: string) => void;
}

export type ChatMode = 'public' | 'private';
export type TabMode = 'chat' | 'friends' | 'blocked';

export const SYSTEM_USERNAME = 'System';
