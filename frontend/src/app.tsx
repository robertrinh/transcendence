import React, { useState, useEffect } from 'react';
import MainLayout from './components/Layout/MainLayout';

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
    const [user, setUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState('home');
    const [loading, setLoading] = useState(true);

    // Check for existing session on startup (but don't require it)
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:3000/api/auth/validate?sessionId=${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                localStorage.removeItem('sessionId');
            }
        } catch (error) {
            console.error('Session check failed:', error);
            localStorage.removeItem('sessionId');
        }
        setLoading(false);
    };

    const handleLogin = (userData: User, sessionId: string) => {
        localStorage.setItem('sessionId', sessionId);
        setUser(userData);
    };

    const handleLogout = async () => {
        try {
            const sessionId = localStorage.getItem('sessionId');
            if (sessionId) {
                await fetch('http://localhost:3000/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                });
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
        
        localStorage.removeItem('sessionId');
        setUser(null);
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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    // Always show the main app (no authentication gate)
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