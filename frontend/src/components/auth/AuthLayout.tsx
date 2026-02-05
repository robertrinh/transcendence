import React, { useState, useEffect } from 'react';
import { GameOfLifeBackground, MarqueeRow } from './ShowcasePanel';

const LOGO_COLORS = [
	'#00FFFF', //* Cyan
	'#FF00FF', //* Magenta
	'#00FF00', //* Lime
	'#FF6B6B', //* Coral
	'#9D4EDD', //* Purple
	'#FFE66D', //* Yellow
];

interface User {
	id: string;
	username: string;
	email?: string;
}

interface AuthLayoutProps {
	children: React.ReactNode;
	onLoginSuccess: (userData: User, token: string) => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
	const [colorIndex, setColorIndex] = useState(0);
	
	//* Cycle through colors
	useEffect(() => {
		const interval = setInterval(() => {
			setColorIndex((prev) => (prev + 1) % LOGO_COLORS.length);
		}, 2000); //* Change color every 2 seconds
		return () => clearInterval(interval);
	}, []);

	const row1 = ['Local Play', 'Tournament Mode', 'Online Functionalities', 'Leaderboards', 'AI Opponents'];
	const row2 = ['Customizable Avatars', 'Match History', 'Friend System', '2FA Security', 'GDPR Compliance'];
	const row3 = ['Classic Pong', 'Pls pass us', 'Fast Matches', 'Chat', 'Anonymous Mode'];

	return (
		<div className="min-h-screen flex bg-white relative">
			<div className="absolute top-6 left-6 z-20">
				<img 
					src="/public/ping-pong-icon.png" 
					alt="Pong Logo" 
					className="h-16 w-auto object-contain transition-[filter] duration-700"
					style={{ 
						filter: `brightness(0) invert(1) drop-shadow(0 0 12px ${LOGO_COLORS[colorIndex]}) drop-shadow(0 0 4px ${LOGO_COLORS[colorIndex]})` 
					}}
				/>
			</div>

			{/* Left side: Form */}
			<div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16">
				<div className="max-w-md mx-auto w-full">
					<div className="mb-8 text-center">
						<h1 className="text-3xl font-bold text-gray-900">Transcendence</h1>
						<p className="text-gray-500 mt-2">A homage to the pioneer of games.</p>
					</div>
					
					{/* Form content (Login or Register) */}
					{children}
				</div>
			</div>

			{/* Right side: Rounded floating panel */}
			<div className="hidden lg:flex lg:w-1/2 h-screen items-center justify-center p-6">
				<div 
					className="w-full h-[90%] bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 relative overflow-hidden"
					style={{ 
						borderRadius: '40px',
					}}
				>
					<ShowcasePanel />
				</div>
			</div>

			<div className="absolute bottom-0 left-0 right-0 lg:right-1/2 z-20 px-8 py-4">
				<div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
					<span>Made at</span>
					<img 
						src="/public/logo_codam_black.png" 
						alt="Codam Logo" 
						className="h-5 w-auto object-contain opacity-60"
					/>
				</div>
			</div>
		</div>
	);
};

export default AuthLayout;
