interface BlockedTabProps {
    blockedUsers: string[];
    onUnblock: (username: string) => void;
}

export function BlockedTab({ blockedUsers, onUnblock }: BlockedTabProps) {
    return (
        <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-800/50 font-mono text-xs">
            <div className="space-y-0.5">
                {blockedUsers.length === 0 ? (
                    <div className="text-center text-slate-400 py-6 font-sans text-sm">
                        No blocked users.
                    </div>
                ) : (
                    blockedUsers.map((username) => (
                        <div
                            key={username}
                            className="flex items-center justify-between py-1 border-b border-slate-600/40 last:border-0 group"
                        >
                            <span className="text-brand-red/90 font-medium">
                                {username}
                            </span>
                            <button
                                type="button"
                                onClick={() => onUnblock(username)}
                                className="text-brand-acidGreen hover:text-brand-mint hover:underline opacity-80 group-hover:opacity-100"
                                title="Unblock"
                            >
                                Unblock
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
