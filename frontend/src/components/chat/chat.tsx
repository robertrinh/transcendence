import React from 'react';
import  ChatWindow from '../chatwindow/chatwindow';

interface ChatProps {
    user: any;
    token: string;
}

export const Chat: React.FC<ChatProps> = ({ user, token }) => {
    // Validate that we have both user and token?
    if (!user || !token) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="text-xl text-red-600 mb-4">Authentication Required</div>
                    <p className="text-gray-600">Please login to access the chat.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-100">
            <div className="h-full max-w-6xl mx-auto bg-white shadow-lg">
                <div className="p-4 border-b bg-gray-50">
                    <h1 className="text-xl font-semibold">Chat Room</h1>
                    <p className="text-sm text-gray-600">
                        Welcome, {user.username}! Session: {token.substring(0, 8)}...
                    </p>
                </div>
                <div className="h-[calc(100vh-120px)]">
                    <ChatWindow
                        user={user}  // Pass the user object directly
                    />
                </div>
            </div>
        </div>
    );
};