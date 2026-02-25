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