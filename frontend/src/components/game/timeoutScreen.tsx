import { InfoBox, infoBoxType } from "./infoBox";

interface TimeoutScreenProps {
	onExit: () => void
	onRetry: () => void
}

interface InfoScreenProps {
	onExit: () => void
	message: string
	screenType: infoBoxType
}

export function TimeoutScreen({ onExit, onRetry }: TimeoutScreenProps) {
	return (
		<InfoBox type={infoBoxType.Neutral}>
			<p>No player found</p>
			<button
				type="button"
				className="bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl w-[20%]"
				onClick={onRetry}
			>
				retry
			</button>
			<button
				type="button"
				className="bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl w-[20%]"
				onClick={onExit}
			>
				exit
			</button>
		</InfoBox>
	);
}

export function InfoScreen({ onExit, message, screenType }: InfoScreenProps) {
	return (
		<InfoBox type={screenType}>
			<p>{message}</p>
			<button
				type="button"
				className="bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"
				onClick={onExit}
			>
				exit
			</button>
		</InfoBox>
	);
}
