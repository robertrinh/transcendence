export enum infoBoxType {
    Bad, // red
    Neutral, // yellow
    Good // green
}

interface infoBoxProps {
    type: infoBoxType
    children?: React.ReactNode
}

export function InfoBox ({type, children}: infoBoxProps) {
    let boxColor: string
    let fontColor:string
    let borderColor: string

    switch (type) {
        case infoBoxType.Bad:
            boxColor = "bg-red-50"
            fontColor = "text-red-900"
            borderColor = "border-red-200"
            break
        case infoBoxType.Neutral:
            boxColor = "bg-yellow-50"
            fontColor = "text-yellow-900"
            borderColor = "border-yellow-200"
            break
        case infoBoxType.Good:
            boxColor = "bg-green-50"
            fontColor = "text-green-900"
            borderColor = "border-green-200"
            break
    }
    const classStr = `${boxColor} ${fontColor} ${borderColor} rounded-lg p-4 flex flex-col space-y-2 items-center m-auto w-[60%]`
	return (
			<div className={classStr}>
                {children}
			</div>
	)
}
