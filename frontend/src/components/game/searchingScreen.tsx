import Button from "./button";

interface SearchingScreenProps {
	onCancel: () => void
}

export default function SearchingScreen ({onCancel}: SearchingScreenProps) {
	return (
		<div>
			Searching for match...
			{/* insert timer, count up */}
			<Button 
				id='btn-cancel'
				className={"bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"}
				buttonName='cancel'
				onClick={onCancel}
			/>	
		</div>
	)
}