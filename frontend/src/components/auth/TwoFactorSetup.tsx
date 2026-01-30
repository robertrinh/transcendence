import { useState } from 'react';

function TwoFactorSetup() {
	const [qrCode, setQrCode] = useState<string | null>(null); //* null before, string qr code after
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(''); //* empty string
	const [message, setMessage] = useState('');

	const setupTwoFactor = async () => {
		setLoading(true);
		setError('');

		try {
			const token = localStorage.getItem('token');
			if (!token) {
				setError('You must be logged in to setup 2FA!');
				setLoading(false);
				return ;
			}

			const response = await fetch('/api/auth/2fa/setup', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});
			const data = await response.json();
			if (response.ok && data.success) {
				setQrCode(data.qrCode); //* qrCode is now a string, stored in state
				//setMessage(data.message); //! add this in later, delete current message
				setMessage("Setup c'est fini! move it around later Joao :D");
			} else {
				setError(data.error || 'Failed to setup 2FA');
			}
		} catch (error) {
			setError('An error occurred while setting up 2FA');
		}
		setLoading(false);
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow border border-gray-200">
		<h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
		
		<button 
			onClick={setupTwoFactor}
			disabled={loading}
			className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:bg-gray-400"
		>
			{loading ? 'Loading...' : 'Setup 2FA'}
		</button>
		
		{error && (
			<p className="text-red-500 mt-4">{error}</p>
		)}
		
		{message && (
			<p className="text-green-600 mt-4">{message}</p>
		)}
		
		{/* if qr code exists, display it */}
		{qrCode && (
			<div className="mt-4">
				<img src={qrCode} alt="2FA QR Code" className="mx-auto" />
			</div>
		)}
	</div>
	);
}

export default TwoFactorSetup;