import { useState, useEffect } from 'react';
import MainLayout from './components/Layout/MainLayout';
import Login from './components/auth/Login';
import AuthRegister from './components/auth/AuthRegister';

// Import your views
import Home from './views/home';
import Game from './views/game';
import Leaderboard from './views/leaderboard';
import Profile from './views/profile';
import Tournaments from './views/tournaments';
import NotFound from './views/notfound';

interface User {
	id: string;
	username: string;
	email?: string;
}

export function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [showLogin, setShowLogin] = useState(true);

	const [user, setUser] = useState<User | null>(null);
	const [currentView, setCurrentView] = useState('home');
	const [loading, setLoading] = useState(true);

	// Check for existing session on startup (but don't require it)
	useEffect(() => {
		checkSession();
	}, []);

	const checkSession = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				setLoading(false);
				return;
			}

			const response = await fetch('/api/auth/validate', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			if (response.ok) {
				const data = await response.json();
				setUser(data.user);
				setIsAuthenticated(true);  // <-- Restore authentication if session valid
			} else {
				localStorage.removeItem('token');
			}
		} catch (error) {
			console.error('Session check failed:', error);
			localStorage.removeItem('token');
		}
		setLoading(false);
	};

	const handleLogin = (userData: User, token: string) => {
		localStorage.setItem('token', token);
		setUser(userData);
		setIsAuthenticated(true);
	};

	const handleLogout = async () => {
		try {
			const token = localStorage.getItem('token');
			if (token) {
				await fetch('/api/auth/logout', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ token }),
				});
			}
		} catch (error) {
			console.error('Logout failed:', error);
		}

		localStorage.removeItem('token');
		setUser(null);
		setIsAuthenticated(false);
		setCurrentView('home');
	};

	const renderCurrentView = () => {
		switch (currentView) {
			case 'home':
				return <Home user={user} />;
			case 'game':
				return <Game />;
			case 'leaderboard':
				return <Leaderboard />;
			case 'profile':
				return <Profile user={user} />;
			case 'tournaments':
				return <Tournaments user={user} />;
			default:
				return <NotFound />;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-950 to-slate-950 flex items-center justify-center">
				<div className="text-xl text-white">Loading...</div>
			</div>
		);
	}

	//* Authentication gate: login/register first
	if (!isAuthenticated) {
		return showLogin ? (
			<Login
				onLoginSuccess={handleLogin}
				onSwitchToRegister={() => setShowLogin(false)}
			/>
		) : (
			<AuthRegister onSwitchToLogin={() => setShowLogin(true)} />
		);
	}

	//* Main application (After login)
	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-950 to-slate-950">
			<MainLayout
				user={user}
				currentView={currentView}
				setCurrentView={setCurrentView}
				onLogin={handleLogin}
				onLogout={handleLogout}
			>
				{renderCurrentView()}
			</MainLayout>
		</div>
	);

}