import Button from "./button";
import { useEffect } from "react";
import websocket from "../static/websocket";

interface GameUI {
    onGameModeSelect: any
}

function updateDisplayById(id: string, displayStyle: string) {
    const element = document.getElementById(id)
    if (element === null) {
        throw Error(`${id} is null`)
    }
    element.style.display = displayStyle
}

// keep only the given elements visible
function transitionMenu(newState: Map<string, string>) {
    const menuEle = document.getElementById("game-menu")
    if (menuEle === null) {
        throw Error("menuEle cannot be null")
    }
    for (const ele of menuEle.children) {
        const displayStyle = newState.get(ele.id)
        if (displayStyle === undefined) {
            updateDisplayById(ele.id, "none")
        }
        else {
            updateDisplayById(ele.id, displayStyle)
        }
    }
}

function validateJoinLobby(lobbyID: string): string {
    const lobbyEle = document.getElementById(lobbyID) as HTMLInputElement | null
    if (lobbyEle === null) {
        throw Error("lobbyEle cannot be null")
    }
    if (lobbyEle.value.length === 0) {
        throw Error("lobby ID cannot be empty")
    }
    return lobbyEle.value
}

function resizeGameUI(gameUI: HTMLElement) {
        const widthRatio = 0.75 // 4:3
        gameUI.setAttribute("style", `height:${gameUI.offsetWidth * widthRatio}px`)
        gameUI.style.height = String(gameUI.offsetWidth * widthRatio) + "px"
}

export default function GameUI({onGameModeSelect}: GameUI) {
    useEffect(() => {
        const gameUI = document.getElementById("game-ui")
        if (gameUI === null) {
            return
        }
        resizeGameUI(gameUI)
        window.addEventListener("resize", () => {
            resizeGameUI(gameUI)
        })
        return () => {
            removeEventListener("resize", () => {
                resizeGameUI(gameUI)
            })
        }
    }, [])
    return (
        <div id="game-ui" className='m-auto my-8 bg-white border-4 border-indigo-500 w-[60%] flex'>
            <div id="game-menu" className="m-auto w-[40%] h-[70%] flex flex-col gap-5">
                <Button
                    id='btn-play-local'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"
                    }
                    buttonName='play local'
                    onClick={() => {
                        const menuState = new Map<string, string>([
                            ['btn-singleplayer', 'block'],
                            ['btn-multiplayer', 'block'],
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
                    onClick={() => {
                        updateDisplayById("game-ui", "none")
                        onGameModeSelect('singleplayer')
                    }}
                >
                </Button>
                <Button
                    id='btn-multiplayer'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl hidden"
                    }
                    buttonName='multiplayer'
                    onClick={() => {
                        updateDisplayById("game-ui", "none")
                        onGameModeSelect('multiplayer')
                    }}
                >
                </Button>
                <Button
                    id='btn-host-lobby'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl hidden"
                    }
                    buttonName='host lobby'
                    onClick={() => {
                        websocket.send(JSON.stringify({type: "REQ_LOBBY"}))
                        const menuState = new Map<string, string>([
                            ['req-lobby-id', 'block'],
                            ['btn-copy-lobby', 'block'],
                            ['btn-join-self', 'block'],
                            ['btn-main-menu', 'block']
                        ])
                        transitionMenu(menuState)
                    }}
                >
                </Button>
                <Button
                    id='btn-join-lobby'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl hidden"
                    }
                    buttonName='join lobby'
                    onClick={() => {
                         const menuState = new Map<string, string>([
                            ['input-lobby-id', 'block'],
                            ['btn-join-other', 'block'],
                            ['btn-main-menu', 'block']
                        ])
                        transitionMenu(menuState)
                    }}
                >
                </Button>
                <input id="req-lobby-id" className="border-4 border-indigo-500 p-2 rounded-xl text-center hidden" placeholder="requesting lobby..."></input>
                <Button
                    id='btn-copy-lobby'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl hidden"
                    }
                    buttonName='copy lobby code'
                    onClick={() => {
                        const lobbyElement = document.getElementById("req-lobby-id") as HTMLInputElement | null
                        if (lobbyElement === null) {
                            return
                        }
                        navigator.clipboard.writeText(lobbyElement.value)
                    }}
                >
                </Button>
                <Button
                    id='btn-join-self'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl hidden"
                    }
                    buttonName='join'
                    onClick={() => {
                        let lobbyID = null
                        try
                        {
                            lobbyID = validateJoinLobby("req-lobby-id")
                        }
                        catch (e)
                        {
                            alert(e)
                            return
                        }
                        websocket.send(JSON.stringify({type: "JOIN_LOBBY", lobby_id: lobbyID}))
                        updateDisplayById("game-ui", "none")
                        onGameModeSelect('online')
                    }}
                >
                </Button>
                <input id="input-lobby-id" className="border-4 border-indigo-500 p-2 rounded-xl text-center hidden" placeholder="enter lobby code"></input>
                <Button
                    id='btn-join-other'
                    className={
                        "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl hidden"
                    }
                    buttonName='join'
                    onClick={() => {
                        let lobbyID = null
                        try
                        {
                            lobbyID = validateJoinLobby("input-lobby-id")
                        }
                        catch (e)
                        {
                            alert(e)
                            return
                        }
                        websocket.send(JSON.stringify({type: "JOIN_LOBBY", lobby_id: lobbyID}))
                        updateDisplayById("game-ui", "none")
                        onGameModeSelect('online')
                    }}
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
                            ['btn-play-online', 'block']
                        ])
                        transitionMenu(menuState)
                    }}
                >
                </Button>
            </div>
        </div>
    )
}