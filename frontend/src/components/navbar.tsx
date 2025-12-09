import React from 'react';

interface NavbarProps {
    currentView: string;
    setCurrentView: (view: string) => void;
    user?: any;
    onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, user, onLogout }) => {
    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'game', label: 'Game' },
        { id: 'chat', label: 'Chat' },
        { id: 'leaderboard', label: 'Leaderboard' },
        { id: 'register', label: 'Register' },
        { id: 'api', label: 'API documentation' }
    ];

    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="text-xl font-bold">ft_transcendence</div>
                    
                    <div className="flex space-x-8">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    currentView === item.id
                                        ? 'bg-blue-700 text-white'
                                        : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {user && onLogout && (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm">Welcome, {user.username}!</span>
                            <button
                                onClick={onLogout}
                                className="bg-rose-500 hover:bg-rose-600 px-3 py-1 rounded text-sm transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
