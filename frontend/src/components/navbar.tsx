import React from 'react'
import { Link } from "react-router-dom";


const navLinkClass =
  "transition-all delay-100 ease-in hover:text-blue-500 font-montserrat font-medium text-base text-white";


const Navbar: React.FC = () => {
	return (
	  <header className="w-full bg-[#00487c] p-5">
		<nav className="w-full">
		  <ul className="flex justify-evenly w-full">
			<li><Link to="/" className={navLinkClass}>Home</Link></li>
			<li><Link to="/game"className={navLinkClass}>Game</Link></li>
			<li><Link to="/leaderboard" className={navLinkClass}>Leaderboard</Link></li>
			<li><Link to="/register" className={navLinkClass}>Register</Link></li>
		  </ul>	
		</nav>
	</header>
	);
};

export default Navbar;


