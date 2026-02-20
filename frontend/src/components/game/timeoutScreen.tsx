import Button from "./button";
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

export function TimeoutScreen ({onExit, onRetry}: TimeoutScreenProps) {
	return (
		<InfoBox type={infoBoxType.Neutral}>
			<p>No player found</p>
			<Button
				id='btn-retry'
				className={"bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl w-[20%]"}
				buttonName='retry'
				onClick={(onRetry)}
			/>	
			<Button
				id='btn-exit'
				className={"bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl w-[20%]"}
				buttonName='exit'
				onClick={(onExit)}
			/>
		</InfoBox>

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
