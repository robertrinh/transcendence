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

import React, { useState, useEffect } from 'react';
import AuthRegister from './components/auth/AuthRegister';
import Login from './components/auth/Login';
import ChatWindow from './components/chatwindow/chatwindow';

interface User {
    id: string;
    username: string;
    email?: string;
}

export function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLogin, setShowLogin] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

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
                setIsAuthenticated(true);
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
        setIsAuthenticated(true);
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
        setIsAuthenticated(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

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

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-blue-600 text-white p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold">ft_transcendence</h1>
                    <div className="flex items-center space-x-4">
                        <span>Welcome, {user?.username}!</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
            
            <div className="container mx-auto p-4">
                <ChatWindow user={user} />
            </div>
        </div>
    );
}