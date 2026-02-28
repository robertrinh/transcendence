import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../config/api';
import { User } from '../util/profileUtils';

interface Message {
    id: string;
    username: string;
    message: string;
    timestamp: Date;
    isPrivate?: boolean;
    toUser?: string;
}

interface Friend {
    id: string;
    username: string;
    isOnline: boolean;
}

interface FriendRequest {
    id: number;
    username: string;
    created_at: string;
}

interface ChatMiniWindowProps {
    user: User;
    navigateToUserProfile?: (username: string) => void; //new
}

type ChatMode = 'public' | 'private';
type TabMode = 'chat' | 'friends' | 'blocked';

const SYSTEM_USERNAME = 'System';

const ChatMiniWindow: React.FC<ChatMiniWindowProps> = ({ user, navigateToUserProfile }) => {

if (user.is_anonymous) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Chat Unavailable</h3>
                    <p className="text-gray-600">
                        Anonymous users cannot access the chat feature.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        This restriction is permanent for anonymous profiles.
                    </p>
                </div>
            </div>
        );
    }
 
 const viewUserProfile = (username: string) => {
        if (navigateToUserProfile) {
            navigateToUserProfile(username);
        }
    };
    //  Start with empty messages - will be filled by SSE
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [connected, setConnected] = useState(false); //  Track SSE connection
    const [connectionId, setConnectionId] = useState<string | null>(null); // NEW: Store connection ID
    const [toast, setToast ] = useState<string | null>(null); // new for public profile
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null); // NEW: Store EventSource ref

    // Social features state
    const [activeTab, setActiveTab] = useState<TabMode>('chat');
    const [chatMode, setChatMode] = useState<ChatMode>('public');
    const [privateChatWith, setPrivateChatWith] = useState<string>('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [guestUsernames, setGuestUsernames] = useState<string[]>([]);

    const [confirmation, setConfirmation] = useState<{
        action: 'remove' | 'block' | null;
        username: string | null;
    }>({ action: null, username: null });

    const [actionPopover, setActionPopover] = useState<{ username: string; messageId: string } | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    //* load friends and blocked from API (guests only get blocked list)
    const loadFriendsAndBlocked = async () => {
        try {
            if (user.is_guest === true) {
                const blockedRes = await fetchWithAuth('/api/friends/blocked');
                if (blockedRes.ok) {
                    const data = await blockedRes.json();
                    if (data?.blocked) {
                        setBlockedUsers(data.blocked.map((blockedUser: { username: string }) => blockedUser.username));
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
                    setFriends(data.friends.map((friend: { id: number; username: string }) => ({
                        id: String(friend.id),
                        username: friend.username,
                        isOnline: onlineUsers.includes(friend.username)
                    })));
                }
            }
            if (incomingRes.ok) {
                const data = await incomingRes.json();
                if (data?.requests) {
                    setIncomingRequests(data.requests);
                }
            }
            if (outgoingRes.ok) {
                const data = await outgoingRes.json();
                if (data?.requests) {
                    setOutgoingRequests(data.requests);
                }
            }
            if (blockedRes.ok) {
                const data = await blockedRes.json();
                if (data?.blocked) {
                    setBlockedUsers(data.blocked.map((blockedUser: { username: string }) => blockedUser.username));
                }
            }
        } catch {
            //* ignore! list will have no changes
        }
    };

    useEffect(() => {
        connectSSE();
        loadFriendsAndBlocked();
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [user]);

    useEffect(() => {
        if (user.is_guest && activeTab === 'friends') {
            setActiveTab('chat');
        }
    }, [user.is_guest, activeTab]);

    //* Refetch friends + requests when switching to Friends tab
    useEffect(() => {
        if (activeTab === 'friends' && !user.is_guest) {
            loadFriendsAndBlocked();
        }
    }, [activeTab]);

	//* Checks status of friend request with a poll
    const FRIENDS_POLL_MS = 5000; //* 5 seconds
    useEffect(() => {
        if (activeTab !== 'friends' || user.is_guest) 
			return;
        const interval = setInterval(() => {
            loadFriendsAndBlocked();
        }, FRIENDS_POLL_MS);
        return () => clearInterval(interval);
    }, [activeTab, user.is_guest]);

    const connectSSE = () => {
        try {
            if (user.is_anonymous) {
                console.log('Skipping SSE connection for anonymous user');
                setConnected(false);
                return;
            }
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const sseUrl = `/api/chat/stream?token=${token}`;
            const eventSource = new EventSource(sseUrl);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log('SSE onopen triggered');
                setConnected(true);
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    switch (data.type) {
                        case 'connected':
                            setConnectionId(data.connectionId);
                            joinChat(data.connectionId);
                            if (data.onlineUsers)
                                setOnlineUsers(data.onlineUsers);
                            if (Array.isArray(data.guestUsernames))
                                setGuestUsernames(data.guestUsernames);
                            break;

                        case 'history':
                            const historyMessages = data.messages.map((msg: any) => ({
                                id: msg.id,
                                username: msg.username,
                                message: msg.message,
                                timestamp: new Date(msg.timestamp),
                                isPrivate: msg.isPrivate,
                                toUser: msg.toUser
                            }));
                            setMessages(historyMessages);
                            break;

                        case 'message':
                            const newMsg: Message = {
                                id: data.id,
                                username: data.username,
                                message: data.message,
                                timestamp: new Date(data.timestamp),
                                isPrivate: data.isPrivate,
                                toUser: data.toUser
                            };
                            setMessages(prev => [...prev, newMsg]);
                            break;

                        case 'user_joined':
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                username: SYSTEM_USERNAME,
                                message: data.message,
                                timestamp: new Date(data.timestamp)
                            }]);
                            if (data.username && data.username.trim() !== '') {
                                setOnlineUsers(prev => {
                                    if (prev.includes(data.username)) return prev;
                                    return [...prev, data.username];
                                });
                                if (data.isGuest) {
                                    setGuestUsernames(prev => prev.includes(data.username) ? prev : [...prev, data.username]);
                                }
                            }
                            break;
                        case 'user_left':
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                username: SYSTEM_USERNAME,
                                message: data.message,
                                timestamp: new Date(data.timestamp)
                            }]);
                            if (data.username && data.username.trim() !== '') {
                                setOnlineUsers(prev => prev.filter(u => u !== data.username));
                                setGuestUsernames(prev => prev.filter(u => u !== data.username));
                            }
                            break;

						//* System message
                        case 'friend_request':
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                username: SYSTEM_USERNAME,
                                message: data.message || `${data.fromUsername || 'Someone'} wants to be your friend!`,
                                timestamp: new Date(data.timestamp || Date.now())
                            }]);
                            loadFriendsAndBlocked();
                            break;

                        default:
                            console.log('Unknown message type:', data.type);
                    }
                } catch (error) {
                    console.error('Error parsing SSE message:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE onerror:', error);
                setConnected(false);
                setTimeout(() => {
                    if (eventSource.readyState === EventSource.CLOSED) {
                        console.log('Attempting reconnection...');
                        connectSSE();
                    }
                }, 3000);
            };

        } catch (error) {
            console.error('Failed to connect SSE:', error);
        }
    };

    // NEW: Join chat endpoint
    const joinChat = async (connId: string) => {
        try {
            const response = await fetchWithAuth('/api/chat/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId: connId,
                    userId: user.id,
                    username: user.username
                })
            });

            await response.json();
            if (response.ok) {
                console.log('Joined chat successfully');
            } else {
                console.error('Failed to join chat:', response.statusText);
            }
        } catch (error) {
            console.error('Error joining chat:', error);
        }
    };

    const confirmAction = (action: 'remove' | 'block', username: string) => {
        setConfirmation({ action, username });
    };

    const handleConfirm = async () => {
        if (confirmation.action === 'remove' && confirmation.username) {
            const username = confirmation.username;
            setConfirmation({ action: null, username: null });
            try {
                const res = await fetchWithAuth('/api/friends/remove', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                if (res.ok) 
					loadFriendsAndBlocked();
                else {
                    const errorData = await res.json() as { error?: string };
                    showToast(errorData?.error || 'Failed to remove friend');
                }
            } catch {
                showToast('Failed to remove friend');
            }
        } else if (confirmation.action === 'block' && confirmation.username) {
            if (!blockedUsers.includes(confirmation.username) && confirmation.username !== user.username) {
                const userToBlock = confirmation.username;
                setConfirmation({ action: null, username: null });
                try {
                    const res = await fetchWithAuth('/api/friends/block', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: userToBlock })
                    });
                    if (res.ok)
                        loadFriendsAndBlocked();
                    else if (!user.is_guest) {
                        const errorData = await res.json() as { error?: string };
                        showToast(errorData?.error || 'Failed to block user');
                    }
                } catch {
                    if (!user.is_guest) 
						showToast('Failed to block user');
                }
            } else {
                setConfirmation({ action: null, username: null });
            }
        } else {
            setConfirmation({ action: null, username: null });
        }
    };

    const handleCancel = () => {
        setConfirmation({ action: null, username: null });
    };

    const filteredMessages = messages.filter(message => {
        if (blockedUsers.includes(message.username)) return false;
        
        if (chatMode === 'private' && privateChatWith) {
            return (
                (message.username === privateChatWith && message.toUser === user.username) ||
                (message.username === user.username && message.toUser === privateChatWith)
            );
        }
        
        return !message.isPrivate;
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [filteredMessages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !connectionId || !connected) {
            console.log('Cannot send: message=', newMessage.trim(), 'connId=', connectionId, 'connected=', connected);
            return;
        }
        if (chatMode === 'private' && (!privateChatWith || !privateChatWith.trim())) {
            showToast('Select a user for private chat');
            return;
        }

        const msgToSend = newMessage.trim();
        setNewMessage('');
        if (connectionId) {
            fetchWithAuth('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId,
                    message: msgToSend,
                    isPrivate: chatMode === 'private' && privateChatWith?.trim(),
                    toUser: chatMode === 'private' && privateChatWith?.trim() ? privateChatWith.trim() : undefined
                })
            })
            .then(res => res.json().then(() => res))
            .then(res => { if (res.ok) console.log('Message sent'); })
            .catch(error => console.error('Failed to send message:', error));
        }
    };

    const sendFriendRequest = async (username: string) => {
        if (friends.some(friend => friend.username === username) || username === user.username) 
			return;
        if (outgoingRequests.some(r => r.username === username)) 
			return;
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
                const errorData = await res.json() as { error?: string };
                const msg = errorData?.error || 'Failed to send request';
                showToast(msg);
                if (msg === 'Already friends' || msg === 'Friend request already exists') {
                    loadFriendsAndBlocked();
                }
            }
        } catch {
            showToast('Failed to send friend request');
        }
    };

    const acceptRequest = async (username: string) => {
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
                const errorData = await res.json() as { error?: string };
                showToast(errorData?.error || 'Failed to accept');
            }
        } catch {
            showToast('Failed to accept request');
        }
    };

    const declineRequest = async (username: string) => {
        try {
            const res = await fetchWithAuth('/api/friends/requests/decline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            if (res.ok) {
                loadFriendsAndBlocked();
            } else {
                const errorData = await res.json() as { error?: string };
                showToast(errorData?.error || 'Failed to decline');
            }
        } catch {
            showToast('Failed to decline request');
        }
    };

    const cancelRequest = async (username: string) => {
        try {
            const res = await fetchWithAuth('/api/friends/requests/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            if (res.ok) {
                loadFriendsAndBlocked();
            } else {
                const errorData = await res.json() as { error?: string };
                showToast(errorData?.error || 'Failed to cancel');
            }
        } catch {
            showToast('Failed to cancel request');
        }
    };

    const unblockUser = async (username: string) => {
        try {
            const res = await fetchWithAuth('/api/friends/unblock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            if (res.ok)
                loadFriendsAndBlocked();
            else if (!user.is_guest) {
                const errorData = await res.json() as { error?: string };
                showToast(errorData?.error || 'Failed to unblock');
            }
        } catch {
            if (!user.is_guest) 
				showToast('Failed to unblock');
        }
    };

    const startPrivateChat = (username: string) => {
        setChatMode('private');
        setPrivateChatWith(username);
        setActiveTab('chat');
    };

    const switchToPublicChat = () => {
        setChatMode('public');
        setPrivateChatWith('');
    };

    const getUniqueUsernames = () => {
        const usernames = Array.from(new Set(messages.map(m => m.username)));
        return usernames.filter(
            (username) =>
                username != null &&
                String(username).trim() !== '' &&
                username !== user.username &&
                username !== SYSTEM_USERNAME
        );
    };

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* NEW: Toast notification - ADD THIS */}
            {toast && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                        {toast}
                    </div>
                </div>
            )}
            {/* Confirmation Popup */}
            {confirmation.action && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-w-sm w-full p-4 text-center">
                        <p className="text-sm text-slate-200 font-sans">
                            Are you sure you want to{' '}
                            {confirmation.action === 'remove' ? 'remove' : 'block'}{' '}
                            <span className="font-medium text-brand-orange">{confirmation.username}</span>?
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="px-4 py-2 bg-brand-red text-white rounded hover:opacity-90 transition-opacity text-sm font-medium"
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 bg-slate-600 text-slate-200 rounded hover:bg-slate-500 border border-slate-500 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation - Chat / Friends (hidden for guests) / Blocked */}
            <div className="flex border-b border-slate-600/70 bg-slate-700/80 flex-shrink-0">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 px-3 text-xs font-medium transition-colors ${
                        activeTab === 'chat'
                            ? 'text-brand-orange border-b-2 border-brand-orange bg-slate-700/40'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Lobby
                </button>
	                 {!user.is_guest && (
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`flex-1 py-2 px-3 text-xs font-medium transition-colors ${
                            activeTab === 'friends'
                                ? 'text-brand-orange border-b-2 border-brand-orange bg-slate-700/40'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Friends ({friends.filter((f) => f.username?.trim()).length})
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('blocked')}
                    className={`flex-1 py-2 px-3 text-xs font-medium transition-colors ${
                        activeTab === 'blocked'
                            ? 'text-brand-orange border-b-2 border-brand-orange bg-slate-700/40'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Blocked ({blockedUsers.length})
                </button>
            </div>

            {/* Chat Tab */}
            {activeTab === 'chat' && (
                <>
                    {/* Chat Mode Indicator */}
                    <div className="bg-slate-700/60 px-3 py-2 border-b border-slate-600/70 flex-shrink-0 font-mono text-xs">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                {chatMode === 'private' ? (
                                    <>
                                        <span className="text-brand-purple font-medium">
                                            Whispering {privateChatWith}
                                        </span>
                                        <button
                                            onClick={switchToPublicChat}
                                            className="text-brand-orange hover:underline text-left"
                                        >
                                            Switch back to lobby
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-brand-acidGreen font-medium">
                                        Public Chat
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-800/50 space-y-0.5 font-mono text-xs">
                            {filteredMessages.length === 0 ? (
                                <div className="text-center text-slate-400 py-8 text-sm font-sans">
                                    No messages yet. Start the conversation!
                                </div>
							) : (
                                filteredMessages.map((message) => {
                                    const isSystem = !message.username || message.username === SYSTEM_USERNAME;
                                    const timeStr = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const showPopover = actionPopover?.messageId === message.id;

                                    if (isSystem) {
                                        return (
                                            <div key={message.id} className="py-0.5 flex flex-wrap items-baseline gap-x-1">
                                                <span className="text-brand-cyan/90">[{timeStr}]</span>
                                                <span className="text-brand-cyan/90">{message.message}</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={message.id} className="relative py-0.5 flex flex-wrap items-baseline gap-x-1">
                                            <span className="text-slate-500 shrink-0">[{timeStr}]</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (message.username === user.username) {
                                                        showToast("This is your own profile!");
                                                        return;
                                                    }
                                                    setActionPopover(prev =>
                                                        prev?.messageId === message.id ? null : { username: message.username, messageId: message.id }
                                                    );
                                                }}
                                                className={`font-medium text-xs shrink-0 hover:underline ${
                                                    message.isPrivate ? 'text-brand-purple' : 'text-brand-orange'
                                                }`}
                                            >
                                                {message.username}
                                            </button>
                                            <span className={message.isPrivate ? 'text-brand-purple/90' : 'text-white'}>: {message.message}</span>
                                            {message.username !== user.username && showPopover && (
                                                <div
                                                    ref={popoverRef}
                                                    className="absolute left-0 top-full mt-0.5 z-50 bg-slate-700 border border-slate-600 rounded shadow-lg py-1 min-w-[140px]"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => { viewUserProfile(message.username); setActionPopover(null); }}
                                                        className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-600 text-xs"
                                                    >
                                                        View profile
                                                    </button>
                                                    {!friends.some(f => f.username === message.username) && !outgoingRequests.some(r => r.username === message.username) ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => { sendFriendRequest(message.username); setActionPopover(null); }}
                                                            className="w-full text-left px-3 py-1.5 text-brand-acidGreen hover:bg-slate-600 text-xs"
                                                        >
                                                            Add friend
                                                        </button>
                                                    ) : friends.some(f => f.username === message.username) ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => { startPrivateChat(message.username); setActionPopover(null); }}
                                                            className="w-full text-left px-3 py-1.5 text-brand-purple hover:bg-slate-600 text-xs"
                                                        >
                                                            Whisper
                                                        </button>
                                                    ) : null}
                                                    <button
                                                        type="button"
                                                        onClick={() => { confirmAction('block', message.username); setActionPopover(null); }}
                                                        className="w-full text-left px-3 py-1.5 text-brand-red hover:bg-slate-600 text-xs"
                                                    >
                                                        Block
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                    {/* Message Input */}
                    <div className="border-t border-slate-600/70 p-3 flex-shrink-0 bg-slate-700/60">
                        <form onSubmit={sendMessage} className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={
                                    connected
                                        ? (chatMode === 'private'
                                            ? `Private message to ${privateChatWith}...`
                                            : "Type message...")
                                        : "Connecting..."
                                }
                                className="flex-1 text-sm text-slate-100 placeholder-slate-500 border border-slate-500 bg-slate-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                                maxLength={200}
                                disabled={!connected}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || !connected}
                                className={`px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                                    chatMode === 'private'
                                        ? 'bg-brand-purple/80 text-white hover:bg-brand-purple'
                                        : 'bg-brand-orange/80 text-white hover:bg-brand-orange'
                                }`}
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </>
            )}

            {/* Friends Tab (hidden for guests) */}
            {activeTab === 'friends' && !user.is_guest && (
                <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-800/50 font-mono text-xs flex flex-col gap-4">
                    {/* Pending: Incoming friend requests */}
                    {incomingRequests.length > 0 && (
                        <div className="space-y-0.5">
                            <div className="text-slate-400 font-medium pb-1 border-b border-slate-600/40 mb-1.5">Pending friend requests</div>
                            {incomingRequests.map((req) => (
                                <div key={`in-${req.id}-${req.username}`} className="py-1.5 border-b border-slate-600/40 last:border-0 flex items-center justify-between">
                                    <span className="text-slate-200">{req.username}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => acceptRequest(req.username)}
                                            className="text-brand-acidGreen hover:underline"
                                            title="Accept"
                                        >
                                            Accept
                                        </button>
                                        <span className="text-slate-600">|</span>
                                        <button
                                            type="button"
                                            onClick={() => declineRequest(req.username)}
                                            className="text-brand-red hover:underline"
                                            title="Decline"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Outgoing: Friend request sent to ... */}
                    {outgoingRequests.length > 0 && (
                        <div className="space-y-0.5">
                            <div className="text-slate-400 font-medium pb-1 border-b border-slate-600/40 mb-1.5">Friend request sent to</div>
                            {outgoingRequests.map((req) => (
                                <div key={`out-${req.id}-${req.username}`} className="py-1.5 border-b border-slate-600/40 last:border-0 flex items-center justify-between">
                                    <span className="text-slate-200">{req.username}</span>
                                    <button
                                        type="button"
                                        onClick={() => cancelRequest(req.username)}
                                        className="text-slate-400 hover:underline"
                                        title="Cancel request"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Friends list */}
                    <div className="space-y-0.5">
                        <div className="text-slate-400 font-medium pb-1 border-b border-slate-600/40 mb-1.5">Friends</div>
                        {friends.filter((f) => f.username?.trim()).length === 0 ? (
                            <div className="text-center text-slate-400 py-6 font-sans text-sm space-y-1">
                                <div>No friends yet.</div>
                                <div>Add friends from chat (click a username).</div>
                            </div>
                        ) : (
                            friends.filter((f) => f.username?.trim()).map((friend) => (
                                <div
                                    key={friend.id}
                                    className="py-1.5 group border-b border-slate-600/40 last:border-0 flex flex-col gap-0.5"
                                >
                                    <div className="flex items-center gap-x-2">
                                        <span
                                            className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                                                friend.isOnline ? 'bg-brand-acidGreen' : 'bg-slate-500'
                                            }`}
                                            title={friend.isOnline ? 'Online' : 'Offline'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => viewUserProfile(friend.username)}
                                            className="font-medium text-brand-orange hover:text-brand-mint hover:underline"
                                        >
                                            {friend.username}
                                        </button>
                                        <span className="text-slate-500">
                                            {friend.isOnline ? 'online' : 'offline'}
                                        </span>
                                    </div>
                                    <div className="pl-3.5 opacity-80 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => startPrivateChat(friend.username)}
                                            className="text-brand-purple hover:text-brand-magenta hover:underline"
                                            title="Whisper"
                                        >
                                            Whisper
                                        </button>
                                        <span className="text-slate-600">|</span>
                                        <button
                                            type="button"
                                            onClick={() => confirmAction('remove', friend.username)}
                                            className="text-brand-red hover:underline"
                                            title="Remove friend"
                                        >
                                            Remove
                                        </button>
                                        <span className="text-slate-600">|</span>
                                        <button
                                            type="button"
                                            onClick={() => confirmAction('block', friend.username)}
                                            className="text-brand-red hover:underline"
                                            title="Block"
                                        >
                                            Block
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Send request: Quick add from recent users (guests shown but not sendable) */}
                    <div className="space-y-0.5 border-t border-slate-600/40 pt-2">
                        <div className="text-slate-400 font-medium pb-1 border-b border-slate-600/40 mb-1.5">Send request to recent users:</div>
                        {getUniqueUsernames()
                            .filter(username => !friends.some(f => f.username === username))
                            .filter(username => !outgoingRequests.some(r => r.username === username))
                            .filter(username => !blockedUsers.includes(username))
                            .slice(0, 5)
                            .map(username => {
                                const isGuest = guestUsernames.includes(username);
                                return isGuest ? (
                                    <div key={username} className="py-1 text-slate-500 text-sm">
                                        {username} <span className="text-slate-600">(guest)</span>
                                    </div>
                                ) : (
                                    <button
                                        key={username}
                                        type="button"
                                        onClick={() => sendFriendRequest(username)}
                                        className="block w-full text-left text-brand-orange hover:text-brand-mint hover:underline py-1"
                                    >
                                        + Send request to {username}
                                    </button>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Blocked Tab */}
            {activeTab === 'blocked' && (
                <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-800/50 font-mono text-xs">
                    <div className="space-y-0.5">
                        {blockedUsers.length === 0 ? (
                            <div className="text-center text-slate-400 py-6 font-sans text-sm">
                                No blocked users.
                            </div>
                        ) : (
                            blockedUsers.map((username) => (
                                <div
                                    key={username}
                                    className="flex items-center justify-between py-1 border-b border-slate-600/40 last:border-0 group"
                                >
                                    <span className="text-brand-red/90 font-medium">{username}</span>
                                    <button
                                        type="button"
                                        onClick={() => unblockUser(username)}
                                        className="text-brand-acidGreen hover:text-brand-mint hover:underline opacity-80 group-hover:opacity-100"
                                        title="Unblock"
                                    >
                                        Unblock
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Status Bar: connection status bottom right */}
            <div className="px-3 py-1 border-t border-slate-600/70 bg-slate-700/60 flex-shrink-0 flex justify-end">
                <div className="flex items-center space-x-1.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${connected ? 'bg-brand-acidGreen' : 'bg-brand-red'}`} />
                    <span className="text-xs text-white">
                        {connected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChatMiniWindow;