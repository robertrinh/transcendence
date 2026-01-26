import React, { useState } from 'react';

interface User {
    id: string;
    username: string;
    email?: string;
}

interface LoginProps {
    onLoginSuccess: (userData: User, token: string) => void;
    onSwitchToRegister?: () => void;
    isInPanel?: boolean;  // ← NEW: Add panel mode support
}

// Same API URL logic as register
const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        return 'http://backend:3000';
    }
    return 'http://localhost:3000';
};

const API_URL = getApiUrl();

const Login: React.FC<LoginProps> = ({ 
    onLoginSuccess, 
    onSwitchToRegister,
    isInPanel = false  // ← NEW: Default to false for backward compatibility
}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting login with:', { username });
            console.log('API URL:', `${API_URL}/api/auth/login`);

            // Try backend container first, fallback to localhost
            let response;
            try {
                response = await fetch(`/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });
            } catch (backendError) {
                console.log('Backend container not reachable, trying localhost...');
                response = await fetch(`/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });
            }

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                onLoginSuccess(data.user, data.token);
                // Clear form
                setUsername('');
                setPassword('');
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

    // ========================================
    // NEW: PANEL MODE RENDERING (Compact)
    // ========================================
    if (isInPanel) {
        return (
            <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                        {error}
                    </div>
                )}

                {onSwitchToRegister && (
                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                            onClick={onSwitchToRegister}
                            className="text-blue-500 hover:text-blue-600 hover:underline"
                        >
                            Register here
                        </button>
                    </p>
                )}
					<div className="border-t border-gray-200 pt-3 mt-3">
						<button
							type="button"
							disabled
							className="w-full bg-gray-200 text-gray-500 p-2 rounded cursor-not-allowed text-sm"
						>
							Continue as Guest
						</button>
						<p className="text-xs text-gray-400 text-center mt-1">
							Coming soon
						</p>
					</div>

                {/* Quick login hint for development */}
                <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-500 text-center">
                        Default admin: <code className="bg-gray-100 px-1 rounded">admin</code> / <code className="bg-gray-100 px-1 rounded">admin123</code>
                    </p>
                </div>
            </div>
        );
    }

    // ========================================
    // EXISTING: FULL-SCREEN MODE RENDERING
    // ========================================
    return (
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {onSwitchToRegister && (
                    <p className="text-center mt-6">
                        Don't have an account?{' '}
                        <button
                            onClick={onSwitchToRegister}
                            className="text-blue-500 hover:underline"
                        >
                            Register here
                        </button>
                    </p>
                )}
					<div className="mt-6 pt-6 border-t border-gray-200">
						<button
							type="button"
							disabled
							className="w-full bg-gray-200 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed"
						>
							Continue as Guest
						</button>
						<p className="text-xs text-gray-400 text-center mt-2">
							Guest mode coming soon!
						</p>
					</div>

                {/* Quick login hint for development */}
                <div className="mt-4 p-3 bg-gray-50 rounded text-center">
                    <p className="text-xs text-gray-600">
                        Default admin: <strong>admin</strong> / <strong>admin123</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;