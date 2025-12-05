// import React, { useState, useEffect, useRef } from 'react';
// import { ChatMessage } from '../chatmessages/chatmessages';
// import { ChatInput } from '../chatinput/chatinput';
// import { ChatUserList } from '../chatUserslist/chatuserlist';

// interface Message {
//     id: string;
//     userId: string;
//     username: string;
//     message: string;
//     timestamp: Date;
// }

// interface User {
//     id: string;
//     username: string;
//     isOnline: boolean;
// }

// interface ChatWindowProps {
//     currentUserId: string;
//     currentUsername: string;
// }

// export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUserId, currentUsername }) => {
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [users, setUsers] = useState<User[]>([]);
//     const [loading, setLoading] = useState(false);
//     const messagesEndRef = useRef<HTMLDivElement>(null);

//     const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     useEffect(() => {
//         joinChatHandler();
//         fetchMessages();
//         fetchUsers();

//         const messageInterval = setInterval(fetchMessages, 2000);
//         const userInterval = setInterval(fetchUsers, 5000);

//         return () => {
//             clearInterval(messageInterval);
//             clearInterval(userInterval);
//             leaveChatHandler();
//         };
//     }, []);

//     const joinChatHandler = async () => {
//         try {
//             await fetch('http://localhost:3000/api/chat/join' , {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     userId: currentUserId,
//                     username: currentUsername 
//                 })
//             });
//         } catch (error) {
//             console.error('Failed to join chat:', error);
//         }
//     };

//     const leaveChatHandler = async () => {
//         try {
//             await fetch(`http://localhost:3000/api/chat/leave/${currentUserId}`, {
//                 method: 'DELETE'
//             });
//         } catch (error) {
//             console.error('Failed to leave chat:', error);
//         }
//     };

//     const fetchMessages = async () => {
//         try {
//             const response = await fetch('http://localhost:3000/api/chat/messages');
//             const data = await response.json();
//             setMessages(data.map((msg: any) => ({
//                 ...msg,
//                 timestamp: new Date(msg.timestamp)
//             })));
//         } catch (error) {
//             console.error('Failed to fetch messages:', error);
//         }
//     };

//     const fetchUsers = async () => {
//         try {
//             const response = await fetch('http://localhost:3000/api/chat/users');
//             const data = await response.json();
//             setUsers(data);
//         } catch (error) {
//             console.error('Failed to fetch users:', error);
//         }
//     };

//     const sendMessage = async (message: string) => {
//         setLoading(true);
//         try {
//             await fetch('http://localhost:3000/api/chat/messages', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     userId: currentUserId,
//                     username: currentUsername,
//                     message
//                 })
//             });

//             await fetchMessages();
//         } catch (error) {
//             console.error('Failed to send message:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return ( 
//         <div className="flex h-full max-h-screen">
//             <div className="flex-1 flex flex-col">
//                 <div className="flex-1 overflow-y-auto p-4 bg-white">
//                     {messages.map((message) => (
//                         <ChatMessage
//                             key={message.id}
//                             id={message.id}
//                             username={message.username}
//                             message={message.message}
//                             timestamp={message.timestamp}
//                             isOwnMessage={message.userId === currentUserId}
//                             />
//                     ))}
//                     <div ref={messagesEndRef} />
//                 </div>

//                 <ChatInput onSendMessage={sendMessage} disabled={loading} />
//             </div>

//             <ChatUserList users={users} />
//         </div>
//     );
// };


import React, { useState, useEffect, useRef } from 'react';

interface User {
    id: string;
    username: string;
    email?: string;
}

interface Message {
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: Date;
    type?: string;
}

interface ChatWindowProps {
    user: User | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [connectionId, setConnectionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (user) {
            connectSSE();
        }

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const connectSSE = () => {
        if (!user) return;

        try {
            console.log('Connecting to SSE stream...');
            const eventSource = new EventSource('http://localhost:3000/api/chat/stream');
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log('✅ SSE connected');
                setConnected(true);
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('SSE message received:', data);

                    switch (data.type) {
                        case 'connected':
                            setConnectionId(data.connectionId);
                            // Join chat after getting connection ID
                            joinChat(data.connectionId);
                            break;

                        case 'history':
                            // Load message history
                            const historyMessages = data.messages.map((msg: any) => ({
                                ...msg,
                                timestamp: new Date(msg.timestamp)
                            }));
                            setMessages(historyMessages);
                            break;

                        case 'message':
                            setMessages(prev => [...prev, {
                                id: data.id,
                                userId: data.userId,
                                username: data.username,
                                message: data.message,
                                timestamp: new Date(data.timestamp)
                            }]);
                            break;

                        case 'user_joined':
                        case 'user_left':
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                userId: 'system',
                                username: 'System',
                                message: data.message,
                                timestamp: new Date(data.timestamp),
                                type: 'system'
                            }]);
                            break;
                    }
                } catch (error) {
                    console.error('Error parsing SSE message:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('❌ SSE error:', error);
                setConnected(false);
                
                // Try to reconnect after a delay
                setTimeout(() => {
                    if (user && eventSource.readyState === EventSource.CLOSED) {
                        console.log('Attempting SSE reconnection...');
                        connectSSE();
                    }
                }, 3000);
            };

        } catch (error) {
            console.error('Failed to connect SSE:', error);
        }
    };

    const joinChat = async (connId: string) => {
        try {
            const response = await fetch('http://localhost:3000/api/chat/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId: connId,
                    userId: user?.id,
                    username: user?.username
                })
            });
            
            if (response.ok) {
                console.log('✅ Joined chat successfully');
            }
        } catch (error) {
            console.error('Failed to join chat:', error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !connectionId || loading) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId,
                    message: newMessage.trim()
                })
            });

            if (response.ok) {
                setNewMessage('');
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setLoading(false);
    };

    if (!user) {
        return <div>Please log in to use chat</div>;
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
            <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">Chat Room</h2>
                        <p className="text-sm text-gray-600">Logged in as: {user.username}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-600">
                            {connected ? 'Connected (SSE)' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={`${message.id}-${index}`}
                            className={`flex ${
                                message.type === 'system' 
                                    ? 'justify-center' 
                                    : message.userId === user.id 
                                        ? 'justify-end' 
                                        : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.type === 'system'
                                        ? 'bg-blue-100 text-blue-800 text-sm italic'
                                        : message.userId === user.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                {message.userId !== user.id && message.type !== 'system' && (
                                    <div className="text-sm font-medium mb-1">
                                        {message.username}
                                    </div>
                                )}
                                <div>{message.message}</div>
                                <div className={`text-xs mt-1 ${
                                    message.type === 'system'
                                        ? 'text-blue-600'
                                        : message.userId === user.id 
                                            ? 'text-blue-100' 
                                            : 'text-gray-500'
                                }`}>
                                    {message.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
                <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={connected ? "Type your message..." : "Connecting..."}
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading || !connected}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || loading || !connected}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;