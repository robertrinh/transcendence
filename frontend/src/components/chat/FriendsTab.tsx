import type { Friend, FriendRequest } from './chatTypes';

interface FriendsTabProps {
    friends: Friend[];
    incomingRequests: FriendRequest[];
    outgoingRequests: FriendRequest[];
    blockedUsers: string[];
    guestUsernames: string[];
    recentUsernames: string[];
    onViewProfile: (username: string) => void;
    onStartPrivateChat: (username: string) => void;
    onConfirmAction: (action: 'remove' | 'block', username: string) => void;
    onSendFriendRequest: (username: string) => void;
    onAcceptRequest: (username: string) => void;
    onDeclineRequest: (username: string) => void;
    onCancelRequest: (username: string) => void;
}

export function FriendsTab({
    friends,
    incomingRequests,
    outgoingRequests,
    blockedUsers,
    guestUsernames,
    recentUsernames,
    onViewProfile,
    onStartPrivateChat,
    onConfirmAction,
    onSendFriendRequest,
    onAcceptRequest,
    onDeclineRequest,
    onCancelRequest
}: FriendsTabProps) {
    const recentFiltered = recentUsernames
        .filter((username) => !friends.some((f) => f.username === username))
        .filter((username) => !outgoingRequests.some((r) => r.username === username))
        .filter((username) => !blockedUsers.includes(username))
        .slice(0, 5);

    return (
        <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-800/50 font-mono text-xs flex flex-col gap-4">
            {incomingRequests.length > 0 && (
                <div className="space-y-0.5">
                    <div className="text-slate-400 font-medium pb-1 border-b border-slate-600/40 mb-1.5">
                        Pending friend requests
                    </div>
                    {incomingRequests.map((req) => (
                        <div
                            key={`in-${req.id}-${req.username}`}
                            className="py-1.5 border-b border-slate-600/40 last:border-0 flex items-center justify-between"
                        >
                            <span className="text-slate-200">{req.username}</span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => onAcceptRequest(req.username)}
                                    className="text-brand-acidGreen hover:underline"
                                    title="Accept"
                                >
                                    Accept
                                </button>
                                <span className="text-slate-600">|</span>
                                <button
                                    type="button"
                                    onClick={() => onDeclineRequest(req.username)}
                                    className="text-brand-red hover:underline"
                                    title="Decline"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {outgoingRequests.length > 0 && (
                <div className="space-y-0.5">
                    <div className="text-slate-400 font-medium pb-1 border-b border-slate-600/40 mb-1.5">
                        Friend request sent to
                    </div>
                    {outgoingRequests.map((req) => (
                        <div
                            key={`out-${req.id}-${req.username}`}
                            className="py-1.5 border-b border-slate-600/40 last:border-0 flex items-center justify-between"
                        >
                            <span className="text-slate-200">{req.username}</span>
                            <button
                                type="button"
                                onClick={() => onCancelRequest(req.username)}
                                className="text-slate-400 hover:underline"
                                title="Cancel request"
                            >
                                Cancel
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-0.5">
                <div className="text-slate-400 font-medium pb-1 border-b border-slate-600/40 mb-1.5">
                    Friends
                </div>
                {friends.filter((f) => f.username?.trim()).length === 0 ? (
                    <div className="text-center text-slate-400 py-6 font-sans text-sm space-y-1">
                        <div>No friends yet.</div>
                        <div>Add friends from chat (click a username).</div>
                    </div>
                ) : (
                    friends
                        .filter((f) => f.username?.trim())
                        .map((friend) => (
                            <div
                                key={friend.id}
                                className="py-1.5 group border-b border-slate-600/40 last:border-0 flex flex-col gap-0.5"
                            >
                                <div className="flex items-center gap-x-2">
                                    <span
                                        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                                            friend.isOnline
                                                ? 'bg-brand-acidGreen'
                                                : 'bg-slate-500'
                                        }`}
                                        title={
                                            friend.isOnline ? 'Online' : 'Offline'
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onViewProfile(friend.username)
                                        }
                                        className="font-medium text-brand-orange hover:text-brand-mint hover:underline"
                                    >
                                        {friend.username}
                                    </button>
                                    <span className="text-slate-500">
                                        {friend.isOnline ? 'online' : 'offline'}
                                    </span>
                                </div>
                                <div className="pl-3.5 opacity-80 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onStartPrivateChat(friend.username)
                                        }
                                        className="text-brand-purple hover:text-brand-magenta hover:underline"
                                        title="Whisper"
                                    >
                                        Whisper
                                    </button>
                                    <span className="text-slate-600">|</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onConfirmAction(
                                                'remove',
                                                friend.username
                                            )
                                        }
                                        className="text-brand-red hover:underline"
                                        title="Remove friend"
                                    >
                                        Remove
                                    </button>
                                    <span className="text-slate-600">|</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onConfirmAction(
                                                'block',
                                                friend.username
                                            )
                                        }
                                        className="text-brand-red hover:underline"
                                        title="Block"
                                    >
                                        Block
                                    </button>
                                </div>
                            </div>
                        ))
                )}
            </div>

            <div className="space-y-0.5 border-t border-slate-600/40 pt-2">
                <div className="text-slate-400 font-medium pb-1 border-b border-slate-600/40 mb-1.5">
                    Send request to recent users:
                </div>
                {recentFiltered.map((username) => {
                    const isGuest = guestUsernames.includes(username);
                    return isGuest ? (
                        <div
                            key={username}
                            className="py-1 text-slate-500 text-sm"
                        >
                            {username}{' '}
                            <span className="text-slate-600">(guest)</span>
                        </div>
                    ) : (
                        <button
                            key={username}
                            type="button"
                            onClick={() => onSendFriendRequest(username)}
                            className="block w-full text-left text-brand-orange hover:text-brand-mint hover:underline py-1"
                        >
                            + Send request to {username}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
