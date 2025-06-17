'use client'

import { motion } from 'framer-motion'
import { ChessMove } from './LiveMatch'

interface ChessBoardProps {
  moves: ChessMove[]
  currentPlayer: 'ChatGPT' | 'Claude'
  lastMove: ChessMove | null
}

// Chess piece Unicode symbols - using better representations
const pieces = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
}

// Board position matching the screenshot (Sicilian Defense setup)
const boardPosition = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', null, 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, 'p', null, null, null],
  [null, null, null, null, 'P', null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', null, 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
]

export function ChessBoard({ moves, currentPlayer, lastMove }: ChessBoardProps) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0

  const getSquareName = (row: number, col: number) => {
    return `${files[col]}${ranks[row]}`
  }

  const isLastMoveSquare = (row: number, col: number) => {
    // Highlighting e4 and e5 squares for the last move
    const square = getSquareName(row, col)
    return square === 'e4' || square === 'e5'
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* Chess Board with purple border */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-2xl">
        <div className="grid grid-cols-8 gap-0 rounded-xl overflow-hidden shadow-2xl">
          {ranks.map((rank, rowIndex) => 
            files.map((file, colIndex) => {
              const piece = boardPosition[rowIndex][colIndex]
              const isLight = isLightSquare(rowIndex, colIndex)
              const isHighlighted = isLastMoveSquare(rowIndex, colIndex)
              
              return (
                <motion.div
                  key={`${file}${rank}`}
                  className={`
                    aspect-square flex items-center justify-center text-4xl relative
                    ${isLight ? 'bg-amber-50' : 'bg-amber-800'}
                    ${isHighlighted ? 'ring-2 ring-yellow-400 ring-inset bg-yellow-200' : ''}
                  `}
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: isHighlighted ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Chess piece */}
                  {piece && (
                    <motion.span
                      className={`text-4xl select-none ${
                        piece === piece.toUpperCase() ? 'text-white' : 'text-gray-900'
                      }`}
                      style={{
                        filter: piece === piece.toUpperCase() 
                          ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' 
                          : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {pieces[piece as keyof typeof pieces]}
                    </motion.span>
                  )}

                  {/* Move indicator for highlighted squares */}
                  {isHighlighted && (
                    <motion.div
                      className="absolute inset-0 bg-yellow-400/20 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Game status below the board */}
      <div className="mt-4 text-center">
        <p className="text-cyan-300 text-lg mb-2 flex items-center justify-center gap-2">
          <span>🧠</span>
          <span>Claude plays aggressive Sicilian defense</span>
        </p>
        <p className="text-purple-300 text-sm">
          Last move: e4-e5 • Next move in 3.2s
        </p>
      </div>
    </div>
  )
} 