// import React from 'react'
// import { Link } from "react-router-dom";


// const navLinkClass =
//   "transition-all delay-100 ease-in hover:text-blue-500 font-montserrat font-medium text-base text-white";


// const Navbar: React.FC = () => {
// 	return (
// 	  <header className="w-full bg-[#00487c] p-5">
// 		<nav className="w-full">
// 		  <ul className="flex justify-evenly w-full">
// 			<li><Link to="/" className={navLinkClass}>Home</Link></li>
// 			<li><Link to="/game"className={navLinkClass}>Game</Link></li>
// 			<li><Link to="/leaderboard" className={navLinkClass}>Leaderboard</Link></li>
// 			<li><Link to="/register" className={navLinkClass}>Register</Link></li>
// 			{/* <li><Link to="/chat" className={navLinkClass}>Chat</Link></li> */}
// 			<a href="/chat" className="nav-link">Chat</a>
// 		  </ul>	
// 		</nav>
// 	</header>
// 	);
// };

// export default Navbar;

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
