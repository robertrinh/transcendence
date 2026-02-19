import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../components/util/profileUtils';

interface HomeProps {
	user: User | null;
}

interface MenuItemProps {
	label: string;
	oneLiner: string;
	onClick: () => void;
	enabled: boolean;
	/** Navbar-style: outline by default, fill on hover. Tailwind classes for enabled state. */
	enabledClass: string;
}

function MenuItem({ label, oneLiner, onClick, enabled, enabledClass }: MenuItemProps) {
	return (
		<button
			type="button"
			onClick={enabled ? onClick : undefined}
			disabled={!enabled}
			className={`group w-full text-center px-5 py-2 rounded-lg border-2 font-semibold uppercase tracking-wider transition-all duration-200 flex flex-col gap-0.5 items-center ${
				enabled ? enabledClass : 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
			}`}
			title={!enabled ? 'Login to access' : oneLiner}
		>
			<span>{label}</span>
			<span className={`text-xs font-normal normal-case transition-opacity duration-200 ${
				enabled ? 'opacity-0 group-hover:opacity-100 group-hover:text-black/70' : 'text-white/40'
			}`}>
				{enabled ? oneLiner : 'Login to access'}
			</span>
		</button>
	);
}

const Home: React.FC<HomeProps> = ({ user }) => {
	const navigate = useNavigate();
	const isGuest = !user;

	return (
		<div className="p-6 flex flex-col min-h-full items-center">
			<h1 className="text-3xl font-bold text-white mb-4 drop-shadow-sm text-center">
				Welcome to <span className="text-brand-yellow">Ft_transcendence</span>
			</h1>

			{user ? (
				<p className="text-white/80 mb-8 text-center">
					O praise the user, <strong className="text-brand-hotPink">{user.username}</strong>! 
				</p>
			) : (
				<p className="text-white/70 mb-8 text-center">
					You're browsing as a guest. Login or register to access Play, Profile and Settings.
				</p>
			)}

			{/* Menu – Profile and Settings require login */}
			<nav className="flex flex-col gap-3 w-full max-w-sm">
				<MenuItem
					label="Play"
					oneLiner="Start a Pong game (local, online or tournament)"
					onClick={() => navigate('/game')}
					enabled={!isGuest}
					enabledClass="bg-black/20 text-brand-cyan border-brand-cyan/50 hover:bg-brand-cyan hover:border-brand-cyan hover:text-black"
				/>
				<MenuItem
					label="Leaderboards"
					oneLiner="View rankings and stats"
					onClick={() => navigate('/leaderboard')}
					enabled={true}
					enabledClass="bg-black/20 text-brand-acidGreen border-brand-acidGreen/50 hover:bg-brand-acidGreen hover:border-brand-acidGreen hover:text-black"
				/>
				<MenuItem
					label="Profile"
					oneLiner="View and edit your profile"
					onClick={() => navigate('/profile')}
					enabled={!isGuest}
					enabledClass="bg-black/20 text-brand-magenta border-brand-magenta/50 hover:bg-brand-magenta hover:border-brand-magenta hover:text-black"
				/>
				<MenuItem
					label="Settings"
					oneLiner="Account and app settings"
					onClick={() => navigate('/settings')}
					enabled={!isGuest}
					enabledClass="bg-black/20 text-brand-orange border-brand-orange/50 hover:bg-brand-orange hover:border-brand-orange hover:text-black"
				/>
			</nav>

			<div className="mt-8 w-full max-w-md flex justify-center flex-shrink-0">
				<img
					src="/public/2-neo-pong.jpeg"
					alt="Two Neo's playing Pong"
					className="max-h-[220px] w-auto object-contain rounded-xl border border-white/10 shadow-[0_0_24px_rgba(0,255,128,0.15)]"
				/>
			</div>

			{/* Dev credits – centre bottom of home only */}
			<div className="mt-auto pt-12 flex justify-center">
				<p className="text-xs text-white/50">
					Made with love (and time-pressure) by qtrinh, eeklund, rmeuzela and joviera			
				</p>
			</div>
		</div>
	);
};

export default Home;
