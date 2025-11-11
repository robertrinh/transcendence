import React from 'react'

interface Button {
    className: string
    buttonName: string
    onClick: () => void
}

export default function Button({className, buttonName, onClick}:Button) {
    return (
        <button className={className} onClick={onClick}>
            {buttonName}
        </button>
    )
}
