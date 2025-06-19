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
    <div className="bg-white/5 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span>📝</span>
        Move History
      </h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {moves.length === 0 ? (
          <p className="text-purple-300 text-sm text-center py-4">
            No moves yet. Game starting soon...
          </p>
        ) : (
          moves.map((move, index) => (
            <motion.div
              key={move.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                move.player === 'Claude' 
                  ? 'bg-purple-500/10 border border-purple-500/20' 
                  : 'bg-cyan-500/10 border border-cyan-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  move.player === 'Claude' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-cyan-500 text-white'
                }`}>
                  {Math.floor(index / 2) + 1}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-60">
                      {getMoveIcon(move)}
                    </span>
                    <span className={`text-sm font-medium ${
                      move.player === 'Claude' ? 'text-purple-300' : 'text-cyan-300'
                    }`}>
                      {move.player}
                    </span>
                    <span className="text-white font-mono text-sm">
                      {getMoveDisplayText(move)}
                    </span>
                  </div>
                  <div className="text-xs text-purple-400 mt-1 flex items-center gap-2">
                    <span>{formatDistanceToNow(move.timestamp, { addSuffix: true })}</span>
                    <span>•</span>
                    <span className="font-mono">{move.from}-{move.to}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                {/* Evaluation */}
                {move.evaluation !== undefined && (
                  <div className={`text-xs px-2 py-1 rounded-full ${getEvaluationColor(move.evaluation)}`}>
                    {move.evaluation > 0 ? '+' : ''}{move.evaluation.toFixed(1)}
                  </div>
                )}
                
                {/* Game status indicators */}
                {(move.isCheckmate || move.isCheck || move.isStalemate || move.isDraw) && (
                  <div className="flex gap-1">
                    {move.isCheckmate && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-1 py-0.5 rounded">
                        MATE
                      </span>
                    )}
                    {move.isCheck && !move.isCheckmate && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded">
                        CHECK
                      </span>
                    )}
                    {move.isStalemate && (
                      <span className="text-xs bg-gray-500/20 text-gray-400 px-1 py-0.5 rounded">
                        STALE
                      </span>
                    )}
                    {move.isDraw && !move.isStalemate && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded">
                        DRAW
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Move count summary */}
      {moves.length > 0 && (
        <div className="mt-4 text-center text-sm text-purple-300 border-t border-white/10 pt-3">
          <div className="flex justify-between items-center">
            <span>Total moves: {moves.length}</span>
            <span>Game time: {Math.floor(moves.length * 1.5)} min</span>
          </div>
          <div className="mt-2 text-xs text-purple-400">
            Full moves: {Math.ceil(moves.length / 2)} • 
            Current turn: {moves.length % 2 === 0 ? 'White (Claude)' : 'Black (ChatGPT)'}
          </div>
        </div>
      )}
    </div>
  )
} 