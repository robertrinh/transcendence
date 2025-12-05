// import React from 'react'
// import { Chat } from './components/chat/chat';
// import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// import Home  from './views/home'
// import Register from './views/register'
// import Leaderboard  from './views/leaderboard'
// import Game  from './views/game'
// import NotFound from "./views/notfound";

// import Navbar from './components/navbar'	


// // Layout component that includes the Navbar and an Outlet for nested routes
// function Layout() {
// 	return (
// 		<div>
// 			<Navbar />
// 			<main>
// 				<Outlet />
// 			</main>
// 		</div>
// 	)
// }

// // Define the routes for the application
// const router = createBrowserRouter([
// 	{ path: '/', element: <Layout />, 
// 	children: [
// 		{ path: '/', element: <Home /> },
// 		{ path: '/register', element: <Register />, },
// 		{ path: '/leaderboard', element: <Leaderboard />,},
// 		{ path: '/game', element: <Game /> },
// 		{ path: '/chat', element: <Chat />},
// 		{ path: "*", element: <NotFound />}
// 	]},
// ])

// export default function App() {
//   return (
// 	<RouterProvider router={router} />
//   )
// }

// import React, { useState, useEffect } from 'react';
// import AuthRegister from './components/auth/AuthRegister';
// import Login from './components/auth/Login';
// import ChatWindow from './components/chatwindow/chatwindow';

// interface User {
//     id: string;
//     username: string;
//     email?: string;
// }

// export function App() {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [showLogin, setShowLogin] = useState(true);
//     const [user, setUser] = useState<User | null>(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         checkSession();
//     }, []);

//     const checkSession = async () => {
//         try {
//             const sessionId = localStorage.getItem('sessionId');
//             if (!sessionId) {
//                 setLoading(false);
//                 return;
//             }

//             const response = await fetch(`http://localhost:3000/api/auth/validate?sessionId=${sessionId}`);
//             if (response.ok) {
//                 const data = await response.json();
//                 setUser(data.user);
//                 setIsAuthenticated(true);
//             } else {
//                 localStorage.removeItem('sessionId');
//             }
//         } catch (error) {
//             console.error('Session check failed:', error);
//             localStorage.removeItem('sessionId');
//         }
//         setLoading(false);
//     };

//     const handleLogin = (userData: User, sessionId: string) => {
//         localStorage.setItem('sessionId', sessionId);
//         setUser(userData);
//         setIsAuthenticated(true);
//     };

//     const handleLogout = async () => {
//         try {
//             const sessionId = localStorage.getItem('sessionId');
//             if (sessionId) {
//                 await fetch('http://localhost:3000/api/auth/logout', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ sessionId }),
//                 });
//             }
//         } catch (error) {
//             console.error('Logout failed:', error);
//         }
        
//         localStorage.removeItem('sessionId');
//         setUser(null);
//         setIsAuthenticated(false);
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//                 <div className="text-xl">Loading...</div>
//             </div>
//         );
//     }

//     if (!isAuthenticated) {
//         return showLogin ? (
//             <Login 
//                 onLoginSuccess={handleLogin}
//                 onSwitchToRegister={() => setShowLogin(false)}
//             />
//         ) : (
//             <AuthRegister onSwitchToLogin={() => setShowLogin(true)} />
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-100">
//             <nav className="bg-blue-600 text-white p-4">
//                 <div className="flex justify-between items-center">
//                     <h1 className="text-xl font-bold">ft_transcendence</h1>
//                     <div className="flex items-center space-x-4">
//                         <span>Welcome, {user?.username}!</span>
//                         <button
//                             onClick={handleLogout}
//                             className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
//                         >
//                             Logout
//                         </button>
//                     </div>
//                 </div>
//             </nav>
            
//             <div className="container mx-auto p-4">
//                 <ChatWindow user={user} />
//             </div>
//         </div>
//     );
// }

// import React, { useState, useEffect } from 'react';
// import AuthRegister from './components/auth/AuthRegister';
// import Login from './components/auth/Login';
// import { Navbar } from './components/navbar';

// // Import your views
// import Home from './views/home';
// import Game from './views/game';
// import Leaderboard from './views/leaderboard';
// import Register from './views/register';
// import NotFound from './views/notfound';
// import ChatWindow from './components/chatwindow/chatwindow';

// // =============================================================================
// // USER INTERFACE - Current User Data Structure
// // =============================================================================
// // This interface defines the structure of user data throughout the app
// // NOTE FOR 2FA IMPLEMENTER: You may need to add fields like:
// // - twoFactorEnabled?: boolean
// // - requiresTwoFactor?: boolean (for login flow)
// interface User {
//     id: string;
//     username: string;
//     email?: string;
//     // TODO: Add 2FA fields when implementing
//     // twoFactorEnabled?: boolean;
// }

// // =============================================================================
// // MAIN APPLICATION COMPONENT
// // =============================================================================
// // This is the root component that handles:
// // 1. Authentication state management
// // 2. Session persistence
// // 3. View routing (without React Router)
// // 4. Login/logout flow
// export function App() {
//     // =============================================================================
//     // STATE MANAGEMENT
//     // =============================================================================
    
//     // Controls whether user is logged in or not
//     // This is the main gate for accessing the application
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
    
//     // Controls which auth screen to show (login vs register)
//     // true = show login, false = show register
//     const [showLogin, setShowLogin] = useState(true);
    
//     // Stores current user data after successful authentication
//     // null = no user logged in, User object = logged in user
//     const [user, setUser] = useState<User | null>(null);
    
//     // Simple routing system - tracks which view to render
//     // Possible values: 'home', 'game', 'chat', 'leaderboard', 'register'
//     // NOTE: This is a custom routing system, not React Router
//     const [currentView, setCurrentView] = useState('home');
    
//     // Loading state for initial session check
//     // Prevents flash of login screen while checking existing session
//     const [loading, setLoading] = useState(true);

//     // =============================================================================
//     // SESSION MANAGEMENT
//     // =============================================================================
    
//     // Check for existing session on app startup
//     // This runs once when the component mounts
//     useEffect(() => {
//         checkSession();
//     }, []);

//     /**
//      * SESSION VALIDATION FUNCTION
//      * 
//      * This function:
//      * 1. Checks localStorage for existing sessionId
//      * 2. Validates session with backend
//      * 3. Restores user state if session is valid
//      * 4. Cleans up invalid sessions
//      * 
//      * NOTE FOR 2FA IMPLEMENTER:
//      * You may need to modify this to handle 2FA session states
//      * - Check if session has completed 2FA
//      * - Handle partial authentication states
//      */
//     const checkSession = async () => {
//         try {
//             // Get stored session ID from browser localStorage
//             const sessionId = localStorage.getItem('sessionId');
//             if (!sessionId) {
//                 // No session found - user needs to login
//                 setLoading(false);
//                 return;
//             }

//             // Validate session with backend API
//             // Backend checks if session exists and hasn't expired
//             const response = await fetch(`http://localhost:3000/api/auth/validate?sessionId=${sessionId}`);
//             if (response.ok) {
//                 // Session is valid - restore user state
//                 const data = await response.json();
//                 setUser(data.user);
//                 setIsAuthenticated(true);
                
//                 // TODO FOR 2FA: Handle 2FA session state
//                 // if (data.user.twoFactorEnabled && !data.session.twoFactorVerified) {
//                 //     // Session exists but 2FA not completed
//                 //     // Redirect to 2FA verification
//                 // }
//             } else {
//                 // Session invalid/expired - clean up
//                 localStorage.removeItem('sessionId');
//             }
//         } catch (error) {
//             console.error('Session check failed:', error);
//             // Network error or other issue - clean up and require login
//             localStorage.removeItem('sessionId');
//         }
//         setLoading(false);
//     };

//     // =============================================================================
//     // AUTHENTICATION HANDLERS
//     // =============================================================================

//     /**
//      * LOGIN SUCCESS HANDLER
//      * 
//      * Called when user successfully logs in
//      * Receives user data and session ID from Login component
//      * 
//      * NOTE FOR 2FA IMPLEMENTER:
//      * You may need to modify this to handle:
//      * - Partial authentication (password verified, 2FA pending)
//      * - Two-step login process
//      * 
//      * @param userData - User information from backend
//      * @param sessionId - Session token from backend
//      */
//     const handleLogin = (userData: User, sessionId: string) => {
//         // Store session ID in browser for persistence
//         localStorage.setItem('sessionId', sessionId);
        
//         // Update application state
//         setUser(userData);
//         setIsAuthenticated(true);
        
//         // TODO FOR 2FA: Handle 2FA flow
//         // if (userData.requiresTwoFactor) {
//         //     setShowTwoFactorPrompt(true);
//         //     return; // Don't set authenticated yet
//         // }
//     };

//     /**
//      * LOGOUT HANDLER
//      * 
//      * Handles complete user logout:
//      * 1. Invalidates session on backend
//      * 2. Clears local storage
//      * 3. Resets application state
//      * 4. Returns to home view
//      */
//     const handleLogout = async () => {
//         try {
//             // Tell backend to invalidate the session
//             const sessionId = localStorage.getItem('sessionId');
//             if (sessionId) {
//                 await fetch('http://localhost:3000/api/auth/logout', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ sessionId }),
//                 });
//             }
//         } catch (error) {
//             console.error('Logout failed:', error);
//             // Continue with local cleanup even if backend call fails
//         }
        
//         // Clean up local state and storage
//         localStorage.removeItem('sessionId');
//         setUser(null);
//         setIsAuthenticated(false);
//         setCurrentView('home'); // Reset to home view
//     };

//     // =============================================================================
//     // VIEW RENDERING SYSTEM
//     // =============================================================================

//     /**
//      * VIEW ROUTER FUNCTION
//      * 
//      * Simple routing system that renders different components based on currentView
//      * This replaces React Router for simplicity
//      * 
//      * NOTE: Only renders if user is authenticated
//      * All views require authentication in this implementation
//      */
//     const renderCurrentView = () => {
//         // Security check - don't render anything if not authenticated
//         if (!isAuthenticated) return null;

//         // Simple switch statement for view routing
//         switch (currentView) {
//             case 'home':
//                 return <Home />;
//             case 'game':
//                 return <Game />;
//             case 'chat':
//                 // Chat component receives current user for messaging
//                 return <ChatWindow user={user} />;
//             case 'leaderboard':
//                 return <Leaderboard />;
//             case 'register':
//                 // Note: This register view is different from auth register
//                 // This might be for tournament registration or similar
//                 return <Register />;
//             default:
//                 // Fallback for invalid routes
//                 return <NotFound />;
//         }
//     };

//     // =============================================================================
//     // RENDER LOGIC
//     // =============================================================================

//     // Show loading spinner while checking session
//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//                 <div className="text-xl">Loading...</div>
//             </div>
//         );
//     }

//     // =============================================================================
//     // AUTHENTICATION GATE
//     // =============================================================================
    
//     // If user is not authenticated, show login/register screens
//     // This prevents access to any protected content
//     if (!isAuthenticated) {
//         return showLogin ? (
//             // LOGIN COMPONENT
//             // Handles username/password authentication
//             // NOTE FOR 2FA: This is where first factor (password) is verified
//             <Login 
//                 onLoginSuccess={handleLogin}
//                 onSwitchToRegister={() => setShowLogin(false)}
//             />
//         ) : (
//             // REGISTRATION COMPONENT
//             // Handles new user account creation
//             // NOTE FOR 2FA: You may want to add 2FA setup option here
//             <AuthRegister onSwitchToLogin={() => setShowLogin(true)} />
//         );
//     }

//     // =============================================================================
//     // MAIN APPLICATION UI (AUTHENTICATED USERS ONLY)
//     // =============================================================================
    
//     // Main application layout with navigation and content
//     return (
//         <div className="min-h-screen bg-gray-100">
//             {/* 
//                 NAVIGATION BAR
//                 - Shows current user info
//                 - Handles view switching
//                 - Provides logout functionality
                
//                 Props explained:
//                 - currentView: Current active view name
//                 - setCurrentView: Function to change views
//                 - user: Current user data
//                 - onLogout: Logout handler function
//             */}
//             <Navbar 
//                 currentView={currentView}
//                 setCurrentView={setCurrentView}
//                 user={user}
//                 onLogout={handleLogout}
//             />
            
//             {/* 
//                 MAIN CONTENT AREA
//                 Renders the current view component
//                 Height calculation: 100vh - 64px (navbar height)
//             */}
//             <main className="min-h-[calc(100vh-64px)]">
//                 {renderCurrentView()}
//             </main>
//         </div>
//     );
// }

// // =============================================================================
// // IMPLEMENTATION NOTES FOR 2FA DEVELOPER
// // =============================================================================

// /*
// AREAS WHERE 2FA INTEGRATION IS NEEDED:

// 1. LOGIN FLOW MODIFICATION:
//    - Current: username/password → authenticated
//    - With 2FA: username/password → 2FA prompt → authenticated
//    - May need additional state: showTwoFactorPrompt

// 2. SESSION HANDLING:
//    - Current: session = authenticated
//    - With 2FA: session may have partial authentication state
//    - Need to check if 2FA is completed for the session

// 3. USER INTERFACE UPDATES:
//    - Add twoFactorEnabled to User interface
//    - Handle "requires 2FA" response from login
//    - Show 2FA setup options in user settings

// 4. STATE MANAGEMENT:
//    - May need additional states for 2FA flow
//    - Consider: isTwoFactorRequired, twoFactorStep, etc.

// 5. COMPONENTS NEEDED:
//    - TwoFactorSetup component
//    - TwoFactorVerify component
//    - BackupCodes component

// 6. SECURITY CONSIDERATIONS:
//    - Ensure 2FA verification is required for sensitive operations
//    - Handle backup codes for account recovery
//    - Implement proper error handling for invalid codes

// CURRENT FLOW:
// Login Component → handleLogin → setAuthenticated(true) → Main App

// PROPOSED 2FA FLOW:
// Login Component → (if 2FA enabled) → TwoFactor Component → handleLogin → setAuthenticated(true) → Main App

// BACKEND INTEGRATION POINTS:
// - /api/auth/login (modified to return 2FA requirement)
// - /api/auth/verify-2fa (new endpoint)
// - /api/auth/setup-2fa (new endpoint)
// - /api/auth/validate (modified to check 2FA session state)
// */

// import React, { useState, useEffect } from 'react';
// import AuthRegister from './components/auth/AuthRegister';
// import Login from './components/auth/Login';
// import MainLayout from './components/Layout/MainLayout';

// // Import your views
// import Home from './views/home';
// import Game from './views/game';
// import Leaderboard from './views/leaderboard';
// import Profile from './views/profile';
// import Tournaments from './views/tournaments';
// import NotFound from './views/notfound';

// interface User {
//     id: string;
//     username: string;
//     email?: string;
// }

// export function App() {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [showLogin, setShowLogin] = useState(true);
//     const [user, setUser] = useState<User | null>(null);
//     const [currentView, setCurrentView] = useState('home');
//     const [loading, setLoading] = useState(true);

//     // ... your existing authentication logic (checkSession, handleLogin, handleLogout) ...

//     const checkSession = async () => {
//         try {
//             const sessionId = localStorage.getItem('sessionId');
//             if (!sessionId) {
//                 setLoading(false);
//                 return;
//             }

//             const response = await fetch(`http://localhost:3000/api/auth/validate?sessionId=${sessionId}`);
//             if (response.ok) {
//                 const data = await response.json();
//                 setUser(data.user);
//                 setIsAuthenticated(true);
//             } else {
//                 localStorage.removeItem('sessionId');
//             }
//         } catch (error) {
//             console.error('Session check failed:', error);
//             localStorage.removeItem('sessionId');
//         }
//         setLoading(false);
//     };

//     const handleLogin = (userData: User, sessionId: string) => {
//         localStorage.setItem('sessionId', sessionId);
//         setUser(userData);
//         setIsAuthenticated(true);
//     };

//     const handleLogout = async () => {
//         try {
//             const sessionId = localStorage.getItem('sessionId');
//             if (sessionId) {
//                 await fetch('http://localhost:3000/api/auth/logout', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ sessionId }),
//                 });
//             }
//         } catch (error) {
//             console.error('Logout failed:', error);
//         }
        
//         localStorage.removeItem('sessionId');
//         setUser(null);
//         setIsAuthenticated(false);
//         setCurrentView('home');
//     };

//     useEffect(() => {
//         checkSession();
//     }, []);

//     // This function determines what shows in the main content area
//     const renderCurrentView = () => {
//         switch (currentView) {
//             case 'home':
//                 return <Home />;
//             case 'game':
//                 return <Game />;
//             case 'leaderboard':
//                 return <Leaderboard />;
//             case 'profile':
//                 return <Profile user={user} />;
//             case 'tournaments':
//                 return <Tournaments user={user} />;
//             default:
//                 return <NotFound />;
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//                 <div className="text-xl">Loading...</div>
//             </div>
//         );
//     }

//     // Show authentication screens if not logged in
//     if (!isAuthenticated) {
//         return showLogin ? (
//             <Login 
//                 onLoginSuccess={handleLogin}
//                 onSwitchToRegister={() => setShowLogin(false)}
//             />
//         ) : (
//             <AuthRegister onSwitchToLogin={() => setShowLogin(true)} />
//         );
//     }

//     // Show main application with layout
//     return (
//         <MainLayout
//             user={user}
//             currentView={currentView}
//             setCurrentView={setCurrentView}
//             onLogout={handleLogout}
//         >
//             {renderCurrentView()}
//         </MainLayout>
//     );
// }

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
    // return (
    //     <MainLayout
    //         user={user}
    //         currentView={currentView}
    //         setCurrentView={setCurrentView}
    //         onLogin={handleLogin}
    //         onLogout={handleLogout}
    //     >
    //         {renderCurrentView()}
    //     </MainLayout>
    // );
}