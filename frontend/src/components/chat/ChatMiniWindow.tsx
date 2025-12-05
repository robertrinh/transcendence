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
    toUser?: string; // For private messages
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
    // Remove, just for show at the moment
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', username: 'alice', message: 'Hello everyone!', timestamp: new Date() },
        { id: '2', username: 'bob', message: 'Hey there!', timestamp: new Date() },
        { id: '3', username: 'charlie', message: 'How is everyone doing?', timestamp: new Date() },
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [connected, setConnected] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Social features state
    const [activeTab, setActiveTab] = useState<TabMode>('chat');
    const [chatMode, setChatMode] = useState<ChatMode>('public');
    const [privateChatWith, setPrivateChatWith] = useState<string>('');
    const [friends, setFriends] = useState<Friend[]>([
        { id: '1', username: 'alice', isOnline: true },
        { id: '2', username: 'bob', isOnline: false },
    ]);
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>(['alice', 'bob', 'charlie', 'david']);

    // Filter messages based on blocked users and chat mode
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
        if (!newMessage.trim()) return;

        const message: Message = {
            id: Date.now().toString(),
            username: user.username,
            message: newMessage.trim(),
            timestamp: new Date(),
            isPrivate: chatMode === 'private',
            toUser: chatMode === 'private' ? privateChatWith : undefined,
        };

        setMessages(prev => [...prev, message]);
        setNewMessage('');
        
        // TODO: Send to backend
    };

    const addFriend = (username: string) => {
        if (!friends.some(f => f.username === username) && username !== user.username) {
            const newFriend: Friend = {
                id: Date.now().toString(),
                username,
                isOnline: onlineUsers.includes(username)
            };
            setFriends(prev => [...prev, newFriend]);
            // TODO: Send to backend
        }
    };

    const removeFriend = (username: string) => {
        setFriends(prev => prev.filter(f => f.username !== username));
        // TODO: Send to backend
    };

    const blockUser = (username: string) => {
        if (!blockedUsers.includes(username) && username !== user.username) {
            setBlockedUsers(prev => [...prev, username]);
            // Remove from friends if they were friends
            setFriends(prev => prev.filter(f => f.username !== username));
            // TODO: Send to backend
        }
    };

    const unblockUser = (username: string) => {
        setBlockedUsers(prev => prev.filter(u => u !== username));
        // TODO: Send to backend
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

    // Get unique usernames from messages for friend/block actions
    const getUniqueUsernames = () => {
        const usernames = Array.from(new Set(messages.map(m => m.username)));
        return usernames.filter(username => username !== user.username);
    };

   return (
        <div className="h-full flex flex-col overflow-hidden">
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
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
                        {filteredMessages.map((message) => (
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
                                                    onClick={() => blockUser(message.username)}
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
                        ))}
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
                                    chatMode === 'private' 
                                        ? `Private message to ${privateChatWith}...`
                                        : "Type message..."
                                }
                                className="flex-1 text-sm border border-white/30 bg-white/50 backdrop-blur-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white/70"
                                maxLength={200}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
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
                                            onClick={() => removeFriend(friend.username)}
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