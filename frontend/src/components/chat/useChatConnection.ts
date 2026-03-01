import { useState, useEffect, useRef, type MutableRefObject } from 'react';
import { fetchWithAuth } from '../../config/api';
import type { Message } from './chatTypes';
import { SYSTEM_USERNAME } from './chatTypes';
import type { User } from '../util/profileUtils';

export function useChatConnection(user: User, friendRequestCallbackRef?: MutableRefObject<(() => void) | null>) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [connected, setConnected] = useState(false);
    const [connectionId, setConnectionId] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [guestUsernames, setGuestUsernames] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

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
                console.error('Failed to join chat', response.statusText);
            }
        } catch (error) {
            console.error('Error joining chat:', error);
        }
    };

    const connectSSE = () => {
        try {
            if (user.is_anonymous) {
                setConnected(false);
                return;
            }
            const token = localStorage.getItem('token');
            if (!token) return;

            const sseUrl = `/api/chat/stream?token=${token}`;
            const eventSource = new EventSource(sseUrl);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => setConnected(true);

            eventSource.onmessage = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data);
                    switch (data.type) {
                        case 'connected':
                            setConnectionId(data.connectionId);
                            joinChat(data.connectionId);
                            if (data.onlineUsers) setOnlineUsers(data.onlineUsers);
                            if (Array.isArray(data.guestUsernames)) setGuestUsernames(data.guestUsernames);
                            break;
                        case 'history':
                            setMessages(data.messages.map((msg: any) => ({
                                id: msg.id,
                                username: msg.username,
                                message: msg.message,
                                timestamp: new Date(msg.timestamp),
                                isPrivate: msg.isPrivate,
                                toUser: msg.toUser
                            })));
                            break;
                        case 'message':
                            setMessages((prev) => [
                                ...prev,
                                {
                                    id: data.id,
                                    username: data.username,
                                    message: data.message,
                                    timestamp: new Date(data.timestamp),
                                    isPrivate: data.isPrivate,
                                    toUser: data.toUser
                                }
                            ]);
                            break;
                        case 'user_joined':
                            setMessages((prev) => [
                                ...prev,
                                {
                                    id: Date.now().toString(),
                                    username: SYSTEM_USERNAME,
                                    message: data.message,
                                    timestamp: new Date(data.timestamp)
                                }
                            ]);
                            if (data.username?.trim()) {
                                setOnlineUsers((prev) =>
                                    prev.includes(data.username) ? prev : [...prev, data.username]
                                );
                                if (data.isGuest) {
                                    setGuestUsernames((prev) =>
                                        prev.includes(data.username) ? prev : [...prev, data.username]
                                    );
                                }
                            }
                            break;
                        case 'user_left':
                            setMessages((prev) => [
                                ...prev,
                                {
                                    id: Date.now().toString(),
                                    username: SYSTEM_USERNAME,
                                    message: data.message,
                                    timestamp: new Date(data.timestamp)
                                }
                            ]);
                            if (data.username?.trim()) {
                                setOnlineUsers((prev) => prev.filter((u) => u !== data.username));
                                setGuestUsernames((prev) => prev.filter((u) => u !== data.username));
                            }
                            break;
                        case 'friend_request':
                            setMessages((prev) => [
                                ...prev,
                                {
                                    id: Date.now().toString(),
                                    username: SYSTEM_USERNAME,
                                    message: data.message || `${data.fromUsername || 'Someone'} wants to be your friend!`,
                                    timestamp: new Date(data.timestamp || Date.now())
                                }
                            ]);
                            friendRequestCallbackRef?.current?.();
                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    console.error('Error parsing SSE message:', error);
                }
            };

            eventSource.onerror = () => {
                setConnected(false);
                setTimeout(() => {
                    if (eventSource.readyState === EventSource.CLOSED) {
                        connectSSE();
                    }
                }, 3000);
            };
        } catch (error) {
            console.error('Failed to connect SSE:', error);
        }
    };

    useEffect(() => {
        connectSSE();
        return () => {
            eventSourceRef.current?.close();
        };
    }, [user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async (e: React.FormEvent, options?: { isPrivate?: boolean; toUser?: string }) => {
        e.preventDefault();
        if (!newMessage.trim() || !connectionId || !connected) return;
        const msgToSend = newMessage.trim();
        setNewMessage('');
        const isPrivate = options?.isPrivate ?? false;
        const toUser = options?.toUser?.trim();
        try {
            const res = await fetchWithAuth('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId,
                    message: msgToSend,
                    isPrivate,
                    toUser: isPrivate && toUser ? toUser : undefined
                })
            });
            await res.json();
            if (res.ok) console.log('Message sent');
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    return {
        messages,
        setMessages,
        newMessage,
        setNewMessage,
        connected,
        connectionId,
        onlineUsers,
        guestUsernames,
        messagesEndRef,
        scrollToBottom,
        sendMessage,
        connectSSE
    };
}
