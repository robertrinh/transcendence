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

interface ChatMiniWindowProps {
    user: User;
    navigateToUserProfile?: (username: string) => void; //new
}

type ChatMode = 'public' | 'private';
type TabMode = 'chat' | 'friends' | 'blocked';

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
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    const [confirmation, setConfirmation] = useState<{
        action: 'remove' | 'block' | null;
        username: string | null;
    }>({ action: null, username: null });

    const [actionPopover, setActionPopover] = useState<{ username: string; messageId: string } | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!actionPopover) 
			return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (popoverRef.current?.contains(target)) return;
            if ((e.target as HTMLElement).closest?.('[data-username-trigger]')) return;
            setActionPopover(null);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [actionPopover]);

    // NEW: Connect to SSE on component mount
    useEffect(() => {
        connectSSE();
        
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [user]);

    // NEW: Helper to connect to SSE stream
    const connectSSE = () => {
        try {
            if (user.is_anonymous) {
                console.log('⏭️ Skipping SSE connection for anonymous user');
                setConnected(false);
                return;
            }
            const token = localStorage.getItem('token');
            console.log('🔍 Token from localStorage:', token ? 'EXISTS' : 'MISSING');
            
            if (!token) {
                console.error('❌ No token found');
                return;
            }

            console.log('🔗 Connecting to SSE with token...');
            //  Pass token as query parameter
            const sseUrl = `/api/chat/stream?token=${token}`;
            console.log('📡 SSE URL:', sseUrl);
            
            const eventSource = new EventSource(sseUrl);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log('✅ SSE onopen triggered');
                setConnected(true);
            };

            eventSource.onmessage = (event) => {
                console.log('📨 SSE onmessage received:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    console.log('📦 Parsed data:', data);

                    switch (data.type) {
                        case 'connected':
                            console.log('🎯 Connected event:', data);
                            setConnectionId(data.connectionId);
                            joinChat(data.connectionId);
                            if (data.onlineUsers)
                                    setOnlineUsers(data.onlineUsers);
                            break;

                        case 'history':
                            console.log('📚 History received:', data.messages.length, 'messages');
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
                            console.log('💬 New message:', data);
                            const newMsg: Message = {
                                id: data.id,
                                username: data.username,
                                message: data.message,
                                timestamp: new Date(data.timestamp),
                                isPrivate: data.isPrivate,
                                toUser: data.toUser
                            };
                            setMessages(prev => {
                                console.log('➕ Adding message to state, total:', prev.length + 1);
                                return [...prev, newMsg];
                            });
                            break;

                        case 'user_joined':
                            console.log('👥 User joined:', data);
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                username: '',
                                message: data.message,
                                timestamp: new Date(data.timestamp)
                            }]);
                            // NEW: Add user to online list
                           if (data.username && data.username.trim() !== '') {
                                setOnlineUsers(prev => {
                                    if (prev.includes(data.username)) {
                                        return prev; // Already exists, don't add
                                    }
                                    return [...prev, data.username];
                                });
                            }
                            break;
                        case 'user_left':
                            console.log('👥 User event:', data);
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                username: '',
                                message: data.message,
                                timestamp: new Date(data.timestamp)
                            }]);
                            if (data.username && data.username.trim() !== '') {
                                setOnlineUsers(prev => prev.filter(u => u !== data.username));
                            }
                            break;

                        default:
                            console.log('⚠️ Unknown message type:', data.type);
                    }
                } catch (error) {
                    console.error('❌ Error parsing SSE message:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('❌ SSE onerror:', error);
                console.log('readyState:', eventSource.readyState);
                setConnected(false);
                
                setTimeout(() => {
                    if (eventSource.readyState === EventSource.CLOSED) {
                        console.log('🔄 Attempting reconnection...');
                        connectSSE();
                    }
                }, 3000);
            };

        } catch (error) {
            console.error('❌ Failed to connect SSE:', error);
        }
    };

    // NEW: Join chat endpoint
    const joinChat = async (connId: string) => {
        try {
            console.log('🔗 Joining chat with connectionId:', connId);
            const response = await fetchWithAuth('/api/chat/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId: connId,
                    userId: user.id,
                    username: user.username
                })
            });

            const data = await response.json();
            console.log('✅ Join response:', data);

            if (response.ok) {
                console.log('✅ Joined chat successfully');
            } else {
                console.error('❌ Failed to join chat:', response.statusText);
            }
        } catch (error) {
            console.error('❌ Error joining chat:', error);
        }
    };

    const confirmAction = (action: 'remove' | 'block', username: string) => {
        setConfirmation({ action, username });
    };

    const handleConfirm = () => {
        if (confirmation.action === 'remove' && confirmation.username) {
            setFriends(prev => prev.filter(f => f.username !== confirmation.username));
            fetchWithAuth('/api/friends/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: confirmation.username })
            }).catch(error => console.error('Failed to remove friend:', error));
        } else if (confirmation.action === 'block' && confirmation.username) {
            if (!blockedUsers.includes(confirmation.username) && confirmation.username !== user.username) {
                // for type guard, avoid test error
                const userToBlock = confirmation.username;
                setBlockedUsers(prev => [...prev, userToBlock]);
                setFriends(prev => prev.filter(f => f.username !== userToBlock));
                fetchWithAuth('/api/friends/block', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: userToBlock })
                }).catch(error => console.error('Failed to block user:', error));
            }
        }
        setConfirmation({ action: null, username: null });
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
            console.log('⚠️ Cannot send: message=', newMessage.trim(), 'connId=', connectionId, 'connected=', connected);
            return;
        }

        const msgToSend = newMessage.trim();
        console.log('📤 Sending message:', msgToSend);
        setNewMessage('');
        
        if (connectionId) {
            console.log('📡 POST /api/chat/send with connectionId:', connectionId);
            fetchWithAuth('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId,
                    message: msgToSend,
                    isPrivate: chatMode === 'private',
                    toUser: chatMode === 'private' ? privateChatWith : undefined
                })
            })
            .then(res => {
                console.log('✅ Send response status:', res.status);
                return res.json();
            })
            .then(data => console.log('✅ Send response:', data))
            .catch(error => console.error('❌ Failed to send message:', error));
        }
    };

    const addFriend = (username: string) => {
        if (!friends.some(f => f.username === username) && username !== user.username) {
            const newFriend: Friend = {
                id: Date.now().toString(),
                username,
                isOnline: onlineUsers.includes(username)
            };
            setFriends(prev => [...prev, newFriend]);
            fetchWithAuth('/api/friends/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            }).catch(error => console.error('Failed to add friend:', error));
        }
    };

    const unblockUser = (username: string) => {
        setBlockedUsers(prev => prev.filter(u => u !== username));
        fetchWithAuth('/api/friends/unblock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        }).catch(error => console.error('Failed to unblock user:', error));
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
        return usernames.filter(username => username !== user.username);
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

            {/* Tab Navigation - Chat / Friends / Blocked */}
            <div className="flex border-b border-slate-600/70 bg-slate-700/80 flex-shrink-0">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 px-3 text-xs font-medium transition-colors rounded-lg ${
                        activeTab === 'chat'
                            ? 'bg-brand-orange/80 text-black'
                            : 'text-slate-300 hover:text-white hover:bg-slate-600/80'
                    }`}
                >
                    Lobby
                </button>
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`flex-1 py-2 px-3 text-xs font-medium transition-colors rounded-lg ${
                        activeTab === 'friends'
                            ? 'bg-brand-orange/80 text-black'
                            : 'text-slate-300 hover:text-white hover:bg-slate-600/80'
                    }`}
                >
                    Friends ({friends.length})
                </button>
                <button
                    onClick={() => setActiveTab('blocked')}
                    className={`flex-1 py-2 px-3 text-xs font-medium transition-colors rounded-lg ${
                        activeTab === 'blocked'
                            ? 'bg-brand-orange/80 text-black'
                            : 'text-slate-300 hover:text-white hover:bg-slate-600/80'
                    }`}
                >
                    Blocked ({blockedUsers.length})
                </button>
            </div>

            {/* Chat Tab */}
            {activeTab === 'chat' && (
                <>
                    {/* Chat Mode Indicator */}
                    <div className="bg-slate-700/60 px-3 py-2 border-b border-slate-600/70 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {chatMode === 'private' ? (
                                    <>
                                        <span className="text-xs text-brand-purple font-medium">
                                            Private with {privateChatWith}
                                        </span>
                                        <button
                                            onClick={switchToPublicChat}
                                            className="text-xs text-brand-orange hover:underline"
                                        >
                                            Switch to Public
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-xs text-brand-acidGreen font-medium">
                                        Public Chat
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-brand-acidGreen' : 'bg-red-500'}`}></div>
                                <span className="text-xs text-slate-400">
                                    {connected ? 'Connected' : 'Disconnected'}
                                </span>
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
                                    const isSystem = !message.username;
                                    const timeStr = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const showPopover = actionPopover?.messageId === message.id;

                                    if (isSystem) {
                                        return (
                                            <div key={message.id} className="text-brand-cyan/90 py-0.5">
                                                [{timeStr}] {message.message}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={message.id} className="relative py-0.5 flex flex-wrap items-baseline gap-x-1">
                                            <span className="text-slate-500 shrink-0">[{timeStr}]</span>
                                            <button
                                                type="button"
                                                data-username-trigger
                                                onClick={() => {
                                                    if (message.username === user.username) {
                                                        showToast("This is your own profile!");
                                                        return;
                                                    }
                                                    setActionPopover(prev =>
                                                        prev?.messageId === message.id ? null : { username: message.username, messageId: message.id }
                                                    );
                                                }}
                                                className={`font-medium hover:underline shrink-0 ${
                                                    message.isPrivate ? 'text-brand-purple' : 'text-brand-orange'
                                                }`}
                                            >
                                                {message.username}
                                                {message.isPrivate && message.toUser && (
                                                    <span className="text-brand-orange"> → {message.toUser}</span>
                                                )}
                                            </button>
                                            <span className={message.isPrivate ? 'text-brand-orange/90' : 'text-white'}>: {message.message}</span>
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
                                                    {!friends.some(f => f.username === message.username) ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => { addFriend(message.username); setActionPopover(null); }}
                                                            className="w-full text-left px-3 py-1.5 text-brand-acidGreen hover:bg-slate-600 text-xs"
                                                        >
                                                            Add friend
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => { startPrivateChat(message.username); setActionPopover(null); }}
                                                            className="w-full text-left px-3 py-1.5 text-brand-purple hover:bg-slate-600 text-xs"
                                                        >
                                                            Whisper
                                                        </button>
                                                    )}
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
                                        : 'bg-brand-orange/80 text-black hover:bg-brand-orange'
                                }`}
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </>
            )}

            {/* Friends Tab */}
            {activeTab === 'friends' && (
                <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-800/50 font-mono text-xs flex flex-col gap-4">
                    <div className="space-y-0.5">
                        {friends.length === 0 ? (
                            <div className="text-center text-slate-400 py-6 font-sans text-sm space-y-1">
                                <div>No friends yet.</div>
                                <div>Add friends from chat (click a username).</div>
                            </div>
                        ) : (
                            friends.map((friend) => (
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

                    {/* Quick add from recent chatters */}
                    <div className="pt-2 border-t border-slate-600/70">
                        <div className="text-slate-400 mb-1.5 font-sans text-xs">Recent chatters</div>
                        <div className="space-y-0.5">
                            {getUniqueUsernames()
                                .filter(username => !friends.some(f => f.username === username))
                                .filter(username => !blockedUsers.includes(username))
                                .slice(0, 5)
                                .map(username => (
                                    <button
                                        key={username}
                                        type="button"
                                        onClick={() => addFriend(username)}
                                        className="block w-full text-left text-brand-orange hover:text-brand-mint hover:underline py-0.5"
                                    >
                                        + {username}
                                    </button>
                                ))}
                            {getUniqueUsernames().filter(
                                u => !friends.some(f => f.username === u) && !blockedUsers.includes(u)
                            ).length === 0 && (
                                <span className="text-slate-500">No one seems to be here!</span>
                            )}
                        </div>
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

            {/* Status Bar */}
            <div className="px-3 py-1 border-t border-slate-600/70 bg-slate-700/60 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                        {filteredMessages.length} messages
                    </span>
                    <span className="text-xs text-slate-400">
                        {onlineUsers.length} online
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChatMiniWindow;