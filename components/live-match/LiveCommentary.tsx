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
    <motion.div 
      className="bg-gradient-to-br from-slate-800/40 to-purple-900/40 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 p-1">
        <div className="bg-gradient-to-br from-slate-800/60 to-purple-900/60 rounded-xl p-6">
          <motion.h3 
            className="text-white font-bold text-xl mb-6 flex items-center gap-3"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span 
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎙️
            </motion.span>
            Live Commentary
            <motion.div 
              className="ml-auto flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 px-3 py-1 rounded-full"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                gameState?.status === 'playing' ? 'bg-red-500 shadow-red-500/50 shadow-lg' : 'bg-yellow-500 shadow-yellow-500/50 shadow-lg'
              }`}></div>
              <span className={`text-xs font-bold ${
                gameState?.status === 'playing' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {gameState?.status === 'playing' ? 'LIVE' : 'GAME OVER'}
              </span>
            </motion.div>
          </motion.h3>

          {/* Enhanced Current Status */}
          <motion.div 
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-purple-500/30 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className="flex items-center gap-2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-pulse shadow-lg"></div>
                <span className="text-red-400 font-bold text-sm">LIVE ANALYSIS</span>
              </motion.div>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
            </div>
            <motion.p 
              className="text-white text-base leading-relaxed font-medium"
              key={getLatestCommentary()} // Re-animate when commentary changes
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {getLatestCommentary()}
            </motion.p>
          </motion.div>

          {/* Enhanced AI Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-purple-300 font-bold text-base mb-4 flex items-center gap-2">
                🧠 Position Analysis
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">Evaluation:</span>
                  <motion.span 
                    className="text-white font-mono text-lg font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                    key={evaluation.score}
                  >
                    {evaluation.score > 0 ? '+' : ''}{evaluation.score.toFixed(1)}
                  </motion.span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">Advantage:</span>
                  <span className="text-white font-medium text-sm">{evaluation.advantage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">Suggested:</span>
                  <span className="text-cyan-400 font-mono font-bold">{getBestMoveHint()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">Depth:</span>
                  <span className="text-white font-mono text-sm">{15 + Math.floor(moves.length / 10)} plies</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-cyan-500/10 to-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/30"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="text-cyan-300 font-bold text-base mb-4 flex items-center gap-2">
                ⚡ AI Thinking Process
              </h4>
              <div className="space-y-2">
                <motion.div
                  className="flex items-center gap-3"
                  animate={{ opacity: isThinking ? [0.5, 1, 0.5] : 1 }}
                  transition={{ duration: 2, repeat: isThinking ? Infinity : 0 }}
                >
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-white text-xs">Analyzing tactical patterns...</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3"
                  animate={{ opacity: isThinking ? [0.5, 1, 0.5] : 1 }}
                  transition={{ duration: 2, repeat: isThinking ? Infinity : 0, delay: 0.5 }}
                >
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-white text-xs">Evaluating pawn structure...</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3"
                  animate={{ opacity: isThinking ? [0.5, 1, 0.5] : 1 }}
                  transition={{ duration: 2, repeat: isThinking ? Infinity : 0, delay: 1 }}
                >
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-white text-xs">Computing continuations...</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Game Progress */}
          <motion.div 
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className="text-yellow-300 font-bold text-base mb-4 flex items-center gap-2">
              📊 Game Progress
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-yellow-200 text-sm">Current Phase:</span>
                <span className="text-white font-bold text-lg">{getGamePhase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-200 text-sm">Move Count:</span>
                <span className="text-white font-bold text-lg">{Math.ceil(moves.length / 2)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-yellow-300">
                  <span>Opening</span>
                  <span>Middlegame</span>
                  <span>Endgame</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((moves.length / 80) * 100, 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((moves.length / 80) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <div className="text-xs text-yellow-400 text-center font-medium">
                  Progress: {Math.min(Math.floor((moves.length / 80) * 100), 100)}%
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 