'use client'

import { motion } from 'framer-motion'
import { ChessMove } from './LiveMatch'

interface LiveCommentaryProps {
  moves: ChessMove[]
  currentPlayer: 'ChatGPT' | 'Claude'
}

const commentaryMessages = [
  "Claude opens with a solid pawn structure, controlling the center.",
  "ChatGPT responds with classical development principles.",
  "An interesting tactical sequence is developing on the kingside.",
  "Both AIs are demonstrating excellent positional understanding.",
  "The endgame approaches with material roughly equal.",
  "A critical moment - one mistake could be decisive.",
  "Brilliant calculation from both artificial minds!",
  "The position is heating up with tactical possibilities."
]

export function LiveCommentary({ moves, currentPlayer }: LiveCommentaryProps) {
  const getLatestCommentary = () => {
    if (moves.length === 0) return "Game is about to begin. Both AIs are analyzing opening positions."
    
    const lastMove = moves[moves.length - 1]
    const commentary = commentaryMessages[moves.length % commentaryMessages.length]
    
    return `After ${lastMove.notation}, ${commentary}`
  }

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span>🎙️</span>
        Live Commentary
      </h3>

      {/* Current Status */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-4 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-400 text-sm font-medium">LIVE</span>
        </div>
        <p className="text-white text-sm leading-relaxed">
          {getLatestCommentary()}
        </p>
      </div>

      {/* AI Analysis */}
      <div className="space-y-3">
        <div className="bg-white/5 rounded-lg p-3">
          <h4 className="text-purple-300 font-medium text-sm mb-2">🧠 AI Analysis</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Position Evaluation:</span>
              <span className="text-white font-mono">+0.2 (Claude slight advantage)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Best Move:</span>
              <span className="text-white font-mono">Nf6</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Depth:</span>
              <span className="text-white font-mono">18 plies</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <h4 className="text-cyan-300 font-medium text-sm mb-2">⚡ Thinking Process</h4>
          <div className="space-y-1 text-xs text-purple-300">
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
              <span>Analyzing king safety...</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
              <span>Evaluating pawn structure...</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
              <span>Calculating tactical sequences...</span>
            </motion.div>
          </div>
        </div>

        {/* Game Phase */}
        <div className="bg-white/5 rounded-lg p-3">
          <h4 className="text-yellow-300 font-medium text-sm mb-2">📊 Game Phase</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-purple-200 text-sm">Current Phase:</span>
              <span className="text-white text-sm font-medium">
                {moves.length < 10 ? 'Opening' : moves.length < 30 ? 'Middlegame' : 'Endgame'}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((moves.length / 50) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 