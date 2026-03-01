import { useState, useEffect } from 'react';

interface TwoFactorSetupProps {
    onSuccess?: () => void;
}

function TwoFactorSetup({ onSuccess }: TwoFactorSetupProps) {
	const [qrCode, setQrCode] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const [verificationCode, setVerificationCode] = useState('');

	useEffect(() => {
		setupTwoFactor();
	}, []);

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
				setQrCode(data.qrCode);
				setMessage(data.message);
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
                if (onSuccess) {
                    onSuccess();
                }
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
            {loading && !qrCode ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                    Generating QR code…
                </div>
            ) : qrCode ? (
                <div className="space-y-4">
                    {/* White box around QR so scanning works */}
                    <div className="bg-white p-4 rounded-lg border border-slate-600/50 shadow-inner">
                        {message && (
                            <p className="text-sm text-slate-700 mb-3">{message}</p>
                        )}
                        <div className="flex justify-center mb-4">
                            <img src={qrCode} alt="2FA QR Code" className="border-2 border-slate-200 shadow rounded" />
                        </div>
                        <div className="space-y-3 mt-4">
                            <p className="text-sm text-slate-700 font-semibold">Enter the code from your authenticator app:</p>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => { setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                                placeholder="000000"
                                maxLength={6}
                                inputMode="numeric"
                                className="w-full px-4 py-2 text-center text-xl tracking-widest bg-slate-100 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                            />
                            {error && (
                                <div className="p-3 bg-brand-red/10 border border-brand-red/40 rounded-lg">
                                    <p className="text-brand-red text-sm">{error}</p>
                                </div>
                            )}
                            <button
                                onClick={verifyAndEnable2FA}
                                disabled={loading || verificationCode.length !== 6}
                                className="w-full bg-brand-orange text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : error ? (
                <div className="space-y-3">
                    <div className="p-3 bg-brand-red/10 border border-brand-red/40 rounded-lg">
                        <p className="text-brand-red text-sm">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => { setError(''); setupTwoFactor(); }}
                        className="w-full bg-slate-600 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-500 font-medium"
                    >
                        Retry
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export default TwoFactorSetup;
