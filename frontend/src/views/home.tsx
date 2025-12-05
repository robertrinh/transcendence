// // import React from 'react'

// // export default function Home() {
// //   return (
// //     <div className="p-4">
// //       <h1 className="text-4xl font-bold font-montserrat">Home Page</h1>
// //     </div>
// //   )
// // }

// import React from 'react';

// export const Home: React.FC = () => {
//     return (
//         <div className="container mx-auto px-4 py-8">
//             <h1 className="text-4xl font-bold text-center mb-8">Welcome to ft_transcendence</h1>
//             <div className="max-w-4xl mx-auto">
//                 <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//                     <h2 className="text-2xl font-semibold mb-4">About the Game</h2>
//                     <p className="text-gray-600 mb-4">
//                         Welcome to the ultimate Pong experience! This is a modern take on the classic game
//                         with real-time multiplayer capabilities, tournaments, and chat functionality.
//                     </p>
//                 </div>
                
//                 <div className="grid md:grid-cols-2 gap-6">
//                     <div className="bg-white rounded-lg shadow-md p-6">
//                         <h3 className="text-xl font-semibold mb-3">Features</h3>
//                         <ul className="text-gray-600 space-y-2">
//                             <li>• Real-time multiplayer Pong</li>
//                             <li>• Tournament system</li>
//                             <li>• Live chat</li>
//                             <li>• User profiles</li>
//                             <li>• Leaderboards</li>
//                         </ul>
//                     </div>
                    
//                     <div className="bg-white rounded-lg shadow-md p-6">
//                         <h3 className="text-xl font-semibold mb-3">Get Started</h3>
//                         <p className="text-gray-600 mb-4">
//                             Ready to play? Navigate to the Game section to start a match,
//                             or check out the Chat to connect with other players!
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Home;

import React from 'react';

interface User {
    id: string;
    username: string;
    email?: string;
}

interface HomeProps {
    user: User | null;  // ← Now optional
}

const Home: React.FC<HomeProps> = ({ user }) => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Welcome to ft_transcendence
            </h1>
            
            {user ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800">
                        Hello, <strong>{user.username}</strong>! Welcome back.
                    </p>
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <p className="text-gray-700">
                        Welcome! You're browsing as a guest. Login or register to access all features.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h2 className="text-xl font-semibold mb-2">Play Game</h2>
                    <p className="text-gray-600 mb-4">Start a new Pong game with other players.</p>
                    <button 
                        className={`px-4 py-2 rounded ${
                            user 
                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!user}
                    >
                        {user ? 'Play Now' : 'Login to Play'}
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
                    <p className="text-gray-600 mb-4">Check rankings of all players.</p>
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        View Rankings
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h2 className="text-xl font-semibold mb-2">Tournaments</h2>
                    <p className="text-gray-600 mb-4">Browse competitive tournaments.</p>
                    <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                        Browse Tournaments
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;