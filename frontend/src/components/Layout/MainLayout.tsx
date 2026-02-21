import React, { useState, useEffect, useRef } from 'react';
import ChatMiniWindow from '../chat/ChatMiniWindow';
import { User, getAvatarUrl } from '../util/profileUtils';

interface MainLayoutProps {
    user: User | null;
    currentView: string;
    setCurrentView: (view: string) => void;
    onLogout: () => void;
    navigateToUserProfile?: (username: string) => void;
    children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    user,
    currentView,
    setCurrentView,
    onLogout,
    navigateToUserProfile,
    children
}) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userButtonRef = useRef<HTMLButtonElement>(null);

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
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('keydown', handleEscapeKey);
            return () => {
                document.removeEventListener('keydown', handleEscapeKey);
            };
        }
    }, [showUserMenu]);

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

                        {/* USER MENU (avatar + dropdown) */}
                        <div className="flex items-center space-x-4 relative">
                            {user && (
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
                                            className="absolute right-0 mt-2 w-52 bg-slate-800 rounded-lg shadow-xl border border-slate-600/70 z-50 overflow-hidden"
                                        >
                                            <div className="px-4 pt-3 pb-2 border-b border-slate-600/70">
                                                <p className="text-slate-200 font-medium">Sup, {user.username}!</p>
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
                                                        ? 'text-slate-500 cursor-not-allowed'
                                                        : 'text-slate-200 hover:bg-slate-700 cursor-pointer'
                                                }`}
                                            >
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>Profile</span>
                                            </button>
                                            <hr className="my-1 border-slate-600/50" />
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
                                                        ? 'text-slate-500 cursor-not-allowed'
                                                        : 'text-slate-200 hover:bg-slate-700 cursor-pointer'
                                                }`}
                                            >
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>Settings</span>
                                            </button>
                                            <hr className="my-1 border-slate-600/50" />
                                            <button
                                                onClick={() => {
                                                    onLogout();
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-brand-red hover:bg-slate-700 transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Logout</span>
                                            </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

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
                        <h3 className="font-semibold text-white">Chat Lobby</h3>
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
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;