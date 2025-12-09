import React from 'react';

interface User {
    id: string;
    username: string;
    isOnline: boolean;
}

interface ChatUsersListProps {
    users: User[];
}

export const ChatUsersList: React.FC<ChatUsersListProps> = ({ users }) => {
    return (
        <div className="h-full">
            <div className="p-4 border-b bg-gray-100">
                <h3 className="font-semibold text-gray-800">
                    Online Users ({users.length})
                </h3>
            </div>
            
            <div className="overflow-y-auto h-full p-2">
                {users.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center mt-4">
                        No users online
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {users.map((user) => (
                            <li
                                key={user.id}
                                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100"
                            >
                                <div className={`w-2 h-2 rounded-full ${
                                    user.isOnline ? 'bg-green-400' : 'bg-gray-400'
                                }`}></div>
                                <span className="text-sm font-medium text-gray-700">
                                    {user.username}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};