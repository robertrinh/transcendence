import Button from "./button";
import { infoBoxType, InfoBox } from "./infoBox";

interface SearchingScreenProps {
	onCancel: () => void
	message: string
}

export default function SearchingScreen ({onCancel, message}: SearchingScreenProps) {
	return (
		<InfoBox type={infoBoxType.Neutral}>
			<p>{message}</p>
			<Button 
				id='btn-cancel'
				className={"bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='cancel'
				onClick={onCancel}
			/>
		</InfoBox>
	)
}
