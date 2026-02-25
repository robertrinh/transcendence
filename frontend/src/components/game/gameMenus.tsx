import Button from "./button";

interface MainMenuProps {
	onPlayLocal: () => void
	onPlayOnline: () => void
}

interface OnlineMenuProps {
	onPlayRandom: () => void
	onHostLobby: () => void
	onJoinLobby: () => void
	onTournament: () => void
	onBack: () => void
}

interface LocalMenuProps {
	onSinglePlayer: () => void
	onMultiPlayer: () => void
	onBack: () => void
}

interface HostLobbyProps {
	onCopyLobby: () => void
	onJoinOwn: () => void
	lobbyId: string
}

interface JoinProps {
	onJoin: () => void
}



export function MainMenu ( {onPlayLocal, onPlayOnline} : MainMenuProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Main Menu</h2>
                    <div className="space-y-4">
                        <Button id='btn-play-local' className="w-full p-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold rounded-lg" buttonName='Play Local' onClick={onPlayLocal}/>
                        <Button id='btn-play-online' className="w-full p-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold rounded-lg" buttonName='Play Online' onClick={onPlayOnline}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function OnlineMenu ( {onPlayRandom, onHostLobby, onJoinLobby, onTournament, onBack} : OnlineMenuProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <div className="w-full max-w-md">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2">← Back</button>
                <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Online Multiplayer</h2>
                    <div className="space-y-4">
                        <Button id='btn-play-random' className="w-full p-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg" buttonName='Play Random' onClick={onPlayRandom}/>
                        <Button id='btn-host-lobby' className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg" buttonName='Host Lobby' onClick={onHostLobby}/>
                        <Button id='btn-join-lobby' className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg" buttonName='Join Lobby' onClick={onJoinLobby}/>
                        <Button id='btn-tournament' className="w-full p-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg" buttonName='Tournament' onClick={onTournament}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function LocalMenu ( {onSinglePlayer, onMultiPlayer, onBack} : LocalMenuProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <div className="w-full max-w-md">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2">← Back</button>
                <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Local Play</h2>
                    <div className="space-y-4">
                        <Button id='btn-singleplayer' className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg" buttonName='Single Player' onClick={onSinglePlayer}/>
                        <Button id='btn-multiplayer' className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg" buttonName='Multiplayer' onClick={onMultiPlayer}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function HostLobby ( {onCopyLobby, onJoinOwn, lobbyId } : HostLobbyProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Host Lobby</h2>
                <input value={lobbyId} readOnly id="req-lobby-id" className="w-full border-2 border-indigo-500 p-3 rounded-lg text-center mb-4" placeholder="requesting lobby..."/>
                <div className="space-y-4">
                    <Button id='btn-copy-lobby' className="w-full p-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold rounded-lg" buttonName='Copy Lobby Code' onClick={onCopyLobby}/>
                    <Button id='btn-join-self' className="w-full p-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg" buttonName='Join' onClick={onJoinOwn}/>
                </div>
            </div>
        </div>
    )
}

export function JoinLobby ( {onJoin} : JoinProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Join Lobby</h2>
                <input id="input-lobby-id" className="w-full border-2 border-indigo-500 p-3 rounded-lg text-center mb-4" placeholder="enter lobby code"/>
                <Button id='btn-join-other' className="w-full p-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold rounded-lg" buttonName='Join' onClick={onJoin}/>
            </div>
        </div>
    )
}