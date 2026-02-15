import { useState } from 'react';
import { User } from '../util/profileUtils';

interface TwoFactorVerifyProps {
	user: User;
	token: string;
	onVerifySuccess: () => void;
	onCancel: () => void;
}

//TODO change _user and _token to user and token after implementing 2fa verification logic
function TwoFactorVerify({ token, onVerifySuccess, onCancel }: TwoFactorVerifyProps) {
	const [code, setCode] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		
		try {
            const response = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onVerifySuccess();
            } else {
                setError(data.error || 'Invalid verification code');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('2FA verification error:', err);
        } finally {
            setLoading(false);
        }

    };

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-black/95 border border-white/10 rounded-2xl shadow-2xl w-96 p-8">
				<h2 className="text-2xl font-bold text-white text-center mb-2">
					Two-Factor Authentication
				</h2>

				<p className="text-white/70 text-center mb-6">
					Enter the 6-digit code from your authenticator app!
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<input
						type="text"
						value={code}
						onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
						placeholder="012345"
						maxLength={6}
						inputMode="numeric"
						className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
						autoFocus
					/>

					<button
						type="submit"
						//! add back in later: disabled={loading || code.length !== 6}
						disabled={loading || code.length !== 6}
						className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-lg hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-blue-500/25"
					>
						{loading ? 'Verifying...' : 'Verify Code'}
					</button>
				</form>

				{error && (
					<div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm text-center">
						{error}
					</div>
				)}

				<div className="mt-6 text-center">
					<button
						onClick={onCancel}
						className="text-blue-400 hover:text-blue-300 text-sm hover:underline transition-colors"
					>
						← Back to login
					</button>
				</div>

				{/* Testing Hint */}
				{/* <div className="mt-4 pt-4 border-t border-gray-200">
					<p className="text-xs text-gray-400 text-center">
						DEV MODE: Click button to skip 2FA (disabled code input for now)
					</p>
				</div> */}
			</div>
		</div>
	);
}

export default TwoFactorVerify;