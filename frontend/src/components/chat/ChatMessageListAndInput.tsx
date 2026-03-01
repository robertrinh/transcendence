import React, { useRef } from 'react';
import type { Message } from './chatTypes';
import { SYSTEM_USERNAME } from './chatTypes';
import type { Friend, FriendRequest } from './chatTypes';

interface ChatMessageListProps {
    messages: Message[];
    currentUsername: string;
    friends: Friend[];
    outgoingRequests: FriendRequest[];
    messagesEndRef: React.RefObject<HTMLDivElement>;
    actionPopover: { username: string; messageId: string } | null;
    setActionPopover: React.Dispatch<React.SetStateAction<{ username: string; messageId: string } | null>>;
    onViewProfile: (username: string) => void;
    onSendFriendRequest: (username: string) => void;
    onStartPrivateChat: (username: string) => void;
    onConfirmAction: (action: 'remove' | 'block', username: string) => void;
    showToast: (message: string) => void;
}

export function ChatMessageList({
    messages,
    currentUsername,
    friends,
    outgoingRequests,
    messagesEndRef,
    actionPopover,
    setActionPopover,
    onViewProfile,
    onSendFriendRequest,
    onStartPrivateChat,
    onConfirmAction,
    showToast
}: ChatMessageListProps) {
    const popoverRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-800/50 space-y-0.5 font-mono text-xs">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 py-8 text-sm font-sans">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((message) => {
                        const isSystem = !message.username || message.username === SYSTEM_USERNAME;
                        const timeStr = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const showPopover = actionPopover?.messageId === message.id;

                        if (isSystem) {
                            return (
                                <div
                                    key={message.id}
                                    className="py-0.5 flex flex-wrap items-baseline gap-x-1"
                                >
                                    <span className="text-brand-cyan/90">[{timeStr}]</span>
                                    <span className="text-brand-cyan/90">
                                        {message.message}
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={message.id}
                                className="relative py-0.5 flex flex-wrap items-baseline gap-x-1"
                            >
                                <span className="text-slate-500 shrink-0">
                                    [{timeStr}]
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (message.username === currentUsername) {
                                            showToast('This is your own profile!');
                                            return;
                                        }
                                        setActionPopover((prev) =>
                                            prev?.messageId === message.id ? null : { username: message.username, messageId: message.id }
                                        );
                                    }}
                                    className={`font-medium text-xs shrink-0 hover:underline ${message.isPrivate ? 'text-brand-purple' : 'text-brand-orange'}`}
                                >
                                    {message.username}
                                </button>
                                <span className={message.isPrivate ? 'text-brand-purple/90' : 'text-white'}>: {message.message}</span>
                                {message.username !== currentUsername &&
                                    showPopover && (
                                        <div
                                            ref={popoverRef}
                                            className="absolute left-0 top-full mt-0.5 z-50 bg-slate-700 border border-slate-600 rounded shadow-lg py-1 min-w-[140px]"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onViewProfile(message.username);
                                                    setActionPopover(null);
                                                }}
                                                className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-600 text-xs"
                                            >
                                                View profile
                                            </button>
                                            {!friends.some((f) => f.username === message.username) && !outgoingRequests.some((r) => r.username === message.username) ? (
                                                <button
                                                    type="button"
                                                    onClick={() => { onSendFriendRequest(message.username); setActionPopover(null); }}
                                                    className="w-full text-left px-3 py-1.5 text-brand-acidGreen hover:bg-slate-600 text-xs"
                                                >
                                                    Add friend
                                                </button>
                                            ) : friends.some((f) => f.username === message.username) ? (
                                                <button
                                                    type="button"
                                                    onClick={() => { onStartPrivateChat(message.username); setActionPopover(null); }}
                                                    className="w-full text-left px-3 py-1.5 text-brand-purple hover:bg-slate-600 text-xs"
                                                >
                                                    Whisper
                                                </button>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={() => { onConfirmAction('block', message.username); setActionPopover(null); }}
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
        </>
    );
}

// ---- ChatInput ----

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent, options?: { isPrivate?: boolean; toUser?: string }) => void;
    connected: boolean;
    chatMode: 'public' | 'private';
    privateChatWith: string;
}

export function ChatInput({
    value,
    onChange,
    onSubmit,
    connected,
    chatMode,
    privateChatWith
}: ChatInputProps) {
    const placeholder = connected ? (chatMode === 'private' ? `Private message to ${privateChatWith}...` : 'Type message...') : 'Connecting...';

    return (
        <div className="border-t border-slate-600/70 p-3 flex-shrink-0 bg-slate-700/60">
            <form
                onSubmit={(e) => onSubmit(e, { isPrivate: chatMode === 'private', toUser: chatMode === 'private' && privateChatWith ? privateChatWith : undefined })}
                className="flex space-x-2"
            >
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 text-sm text-slate-100 placeholder-slate-500 border border-slate-500 bg-slate-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                    maxLength={200}
                    disabled={!connected}
                />
                <button
                    type="submit"
                    disabled={!value.trim() || !connected}
                    className={`px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${chatMode === 'private' ? 'bg-brand-purple/80 text-white hover:bg-brand-purple' : 'bg-brand-orange/80 text-white hover:bg-brand-orange'}`}
                >
                    Send
                </button>
            </form>
        </div>
    );
}
