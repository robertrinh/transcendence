import { useState, useEffect } from 'react'

interface SearchingScreenProps {
    onCancel: () => void
}

export default function SearchingScreen ({ onCancel }: SearchingScreenProps) {
    const [seconds, setSeconds] = useState(0)
    const [dots, setDots] = useState('.')

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(s => s + 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const dotTimer = setInterval(() => {
            setDots(d => d.length >= 3 ? '.' : d + '.')
        }, 500)

        return () => clearInterval(dotTimer)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{
            backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e), linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
        }}>
            {/* Scanline effect */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)'
            }}></div>

            <div className="relative z-10 text-center max-w-2xl">
                {/* Title */}
                <h1 className="text-6xl font-black mb-8 text-center" style={{
                    color: '#00ff00',
                    textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 3px 3px 0 #ff00ff',
                    fontFamily: 'monospace',
                    letterSpacing: '4px'
                }}>
                    SEARCHING
                </h1>

                <div className="border-4 border-cyan-400 p-12 mb-8 bg-gray-900" style={{
                    boxShadow: 'inset 0 0 10px rgba(0,255,255,0.3), 0 0 20px rgba(0,255,255,0.5)'
                }}>
                    {/* Searching Animation */}
                    <div className="mb-8">
                        <div className="flex justify-center gap-4 mb-8">
                            <div 
                                className="w-6 h-6 border-2 border-cyan-400 rounded-full"
                                style={{
                                    animation: 'pulse 1s ease-in-out infinite',
                                    animationDelay: '0s'
                                }}
                            ></div>
                            <div 
                                className="w-6 h-6 border-2 border-cyan-400 rounded-full"
                                style={{
                                    animation: 'pulse 1s ease-in-out infinite',
                                    animationDelay: '0.2s'
                                }}
                            ></div>
                            <div 
                                className="w-6 h-6 border-2 border-cyan-400 rounded-full"
                                style={{
                                    animation: 'pulse 1s ease-in-out infinite',
                                    animationDelay: '0.4s'
                                }}
                            ></div>
                        </div>

                        <p className="text-cyan-300 text-2xl font-bold uppercase" style={{
                            fontFamily: 'monospace',
                            textShadow: '0 0 10px #00ffff',
                            letterSpacing: '2px',
                            height: '40px'
                        }}>
                            Looking for opponent{dots}
                        </p>
                    </div>

                    {/* Timer */}
                    <div className="bg-purple-900 border-4 border-purple-500 rounded-none p-6 mb-8" style={{
                        boxShadow: '0 0 15px rgba(168,85,247,0.5)',
                        fontFamily: 'monospace'
                    }}>
                        <p className="text-purple-200 text-sm font-bold mb-2 uppercase">
                            ⏱️ SEARCHING TIME
                        </p>
                        <p className="text-purple-300 text-4xl font-black" style={{
                            textShadow: '0 0 10px #a855f7'
                        }}>
                            {formatTime(seconds)}
                        </p>
                    </div>

                    {/* Status */}
                    <div className="bg-green-900 border-4 border-green-400 rounded-none p-4 mb-8" style={{
                        boxShadow: '0 0 15px rgba(0,255,0,0.3)',
                        fontFamily: 'monospace'
                    }}>
                        <p className="text-green-300 text-sm font-bold uppercase">
                            🟢 MATCHMAKING IN PROGRESS
                        </p>
                    </div>

                    {/* Cancel Button */}
                    <button
                        onClick={onCancel}
                        className="w-full p-4 bg-red-900 hover:bg-red-700 border-4 border-red-400 font-black text-red-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
                        style={{
                            fontFamily: 'monospace',
                            boxShadow: '0 0 15px rgba(255,0,0,0.5)',
                            textShadow: '2px 2px 0 #000'
                        }}
                    >
                        CANCEL SEARCH
                    </button>
                </div>

                {/* Footer */}
                <p className="text-green-400 font-bold text-sm" style={{fontFamily: 'monospace', textShadow: '0 0 10px #00ff00'}}>
                    &gt;&gt;&gt; WAITING FOR OPPONENT &lt;&lt;&lt;
                </p>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { 
                            transform: scale(1);
                            opacity: 1;
                        }
                        50% { 
                            transform: scale(1.2);
                            opacity: 0.5;
                        }
                    }
                `}</style>
            </div>
        </div>
    )
}