import React from 'react';

interface PrivacyPolicyProps {
    isModal?: boolean;
    onClose?: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isModal = false, onClose }) => {
    const content = (
        <div className="bg-white rounded-lg p-8 text-gray-800 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy Ft_transcendence</h1>
                {isModal && onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-800 text-2xl font-bold leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                )}
            </div>
            <p className="text-gray-800 mb-8">Last Updated: 16-12-2025</p>

            <hr className="border-gray-200 mb-8" />

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Your Rights Under GDPR</h2>
                <p className="text-gray-800">
                    ft_transcendence respects your privacy and complies with the General Data Protection Regulation (GDPR). 
                    This document explains your rights regarding your personal data and how to exercise them.
                </p>
            </section>

            <hr className="border-gray-200 mb-8" />

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. What Data We Collect</h2>
                <p className="text-gray-800 mb-4">When you use ft_transcendence, we collect and store:</p>
                <ul className="list-disc list-inside text-gray-800 space-y-2 ml-4">
                    <li><strong>Account Information:</strong> Username, email address, password (encrypted)</li>
                    <li><strong>Profile Data:</strong> Display name, avatar, user preferences</li>
                    <li><strong>Game Data:</strong> Tournament participation, match results, statistics, win/loss records</li>
                    <li><strong>Communication:</strong> Direct messages and chat history with other users</li>
                    <li><strong>Technical Data:</strong> Login times, cookies</li>
                </ul>
            </section>

            <hr className="border-gray-200 mb-8" />

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Your Data Rights</h2>
                
                <div className="mb-6">
                    <h3 className="text-xl font-medium mb-2 text-gray-800">2.1 Right to View Your Data</h3>
                    <p className="text-gray-800 mb-2">You can view all personal data we have stored about you at any time.</p>
                    <p className="text-gray-800 mb-1"><strong>How to exercise:</strong></p>
                    <ol className="list-decimal list-inside text-gray-800 text-sm ml-4 space-y-1">
                        <li>Navigate to Profile → Settings</li>
                        <li>You will see a complete overview of your stored information</li>
                    </ol>
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-medium mb-2 text-gray-800">2.2 Right to Edit Your Data</h3>
                    <p className="text-gray-800 mb-2">You can update or correct your personal information whenever needed.</p>
                    <p className="text-gray-800 text-sm"><strong>How to exercise:</strong> Navigate to Profile → Settings to update your information. Changes take effect immediately.</p>
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-medium mb-2 text-gray-800">2.3 Right to Delete Your Data</h3>
                    <p className="text-gray-800 mb-2">You can delete specific personal information from your account.</p>
                    <p className="text-gray-800 mb-2"><strong>What you can delete:</strong></p>
                    <ul className="list-disc list-inside text-gray-800 space-y-1 ml-4 mb-2">
                        <li>Profile information (avatar, display name)</li>
                        <li>Messages within 1 minute of sending</li>
                        <li>Game statistics (optional)</li>
                    </ul>
                    <p className="text-gray-800 mb-1"><strong>How to exercise:</strong></p>
                    <ol className="list-decimal list-inside text-gray-800 text-sm ml-4 space-y-1">
                        <li>Navigate to Profile → Settings → Privacy & Data → Manage My Data</li>
                        <li>Select the data you want to remove</li>
                        <li>Confirm deletion</li>
                    </ol>
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-medium mb-2 text-gray-800">2.4 Right to Anonymize Your Account</h3>
                    <p className="text-gray-800 mb-2">If you want to stop using ft_transcendence but preserve historical tournament data, you can anonymize your account.</p>
                    <p className="text-gray-800 mb-2"><strong>What happens:</strong></p>
                    <ul className="list-disc list-inside text-gray-800 space-y-1 ml-4 mb-2">
                        <li>Your email and personal identifiers are removed</li>
                        <li>Your username is replaced with Anonymous User [ID]</li>
                        <li>Your match history remains visible but not linked to you</li>
                        <li>You will not have access to the chat</li>
                        <li>You cannot recover your account after anonymization</li>
                    </ul>
                    <p className="text-gray-800 text-sm"><strong>How to exercise:</strong> Navigate to Profile → Settings → Privacy & Data → Anonymize My Account</p>
                    <p className="text-amber-600 text-sm mt-1">⚠️ This action is irreversible</p>
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-medium mb-2 text-gray-800">2.5 Right to Delete Your Account</h3>
                    <p className="text-gray-800 mb-2">You can permanently delete your account and all associated personal data.</p>
                    <p className="text-gray-800 mb-2"><strong>What gets deleted:</strong></p>
                    <ul className="list-disc list-inside text-gray-800 space-y-1 ml-4 mb-2">
                        <li>Your account credentials and login information</li>
                        <li>Profile information (username, email, avatar)</li>
                        <li>Private messages and chat history</li>
                        <li>Personal preferences and settings</li>
                        <li>All game statistics and match history</li>
                    </ul>
                    <p className="text-gray-800 mb-1"><strong>How to exercise:</strong></p>
                    <ol className="list-decimal list-inside text-gray-800 text-sm ml-4 space-y-1">
                        <li>Navigate to Profile → Settings → Privacy & Data → Delete My Account</li>
                        <li>Confirm your decision</li>
                        <li>Your data will be permanently deleted</li>
                    </ol>
                </div>
            </section>

            <hr className="border-gray-200 mb-8" />

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Data Retention</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-gray-800 border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left py-3 px-4 border-b border-gray-200 font-semibold">Account Status</th>
                                <th className="text-left py-3 px-4 border-b border-gray-200 font-semibold">Data Retention Policy</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-3 px-4 border-b border-gray-200">Active accounts</td>
                                <td className="py-3 px-4 border-b border-gray-200">Your data is retained while your account is active</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 border-b border-gray-200">Deleted accounts</td>
                                <td className="py-3 px-4 border-b border-gray-200">All personal data is permanently removed</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4">Anonymized accounts</td>
                                <td className="py-3 px-4">Personal identifiers removed immediately; anonymized statistics may be retained</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <hr className="border-gray-200 mb-8" />

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. How We Protect Your Data</h2>
                <p className="text-gray-800 mb-4">We implement security measures to protect your information:</p>
                <ul className="list-disc list-inside text-gray-800 space-y-2 ml-4">
                    <li>Passwords encrypted using bcrypt hashing</li>
                    <li>All connections use HTTPS encryption</li>
                    <li>Authentication uses JWT tokens with optional 2FA</li>
                    <li>Regular security monitoring and updates</li>
                </ul>
            </section>

            <hr className="border-gray-200 mb-8" />

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Data Sharing</h2>
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                    <p className="text-green-700 font-medium">We do not sell or rent your personal data to third parties.</p>
                </div>
                <p className="text-gray-800 mb-2"><strong>Your data may be visible to:</strong></p>
                <ul className="list-disc list-inside text-gray-800 space-y-1 ml-4 mb-4">
                    <li>Other users (username, display name, game statistics, match results)</li>
                    <li>Platform administrators (for technical support and moderation)</li>
                </ul>
                <p className="text-gray-800 mb-2"><strong>Your data remains private:</strong></p>
                <ul className="list-disc list-inside text-gray-800 space-y-1 ml-4">
                    <li>Email address</li>
                    <li>Password</li>
                    <li>Private messages (only you and recipients)</li>
                    <li>Technical logs</li>
                </ul>
            </section>

            <hr className="border-gray-200 mb-8" />

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Contact</h2>
                <p className="text-gray-800 mb-4">If you have questions about your data or need assistance exercising your rights:</p>
                <p className="text-gray-800 mb-2"><strong>Contact us:</strong></p>
                <p className="text-gray-800">
                    📧 Email: <a href="mailto:qtrinh@student.codam.nl" className="text-gray-800 hover:underline">qtrinh@student.codam.nl</a>
                </p>
            </section>

            <hr className="border-gray-200 mb-8" />

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Changes to This Document</h2>
                <p className="text-gray-800 mb-4">We may update this document to reflect changes in our practices or legal requirements.</p>
                <p className="text-gray-800"><strong>Version History:</strong></p>
                <p className="text-gray-800 ml-4">v1.0 - 16-12-2025 - Initial release</p>
            </section>

            <hr className="border-gray-200 mb-8" />

            <p className="text-gray-800 italic text-center">
                By using ft_transcendence, you acknowledge your understanding of these rights and how to exercise them.
            </p>

            {isModal && onClose && (
                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );

    if (isModal) {
        return (
            <div 
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget && onClose) {
                        onClose();
                    }
                }}
            >
                <div className="max-w-4xl w-full">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {content}
            </div>
        </div>
    );
};

export default PrivacyPolicy;
