import { useState, useCallback } from 'react';
import { fetchWithAuth } from '../../config/api';
import type { Friend, FriendRequest } from './chatTypes';
import type { User } from '../util/profileUtils';

export function useFriends(user: User, onlineUsers: string[], showToast: (message: string) => void) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

    const loadFriendsAndBlocked = useCallback(async () => {
        try {
            if (user.is_guest === true) {
                const blockedRes = await fetchWithAuth('/api/friends/blocked');
                if (blockedRes.ok) {
                    const data = await blockedRes.json();
                    if (data?.blocked) {
                        setBlockedUsers(data.blocked.map((b: { username: string }) => b.username));
                    }
                }
                return;
            }
            const [friendsRes, incomingRes, outgoingRes, blockedRes] = await Promise.all([
                fetchWithAuth('/api/friends'),
                fetchWithAuth('/api/friends/requests/incoming'),
                fetchWithAuth('/api/friends/requests/outgoing'),
                fetchWithAuth('/api/friends/blocked')
            ]);
            if (friendsRes.ok) {
                const data = await friendsRes.json();
                if (data?.friends) {
                    setFriends(data.friends.map((f: { id: number; username: string }) => ({
                        id: String(f.id),
                        username: f.username,
                        isOnline: onlineUsers.includes(f.username)
                    })));
                }
            }
            if (incomingRes.ok) {
                const data = await incomingRes.json();
                if (data?.requests) setIncomingRequests(data.requests);
            }
            if (outgoingRes.ok) {
                const data = await outgoingRes.json();
                if (data?.requests) setOutgoingRequests(data.requests);
            }
            if (blockedRes.ok) {
                const data = await blockedRes.json();
                if (data?.blocked) {
                    setBlockedUsers(data.blocked.map((b: { username: string }) => b.username));
                }
            }
        } catch {
            //* ignore! list will have no changes
        }
    }, [user.is_guest, onlineUsers]);

    const sendFriendRequest = useCallback(
        async (username: string) => {
            if (friends.some((f) => f.username === username) || username === user.username)
                return;
            if (outgoingRequests.some((r) => r.username === username)) return;
            try {
                const res = await fetchWithAuth('/api/friends/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                if (res.ok) {
                    await loadFriendsAndBlocked();
                    showToast('Friend request sent');
                } else {
                    const data = (await res.json()) as { error?: string };
                    const msg = data?.error || 'Failed to send request';
                    showToast(msg);
                    if (msg === 'Already friends' || msg === 'Friend request already exists') {
                        loadFriendsAndBlocked();
                    }
                }
            } catch {
                showToast('Failed to send friend request');
            }
        },
        [friends, user.username, outgoingRequests, loadFriendsAndBlocked, showToast]
    );

    const acceptRequest = useCallback(
        async (username: string) => {
            try {
                const res = await fetchWithAuth('/api/friends/requests/accept', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                if (res.ok) {
                    loadFriendsAndBlocked();
                    showToast('Friend added');
                } else {
                    const data = (await res.json()) as { error?: string };
                    showToast(data?.error || 'Failed to accept');
                }
            } catch {
                showToast('Failed to accept request');
            }
        },
        [loadFriendsAndBlocked, showToast]
    );

    const declineRequest = useCallback(
        async (username: string) => {
            try {
                const res = await fetchWithAuth('/api/friends/requests/decline', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                if (res.ok) loadFriendsAndBlocked();
                else {
                    const data = (await res.json()) as { error?: string };
                    showToast(data?.error || 'Failed to decline');
                }
            } catch {
                showToast('Failed to decline request');
            }
        },
        [loadFriendsAndBlocked, showToast]
    );

    const cancelRequest = useCallback(
        async (username: string) => {
            try {
                const res = await fetchWithAuth('/api/friends/requests/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                if (res.ok) loadFriendsAndBlocked();
                else {
                    const data = (await res.json()) as { error?: string };
                    showToast(data?.error || 'Failed to cancel');
                }
            } catch {
                showToast('Failed to cancel request');
            }
        },
        [loadFriendsAndBlocked, showToast]
    );

    const unblockUser = useCallback(
        async (username: string) => {
            try {
                const res = await fetchWithAuth('/api/friends/unblock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                if (res.ok) loadFriendsAndBlocked();
                else if (!user.is_guest) {
                    const data = (await res.json()) as { error?: string };
                    showToast(data?.error || 'Failed to unblock');
                }
            } catch {
                if (!user.is_guest) showToast('Failed to unblock');
            }
        },
        [loadFriendsAndBlocked, showToast, user.is_guest]
    );

    return {
        friends,
        incomingRequests,
        outgoingRequests,
        blockedUsers,
        loadFriendsAndBlocked,
        sendFriendRequest,
        acceptRequest,
        declineRequest,
        cancelRequest,
        unblockUser
    };
}
