interface GameResultsProps {
  gameMode: string
  winnerLabel: string
  scorePlayer1: number
  scorePlayer2: number
  player1Label: string
  player2Label: string
  onBackToMenu: () => void
}

export default function GameResults({
  gameMode,
  winnerLabel,
  scorePlayer1,
  scorePlayer2,
  player1Label,
  player2Label,
  onBackToMenu,
}: GameResultsProps) {

  const getModeLabel = () => {
    switch (gameMode) {
      case 'singleplayer': return '🤖 VS BOT'
      case 'multiplayer': return '🎮 LOCAL PVP'
      case 'online': return '🌐 ONLINE MATCH'
      default: return '🏓 PONG'
    }
  }

//   const isWin = winnerLabel.includes('WIN')
  const isLoss = winnerLabel.includes('LOST')

  const titleColor = isLoss ? '#ff4444' : '#ffd700'
  const titleGlow = isLoss
    ? '0 0 30px #ff4444, 0 0 60px #ff0000'
    : '0 0 30px #ffd700, 0 0 60px #ffa500'
  const titleEmoji = isLoss ? '💀' : '🏆'

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{
      backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e), linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e)',
      backgroundSize: '40px 40px',
      backgroundPosition: '0 0, 20px 20px'
    }}>
      <div className="relative z-10 text-center">
        <p className="text-cyan-400 text-xl font-bold mb-4 uppercase" style={{
          fontFamily: 'monospace',
          textShadow: '0 0 10px #00ffff'
        }}>
          {getModeLabel()}
        </p>

        <div className="text-6xl font-black mb-6" style={{
          color: titleColor,
          textShadow: titleGlow,
          fontFamily: 'monospace',
        }}>
          {titleEmoji} {winnerLabel} {titleEmoji}
        </div>

        <div className="flex items-center justify-center gap-8 mb-10">
          <div className="text-center">
            <p className="text-2xl font-bold mb-2" style={{
              color: '#5885a2',
              textShadow: '0 0 10px #5885a2',
              fontFamily: 'monospace'
            }}>
              {player1Label}
            </p>
            <p className="text-7xl font-black" style={{
              color: scorePlayer1 > scorePlayer2 ? '#00ff00' : '#ff4444',
              textShadow: scorePlayer1 > scorePlayer2
                ? '0 0 20px #00ff00, 0 0 40px #00ff00'
                : '0 0 20px #ff4444',
              fontFamily: 'monospace'
            }}>
              {scorePlayer1}
            </p>
          </div>

          <div className="text-4xl font-bold" style={{
            color: '#666',
            fontFamily: 'monospace'
          }}>
            —
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold mb-2" style={{
              color: '#b8383b',
              textShadow: '0 0 10px #b8383b',
              fontFamily: 'monospace'
            }}>
              {player2Label}
            </p>
            <p className="text-7xl font-black" style={{
              color: scorePlayer2 > scorePlayer1 ? '#00ff00' : '#ff4444',
              textShadow: scorePlayer2 > scorePlayer1
                ? '0 0 20px #00ff00, 0 0 40px #00ff00'
                : '0 0 20px #ff4444',
              fontFamily: 'monospace'
            }}>
              {scorePlayer2}
            </p>
          </div>
        </div>

        <button
          onClick={onBackToMenu}
          className="px-8 py-3 text-xl font-bold rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            fontFamily: 'monospace',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
            border: '2px solid #818cf8'
          }}
        >
          🏠 BACK TO MENU
        </button>
      </div>
    </div>
  )
}