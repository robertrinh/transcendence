import React from "react";
import Button from "./button";


function updateDisplayById(id: string, displayStyle: string) {
    const element = document.getElementById(id)
    if (element === null) {
        return
    }
    element.style.display = displayStyle
}

function transitionMenu(newState: Map<string, string>) {
    for (const [id, displayStyle] of newState) {
        updateDisplayById(id, displayStyle)        
    }
}

const buttonStyle = "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"
export default function GameUI() {
    return (
        <div className='m-auto my-8 bg-pink-100 border-4 border-indigo-500 w-[1024px] h-[768px] flex'>
            <div id="game-menu" className="m-auto w-[40%] h-[70%] flex flex-col gap-5">
                <Button
                    id='btn-play-local'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"
                    }
                    buttonName='play local'
                    onClick={() => {
                        const menuState = new Map<string, string>([
                            ['btn-play-local', 'none'],
                            ['btn-play-online', 'none'],
                            ['btn-singleplayer', 'block'],
                            ['btn-multiplayer', 'block'],
                            ['btn-join-lobby', 'none'],
                            ['btn-host-lobby', 'none'],
                            ['btn-main-menu', 'block']
                        ])
                        transitionMenu(menuState)
                    }}
                >
                </Button>
                <Button
                    id='btn-play-online'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"
                    }
                    buttonName='play online'
                    onClick={() => {
                        const menuState = new Map<string, string>([
                            ['btn-play-local', 'none'],
                            ['btn-play-online', 'none'],
                            ['btn-singleplayer', 'none'],
                            ['btn-multiplayer', 'none'],
                            ['btn-join-lobby', 'block'],
                            ['btn-host-lobby', 'block'],
                            ['btn-main-menu', 'block']
                        ])
                        transitionMenu(menuState)
                    }}
                >
                </Button>
                <Button
                    id='btn-singleplayer'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl hidden"
                    }
                    buttonName='singleplayer'
                    onClick={() => {}}
                >
                </Button>
                <Button
                    id='btn-multiplayer'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl hidden"
                    }
                    buttonName='multiplayer'
                    onClick={() => {}}
                >
                </Button>
                <Button
                    id='btn-host-lobby'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl hidden"
                    }
                    buttonName='host lobby'
                    onClick={() => {}}
                >
                </Button>
                <Button
                    id='btn-join-lobby'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl hidden"
                    }
                    buttonName='join lobby'
                    onClick={() => {}}
                >
                </Button>
                <Button
                    id='btn-main-menu'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl hidden"
                    }
                    buttonName='main menu'
                    onClick={() => {
                        const menuState = new Map<string, string>([
                            ['btn-play-local', 'block'],
                            ['btn-play-online', 'block'],
                            ['btn-singleplayer', 'none'],
                            ['btn-multiplayer', 'none'],
                            ['btn-join-lobby', 'none'],
                            ['btn-host-lobby', 'none'],
                            ['btn-main-menu', 'none']
                        ])
                        transitionMenu(menuState)
                    }}
                >
                </Button>
            </div>
        </div>
    )
}