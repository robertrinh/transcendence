import React from 'react'

interface Button {
    id: string
    className: string
    buttonName: string
    onClick: () => void
}

export default function Button({id, className, buttonName, onClick}:Button) {
    return (
        <button id={id} className={className} onClick={onClick}>
            {buttonName}
        </button>
    )
}
