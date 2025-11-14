// import React from 'react';

// interface User {
//     id: string;
//     username: string;
//     isOnline: boolean;
// }

// interface ChatUserListProps {
//     users: User[];
// }

// export const ChatUserList: React.FC<ChatUserListProps> = ({ users }) => {
//     return (
//         <div className="w-64 bg-gray-50 border-1">
//             <div className="p-4 vorder-b">
//                 <h3 className="text-lg font-semibold">Online Users ({users.length})</h3>
//             </div>
//             <div className="p-2">
//                 {users.map((user) => (
//                     <div key={user.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
//                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                         <span className="text-sm">{user.username}</span>
//                     </div>
//                 ))}
//                 {users.length === 0 && (
//                     <div className="text-gray-500 text-sm p-2">NO users online</div>
//                 )}
//             </div>
//         </div>
//     );
// };

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