import React, { useState } from 'react';

interface AuthRegisterProps {
    onSwitchToLogin: () => void;
    isInPanel?: boolean;  // ← NEW: Add panel mode support
}

// For Docker containers, use the backend container name
// For development outside Docker, use localhost
const getApiUrl = () => {
    // Check if we're in a Docker environment
    if (typeof window !== 'undefined') {
        // Browser environment - check if we can reach backend container
        return 'http://backend:3000';
    }
    return 'http://localhost:3000';
};

const API_URL = getApiUrl();

export const AuthRegister: React.FC<AuthRegisterProps> = ({ 
    onSwitchToLogin, 
    isInPanel = false  // ← NEW: Default to false for backward compatibility
}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');  // ← Added email field
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting registration with:', { username, email });
            console.log('API URL:', `${API_URL}/api/auth/register`);
            
            // Try backend container first, fallback to localhost
            let response;
            try {
                response = await fetch(`/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, email }),
                });
            } catch (backendError) {
                console.log('Backend container not reachable, trying localhost...');
                response = await fetch(`/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, email }),
                });
            }

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                setSuccess('Registration successful! You can now login.');
                setUsername('');
                setPassword('');
                setEmail('');
                
                // If in panel mode, auto-switch to login after success
                if (isInPanel) {
                    setTimeout(() => onSwitchToLogin(), 1500);
                }
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
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
                {success ? (
                    <div className="text-center">
                        <div className="text-green-600 font-semibold mb-2">Registration successful!</div>
                        <p className="text-sm text-gray-600">Switching to login...</p>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                minLength={3}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password (min 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                minLength={6}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Creating account...' : 'Register'}
                            </button>
                        </form>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="text-blue-500 hover:text-blue-600 hover:underline"
                            >
                                Login here
                            </button>
                        </p>
                    </>
                )}
            </div>
        );
    }

    // ========================================
    // EXISTING: FULL-SCREEN MODE RENDERING
    // ========================================
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                            minLength={3}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={onSwitchToLogin}
                        className="text-blue-500 hover:text-blue-600"
                    >
                        Already have an account? Login here
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthRegister;