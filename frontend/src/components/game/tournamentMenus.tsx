// import Button from "./button";

// interface TournamentProps {
// 	onCreateTour: () => void
// }

// interface CreateTournamentProps {
// 	onCreate: () => void
// 	// setPlayerCount: (count: number) => void
// 	// setTournamentName: (name: string) => void
// 	// setAlias: (alias: string | null ) => void //only if not logged in and/or nickname is not set for logged in ppl, otherwise set to null
// }

// export function MainMenuTournament ({onCreateTour} : TournamentProps) {
// 	return (
// 	 <div id="game-ui" className='m-auto my-8 bg-white border-4 border-indigo-500 w-[1024px] h-[768px] flex'>
// 		<div id="game-menu" className="m-auto w-[40%] h-[70%] flex flex-col gap-5">
// 			<h2 className="text-2xl font-bold text">Create new tournament</h2>
// 			<Button
// 				id='btn-create-tournament'
// 				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
// 				buttonName='create Tournament'
// 				onClick={onCreateTour}
// 			/>
// 		</div>
// 		</div>
// 	)
// }

// export function MenuCreateTournament ({onCreate} : CreateTournamentProps) {
// 	return (
// 		<div id="game-ui" className='m-auto my-8 bg-white border-4 border-indigo-500 w-[1024px] h-[768px] flex'> 
// 		<div id="game-menu" className="m-auto w-[40%] h-[70%] flex flex-col gap-5">
// 			{/* <Button
// 				id="4-player"
// 				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
// 				buttonName='4 player'
// 				onClick={() => {setPlayerCount(4)}}
// 			/>
// 			<Button
// 				id="8-player"
// 				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
// 				buttonName='8 player'
// 				onClick={() => {setPlayerCount(8)}}
// 			/>
// 			<Button
// 				id="16-player"
// 				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
// 				buttonName='16 player'
// 				onClick={() => {setPlayerCount(16)}}
// 			/> */}
// 			{/* set time frame, for when it should start, 5 min/15min/1h */}
//             <input id="input-tournament-name" className="border-4 border-indigo-500 p-2 rounded-xl text-center" placeholder="enter tournament name"></input>
// 			<Button
// 				id="create-tournament"
// 				className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
// 				buttonName='create'
// 				onClick={onCreate}
// 			/>
// 		</div>
// 		</div>
// 	)
// }

import Button from "./button";

interface TournamentProps {
    onCreateTour: () => void
}

interface CreateTournamentProps {
    onCreate: () => void
}

export function MainMenuTournament ({onCreateTour} : TournamentProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">Tournament</h2>
                <Button
                    id='btn-create-tournament'
                    className={"w-full p-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold rounded-lg"}
                    buttonName='Create Tournament'
                    onClick={onCreateTour}
                />
            </div>
        </div>
    )
}

export function MenuCreateTournament ({onCreate} : CreateTournamentProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Tournament</h2>
                <input id="input-tournament-name" className="w-full border-2 border-indigo-500 p-3 rounded-lg text-center mb-4" placeholder="enter tournament name"/>
                <Button
                    id="create-tournament"
                    className={"w-full p-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold rounded-lg"}
                    buttonName='Create'
                    onClick={onCreate}
                />
            </div>
        </div>
    )
}