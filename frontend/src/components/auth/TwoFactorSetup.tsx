import { useState } from 'react';

function TwoFactorSetup() {
	const [qrCode, setQrCode] = useState<string | null>(null); //* null before, string qr code after
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(''); //* empty string
	const [message, setMessage] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

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
				setMessage(data.message); //! add this in later, delete current message
				// setMessage("Setup c'est fini! move it around later Joao :D");
			} else {
				setError(data.error || 'Failed to setup 2FA');
			}
		} catch (error) {
			setError('An error occurred while setting up 2FA');
		}
		setLoading(false);
	};

    const verifyAndEnable2FA = async () => {
        if (verificationCode.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/2fa/enable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: verificationCode })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage('✅ 2FA successfully enabled!');
                setQrCode(null); // Hide QR code
                setVerificationCode('');
            } else {
                setError(data.error || 'Invalid code. Please try again.');
            }
        } catch (err) {
            setError('Failed to verify code');
            console.error('2FA verification error:', err);
        } finally {
            setLoading(false);
        }
    };

	return (
        <div className="space-y-4">
            {!qrCode ? (
                <button 
                    onClick={setupTwoFactor}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                >
                    {loading ? 'Generating QR Code...' : 'Generate QR Code'}
                </button>
            ) : (
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 mb-3">{message}</p>
                        <div className="flex justify-center mb-4">
                            <img src={qrCode} alt="2FA QR Code" className="border-4 border-white shadow-lg rounded" />
                        </div>
                        {/* verification input */}
                        <div className="space-y-3 mt-4">
                            <p className="text-sm text-gray-700 font-semibold">Enter the code from your authenticator app:</p>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                inputMode="numeric"
                                className="w-full px-4 py-2 text-center text-xl tracking-widest border rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={verifyAndEnable2FA}
                                disabled={loading || verificationCode.length !== 6}
                                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                            >
                                {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
}

export default TwoFactorSetup;
