'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ChessMove } from './LiveMatch'

interface MoveHistoryProps {
  moves: ChessMove[]
}

export function MoveHistory({ moves }: MoveHistoryProps) {
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
                    <span className={`text-sm font-medium ${
                      move.player === 'Claude' ? 'text-purple-300' : 'text-cyan-300'
                    }`}>
                      {move.player}
                    </span>
                    <span className="text-white font-mono text-sm">
                      {move.notation}
                    </span>
                  </div>
                  <div className="text-xs text-purple-400 mt-1">
                    {formatDistanceToNow(move.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>

              {/* Evaluation */}
              {move.evaluation !== undefined && (
                <div className={`text-xs px-2 py-1 rounded-full ${
                  move.evaluation > 0 
                    ? 'bg-green-500/20 text-green-400' 
                    : move.evaluation < 0 
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {move.evaluation > 0 ? '+' : ''}{move.evaluation.toFixed(1)}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Move count summary */}
      {moves.length > 0 && (
        <div className="mt-4 text-center text-sm text-purple-300 border-t border-white/10 pt-3">
          Total moves: {moves.length} • Game time: {Math.floor(moves.length * 1.5)} minutes
        </div>
      )}
    </div>
  )
} 