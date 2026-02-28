import Button from "./button";
import { InfoBox, infoBoxType } from "./infoBox";

interface TimeoutScreenProps {
	onExit: () => void
}

interface InfoScreenProps {
	onExit: () => void
	message: string
	screenType: infoBoxType
}

export function TimeoutScreen ({onExit}: TimeoutScreenProps) {
	return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{
            backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e), linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
        }}>
			<div className="relative z-10 text-center max-w-2xl">
                <h1 className="text-6xl font-black mb-8 text-center" style={{
                    color: '#ff1500',
                    textShadow: '0 0 10px #ff1500, 0 0 20px #ff1500, 3px 3px 0 #ff00ff',
                    fontFamily: 'monospace',
                    letterSpacing: '4px'
                }}>
					NO OPPONENT FOUND
				</h1>

				<div className="flex gap-4"></div>
				<button
					onClick={onExit}
					className="w-full p-4 bg-red-900 hover:bg-red-700 border-4 border-red-400 font-black text-red-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
					style={{
						fontFamily: 'monospace',
						boxShadow: '0 0 15px rgba(255,0,0,0.5)',
						textShadow: '2px 2px 0 #000'
					}}
				>
					BACK
				</button>
			</div>
        </div>
	)
}

export function InfoScreen ({onExit, message, screenType}: InfoScreenProps) {
	return (
		<InfoBox type={screenType}>
			<p>{message}</p>
			<Button
				id='btn-exit'
			className={"bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='exit'
				onClick={(onExit)}
			/>
		</InfoBox>
	)
}
