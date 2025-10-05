import React from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

import Home  from './views/home'
import Register from './views/register'
import Leaderboard  from './views/leaderboard'
import Game  from './views/game'
import NotFound from "./views/notfound";

import Navbar from './components/navbar'	


// Layout component that includes the Navbar and an Outlet for nested routes
function Layout() {
	return (
		<div>
			<Navbar />
			<main>
				<Outlet />
			</main>
		</div>
	)
}

// Define the routes for the application
const router = createBrowserRouter([
	{ path: '/', element: <Layout />, 
	children: [
		{ path: '/', element: <Home /> },
		{ path: '/register', element: <Register />, },
		{ path: '/leaderboard', element: <Leaderboard />,},
		{ path: '/game', element: <Game /> },
		{ path: "*", element: <NotFound />}
	]},
])

export default function App() {
  return (
	<RouterProvider router={router} />
  )
}
