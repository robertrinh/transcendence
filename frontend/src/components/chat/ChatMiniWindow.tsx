import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWithAuth } from '../../config/api';
import type { ChatMiniWindowProps, ChatMode, TabMode } from './chatTypes';
import { useChatConnection } from './useChatConnection';
import { useFriends } from './useFriends';
import { ChatMessageList, ChatInput } from './ChatMessageListAndInput';
import { FriendsTab } from './FriendsTab';
import { BlockedTab } from './BlockedTab';

const ChatMiniWindow: React.FC<ChatMiniWindowProps> = ({ user, navigateToUserProfile }) => {
    if (user.is_anonymous) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-slate-800/50">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-slate-700 border border-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">Chat Unavailable</h3>
                    <p className="text-slate-400">
                        Anonymous users cannot access the chat feature.
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                        This restriction is permanent for anonymous profiles.
                    </p>
                </div>
            </div>
        );
    }

    const [toast, setToast] = useState<string | null>(null);
    const showToast = useCallback((message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    }, []);

    const [activeTab, setActiveTab] = useState<TabMode>('chat');
    const [chatMode, setChatMode] = useState<ChatMode>('public');
    const [privateChatWith, setPrivateChatWith] = useState<string>('');
    const [confirmation, setConfirmation] = useState<{
        action: 'remove' | 'block' | null;
        username: string | null;
    }>({ action: null, username: null });
    const [actionPopover, setActionPopover] = useState<{
        username: string;
        messageId: string;
    } | null>(null);

    const friendRequestCallbackRef = useRef<(() => void) | null>(null);
    const connection = useChatConnection(user, friendRequestCallbackRef);
    const friends = useFriends(user, connection.onlineUsers, showToast);

    useEffect(() => {
        friendRequestCallbackRef.current = friends.loadFriendsAndBlocked;
    }, [friends.loadFriendsAndBlocked]);

    useEffect(() => {
        friends.loadFriendsAndBlocked();
    }, []);

	//* guests cannot use friends tab
    useEffect(() => {
        if (user.is_guest && activeTab === 'friends') {
            setActiveTab('chat');
        }
    }, [user.is_guest, activeTab]);

    //* refetch friends and requests when switching to Friends tab
    useEffect(() => {
        if (activeTab === 'friends' && !user.is_guest) {
            friends.loadFriendsAndBlocked();
        }
    }, [activeTab]);

    //* Poll friends/requests every 5s to confirm
    const FRIENDS_POLL_MS = 5000;
    useEffect(() => {
        if (activeTab !== 'friends' || user.is_guest) 
			return;
        const interval = setInterval(() => {
            friends.loadFriendsAndBlocked();
        }, FRIENDS_POLL_MS);
        return () => clearInterval(interval);
    }, [activeTab, user.is_guest]);

    const viewUserProfile = (username: string) => {
        navigateToUserProfile?.(username);
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
					friends.loadFriendsAndBlocked();
                else {
                    const errorData = (await res.json()) as { error?: string };
                    showToast(errorData?.error || 'Failed to remove friend');
                }
            } catch {
                showToast('Failed to remove friend');
            }
        } else if (confirmation.action === 'block' && confirmation.username) {
            if (!friends.blockedUsers.includes(confirmation.username) && confirmation.username !== user.username) {
                const userToBlock = confirmation.username;
                setConfirmation({ action: null, username: null });
                try {
                    const res = await fetchWithAuth('/api/friends/block', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: userToBlock })
                    });
                    if (res.ok) 
						friends.loadFriendsAndBlocked();
                    else if (!user.is_guest) {
                        const errorData = (await res.json()) as { error?: string };
                        showToast(errorData?.error || 'Failed to block user');
                    }
                } catch {
                    if (!user.is_guest) showToast('Failed to block user');
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

    //* exclude blocked users from messages
    const filteredMessages = connection.messages.filter((message) => {
        if (friends.blockedUsers.includes(message.username)) return false;
        if (chatMode === 'private' && privateChatWith) {
            return (
                (message.username === privateChatWith && message.toUser === user.username) ||
                (message.username === user.username && message.toUser === privateChatWith)
            );
        }
        return !message.isPrivate;
    });

    useEffect(() => {
        connection.scrollToBottom();
    }, [filteredMessages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!connection.newMessage.trim() || !connection.connectionId || !connection.connected) {
            return;
        }
        if (chatMode === 'private' && (!privateChatWith || !privateChatWith.trim())) {
            showToast('Select a user for private chat');
            return;
        }
        connection.sendMessage(e, {
            isPrivate: chatMode === 'private',
            toUser: chatMode === 'private' && privateChatWith ? privateChatWith.trim() : undefined
        });
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

	//* for send request to recent users
    const getUniqueUsernames = () => {
        const usernames = Array.from(new Set(connection.messages.map(m => m.username)));
        return usernames.filter(
            (username) =>
                username != null &&
                String(username).trim() !== '' &&
                username !== user.username &&
                username !== 'System'
        );
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {toast && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                        {toast}
                    </div>
                </div>
            )}
            {confirmation.action && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-w-sm w-full p-4 text-center">
                        <p className="text-sm text-slate-200 font-sans">
                            Are you sure you want to {confirmation.action === 'remove' ? 'remove' : 'block'}{' '}
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

            {/* Tab Navigation: Lobby | Friends | Blocked */}
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
                        Friends ({friends.friends.filter((f) => f.username?.trim()).length})
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
                    Blocked ({friends.blockedUsers.length})
                </button>
            </div>

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

                    <ChatMessageList
                        messages={filteredMessages}
                        currentUsername={user.username}
                        friends={friends.friends}
                        outgoingRequests={friends.outgoingRequests}
                        messagesEndRef={connection.messagesEndRef}
                        actionPopover={actionPopover}
                        setActionPopover={setActionPopover}
                        onViewProfile={viewUserProfile}
                        onSendFriendRequest={friends.sendFriendRequest}
                        onStartPrivateChat={startPrivateChat}
                        onConfirmAction={confirmAction}
                        showToast={showToast}
                    />

                    <ChatInput
                        value={connection.newMessage}
                        onChange={connection.setNewMessage}
                        onSubmit={sendMessage}
                        connected={connection.connected}
                        chatMode={chatMode}
                        privateChatWith={privateChatWith}
                    />
                </>
            )}

            {/* Friends Tab: incoming/outgoing requests, friends list, send request to recent users */}
            {activeTab === 'friends' && !user.is_guest && (
                <FriendsTab
                    friends={friends.friends}
                    incomingRequests={friends.incomingRequests}
                    outgoingRequests={friends.outgoingRequests}
                    blockedUsers={friends.blockedUsers}
                    guestUsernames={connection.guestUsernames}
                    recentUsernames={getUniqueUsernames()}
                    onViewProfile={viewUserProfile}
                    onStartPrivateChat={startPrivateChat}
                    onConfirmAction={confirmAction}
                    onSendFriendRequest={friends.sendFriendRequest}
                    onAcceptRequest={friends.acceptRequest}
                    onDeclineRequest={friends.declineRequest}
                    onCancelRequest={friends.cancelRequest}
                />
            )}

            {/* Blocked Tab */}
            {activeTab === 'blocked' && (
                <BlockedTab
                    blockedUsers={friends.blockedUsers}
                    onUnblock={friends.unblockUser}
                />
            )}

            {/* Status Bar: connection status bottom right */}
            <div className="px-3 py-1 border-t border-slate-600/70 bg-slate-700/60 flex-shrink-0 flex justify-end">
                <div className="flex items-center space-x-1.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${connection.connected ? 'bg-brand-acidGreen' : 'bg-brand-red'}`} />
                    <span className="text-xs text-white">{connection.connected ? 'Connected' : 'Disconnected'}</span>
                </div>
            </div>
        </div>
    );
};

export default ChatMiniWindow;