import React, { useState, useEffect, useRef } from 'react';
import ChatMiniWindow from '../chat/ChatMiniWindow';
import Login from '../auth/Login';
import AuthRegister from '../auth/AuthRegister';

interface User {
    id: string;
    username: string;
    email?: string;
}

interface MainLayoutProps {
    user: User | null;
    currentView: string;
    setCurrentView: (view: string) => void;
    onLogin: (userData: User, sessionId: string) => void;
    onLogout: () => void;
    children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    user,
    currentView,
    setCurrentView,
    onLogin,
    onLogout,
    children
}) => {
    const [showAuthPanel, setShowAuthPanel] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const authPanelRef = useRef<HTMLDivElement>(null);
    const authButtonRef = useRef<HTMLButtonElement>(null);

    const handleLoginSuccess = (userData: User, sessionId: string) => {
        onLogin(userData, sessionId);
        setShowAuthPanel(false);
    };

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                authPanelRef.current && 
                authButtonRef.current &&
                !authPanelRef.current.contains(event.target as Node) &&
                !authButtonRef.current.contains(event.target as Node)
            ) {
                setShowAuthPanel(false);
            }
        };

        if (showAuthPanel) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showAuthPanel]);

    // Close panel when pressing Escape
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowAuthPanel(false);
            }
        };

        if (showAuthPanel) {
            document.addEventListener('keydown', handleEscapeKey);
            return () => {
                document.removeEventListener('keydown', handleEscapeKey);
            };
        }
    }, [showAuthPanel]);

    // Auto-close after 30 seconds of inactivity
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        
        if (showAuthPanel) {
            timeout = setTimeout(() => {
                setShowAuthPanel(false);
            }, 30000); // 30 seconds
        }

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [showAuthPanel]);

    return (
        <div className="h-screen flex flex-col overflow-hidden relative">
            {/* TOP NAVBAR */}
            <header className="bg-white/50 backdrop-blur-sm shadow-sm border-b border-white/20 h-16 flex-shrink-0 relative z-40">
                <div className="max-w-7xl mx-auto px-4 h-full">
                    <div className="flex items-center justify-between h-full">
                        {/* Logo/Brand */}
                        <div className="bg-gray-900/80 text-white px-6 py-2 rounded-md backdrop-blur-sm">
                            <span className="font-bold">TRANSCENDENCE</span>
                        </div>

                        {/* MENU NAVIGATION BUTTONS */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentView('home')}
                                className={`px-4 py-2 rounded-md border-2 transition-colors backdrop-blur-sm ${
                                    currentView === 'home' 
                                        ? 'bg-gray-900/80 text-white border-gray-900/80' 
                                        : 'bg-white/30 text-gray-900 border-gray-900/50 hover:bg-white/40'
                                }`}
                            >
                                Home
                            </button>

                            <button
                                onClick={() => setCurrentView('game')}
                                className={`px-4 py-2 rounded-md border-2 transition-colors backdrop-blur-sm ${
                                    currentView === 'game' 
                                        ? 'bg-gray-900/80 text-white border-gray-900/80' 
                                        : 'bg-white/30 text-gray-900 border-gray-900/50 hover:bg-white/40'
                                }`}
                            >
                                Game
                            </button>

                            <button
                                onClick={() => setCurrentView('leaderboard')}
                                className={`px-4 py-2 rounded-md border-2 transition-colors backdrop-blur-sm ${
                                    currentView === 'leaderboard' 
                                        ? 'bg-gray-900/80 text-white border-gray-900/80' 
                                        : 'bg-white/30 text-gray-900 border-gray-900/50 hover:bg-white/40'
                                }`}
                            >
                                Leaderboard
                            </button>

                            <button
                                onClick={() => setCurrentView('tournaments')}
                                className={`px-4 py-2 rounded-md border-2 transition-colors backdrop-blur-sm ${
                                    currentView === 'tournaments' 
                                        ? 'bg-gray-900/80 text-white border-gray-900/80' 
                                        : 'bg-white/30 text-gray-900 border-gray-900/50 hover:bg-white/40'
                                }`}
                            >
                                Tournaments
                            </button>

                            <button
                                onClick={() => setCurrentView('api-documentation')}
                                className={`px-4 py-2 rounded-md border-2 transition-colors backdrop-blur-sm ${
                                    currentView === 'api-documentation' 
                                        ? 'bg-gray-900/80 text-white border-gray-900/80' 
                                        : 'bg-white/30 text-gray-900 border-gray-900/50 hover:bg-white/40'
                                }`}
                            >
                                API Documentation
                            </button>

                            {/* Show profile only if logged in */}
                            {user && (
                                <button
                                    onClick={() => setCurrentView('profile')}
                                    className={`px-4 py-2 rounded-md border-2 transition-colors backdrop-blur-sm ${
                                        currentView === 'profile' 
                                            ? 'bg-gray-900/80 text-white border-gray-900/80' 
                                            : 'bg-white/30 text-gray-900 border-gray-900/50 hover:bg-white/40'
                                    }`}
                                >
                                    Profile
                                </button>
                            )}
                        </div>

                        {/* USER AUTHENTICATION AREA */}
                        <div className="flex items-center space-x-4 relative">
                            {user ? (
                                <>
                                    <span className="text-gray-900 font-medium">Hello, {user.username}!</span>
                                    <button
                                        onClick={onLogout}
                                        className="px-4 py-2 rounded-md border-2 border-red-600 bg-red-500/80 text-white hover:bg-red-500 backdrop-blur-sm transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    ref={authButtonRef}
                                    onClick={() => setShowAuthPanel(!showAuthPanel)}
                                    className="px-4 py-2 rounded-md border-2 border-blue-600 bg-blue-600/80 text-white hover:bg-blue-600 backdrop-blur-sm transition-colors"
                                >
                                    {showAuthPanel ? 'Close' : 'Login / Register'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* AUTH PANEL OVERLAY - Portal to body */}
            {showAuthPanel && !user && (
                <>
                    {/* Full screen backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[998]"
                        onClick={() => setShowAuthPanel(false)}
                    />
                    
                    {/* Auth Panel - Fixed positioning */}
                    <div 
                        ref={authPanelRef}
                        className="fixed top-20 right-4 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/50 z-[999] w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-hidden"
                    >
                        {/* Panel Header */}
                        <div className="flex justify-between items-center p-4 border-b border-white/30 bg-white/80 rounded-t-xl">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setAuthMode('login')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        authMode === 'login' 
                                            ? 'bg-blue-500 text-white shadow-md' 
                                            : 'bg-white/60 text-gray-700 hover:bg-white/80'
                                    }`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setAuthMode('register')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        authMode === 'register' 
                                            ? 'bg-blue-500 text-white shadow-md' 
                                            : 'bg-white/60 text-gray-700 hover:bg-white/80'
                                    }`}
                                >
                                    Register
                                </button>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                {/* Minimize/Close buttons */}
                                <button
                                    onClick={() => setShowAuthPanel(false)}
                                    className="text-gray-400 hover:text-gray-600 text-sm bg-white/60 hover:bg-white/80 w-8 h-8 flex items-center justify-center rounded-full transition-all"
                                    title="Close (ESC)"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Panel Content - Scrollable */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {authMode === 'login' ? (
                                <Login 
                                    onLoginSuccess={handleLoginSuccess}
                                    onSwitchToRegister={() => setAuthMode('register')}
                                    isInPanel={true}
                                />
                            ) : (
                                <AuthRegister 
                                    onSwitchToLogin={() => setAuthMode('login')}
                                    isInPanel={true}
                                />
                            )}
                        </div>

                        {/* Panel Footer */}
                        <div className="px-4 py-2 border-t border-white/30 bg-white/60 rounded-b-xl">
                            <p className="text-xs text-gray-500 text-center">
                                Press ESC or click outside to close • Auto-closes in 30s
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex min-h-0 overflow-hidden">
                {/* LEFT SIDE - Main Content */}
                <div className="flex-1 p-4 border-r border-white/20 overflow-hidden">
                    <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 h-full overflow-hidden">
                        <div className="h-full overflow-y-auto">
                            {children}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - Chat */}
                <div className="w-80 bg-white/50 backdrop-blur-sm border-l border-white/20 flex flex-col overflow-hidden">
                    {/* Chat Header - Fixed */}
                    <div className="p-4 border-b border-white/20 bg-white/30 backdrop-blur-sm flex-shrink-0">
                        <h3 className="font-semibold text-gray-900">Chat</h3>
                    </div>
                    
                    {/* Chat Content - Flexible */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {user ? (
                            <ChatMiniWindow user={user} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-900 p-4">
                                <p className="text-center mb-2">Login to join the chat</p>
                                <button
                                    onClick={() => setShowAuthPanel(true)}
                                    className="text-blue-600 hover:text-blue-700 underline text-sm bg-white/50 px-3 py-1 rounded backdrop-blur-sm"
                                >
                                    Login here
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* BOTTOM STATUS BAR */}
            <footer className="bg-gray-900/80 backdrop-blur-sm text-white h-6 flex items-center px-4 flex-shrink-0 border-t border-white/10 z-30">
                <div className="text-xs">
                    Status: {user ? `Connected as ${user.username}` : 'Browsing as guest'} | 
                    Current Page: {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                    {showAuthPanel && ' | Auth panel open'}
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;