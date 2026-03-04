import { useEffect, useState, useRef, useCallback } from 'react'
import gameInit from '../../static/game.js'
import { resetState } from '../../static/lib.js'
import { GameMode } from './types.js'

interface GameCanvas {
    mode: GameMode
    websocket: React.RefObject<null | WebSocket>
    ownName: string
    oppName: string
    ownAvatar?: string
    oppAvatar?: string
}

const CANVAS_WIDTH = 1024
const AVATAR_BAR = 70
const SPACING = 40
const TOTAL_CONTENT_HEIGHT = 768 + AVATAR_BAR + SPACING
const CHAT_WIDTH = 320
const LAYOUT_PADDING = 64

const MIN_WINDOW_WIDTH = CANVAS_WIDTH + CHAT_WIDTH + LAYOUT_PADDING
const MIN_WINDOW_HEIGHT = TOTAL_CONTENT_HEIGHT + LAYOUT_PADDING

export default function GameCanvas({mode, websocket, ownName, oppName, ownAvatar, oppAvatar}: GameCanvas) {
    const isLocalMultiplayer = mode === 'multiplayer'
    const displayOwnName = isLocalMultiplayer ? 'P1' : ownName
    const displayOppName = isLocalMultiplayer ? 'P2' : (oppName === 'UNKNOWN' || mode === 'singleplayer')
        ? 'BOT' : oppName
    const shouldShowOppAvatar = Boolean(oppAvatar) && displayOppName !== 'BOT'

    const [scale, setScale] = useState(1)
    const [tooSmall, setTooSmall] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const calculateScale = useCallback(() => {
        const vw = window.innerWidth
        const vh = window.innerHeight

        if (vw < MIN_WINDOW_WIDTH || vh < MIN_WINDOW_HEIGHT) {
            setTooSmall(true)
            return
        }
        setTooSmall(false)

        // Available space = viewport - chat sidebar - padding
        const availableWidth = vw - CHAT_WIDTH - LAYOUT_PADDING
        const availableHeight = vh - LAYOUT_PADDING

        const scaleX = availableWidth / CANVAS_WIDTH
        const scaleY = availableHeight / TOTAL_CONTENT_HEIGHT

        setScale(Math.min(scaleX, scaleY, 1))
    }, [])

    useEffect(() => {
        calculateScale()
        window.addEventListener('resize', calculateScale)
        return () => window.removeEventListener('resize', calculateScale)
    }, [calculateScale])

    useEffect(() => {
        async function wrapper() {
            await gameInit(mode, websocket.current!, ownName, oppName)
        }
        wrapper()
        return () => {
            const gameCanvas = document.getElementById("game-canvas")
            if (gameCanvas !== null) {
                gameCanvas.remove()
            }
            resetState()
        }
    }, [])

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-900"
            style={{ minWidth: `${MIN_WINDOW_WIDTH}px`, minHeight: `${MIN_WINDOW_HEIGHT}px` }}>
            {tooSmall && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 text-center p-8">
                    <p className="text-yellow-400 text-3xl font-bold mb-4"
                       style={{ fontFamily: 'monospace', textShadow: '0 0 10px rgba(255,200,0,0.5)' }}>
                        WINDOW TOO SMALL
                    </p>
                    <p className="text-gray-300 text-lg" style={{ fontFamily: 'monospace' }}>
                        Please resize your browser window to continue playing.
                    </p>
                    <p className="text-gray-500 text-sm mt-4" style={{ fontFamily: 'monospace' }}>
                        Minimum: {MIN_WINDOW_WIDTH} x {MIN_WINDOW_HEIGHT}
                    </p>
                </div>
            )}
            <div
                ref={containerRef}
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    width: `${CANVAS_WIDTH}px`,
                }}
            >
                {/* Avatar bar */}
                <div className="flex justify-between items-center px-4 py-2"
                    style={{
                        width: `${CANVAS_WIDTH}px`,
                        border: '3px solid rgb(255, 255, 255)',
                        borderRadius: '8px 8px 8px 8px',
                        backgroundColor: 'rgba(0,0,0,0.4)'
                    }}
                >
                    {/* Player 1 — Left */}
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl overflow-hidden flex items-center justify-center"
                            style={{
                                width: '130px',
                                height: '60px',
                                minWidth: '120px',
                                minHeight: '50px',
                                background: '#00d4ff',
                                border: '2px solid #00d4ff',
                                boxShadow: '0 0 10px #00d4ff'
                            }}
                        >
                            {ownAvatar ? (
                                <img
                                    src={ownAvatar}
                                    alt={ownAvatar}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-2xl font-bold">
                                    {displayOwnName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <p className="font-bold text-xl" style={{
                            fontFamily: 'monospace',
                            color: '#00d4ff',
                            textShadow: '0 0 12px #00d4ff'
                        }}>
                            {displayOwnName}
                        </p>
                    </div>

                    <p className="font-bold text-xl" style={{
                        fontFamily: 'monospace',
                        color: 'rgba(255,255,255,0.6)',
                    }}>
                        VS
                    </p>

                    {/* Player 2 — Right */}
                    <div className="flex items-center gap-3">
                        <p className="font-bold text-xl" style={{
                            fontFamily: 'monospace',
                            color: '#ff6600',
                            textShadow: '0 0 12px #ff6600'
                        }}>
                            {displayOppName}
                        </p>
                        <div className="rounded-xl overflow-hidden flex items-center justify-center"
                            style={{
                                width: '130px',
                                height: '60px',
                                minWidth: '120px',
                                minHeight: '50px',
                                background: '#ff6600',
                                border: '2px solid #ff6600',
                                boxShadow: '0 0 10px #ff6600'
                            }}
                        >
                            {shouldShowOppAvatar ? (
                                <img
                                    src={oppAvatar}
                                    alt={oppAvatar}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-2xl font-bold">
                                    {displayOppName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <br /><br />
                {/* Game Canvas */}
                <canvas id="game-canvas" className="border-4 border-indigo-500 bg-white"></canvas>
            </div>
        </div>
    )
}