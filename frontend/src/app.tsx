import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams, Outlet } from 'react-router-dom'
import MainLayout from './components/Layout/MainLayout';
import Login from './components/auth/Login';
import AuthRegister from './components/auth/AuthRegister';
import AuthLayout from './components/auth/AuthLayout';
import UserProfile from './components/chat/publicProfile';

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
	nickname?: string;
    display_name?: string;
    avatar_url?: string;
}


//* Route needed for user profile view
function UserProfileRoute() {
	const { username } = useParams<{ username: string }>();
	if (!username) {
		return <NotFound />;
	}
	return <UserProfile username={username} />;
}

//* AppLayout component needed for main layout and navigation
//* uses old logic from MainLayout component to avoid dependencies
function AppLayout({
	user: _user,
	onLogin: _onLogin,
	onLogout: _onLogout,
}: {
	user: User | null;
	onLogin: (userData: User, token: string) => void;
	onLogout: () => void;
}) {
	const navigate = useNavigate();
	const location = useLocation();

	const getCurrentView = (): string => {
		const path = location.pathname;
		if (path === '/') {
			return 'home';
		}
		if (path.startsWith('/user/')) {
			return 'userProfile';
		}
		if (path === '/game') {
			return 'game';
		}
		if (path === '/leaderboard') {
			return 'leaderboard';
		}
		if (path === '/tournaments') {
			return 'tournaments';
		}
		if (path === '/profile') {
			return 'profile';
		}
		return 'home';
	}

	//* updates current view in URL without reloading the page
	const handleSetCurrentView = (view: string) => {
		if (view === 'home') {
			navigate('/');
		} else {
			navigate(`/${view}`); //* $(view) syntax: navigate game, leaderboard etc.
		}
	};

	const navigateToUserProfile = (username: string) => {
		navigate(`/user/${username}`);
	};

	return (
		<MainLayout
			user={_user}
			currentView={getCurrentView()}
			setCurrentView={handleSetCurrentView}
			onLogin={_onLogin}
			onLogout={_onLogout}
			navigateToUserProfile={navigateToUserProfile}
		>
			<Outlet />
		</MainLayout>
	);
}

export function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [showLogin, setShowLogin] = useState(true);

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on startup
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
				setIsAuthenticated(true);
			} else {
				localStorage.removeItem('token');
			}
		} catch (error) {
			console.error('Session check failed:', error);
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
		return (
			<AuthLayout onLoginSuccess={handleLogin}>
				{showLogin ? (
					<Login
						onLoginSuccess={handleLogin}
						onSwitchToRegister={() => setShowLogin(false)}
						isInPanel={true}
					/>
				) : (
					<AuthRegister 
						onSwitchToLogin={() => setShowLogin(true)} 
						isInPanel={true}
					/>
				)}
			</AuthLayout>
		);
	}

	return (
		<BrowserRouter>
			<div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-950 to-slate-950">
				<Routes>
					<Route 
						path="/"
						element={
						<AppLayout 
							user={user} 
							onLogin={handleLogin} 
							onLogout={handleLogout} 
						/>
						}
					>
						<Route index element={<Home user={user} />} />
						<Route path="/game" element={<Game />} />
						<Route path="/leaderboard" element={<Leaderboard />} />
						<Route path="/tournaments" element={<Tournaments user={user} />} />
						<Route path="/profile" element={<Profile user={user} />} />
						<Route path="/user/:username" element={<UserProfileRoute />} />
						<Route path="*" element={<NotFound />} />
						</Route>
				</Routes>
			</div>
		</BrowserRouter>
	);
}