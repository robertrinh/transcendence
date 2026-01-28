import { useState, useEffect } from 'react';
import MainLayout from './components/Layout/MainLayout';
import { verifyToken } from './config/api'  // NEW: import handshake
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

export function App() {
    const [user, setUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState('home');
    const [viewParams, setViewParams] = useState<any>(null); // new
    const [loading, setLoading] = useState(true);

    // Check for existing session on startup
    useEffect(() => {
        checkSession();
    }, []);

    // CHANGED: Replace this function
    const checkSession = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            // CHANGED: Use verifyToken from api.ts instead
            const userData = await verifyToken();
            
            if (userData) {
                setUser(userData);
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
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json' 
                    },
                });
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
        
        localStorage.removeItem('token');
        setUser(null);
        setCurrentView('home');
    };

    //new
    const navigateToUserProfile = (username: string) => {
        setCurrentView('userProfile');
        setViewParams({ username });
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
            case 'userProfile': // NEW: Handle user profile view
                return viewParams?.username ? (
                    <UserProfile username={viewParams.username} />
                ) : (
                    <NotFound />
                );
            case 'tournaments':
                return <Tournaments user={user} />;
            default:
                return <NotFound />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-950 to-slate-950">
            <MainLayout
                user={user}
                currentView={currentView}
                setCurrentView={setCurrentView}
                onLogin={handleLogin}
                onLogout={handleLogout}
                navigateToUserProfile={navigateToUserProfile} 
            >
                {renderCurrentView()}
            </MainLayout>
        </div>
    );
}