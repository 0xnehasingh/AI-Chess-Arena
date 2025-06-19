'use client'

import { motion } from 'framer-motion'
import { ChessMove } from './LiveMatch'

interface LiveCommentaryProps {
  moves: ChessMove[]
  currentPlayer: 'ChatGPT' | 'Claude'
  gameState?: {
    status: 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'waiting'
    winner?: 'ChatGPT' | 'Claude' | 'draw'
    reason?: string
  }
  isThinking?: boolean
}

const openingCommentary = [
  "Both AIs start with classical opening principles.",
  "Solid development and center control are key.",
  "The opening phase shows careful position building.",
  "Each AI demonstrates deep opening knowledge."
]

const middlegameCommentary = [
  "The position is heating up with tactical possibilities.",
  "Strategic maneuvering and piece coordination take center stage.",
  "Both AIs are calculating complex variations.",
  "The middlegame reveals the true strength of each AI."
]

const endgameCommentary = [
  "Precision is everything in this endgame.",
  "Every move must be calculated to perfection.",
  "The endgame showcases pure calculation ability.",
  "Technical accuracy will determine the winner."
]

const tacticalCommentary = [
  "Brilliant tactical vision from both artificial minds!",
  "A forcing sequence develops on the board.",
  "Sharp calculations lead to critical positions.",
  "The engines find the most precise continuations."
]

export function LiveCommentary({ moves, currentPlayer, gameState, isThinking }: LiveCommentaryProps) {
  const getGamePhase = () => {
    if (moves.length < 16) return 'Opening'
    if (moves.length < 40) return 'Middlegame'
    return 'Endgame'
  }

  const getLatestCommentary = () => {
    if (gameState?.status === 'checkmate') {
      return `Checkmate! ${gameState.winner} delivers the final blow with superior calculation.`
    }
    
    if (gameState?.status === 'stalemate') {
      return `The game ends in stalemate - a fascinating display of defensive technique.`
    }
    
    if (gameState?.status === 'draw') {
      return `The game ends in a draw by ${gameState.reason?.toLowerCase()}. Both AIs played at an exceptional level.`
    }

    if (moves.length === 0) {
      return "The battle is about to begin. Both AI engines are ready to demonstrate their chess mastery."
    }
    
    if (isThinking) {
      return `${currentPlayer} is deep in calculation, exploring millions of possible continuations.`
    }
    
    const lastMove = moves[moves.length - 1]
    const phase = getGamePhase()
    
    let commentary = ""
    
    // Special move commentary
    if (lastMove.isCheckmate) {
      commentary = `${lastMove.player} delivers checkmate with ${lastMove.notation}! A masterful conclusion to the game.`
    } else if (lastMove.isCheck) {
      commentary = `${lastMove.player} gives check with ${lastMove.notation}, putting pressure on the opponent.`
    } else if (lastMove.notation.includes('x')) {
      commentary = `${lastMove.player} captures with ${lastMove.notation}, changing the material balance.`
    } else if (lastMove.notation.includes('O-O-O')) {
      commentary = `${lastMove.player} castles queenside with ${lastMove.notation}, securing the king while activating the rook.`
    } else if (lastMove.notation.includes('O-O')) {
      commentary = `${lastMove.player} castles kingside with ${lastMove.notation}, prioritizing king safety.`
    } else if (lastMove.notation.includes('=')) {
      commentary = `${lastMove.player} promotes a pawn with ${lastMove.notation}, reaching a critical endgame moment.`
    } else {
      // General phase-based commentary
      if (phase === 'Opening') {
        const randomComment = openingCommentary[moves.length % openingCommentary.length]
        commentary = `After ${lastMove.notation}, ${randomComment}`
      } else if (phase === 'Middlegame') {
        const randomComment = middlegameCommentary[moves.length % middlegameCommentary.length]
        commentary = `${lastMove.player} plays ${lastMove.notation}. ${randomComment}`
      } else {
        const randomComment = endgameCommentary[moves.length % endgameCommentary.length]
        commentary = `In this endgame, ${lastMove.player}'s ${lastMove.notation} shows ${randomComment.toLowerCase()}`
      }
    }
    
    return commentary
  }

  const getCurrentEvaluation = () => {
    if (moves.length === 0) return { score: 0, advantage: 'Equal' }
    
    const lastMove = moves[moves.length - 1]
    const evaluation = lastMove.evaluation || 0
    
    let advantage = 'Equal'
    if (evaluation > 1) advantage = 'Claude (significant)'
    else if (evaluation > 0.3) advantage = 'Claude (slight)'
    else if (evaluation < -1) advantage = 'ChatGPT (significant)'
    else if (evaluation < -0.3) advantage = 'ChatGPT (slight)'
    
    return { score: evaluation, advantage }
  }

  const getBestMoveHint = () => {
    const phase = getGamePhase()
    const moveCount = moves.length
    
    // Simplified move suggestions based on game phase
    if (phase === 'Opening') {
      const openingMoves = ['e4', 'Nf3', 'Bb5', 'd4', 'Nc3', 'Be2']
      return openingMoves[moveCount % openingMoves.length]
    } else if (phase === 'Middlegame') {
      const middlegameMoves = ['Rd1', 'Qe2', 'f4', 'h3', 'Rb1', 'a4']
      return middlegameMoves[moveCount % middlegameMoves.length]
    } else {
      const endgameMoves = ['Kg2', 'Rd8+', 'f5', 'Kb6', 'Re1', 'h4']
      return endgameMoves[moveCount % endgameMoves.length]
    }
  }

  const evaluation = getCurrentEvaluation()

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span>🎙️</span>
        Live Commentary
      </h3>

      {/* Current Status */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-4 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            gameState?.status === 'playing' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <span className={`text-sm font-medium ${
            gameState?.status === 'playing' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {gameState?.status === 'playing' ? 'LIVE' : 'GAME OVER'}
          </span>
        </div>
        <p className="text-white text-sm leading-relaxed">
          {getLatestCommentary()}
        </p>
      </div>

      {/* AI Analysis */}
      <div className="space-y-3">
        <div className="bg-white/5 rounded-lg p-3">
          <h4 className="text-purple-300 font-medium text-sm mb-2">🧠 Position Analysis</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Evaluation:</span>
              <span className="text-white font-mono">
                {evaluation.score > 0 ? '+' : ''}{evaluation.score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Advantage:</span>
              <span className="text-white font-medium">{evaluation.advantage}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Suggested Move:</span>
              <span className="text-white font-mono">{getBestMoveHint()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Search Depth:</span>
              <span className="text-white font-mono">{15 + Math.floor(moves.length / 10)} plies</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <h4 className="text-cyan-300 font-medium text-sm mb-2">⚡ AI Thinking Process</h4>
          <div className="space-y-1 text-xs text-purple-300">
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: isThinking ? [0.5, 1, 0.5] : 1 }}
              transition={{ duration: 2, repeat: isThinking ? Infinity : 0 }}
            >
              <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
              <span>Analyzing tactical patterns...</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: isThinking ? [0.5, 1, 0.5] : 1 }}
              transition={{ duration: 2, repeat: isThinking ? Infinity : 0, delay: 0.5 }}
            >
              <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
              <span>Evaluating pawn structure...</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: isThinking ? [0.5, 1, 0.5] : 1 }}
              transition={{ duration: 2, repeat: isThinking ? Infinity : 0, delay: 1 }}
            >
              <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
              <span>Computing optimal continuations...</span>
            </motion.div>
          </div>
        </div>

        {/* Game Phase */}
        <div className="bg-white/5 rounded-lg p-3">
          <h4 className="text-yellow-300 font-medium text-sm mb-2">📊 Game Progress</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-purple-200 text-sm">Current Phase:</span>
              <span className="text-white text-sm font-medium">{getGamePhase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-200 text-sm">Move Count:</span>
              <span className="text-white text-sm font-medium">{Math.ceil(moves.length / 2)}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((moves.length / 80) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-purple-400 text-center">
              Game progress: {Math.min(Math.floor((moves.length / 80) * 100), 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 