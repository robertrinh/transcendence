import React from 'react';
import ShowcasePanel from './ShowcasePanel';

interface User {
	id: string;
	username: string;
	email?: string;
}

interface AuthLayoutProps {
	children: React.ReactNode;
	onLoginSuccess: (userData: User, token: string) => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
	return (
		<div className="min-h-screen flex bg-white">
			{/* LEFT SIDE - Form */}
			<div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16">
				<div className="max-w-md mx-auto w-full">
					{/* Logo */}
					<div className="mb-8 text-center">
						<h1 className="text-3xl font-bold text-gray-900">Transcendence</h1>
						<p className="text-gray-500 mt-2">An ode to the pioneer of games.</p>
					</div>
					
					{/* Form content (Login or Register) */}
					{children}
				</div>
			</div>

			{/* RIGHT SIDE - Showcase (hidden on mobile) - Rounded floating panel */}
			<div className="hidden lg:flex lg:w-1/2 h-screen items-center justify-center p-6">
				<div 
					className="w-full h-[90%] bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 relative overflow-hidden"
					style={{ 
						borderRadius: '40px',
					}}
				>
					<ShowcasePanel />
				</div>
			</div>
		</div>
	);
};

export default AuthLayout;
