import { ReactNode } from "react";
import Button from "./button";

interface TimeoutScreenProps {
	onExit: () => void
	onRetry: () => void
}

export default function TimeoutScreen ({onExit, onRetry}: TimeoutScreenProps) {
	return (
		<div>
			No player found
			<Button
				id='btn-retry'
				className={"bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='retry'
				onClick={(onRetry)}
			/>	
			<Button
				id='btn-exit'
				className={"bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='exit'
				onClick={(onExit)}
			/>	
		</div>
	)
}