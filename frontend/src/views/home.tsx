// import React from 'react'

// export default function Home() {
//   return (
//     <div className="p-4">
//       <h1 className="text-4xl font-bold font-montserrat">Home Page</h1>
//     </div>
//   )
// }

import React from 'react';

export const Home: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8">Welcome to ft_transcendence</h1>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-semibold mb-4">About the Game</h2>
                    <p className="text-gray-600 mb-4">
                        Welcome to the ultimate Pong experience! This is a modern take on the classic game
                        with real-time multiplayer capabilities, tournaments, and chat functionality.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-3">Features</h3>
                        <ul className="text-gray-600 space-y-2">
                            <li>• Real-time multiplayer Pong</li>
                            <li>• Tournament system</li>
                            <li>• Live chat</li>
                            <li>• User profiles</li>
                            <li>• Leaderboards</li>
                        </ul>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-3">Get Started</h3>
                        <p className="text-gray-600 mb-4">
                            Ready to play? Navigate to the Game section to start a match,
                            or check out the Chat to connect with other players!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;