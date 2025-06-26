'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ChessMove } from './LiveMatch'

interface MoveHistoryProps {
  moves: ChessMove[]
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const getMoveDisplayText = (move: ChessMove) => {
    let text = move.notation
    
    if (move.isCheckmate) {
      text += ' (Checkmate!)'
    } else if (move.isCheck) {
      text += ' (Check)'
    }
    
    return text
  }

  const getMoveIcon = (move: ChessMove) => {
    if (move.isCheckmate) return '👑'
    if (move.isCheck) return '⚠️'
    if (move.notation.includes('x')) return '⚔️' // Capture
    if (move.notation.includes('O-O')) return '🏰' // Castling
    return '♟️'
  }

  const getEvaluationColor = (evaluation?: number) => {
    if (evaluation === undefined) return 'bg-gray-500/20 text-gray-400'
    
    if (evaluation > 0.5) return 'bg-green-500/20 text-green-400'
    if (evaluation < -0.5) return 'bg-red-500/20 text-red-400'
    return 'bg-yellow-500/20 text-yellow-400'
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-800/40 to-indigo-900/40 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-1">
        <div className="bg-gradient-to-br from-slate-800/60 to-indigo-900/60 rounded-xl p-6">
          <motion.h3 
            className="text-white font-bold text-xl mb-6 flex items-center gap-3"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span 
              className="text-2xl"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              📝
            </motion.span>
            Move History
            <motion.div 
              className="ml-auto bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-3 py-1 rounded-full"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-indigo-400 text-xs font-bold">
                {moves.length} MOVES
              </span>
            </motion.div>
          </motion.h3>
          
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {moves.length === 0 ? (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl mb-4 opacity-50">⏳</div>
                <p className="text-purple-300 text-base font-medium">
                  No moves yet. Game starting soon...
                </p>
                <p className="text-purple-400 text-sm mt-2">
                  The AI players are preparing their strategies
                </p>
              </motion.div>
            ) : (
              moves.map((move, index) => (
                <motion.div
                  key={move.id}
                  initial={{ opacity: 0, x: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                    move.player === 'Claude' 
                      ? 'bg-gradient-to-r from-purple-500/10 to-purple-600/5 border-purple-500/30 hover:border-purple-400/50' 
                      : 'bg-gradient-to-r from-cyan-500/10 to-cyan-600/5 border-cyan-500/30 hover:border-cyan-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                          move.player === 'Claude' 
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' 
                            : 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        {Math.floor(index / 2) + 1}
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <motion.span 
                            className="text-lg"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                          >
                            {getMoveIcon(move)}
                          </motion.span>
                          <span className={`text-base font-bold ${
                            move.player === 'Claude' ? 'text-purple-300' : 'text-cyan-300'
                          }`}>
                            {move.player}
                          </span>
                          <motion.span 
                            className="text-white font-mono text-lg font-bold"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 + 0.2 }}
                          >
                            {getMoveDisplayText(move)}
                          </motion.span>
                        </div>
                        <div className="text-xs text-purple-400 flex items-center gap-3">
                          <span className="bg-white/5 px-2 py-1 rounded-full">
                            {formatDistanceToNow(move.timestamp, { addSuffix: true })}
                          </span>
                          <span className="bg-white/5 px-2 py-1 rounded-full font-mono">
                            {move.from} → {move.to}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {/* Evaluation */}
                      {move.evaluation !== undefined && (
                        <motion.div 
                          className={`text-sm px-3 py-1 rounded-full font-bold shadow-lg ${getEvaluationColor(move.evaluation)}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.3 }}
                        >
                          {move.evaluation > 0 ? '+' : ''}{move.evaluation.toFixed(1)}
                        </motion.div>
                      )}
                      
                      {/* Game status indicators */}
                      {(move.isCheckmate || move.isCheck || move.isStalemate || move.isDraw) && (
                        <div className="flex gap-1">
                                                     {move.isCheckmate && (
                             <motion.span 
                               className="text-xs bg-red-500/30 text-red-300 px-2 py-1 rounded-full font-bold border border-red-500/50"
                               animate={{ scale: [1, 1.2, 1] }}
                               transition={{ duration: 1, repeat: Infinity }}
                             >
                               MATE
                             </motion.span>
                           )}
                          {move.isCheck && !move.isCheckmate && (
                            <motion.span 
                              className="text-xs bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded-full font-bold border border-yellow-500/50"
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              CHECK
                            </motion.span>
                          )}
                          {move.isStalemate && (
                            <span className="text-xs bg-gray-500/30 text-gray-300 px-2 py-1 rounded-full font-bold border border-gray-500/50">
                              STALE
                            </span>
                          )}
                          {move.isDraw && !move.isStalemate && (
                            <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full font-bold border border-blue-500/50">
                              DRAW
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Subtle animated border */}
                  <div className={`absolute inset-0 rounded-xl opacity-20 ${
                    move.player === 'Claude' 
                      ? 'bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0' 
                      : 'bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0'
                  }`} />
                </motion.div>
              ))
            )}
          </div>

          {/* Enhanced Move count summary */}
          {moves.length > 0 && (
            <motion.div 
              className="mt-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-indigo-400/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-indigo-300 text-xs font-medium mb-1">Total Moves</div>
                  <div className="text-white text-2xl font-bold">{moves.length}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-indigo-300 text-xs font-medium mb-1">Game Time</div>
                  <div className="text-white text-2xl font-bold">{Math.floor(moves.length * 1.5)}m</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs text-indigo-400 bg-white/5 rounded-full px-3 py-2 inline-block">
                  Full moves: {Math.ceil(moves.length / 2)} • 
                  Current turn: {moves.length % 2 === 0 ? 'White (Claude)' : 'Black (ChatGPT)'}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </motion.div>
  )
} 