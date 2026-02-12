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
		<div className="min-h-screen w-full relative overflow-hidden">
			<div className="fixed inset-0 z-0">
				<GameOfLifeBackground />
			</div>

			{/* Dark overlay from game of life for text readability */}
			<div className="fixed inset-0 z-[1] bg-black/40" />

			{/* Ping pong icon with drop shadow from game of life*/}
			<div className="fixed top-6 left-6 z-50">
				<img 
					src="/public/ping-pong-icon.png" 
					alt="Pong Logo" 
					className="h-16 w-auto object-contain transition-[filter] duration-700"
					style={{ 
						filter: `brightness(0) invert(1) drop-shadow(0 0 12px ${LOGO_COLORS[colorIndex]}) drop-shadow(0 0 4px ${LOGO_COLORS[colorIndex]})` 
					}}
				/>
			</div>

			<div className="relative z-30 min-h-screen flex flex-col items-center pt-20 px-4">
				<div 
					className="w-full max-w-md bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
				>
					<div className="mb-6 text-center">
						<h1 className="text-2xl font-bold text-white">Transcendence</h1>
						<p className="text-white/50 mt-1 text-sm">A homage to the pioneer of games.</p>
					</div>
					
					{/* Form content (Login or Register) */}
					{children}
				</div>
			</div>

			<div className="fixed bottom-12 left-0 right-0 z-20 flex flex-col gap-3">
				<MarqueeRow items={row1} direction="left" speed={30} />
				<MarqueeRow items={row2} direction="right" speed={35} />
				<MarqueeRow items={row3} direction="left" speed={28} />
			</div>

			<div className="fixed bottom-0 left-0 right-0 z-30 px-8 py-2">
				<div className="flex items-center justify-center gap-2 text-white/80 text-xs">
					<span>Made at</span>
					<img 
						src="/public/logo_codam_white.png" 
						alt="Codam Logo" 
						className="h-4 w-auto object-contain invert-0 opacity-70"
					/>
				</div>
			</div>
		</div>
	);
};

export default AuthLayout;
