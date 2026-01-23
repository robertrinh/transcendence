import React, { useState, useEffect, useRef } from 'react';

interface User {
    id: string;
    username: string;
}

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
}

type ChatMode = 'public' | 'private';
type TabMode = 'chat' | 'friends' | 'blocked';

const ChatMiniWindow: React.FC<ChatMiniWindowProps> = ({ user }) => {
    // CHANGED: Start with empty messages - will be filled by SSE
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [connected, setConnected] = useState(false); // CHANGED: Track SSE connection
    const [connectionId, setConnectionId] = useState<string | null>(null); // NEW: Store connection ID
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null); // NEW: Store EventSource ref

    // Social features state
    const [activeTab, setActiveTab] = useState<TabMode>('chat');
    const [chatMode, setChatMode] = useState<ChatMode>('public');
    const [privateChatWith, setPrivateChatWith] = useState<string>('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [onlineUsers] = useState<string[]>(['alice', 'bob', 'charlie', 'david']);

    const [confirmation, setConfirmation] = useState<{
        action: 'remove' | 'block' | null;
        username: string | null;
    }>({ action: null, username: null });

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
            const token = localStorage.getItem('token');
            console.log('🔍 Token from localStorage:', token ? 'EXISTS' : 'MISSING');
            
            if (!token) {
                console.error('❌ No token found');
                return;
            }

            console.log('🔗 Connecting to SSE with token...');
            // CHANGED: Pass token as query parameter
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
                            joinChat(data.connectionId, token);
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
                        case 'user_left':
                            console.log('👥 User event:', data);
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                username: 'System',
                                message: data.message,
                                timestamp: new Date(data.timestamp)
                            }]);
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
    const joinChat = async (connId: string, token: string) => {
        try {
            console.log('🔗 Joining chat with connectionId:', connId);
            const response = await fetch('/api/chat/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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

    const getToken = () => localStorage.getItem('token');

    const confirmAction = (action: 'remove' | 'block', username: string) => {
        setConfirmation({ action, username });
    };

    const handleConfirm = () => {
        if (confirmation.action === 'remove' && confirmation.username) {
            setFriends(prev => prev.filter(f => f.username !== confirmation.username));
            const token = getToken();
            if (token) {
                fetch('/api/friends/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ username: confirmation.username })
                }).catch(error => console.error('Failed to remove friend:', error));
            }
        } else if (confirmation.action === 'block' && confirmation.username) {
            if (!blockedUsers.includes(confirmation.username) && confirmation.username !== user.username) {
                setBlockedUsers(prev => [...prev, confirmation.username]);
                setFriends(prev => prev.filter(f => f.username !== confirmation.username));
                const token = getToken();
                if (token) {
                    fetch('/api/friends/block', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ username: confirmation.username })
                    }).catch(error => console.error('Failed to block user:', error));
                }
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
        
        const token = getToken();
        if (token && connectionId) {
            console.log('📡 POST /api/chat/send with connectionId:', connectionId);
            fetch('/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
            const token = getToken();
            if (token) {
                fetch('/api/friends/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ username })
                }).catch(error => console.error('Failed to add friend:', error));
            }
        }
    };

    const unblockUser = (username: string) => {
        setBlockedUsers(prev => prev.filter(u => u !== username));
        const token = getToken();
        if (token) {
            fetch('/api/friends/unblock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username })
            }).catch(error => console.error('Failed to unblock user:', error));
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
        return usernames.filter(username => username !== user.username);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Confirmation Popup */}
            {confirmation.action && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded shadow-md text-center">
                        <p className="text-sm text-gray-800">
                            Are you sure you want to{' '}
                            {confirmation.action === 'remove' ? 'remove' : 'block'}{' '}
                            <strong>{confirmation.username}</strong>?
                        </p>
                        <div className="mt-4 flex justify-center space-x-2">
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Yes
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-white/20 bg-white/30 backdrop-blur-sm flex-shrink-0">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 px-3 text-xs font-medium transition-colors ${
                        activeTab === 'chat'
                            ? 'bg-blue-500/80 text-white'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-white/30'
                    }`}
                >
                    Chat
                </button>
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`flex-1 py-2 px-3 text-xs font-medium transition-colors ${
                        activeTab === 'friends'
                            ? 'bg-blue-500/80 text-white'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-white/30'
                    }`}
                >
                    Friends ({friends.length})
                </button>
                <button
                    onClick={() => setActiveTab('blocked')}
                    className={`flex-1 py-2 px-3 text-xs font-medium transition-colors ${
                        activeTab === 'blocked'
                            ? 'bg-blue-500/80 text-white'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-white/30'
                    }`}
                >
                    Blocked ({blockedUsers.length})
                </button>
            </div>

            {/* Chat Tab */}
            {activeTab === 'chat' && (
                <>
                    {/* Chat Mode Indicator */}
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-2 border-b border-white/20 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {chatMode === 'private' ? (
                                    <>
                                        <span className="text-xs text-purple-700 font-medium">
                                            Private with {privateChatWith}
                                        </span>
                                        <button
                                            onClick={switchToPublicChat}
                                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Switch to Public
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-xs text-green-700 font-medium">
                                        Public Chat
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs text-gray-600">
                                    {connected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
                        {filteredMessages.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            filteredMessages.map((message) => (
                                <div key={message.id} className="text-sm group">
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className={`font-medium text-xs ${
                                                    message.isPrivate ? 'text-purple-700' : 'text-blue-700'
                                                }`}>
                                                    {message.username}
                                                    {message.isPrivate && (
                                                        <span className="ml-1 text-purple-500">→ {message.toUser}</span>
                                                    )}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {message.timestamp.toLocaleTimeString([], { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </span>
                                            </div>
                                            
                                            {/* User Actions (show on hover) */}
                                            {message.username !== user.username && (
                                                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                                                    {!friends.some(f => f.username === message.username) && (
                                                        <button
                                                            onClick={() => addFriend(message.username)}
                                                            className="text-green-600 hover:text-green-800 text-xs bg-white/50 rounded px-1"
                                                            title="Add friend"
                                                        >
                                                            +
                                                        </button>
                                                    )}
                                                    {friends.some(f => f.username === message.username) && (
                                                        <button
                                                            onClick={() => startPrivateChat(message.username)}
                                                            className="text-purple-600 hover:text-purple-800 text-xs bg-white/50 rounded px-1"
                                                            title="Private message"
                                                        >
                                                            💬
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => confirmAction('block', message.username)}
                                                        className="text-red-600 hover:text-red-800 text-xs bg-white/50 rounded px-1"
                                                        title="Block user"
                                                    >
                                                        🚫
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className={`break-words pl-2 border-l-2 ${
                                            message.isPrivate ? 'border-purple-300 text-purple-900 bg-purple-50/50' : 'border-blue-300 text-gray-900 bg-white/30'
                                        } rounded-r px-2 py-1`}>
                                            {message.message}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-white/20 p-3 flex-shrink-0 bg-white/20 backdrop-blur-sm">
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
                                className="flex-1 text-sm border border-white/30 bg-white/50 backdrop-blur-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white/70"
                                maxLength={200}
                                disabled={!connected}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || !connected}
                                className={`px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 backdrop-blur-sm ${
                                    chatMode === 'private'
                                        ? 'bg-purple-500/80 text-white hover:bg-purple-600'
                                        : 'bg-blue-500/80 text-white hover:bg-blue-600'
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
                <div className="flex-1 min-h-0 overflow-y-auto p-3">
                    <div className="space-y-2">
                        {friends.length === 0 ? (
                            <div className="text-center text-gray-700 text-sm py-4">
                                No friends yet. Add friends from chat messages!
                            </div>
                        ) : (
                            friends.map((friend) => (
                                <div key={friend.id} className="flex items-center justify-between p-2 bg-white/30 backdrop-blur-sm border border-white/20 rounded">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <span className="text-sm font-medium text-gray-900">{friend.username}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => startPrivateChat(friend.username)}
                                            className="text-purple-600 hover:text-purple-800 text-sm bg-white/50 rounded px-2 py-1"
                                            title="Private chat"
                                        >
                                            💬
                                        </button>
                                        <button
                                            onClick={() => confirmAction('remove', friend.username)}
                                            className="text-red-600 hover:text-red-800 text-sm bg-white/50 rounded px-2 py-1"
                                            title="Remove friend"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Friend Section */}
                    <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="text-xs text-gray-700 mb-2">Quick add from recent users:</div>
                        <div className="space-y-1">
                            {getUniqueUsernames()
                                .filter(username => !friends.some(f => f.username === username))
                                .filter(username => !blockedUsers.includes(username))
                                .slice(0, 3)
                                .map(username => (
                                    <button
                                        key={username}
                                        onClick={() => addFriend(username)}
                                        className="block w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-white/30 px-2 py-1 rounded bg-white/20"
                                    >
                                        + Add {username}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Blocked Tab */}
            {activeTab === 'blocked' && (
                <div className="flex-1 min-h-0 overflow-y-auto p-3">
                    <div className="space-y-2">
                        {blockedUsers.length === 0 ? (
                            <div className="text-center text-gray-700 text-sm py-4">
                                No blocked users.
                            </div>
                        ) : (
                            blockedUsers.map((username) => (
                                <div key={username} className="flex items-center justify-between p-2 bg-red-100/50 backdrop-blur-sm border border-red-200/50 rounded">
                                    <span className="text-sm font-medium text-red-800">{username}</span>
                                    <button
                                        onClick={() => unblockUser(username)}
                                        className="text-green-600 hover:text-green-800 text-sm bg-white/50 rounded px-2 py-1"
                                        title="Unblock user"
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
            <div className="px-3 py-1 border-t border-white/20 bg-white/30 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">
                        {filteredMessages.length} messages
                    </span>
                    <span className="text-xs text-gray-700">
                        {onlineUsers.length} online
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChatMiniWindow;