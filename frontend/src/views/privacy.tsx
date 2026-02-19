import React from 'react';

interface PrivacyPolicyProps {
    isModal?: boolean;
    onClose?: () => void;
    /** When true, renders for embedding in Settings (light theme, no full-page wrapper) */
    embedded?: boolean;
    /** When true, use light theme (e.g. for modal in Settings) */
    lightMode?: boolean;
}

/**
 * PrivacyPolicy component
 * @param isModal - Whether the policy is displayed in a modal
 * @param onClose - Function to close the modal
 * @param embedded - Whether the policy is embedded in a component
 * @param lightMode - Whether to use light theme
 * @returns PrivacyPolicy component
 */
const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isModal = false, onClose, embedded = false, lightMode = false }) => {
    const isLight = embedded || lightMode;
    const wrap = isLight
        ? 'bg-white border border-gray-200 rounded-lg shadow p-6 max-h-[60vh] overflow-y-auto text-gray-900 text-sm'
        : 'bg-black/95 border border-white/10 rounded-2xl shadow-2xl p-8 text-white/90 max-h-[80vh] overflow-y-auto flex-1 min-h-0';
    const h1 = isLight ? 'text-lg font-semibold text-gray-900' : 'text-3xl font-bold text-white';
    const h2 = isLight ? 'text-base font-semibold mb-3 text-gray-900' : 'text-2xl font-semibold mb-4 text-white';
    const h3 = isLight ? 'text-sm font-semibold mb-2 text-gray-900' : 'text-xl font-medium mb-2 text-white/90';
    const p = isLight ? 'text-sm text-gray-700 leading-relaxed' : 'text-white/80';
    const pMuted = isLight ? 'text-sm text-gray-600 mb-6' : 'text-white/70 mb-8';
    const hr = isLight ? 'border-gray-200 mb-6' : 'border-white/10 mb-8';
    const ul = isLight ? 'list-disc list-inside text-sm text-gray-700 space-y-1 ml-4' : 'list-disc list-inside text-white/80 space-y-2 ml-4';
    const ol = isLight ? 'list-decimal list-inside text-sm text-gray-700 ml-4 space-y-1' : 'list-decimal list-inside text-white/80 text-sm ml-4 space-y-1';
    const tableWrap = isLight ? 'w-full text-sm text-gray-700 border-collapse border border-gray-200' : 'w-full text-white/80 border-collapse border border-white/20';
    const th = isLight ? 'text-left py-2 px-3 border-b border-gray-200 font-semibold text-gray-900 text-sm' : 'text-left py-3 px-4 border-b border-white/20 font-semibold';
    const td = isLight ? 'py-2 px-3 border-b border-gray-100 text-sm text-gray-700' : 'py-3 px-4 border-b border-white/10';
    const tdLast = isLight ? 'py-2 px-3 text-sm text-gray-700' : 'py-3 px-4';
    const thead = isLight ? 'bg-gray-100' : 'bg-white/10';
    const quote = isLight ? 'bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4' : 'bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4 mb-4';
    const quoteP = isLight ? 'text-sm text-emerald-800 font-medium' : 'text-emerald-300 font-medium';
    const code = isLight ? 'text-sm text-gray-800 bg-gray-100 px-1 rounded' : 'text-white/90';
    const link = isLight ? 'text-sm text-blue-600 hover:text-blue-500 hover:underline transition-colors' : 'text-blue-400 hover:text-blue-300 hover:underline transition-colors';
    const italic = isLight ? 'text-sm text-gray-600 italic text-center' : 'text-white/70 italic text-center';
    const closeBtn = isLight ? 'text-gray-500 hover:text-gray-700' : 'text-white/60 hover:text-white';

    const content = (
        <div className={wrap}>
            <div className="flex justify-between items-start mb-2">
                <h1 className={h1}>Privacy Policy Ft_transcendence</h1>
                {isModal && onClose && (
                    <button
                        onClick={onClose}
                        className={`${closeBtn} text-2xl font-bold leading-none transition-colors`}
                        aria-label="Close"
                    >
                        ×
                    </button>
                )}
            </div>
            <p className={pMuted}>Last Updated: 16-2-2026</p>

            <hr className={hr} />

            <section className="mb-8">
                <h2 className={h2}>Your Rights Under GDPR</h2>
                <p className={p}>
                    ft_transcendence respects your privacy and complies with the General Data Protection Regulation (GDPR). 
                    This document explains your rights regarding your personal data and how to exercise them.
                </p>
            </section>

            <hr className={hr} />

            <section className="mb-8">
                <h2 className={h2}>1. What Data We Collect</h2>
                <p className={`${p} mb-4`}>When you use ft_transcendence, we collect and store:</p>
                <ul className={ul}>
                    <li><strong>Account Information:</strong> Username, email address, password (encrypted)</li>
                    <li><strong>Profile Data:</strong> Display name, avatar, user preferences</li>
                    <li><strong>Game Data:</strong> Tournament participation, match results, statistics, win/loss records</li>
                    <li><strong>Communication:</strong> Direct messages and chat history with other users</li>
                    <li><strong>Technical Data:</strong> Login times</li>
                </ul>
            </section>

            <hr className={hr} />

            <section className="mb-8">
                <h2 className={h2}>2. Your Data Rights</h2>
                
                <div className="mb-6">
                    <h3 className={h3}>2.1 Right to View Your Data</h3>
                    <p className={`${p} mb-2`}>You can view all personal data we have stored about you at any time.</p>
                    <p className={`${p} mb-1`}><strong>How to exercise:</strong></p>
                    <ol className={ol}>
                        <li>Navigate to <strong>Avatar icon → Profile</strong></li>
                        <li>You will see a complete overview of your stored information on the profile page</li>
                    </ol>
                </div>

                <div className="mb-6">
                    <h3 className={h3}>2.2 Right to Edit Your Data</h3>
                    <p className={`${p} mb-2`}>You can update or correct your personal information whenever needed.</p>
                    <p className={`${p} mb-1`}><strong>How to exercise:</strong></p>
                    <ol className={ol}>
                        <li>Navigate to <strong>Avatar icon → Settings</strong> to update your information: such as Display name, Nickname, e-mail and avatar.</li>
                        <li>Changes take effect immediately</li>
                    </ol>
                </div>

                <div className="mb-6">
                    <h3 className={h3}>2.3 Right to Anonymize Your Account</h3>
                    <p className={`${p} mb-2`}>If you don't want your data to be shown using ft_transcendence, you can anonymize your account.</p>
                    <p className={`${p} mb-2`}><strong>What happens:</strong></p>
                    <ul className={`${ul} mb-2`}>
                        <li>Your email and personal identifiers are removed</li>
                        <li>Your username is replaced with <code className={code}>Anonymous User</code></li>
                        <li>Your match history remains visible but not linked to you</li>
                        <li>You will not have access to the chat</li>
                        <li>You cannot recover your account after anonymization</li>
                    </ul>
                    <p className={`${p} mb-1`}><strong>How to exercise:</strong></p>
                    <ol className={ol}>
                        <li>Navigate to <strong>Avatar icon → Settings → Privacy & Data → Anonymous Mode</strong></li>
                        <li className="text-amber-600">⚠️ This action is irreversible</li>
                    </ol>
                </div>

                <div className="mb-6">
                    <h3 className={h3}>2.4 Right to Delete Your Account</h3>
                    <p className={`${p} mb-2`}>You can permanently delete your account and all associated personal data.</p>
                    <p className={`${p} mb-2`}><strong>What gets deleted:</strong></p>
                    <ul className={`${ul} mb-2`}>
                        <li>Your account credentials and login information</li>
                        <li>Profile information (username, email, avatar)</li>
                        <li>Private messages and chat history</li>
                        <li>Personal preferences and settings</li>
                        <li>All game statistics and match history</li>
                    </ul>
                    <p className={`${p} mb-1`}><strong>How to exercise:</strong></p>
                    <ol className={ol}>
                        <li>Navigate to <strong>Avatar icon → Settings → Privacy & Data → Delete Account</strong></li>
                        <li>Confirm your decision</li>
                        <li>Your data will be permanently deleted</li>
                    </ol>
                </div>
            </section>

            <hr className={hr} />

            <section className="mb-8">
                <h2 className={h2}>3. Data Retention</h2>
                <div className="overflow-x-auto">
                    <table className={tableWrap}>
                        <thead>
                            <tr className={thead}>
                                <th className={th}>Account Status</th>
                                <th className={th}>Data Retention Policy</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={td}>Active accounts</td>
                                <td className={td}>Your data is retained while your account is active</td>
                            </tr>
                            <tr>
                                <td className={td}>Deleted accounts</td>
                                <td className={td}>All personal data is permanently removed</td>
                            </tr>
                            <tr>
                                <td className={tdLast}>Anonymized accounts</td>
                                <td className={tdLast}>Personal identifiers removed immediately; anonymized statistics may be retained</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <hr className={hr} />

            <section className="mb-8">
                <h2 className={h2}>4. How We Protect Your Data</h2>
                <p className={`${p} mb-4`}>We implement security measures to protect your information:</p>
                <ul className={ul}>
                    <li>Passwords encrypted using bcrypt hashing</li>
                    <li>All connections use HTTPS encryption and wss</li>
                    <li>Authentication uses JWT tokens with optional 2FA</li>
                    <li>Database setup for to prevent SQL injections and Cross site scripting</li>
                </ul>
            </section>

            <hr className={hr} />

            <section className="mb-8">
                <h2 className={h2}>5. Data Sharing</h2>
                <div className={quote}>
                    <p className={quoteP}>We do not sell or rent your personal data to third parties.</p>
                </div>
                <p className={`${p} mb-2`}><strong>Your data may be visible to:</strong></p>
                <ul className={`${ul} mb-4`}>
                    <li>Other users (username, display name, game statistics, match results)</li>
                    <li>Platform administrators (for technical support and moderation)</li>
                </ul>
                <p className={`${p} mb-2`}><strong>Your data remains private:</strong></p>
                <ul className={ul}>
                    <li>Email address</li>
                    <li>Password</li>
                    <li>Private messages (only you and recipients)</li>
                    <li>Technical logs</li>
                </ul>
            </section>

            <hr className={hr} />

            <section className="mb-8">
                <h2 className={h2}>6. Contact</h2>
                <p className={`${p} mb-4`}>If you have questions about your data or need assistance exercising your rights:</p>
                <p className={`${p} mb-2`}><strong>Contact us:</strong></p>
                <p className={p}>
                    📧 Email: <a href="mailto:qtrinh@student.codam.nl" className={link}>qtrinh@student.codam.nl</a>
                </p>
            </section>

            <hr className={hr} />

            <section className="mb-8">
                <h2 className={h2}>7. Changes to This Document</h2>
                <p className={`${p} mb-4`}>We may update this document to reflect changes in our practices or legal requirements.</p>
                <p className={`${p} mb-2`}><strong>Version History:</strong></p>
                <ul className={`${ul} space-y-1`}>
                    <li>v1.1 - 16-2-2026 - Updated flow regarding exercising rights according to the technical architecture development</li>
                    <li>v1.0 - 16-12-2025 - Initial release</li>
                </ul>
            </section>

            <hr className={hr} />

            <p className={italic}>
                By using ft_transcendence, you acknowledge your understanding of these rights and how to exercise them.
            </p>

            {isModal && onClose && (
                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all font-medium shadow-lg shadow-blue-500/25"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );

    if (embedded) {
        return <>{content}</>;
    }

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
                <div className="w-[95vw] min-w-[40rem] max-w-6xl h-[70vh] min-h-[360px] flex flex-col overflow-hidden rounded-2xl">
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
