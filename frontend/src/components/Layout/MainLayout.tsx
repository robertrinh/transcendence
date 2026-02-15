import React, { useState, useEffect, useRef } from 'react';
import ChatMiniWindow from '../chat/ChatMiniWindow';
import Login from '../auth/Login';
import AuthRegister from '../auth/AuthRegister';
import { User, getAvatarUrl } from '../util/profileUtils';

interface MainLayoutProps {
    user: User | null;
    currentView: string;
    setCurrentView: (view: string) => void;
    onLogin: (userData: User, token: string) => void;
    onLogout: () => void;
    navigateToUserProfile?: (username: string) => void;
    children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    user,
    currentView,
    setCurrentView,
    onLogin,
    onLogout,
    navigateToUserProfile,
    children
}) => {
    const [showAuthPanel, setShowAuthPanel] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [showUserMenu, setShowUserMenu] = useState(false); // new for avata + dropmenu
    const authPanelRef = useRef<HTMLDivElement>(null);
    const authButtonRef = useRef<HTMLButtonElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null); // new for avata + dropmenu
    const userButtonRef = useRef<HTMLButtonElement>(null); // new for avata + dropmenu

    useEffect(() => {
        console.log('🔍 MainLayout user changed:', user);
        console.log('🔍 MainLayout avatar_url:', user?.avatar_url);
    }, [user]);

    const handleLoginSuccess = (userData: User, token: string) => {
        onLogin(userData, token);
        setShowAuthPanel(false);
    };

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

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current && 
                userButtonRef.current &&
                !userMenuRef.current.contains(event.target as Node) &&
                !userButtonRef.current.contains(event.target as Node)
            ) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showUserMenu]);

    // Close panel when pressing Escape
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowAuthPanel(false);
                setShowUserMenu(false); // new for avata + dropmenu
            }
        };

        if (showAuthPanel || showUserMenu) {
            document.addEventListener('keydown', handleEscapeKey);
            return () => {
                document.removeEventListener('keydown', handleEscapeKey);
            };
        }
    }, [showAuthPanel, showUserMenu]);

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
                        <div className={`px-4 py-2 rounded-md ${
                            currentView === 'home'
                        }`}>
                            <button
                                onClick={() => setCurrentView('home')}
                                className={`px-4 py-2 rounded-md border-2 transition-colors backdrop-blur-sm ${
                                    currentView === 'home' 
                                        ? 'bg-gray-900/80 text-white border-gray-900/80' 
                                        : 'bg-white/30 text-gray-900 border-gray-900/50 hover:bg-white/40'
                                }`}
                            >
                                TRANSCENDENCE
                            </button>
                        </div>
                        {/* MENU NAVIGATION BUTTONS */}
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => setCurrentView('game')}
                                className={`relative px-6 py-2 rounded-lg font-black uppercase tracking-wider transition-all duration-300 ${
                                    currentView === 'game'
                                        ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.6)]'
                                        : 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                                }`}
                                style={{
                                    textShadow: currentView === 'game' ? '2px 2px 0px rgba(248, 4, 4, 0.34)' : 'none',
                                    transform: currentView === 'game' ? 'translateY(-2px)' : 'none'
                                }}
                            >
                                <span className={`${currentView === 'game' ? 'animate-pulse' : ''}`}>
                                    🎮 GAME
                                </span>
                                {currentView === 'game' && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setCurrentView('leaderboard')}
                                className={`relative px-6 py-2 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${
                                    currentView === 'leaderboard'
                                        ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-105'
                                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-[0_0_15px_rgba(251,191,36,0.5)] hover:scale-105'
                                }`}
                                style={{
                                    textShadow: currentView === 'leaderboard' ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none',
                                    border: '2px solid rgba(255,255,255,0.3)'
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    🏆 LEADERBOARD
                                </span>
                                {currentView === 'leaderboard' && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                        1
                                    </span>
                                )}
                            </button> 
                        </div>

                        {/* USER AUTHENTICATION AREA */}
                       <div className="flex items-center space-x-4 relative">
                            {user ? (
                                <div className="relative">
                                    <button
                                        ref={userButtonRef}
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="w-20 h-15 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden border-2 border-white/50 hover:border-white transition-all shadow-md hover:shadow-lg cursor-pointer"
                                    >
                                        {user.avatar_url ? (
                                            <img 
                                                src={getAvatarUrl(user.avatar_url)}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement!.textContent = user.username.charAt(0).toUpperCase();
                                                }}
                                            />
                                        ) : (
                                            user.username.charAt(0).toUpperCase()
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showUserMenu && (
                                        <div
                                            ref={userMenuRef}
                                            className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-lg shadow-xl border border-white/50 py-1 z-50"
                                        >
                                             <button
                                                onClick={() => {
                                                    setCurrentView('profile');
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>Profile</span>
                                            </button>
                                            <hr className="my-1 border-gray-200" />
                                            <button
                                                onClick={() => {
                                                    setCurrentView('settings');
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>Settings</span>
                                            </button>
                                            <hr className="my-1 border-gray-200" />
                                            <button
                                                onClick={() => {
                                                    onLogout();
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
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
                            <ChatMiniWindow user={user}
                                navigateToUserProfile={navigateToUserProfile}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-900 p-4">
                                <p className="text-center mb-2">Login to join the chat</p>
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