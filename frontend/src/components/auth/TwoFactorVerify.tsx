import { useState } from 'react';

interface User {
	id: string;
	username: string;
	email?: string;
}

interface TwoFactorVerifyProps {
	user: User;
	token: string;
	onVerifySuccess: () => void;
	onCancel: () => void;
}

function TwoFactorVerify({ user, token, onVerifySuccess, onCancel }: TwoFactorVerifyProps) {
	const [code, setCode] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		//TODO add 2fa verification logic
		//! delete later: accept "000000" dummy code
		if (code === '000000') {
			onVerifySuccess();
		} else {
			setError('Invalid code, try 000000 (lol this is a test :D)');
		}

		setLoading(false);
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl w-96">
				<h2 className="text-2xl font-bold text-center mb-2">
					Two-Factor Authentication
				</h2>

				<p className="text-gray-600 text-center mb-6">
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
						className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						autoFocus
					/>

					<button
						type="submit"
						disabled={loading || code.length !== 6}
						className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{loading ? 'Verifying...' : 'Verify Code'}
					</button>
				</form>

				{error && (
					<div className="mt-4 text-red-500 text-sm text-center">
						{error}
					</div>
				)}

				<div className="mt-6 text-center">
					<button
						onClick={onCancel}
						className="text-gray-500 hover:text-gray-700 text-sm hover:underline"
					>
						← Back to login
					</button>
				</div>

				{/* Testing Hint */}
				<div className="mt-4 pt-4 border-t border-gray-200">
					<p className="text-xs text-gray-400 text-center">
						Testing: Use code <code className="bg-gray-100 px-1 rounded">000000</code>
					</p>
				</div>
			</div>
		</div>
	);
}

export default TwoFactorVerify;