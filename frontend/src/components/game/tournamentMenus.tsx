import Button from "./button";

interface TournamentProps {
	onJoinTour: () => void
	onCreateTour: () => void
}

interface CreateTournamentProps {
	onCreate: () => void
	setPlayerCount: (count: number) => void
	setTournamentName: (name: string) => void
	setAlias: (alias: string | null ) => void //only if not logged in and/or nickname is not set for logged in ppl, otherwise set to null
}

export function MainMenuTournament ({onJoinTour, onCreateTour} : TournamentProps) {
	return (
	 <div id="game-ui" className='m-auto my-8 bg-white border-4 border-indigo-500 w-[1024px] h-[768px] flex'>
		<div id="game-menu" className="m-auto w-[40%] h-[70%] flex flex-col gap-5">
			<h2 className="text-2xl font-bold text">Active Tournaments</h2>
			{/* show the exisiting tournaments from the database with buttons to join */}
			{/* or show NO active tournaments */}
			<Button
				id='btn-join-tournament'
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='join'
				onClick={onJoinTour}
			/>
			<h2 className="text-2xl font-bold text">Create new tournament</h2>
			<Button
				id='btn-create-tournament'
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='create Tournament'
				onClick={onCreateTour}
			/>
		</div>
		</div>
	)
}

export function MenuCreateTournament ({onCreate, setPlayerCount} : CreateTournamentProps) {
	return (
		<div id="game-ui" className='m-auto my-8 bg-white border-4 border-indigo-500 w-[1024px] h-[768px] flex'> 
		<div id="game-menu" className="m-auto w-[40%] h-[70%] flex flex-col gap-5">
			<Button
				id="4-player"
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='4 player'
				onClick={() => {setPlayerCount(4)}}
			/>
			<Button
				id="8-player"
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='8 player'
				onClick={() => {setPlayerCount(8)}}
			/>
			<Button
				id="16-player"
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='16 player'
				onClick={() => {setPlayerCount(16)}}
			/>
			{/* set time frame, for when it should start, 5 min/15min/1h */}
            <input id="input-tournament-name" className="border-4 border-indigo-500 p-2 rounded-xl text-center" placeholder="enter tournament name"></input>
			<Button
				id="create-tournament"
				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='create'
				onClick={onCreate}
			/>
		</div>
		</div>
	)
}