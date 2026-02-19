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
    const [showUserMenu, setShowUserMenu] = useState(false);
    const authPanelRef = useRef<HTMLDivElement>(null);
    const authButtonRef = useRef<HTMLButtonElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userButtonRef = useRef<HTMLButtonElement>(null);

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
            <header className="bg-slate-800 border-b border-slate-600/70 h-16 flex-shrink-0 relative z-40">
                <div className="max-w-7xl mx-auto px-4 h-full relative">
                    <div className="flex items-center justify-between h-full">
                         {/* Logo/Brand */}
                        <div>
                            <button
                                onClick={() => setCurrentView('home')}
                                className={`px-5 py-2 rounded-lg border-2 font-semibold uppercase tracking-wider transition-all duration-200 ${
                                    currentView === 'home'
                                        ? 'bg-brand-mint text-black border-brand-mint shadow-[0_0_20px_rgba(0,255,204,0.4)]'
                                        : 'bg-black/20 text-brand-mint border-brand-mint/50 hover:bg-brand-mint/20 hover:border-brand-mint'
                                }`}
                            >
                                TRANSCENDENCE
                            </button>
                        </div>

                        {/* Center: GAME + LEADERBOARD */}
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
                            <button
                                onClick={() => setCurrentView('game')}
                                className={`relative px-5 py-2 rounded-lg border-2 font-semibold uppercase tracking-wider transition-all duration-200 ${
                                    currentView === 'game'
                                        ? 'bg-brand-cyan/60 text-white border-brand-cyan shadow-[0_0_16px_rgba(0,255,255,0.4)]'
                                        : 'bg-black/20 text-brand-cyan border-brand-cyan/40 hover:bg-brand-cyan/20 hover:border-brand-cyan/60'
                                }`}
                            >
                                🎮 GAME
                                {currentView === 'game' && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-brand-hotPink" />
                                )}
                            </button>
                            <button
                                onClick={() => setCurrentView('leaderboard')}
                                className={`relative px-5 py-2 rounded-lg border-2 font-semibold uppercase tracking-wider transition-all duration-200 ${
                                    currentView === 'leaderboard'
                                        ? 'bg-brand-acidGreen/60 text-white border-brand-acidGreen shadow-[0_0_16px_rgba(0,255,128,0.4)]'
                                        : 'bg-black/20 text-brand-acidGreen border-brand-acidGreen/40 hover:bg-brand-acidGreen/20 hover:border-brand-acidGreen/60'
                                }`}
                            >
                                🏆 LEADERBOARD
                                {currentView === 'leaderboard' && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-brand-hotPink" />
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
                                            className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-lg rounded-lg shadow-xl border border-white/50 z-50 overflow-hidden"
                                        >
                                            <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                                                <p className="text-gray-800 font-medium">Sup, {user.username}!</p>
                                            </div>
                                            <div className="py-1">
                                             <button
                                                onClick={() => {
                                                    if (user?.is_guest) 
														return;
                                                    setCurrentView('profile');
                                                    setShowUserMenu(false);
                                                }}
                                                title={user?.is_guest ? 'Register to access Profile' : undefined}
                                                className={`w-full text-left px-4 py-2 transition-colors flex items-center space-x-2 ${
                                                    user?.is_guest
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-gray-700 hover:bg-blue-50 cursor-pointer'
                                                }`}
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
                                                    if (user?.is_guest) 
														return;
                                                    setCurrentView('settings');
                                                    setShowUserMenu(false);
                                                }}
                                                title={user?.is_guest ? 'Register to access Settings' : undefined}
                                                className={`w-full text-left px-4 py-2 transition-colors flex items-center space-x-2 ${
                                                    user?.is_guest
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-gray-700 hover:bg-blue-50 cursor-pointer'
                                                }`}
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
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    ref={authButtonRef}
                                    onClick={() => setShowAuthPanel(!showAuthPanel)}
                                    className="px-5 py-2 rounded-lg border-2 border-brand-cyan bg-brand-cyan/80 text-white font-semibold uppercase tracking-wider hover:bg-brand-cyan transition-all duration-200"
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
                <div className="flex-1 p-4 border-r border-white/10 overflow-hidden">
                    <div className="bg-slate-900/30 backdrop-blur-sm rounded-lg border border-white/10 h-full overflow-hidden">
                        <div className="h-full overflow-y-auto">
                            {children}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - Chat */}
                <div className="w-80 bg-slate-800 border-l border-slate-600/70 flex flex-col overflow-hidden">
                    {/* Chat Header - Fixed */}
                    <div className="p-4 border-b border-slate-600/70 bg-slate-800 flex-shrink-0">
                        <h3 className="font-semibold text-white">Chat</h3>
                    </div>
                    
                    {/* Chat Content - Flexible */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {user ? (
                            <ChatMiniWindow user={user}
                                navigateToUserProfile={navigateToUserProfile}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-white/70 p-4">
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