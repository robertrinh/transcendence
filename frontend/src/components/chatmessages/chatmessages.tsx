import React, { useEffect, useRef } from 'react';

interface Message {
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: Date;
}

interface ChatMessagesProps {
    messages: Message[];
    currentUserId: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, currentUserId }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (messages.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                No messages yet. Start the conversation!
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
                const isOwnMessage = message.userId === currentUserId;
                
                return (
                    <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            {!isOwnMessage && (
                                <div className="text-sm font-semibold mb-1">
                                    {message.username}
                                </div>
                            )}
                            <div className="break-words">{message.message}</div>
                            <div className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                                {formatTime(message.timestamp)}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};