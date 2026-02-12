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
	 <div id="game-ui" className='m-auto my-8 bg-white border-4 border-indigo-500 w-[1024px] h-[768px] flex'>
        <div id="game-menu" className="m-auto w-[40%] h-[70%] flex flex-col gap-5">
		  <Button
		  	id='btn-play-local'
			className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
			buttonName='play local' onClick={onPlayLocal}
		  />
		  <Button
		  	id='btn-play-online'
			className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
			buttonName='play online'
			onClick={onPlayOnline}
		   />
		</div>
			</div>
	)
} 

export function OnlineMenu ( {onPlayRandom, onHostLobby, onJoinLobby, onTournament, onBack} : OnlineMenuProps) {
	return (
	 <div id="game-ui" className='m-auto my-8 bg-white border-4 border-indigo-500 w-[1024px] h-[768px] flex'>
		<div id="game-menu" className="m-auto w-[40%] h-[70%] flex flex-col gap-5">
			<Button
				id='btn-play-random'
				className="bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"
				buttonName='Play Random'
				onClick={onPlayRandom}
			/>
			<Button
				id='btn-host-lobby'
				className="bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"
				buttonName='Host lobby'
				onClick={onHostLobby}
			/>
			<Button
				id='btn-join-lobby'
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='join lobby' onClick={onJoinLobby}
			/>
			<Button
				id='btn-tournament'
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='tournament'
				onClick={onTournament}
			/>
			<Button 
				id='btn-back'
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='Back to main menu'
				onClick={onBack}
			/>
		</div>
	</div>
	)
}

export function LocalMenu ( {onSinglePlayer, onMultiPlayer, onBack} : LocalMenuProps) {
	return (
	 <div id="game-ui" className='m-auto my-8 bg-white border-4 border-indigo-500 w-[1024px] h-[768px] flex'>
		<div id="game-menu" className="m-auto w-[40%] h-[70%] flex flex-col gap-5">
			<Button
				id='btn-singleplayer'
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='singleplayer'
				onClick={onSinglePlayer}
			/>
			<Button 
				id='btn-multiplayer'
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='multiplayer'
				onClick={onMultiPlayer}
			/>
			<Button
				id='btn-back'
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='Back to main menu'
				onClick={onBack}
			/>

		</div>
		</div>
	)
} 

export function HostLobby ( {onCopyLobby, onJoinOwn, lobbyId } : HostLobbyProps) {
	return (
	 <div id="game-ui" className='m-auto my-8 bg-white border-4 border-indigo-500 w-[1024px] h-[768px] flex'>
		<div id="game-menu" className="m-auto w-[40%] h-[70%] flex flex-col gap-5">
		<input value={lobbyId} readOnly id="req-lobby-id" className="border-4 border-indigo-500 p-2 rounded-xl text-center" placeholder="requesting lobby..."></input>
		<Button
			id='btn-copy-lobby'
			className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
			buttonName='copy lobby code'
			onClick={onCopyLobby}/>
		<Button
				id='btn-join-self'
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='join'
				onClick={onJoinOwn}/>
		</div>
		</div>
	)
}

export function JoinLobby ( {onJoin} : JoinProps) {
	return (
	 <div id="game-ui" className='m-auto my-8 bg-white border-4 border-indigo-500 w-[1024px] h-[768px] flex'>
		<div id="game-menu" className="m-auto w-[40%] h-[70%] flex flex-col gap-5">
            <input id="input-lobby-id" className="border-4 border-indigo-500 p-2 rounded-xl text-center" placeholder="enter lobby code"></input>
			<Button
				id='btn-join-other'
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='join'
				onClick={onJoin}
			/>
		</div>
		</div>
	)
}
