// import React, { useState } from 'react';
// import { ChatWindow } from '../chatwindow/chatwindow';

// export const Chat: React.FC = () => {
//     const [currentUserId] = useState(() => `user_${Date.now()}`);
//     const [currentUsername, setCurrentUsername] = useState('');
//     const [hasJoined, setHasJoined] = useState(false);

//     const handleJoinChat = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (currentUsername.trim()) {
//             setHasJoined(true);
//         }
//     };

//     if (!hasJoined) {
//         return (
//             <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//                 <div className="bg-white p-8 rounded-lg shadow-md w-96">
//                     <h1 className="text-1x2 font-bold mb-6 text-center">Join Chat</h1>
//                     <form onSubmit={handleJoinChat}>
//                         <div className="mb-4">
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Username
//                             </label>
//                             <input 
//                                 type="text"
//                                 value={currentUsername}
//                                 onChange={(e) => setCurrentUsername(e.target.value)}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 placeholder="Enter your username"
//                                 required
//                                 />
//                         </div>
//                         <button 
//                             type="submit"
//                             className="2-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-coloers"
//                         >
//                             Join Chat
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="h-screen bg-gray-100">
//             <div className="h-full max-w-6x1 mx-auto bg-white shadow-lg">
//                 <div className="p-4 border-b bg-gray-50">
//                     <h1 className="text-x1 font-semibold">Chat Room</h1>
//                     <p className="text-sm text-gray-600">Welcome, {currentUsername}!</p>
//                 </div>
//                 <div className="h-[calc(100vh-80px)]">
//                     <ChatWindow
//                         currentUserId={currentUserId}
//                         currentUsername={currentUsername}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

import React from 'react';
import  ChatWindow from '../chatwindow/chatwindow';

interface ChatProps {
    user: any;
    sessionId: string;
}

export const Chat: React.FC<ChatProps> = ({ user, sessionId }) => {
    // Validate that we have both user and sessionId
    if (!user || !sessionId) {
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
                        Welcome, {user.username}! Session: {sessionId.substring(0, 8)}...
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