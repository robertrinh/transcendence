import React, { useState } from 'react';
import PrivacyPolicy from '../../views/privacy';

interface AuthRegisterProps {
    onSwitchToLogin: () => void;
    isInPanel?: boolean;
}

export const AuthRegister: React.FC<AuthRegisterProps> = ({ 
    onSwitchToLogin, 
    isInPanel = false 
}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email }),
            });
            const data = await response.json();

            if (response.ok) {
                setSuccess('Registration successful! You can now login.');
                setUsername('');
                setPassword('');
                setEmail('');
                
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
                    <div className="text-center py-4">
                        <div className="text-green-400 font-semibold mb-2">Registration successful!</div>
                        <p className="text-sm text-white/60">Switching to login...</p>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-sm font-medium mb-1.5">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-acidGreen focus:border-brand-acidGreen transition-all"
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm font-medium mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-acidGreen focus:border-brand-acidGreen transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm font-medium mb-1.5">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Min 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-acidGreen focus:border-brand-acidGreen transition-all"
                                    required
                                    minLength={8}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-acidGreen text-black p-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-medium shadow-lg shadow-brand-acidGreen/25"
                            >
                                {loading ? 'Creating account...' : 'Register'}
                            </button>
                        </form>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <p className="text-center text-sm text-white/60">
                            Already have an account?{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="text-brand-acidGreen hover:opacity-90 hover:underline transition-colors"
                            >
                                Login here
                            </button>
                        </p>

                        <p className="text-center text-xs text-white/40 mt-2">
                            By registering, you agree to our{' '}
                            <button
                                type="button"
                                onClick={() => setShowPrivacyModal(true)}
                                className="text-brand-acidGreen hover:opacity-90 hover:underline transition-colors"
                            >
                                Privacy Policy
                            </button>
                        </p>
                    </>
                )}

                {showPrivacyModal && (
                    <PrivacyPolicy 
                        isModal={true} 
                        onClose={() => setShowPrivacyModal(false)} 
                    />
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
                    <div className="bg-brand-acidGreen/10 border border-brand-acidGreen/40 text-brand-acidGreen px-4 py-3 rounded mb-4">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-acidGreen focus:border-brand-acidGreen"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-acidGreen focus:border-brand-acidGreen"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-acidGreen focus:border-brand-acidGreen"
                            required
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-acidGreen text-black py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 font-medium"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={onSwitchToLogin}
                        className="text-brand-acidGreen hover:opacity-90 hover:underline font-medium"
                    >
                        Already have an account? Login here
                    </button>
                </div>

                <p className="mt-4 text-center text-sm text-gray-500">
                    By registering, you agree to our{' '}
                    <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-brand-acidGreen hover:opacity-90 hover:underline"
                    >
                        Privacy Policy
                    </button>
                </p>
            </div>

            {showPrivacyModal && (
                <PrivacyPolicy 
                    isModal={true} 
                    onClose={() => setShowPrivacyModal(false)} 
                />
            )}
        </div>
    );
};

export default AuthRegister;