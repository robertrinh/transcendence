import React, { useState } from 'react';
import TwoFactorVerify from './TwoFactorVerify';
import { User } from '../util/profileUtils';

interface LoginProps {
	onLoginSuccess: (userData: User, token: string) => void;
	onSwitchToRegister?: () => void;
	isInPanel?: boolean;
}

const Login: React.FC<LoginProps> = ({
	onLoginSuccess,
	onSwitchToRegister,
	isInPanel = false
}) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [guestLoading, setGuestLoading] = useState(false);

	const [showTwoFactor, setShowTwoFactor] = useState(false);
	const [pendingUser, setPendingUser] = useState<User | null>(null);
	const [pendingToken, setPendingToken] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await fetch(`/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});
			const data = await response.json();

			if (response.ok) {
				if (data.requires2FA) {
					setPendingUser(data.user);
					setPendingToken(data.token);
					setShowTwoFactor(true);
				} else {
					onLoginSuccess(data.user, data.token);
					setUsername('');
					setPassword('');
				}
			} else {
				setError(data.error || 'Login failed');
			}
		} catch (err) {
			console.error('Login error:', err);
			setError('Network error. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleTwoFactorSuccess = (token: string, user: User) => {
		onLoginSuccess(user, token);

		//* Reset state
		setShowTwoFactor(false);
		setPendingUser(null);
		setPendingToken(null);
		setUsername('');
		setPassword('');
	};

	const handleTwoFactorCancel = () => {
		setShowTwoFactor(false);
		setPendingUser(null);
		setPendingToken(null);
		setUsername('');
		setPassword('');
	};

	const handleContinueAsGuest = async () => {
		setGuestLoading(true);
		setError('');
		const guestUsername = `guest_${Math.random().toString(36).slice(2, 8)}`;
		try {
			const response = await fetch(`/api/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: guestUsername, isGuest: true }),
			});
			const data = await response.json();
			if (response.ok) {
				onLoginSuccess(data.user, data.token);
			} else {
				setError(data.error || 'Guest sign-in failed');
			}
		} catch (err) {
			console.error('Guest sign-in error:', err);
			setError('Network error. Please try again.');
		} finally {
			setGuestLoading(false);
		}
	};

	// ========================================
	// NEW: PANEL MODE RENDERING (Compact)
	// ========================================
	if (isInPanel) {
		return (
			<>
				{showTwoFactor && pendingUser && pendingToken && (
					<TwoFactorVerify
						user={pendingUser}
						token={pendingToken}
						onVerifySuccess={handleTwoFactorSuccess}
						onCancel={handleTwoFactorCancel}
					/>
				)}
				<div className="space-y-4">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-white/70 text-sm font-medium mb-1.5">
								Username
							</label>
							<input
								type="text"
								placeholder="Enter your username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-mint focus:border-brand-mint transition-all"
								required
							/>
						</div>
						<div>
							<label className="block text-white/70 text-sm font-medium mb-1.5">
								Password
							</label>
							<input
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-mint focus:border-brand-mint transition-all"
								required
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-brand-mint text-black p-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-medium shadow-lg shadow-brand-mint/25"
						>
							{loading ? 'Logging in...' : 'Login'}
						</button>
					</form>

					{error && (
						<div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
							{error}
						</div>
					)}

					{onSwitchToRegister && (
						<p className="text-center text-sm text-white/60">
							Don't have an account?{' '}
							<button
								onClick={onSwitchToRegister}
								className="text-brand-mint hover:opacity-90 hover:underline transition-colors"
							>
								Register here
							</button>
						</p>
					)}
					
					<div className="border-t border-white/10 pt-4 mt-4">
						<button
							type="button"
							onClick={handleContinueAsGuest}
							disabled={guestLoading}
							className="w-full bg-slate-600 hover:bg-slate-500 text-white p-3 rounded-lg disabled:opacity-50 transition-all font-medium text-sm border border-slate-500/50"
						>
							{guestLoading ? 'Signing in...' : 'Continue as Guest'}
						</button>
					</div>
				</div>
			</>
		);
	}

	// ========================================
	// EXISTING: FULL-SCREEN MODE RENDERING
	// ========================================
	return (	
		<>
			{/* 2FA Popup */}
			{showTwoFactor && pendingUser && pendingToken && (
				<TwoFactorVerify
					user={pendingUser}
					token={pendingToken}
					onVerifySuccess={handleTwoFactorSuccess}
					onCancel={handleTwoFactorCancel}
				/>
			)}
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg shadow-md w-96">
					<h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-gray-700 text-sm font-bold mb-2">
								Username
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-mint focus:border-brand-mint"
								required
							/>
						</div>

						<div>
							<label className="block text-gray-700 text-sm font-bold mb-2">
								Password
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-mint focus:border-brand-mint"
								required
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-brand-mint text-black py-2 px-4 rounded-md hover:opacity-90 disabled:opacity-50 font-medium"
						>
							{loading ? 'Logging in...' : 'Login'}
						</button>
					</form>

					{onSwitchToRegister && (
						<p className="text-center mt-6">
							Don't have an account?{' '}
							<button
								onClick={onSwitchToRegister}
								className="text-brand-mint hover:opacity-90 hover:underline font-medium"
							>
								Register here
							</button>
						</p>
					)}
					<div className="mt-6 pt-6 border-t border-gray-200">
						<button
							type="button"
							onClick={handleContinueAsGuest}
							disabled={guestLoading}
							className="w-full bg-transparent border border-brand-purple/60 text-brand-purple py-2 px-4 rounded-md hover:bg-brand-purple/20 disabled:opacity-50 transition-colors font-medium"
						>
							{guestLoading ? 'Signing in...' : 'Continue as Guest'}
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;