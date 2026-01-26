import React from 'react';
import TwoFactorSetup from '../components/auth/TwoFactorSetup';

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

				{/* Put in the right place later! */}
				{user && <TwoFactorSetup />}
			</div>
		</div>
	);
};

export default Home;