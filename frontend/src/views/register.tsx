import React, { useState } from 'react';

interface RegisterProps {
    onSwitchToLogin?: () => void;
    isInPanel?: boolean;  // ← ADD THIS NEW PROP
}

const AuthRegister: React.FC<RegisterProps> = ({ 
    onSwitchToLogin,
    isInPanel = false  // ← ADD THIS WITH DEFAULT VALUE
}) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                // Automatically switch to login after successful registration
                if (onSwitchToLogin) {
                    setTimeout(() => onSwitchToLogin(), 1500);
                }
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // NEW: PANEL MODE RENDERING
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
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
                            >
                                {loading ? 'Creating account...' : 'Register'}
                            </button>
                        </form>

                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        {onSwitchToLogin && (
                            <p className="text-center text-sm">
                                Already have an account?{' '}
                                <button
                                    onClick={onSwitchToLogin}
                                    className="text-blue-500 hover:underline"
                                >
                                    Login here
                                </button>
                            </p>
                        )}
                    </>
                )}
            </div>
        );
    }

    // ========================================
    // EXISTING: FULL-SCREEN MODE RENDERING
    // ========================================
    // Keep your existing full-screen register design here
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            {/* Your existing full-screen register form */}
        </div>
    );
};

export default AuthRegister;