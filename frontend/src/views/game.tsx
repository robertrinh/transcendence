import React from 'react';

export const Game: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8">Pong Game</h1>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-2xl font-semibold mb-4">Game Coming Soon!</h2>
                    <p className="text-gray-600 mb-6">
                        The Pong game is currently under development. 
                        Soon you'll be able to play real-time multiplayer matches here!
                    </p>
                    <div className="bg-gray-200 rounded-lg p-8 mb-6">
                        <div className="text-gray-500 text-lg">🏓</div>
                        <p className="text-gray-500 mt-2">Game Canvas Placeholder</p>
                    </div>
                    <button 
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                        disabled
                    >
                        Start Game (Coming Soon)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Game;