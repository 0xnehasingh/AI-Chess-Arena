'use client'

import { motion } from 'framer-motion'
import { Chess } from 'chess.js'
import { ChessMove } from './LiveMatch'

interface GameState {
  status: 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'waiting'
  winner?: 'ChatGPT' | 'Claude' | 'draw'
  reason?: string
}

interface ChessBoardProps {
  moves: ChessMove[]
  currentPlayer: 'ChatGPT' | 'Claude'
  lastMove: ChessMove | null
  boardPosition: any[][] // chess.js board representation
  gameState: GameState
  chess: Chess
  onMove: (from: string, to: string, promotion?: string) => boolean
  isThinking: boolean
}

// Chess piece Unicode symbols
const pieces = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
}

export function ChessBoard({ 
  moves, 
  currentPlayer, 
  lastMove, 
  boardPosition, 
  gameState,
  chess,
  onMove,
  isThinking
}: ChessBoardProps) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0

  const getSquareName = (row: number, col: number) => {
    return `${files[col]}${ranks[row]}`
  }

  const isLastMoveSquare = (row: number, col: number) => {
    if (!lastMove) return false
    const square = getSquareName(row, col)
    return square === lastMove.from || square === lastMove.to
  }

  const isInCheck = (row: number, col: number) => {
    if (!chess.inCheck()) return false
    const square = getSquareName(row, col)
    const piece = boardPosition[row][col]
    
    // Check if this square contains the king that's in check
    if (piece && piece.type === 'k') {
      const isWhiteKing = piece.color === 'w'
      const isCurrentPlayerWhite = chess.turn() === 'w'
      return isWhiteKing === isCurrentPlayerWhite
    }
    return false
  }

  const getPieceSymbol = (piece: any) => {
    if (!piece) return null
    
    // chess.js returns pieces with color and type
    const isWhite = piece.color === 'w'
    const pieceType = piece.type.toUpperCase()
    const symbol = isWhite ? pieceType : pieceType.toLowerCase()
    
    return pieces[symbol as keyof typeof pieces]
  }

  const getPieceColor = (piece: any) => {
    if (!piece) return ''
    return piece.color === 'w' ? 'text-white' : 'text-gray-900'
  }

  const getSquareHighlight = (row: number, col: number) => {
    const square = getSquareName(row, col)
    
    // Check square highlighting
    if (isInCheck(row, col)) {
      return 'ring-2 ring-red-500 ring-inset bg-red-200'
    }
    
    // Last move highlighting
    if (isLastMoveSquare(row, col)) {
      return 'ring-2 ring-yellow-400 ring-inset bg-yellow-200'
    }
    
    return ''
  }

  const getGameStatusMessage = () => {
    if (gameState.status === 'playing') {
      if (isThinking) {
        return `${currentPlayer} is analyzing...`
      }
      return `${currentPlayer} to move`
    }
    
    if (gameState.status === 'checkmate') {
      return `Checkmate! ${gameState.winner} wins!`
    }
    
    if (gameState.status === 'stalemate') {
      return 'Stalemate - Draw!'
    }
    
    if (gameState.status === 'draw') {
      return `Draw - ${gameState.reason}`
    }
    
    return 'Game Over'
  }

  const getLastMoveDescription = () => {
    if (!lastMove) return 'Game starting...'
    
    let description = `${lastMove.player}: ${lastMove.notation}`
    
    if (lastMove.isCheckmate) {
      description += ' (Checkmate!)'
    } else if (lastMove.isCheck) {
      description += ' (Check!)'
    }
    
    return description
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* Chess Board with gradient border */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-2xl">
        <div className="grid grid-cols-8 gap-0 rounded-xl overflow-hidden shadow-2xl">
          {ranks.map((rank, rowIndex) => 
            files.map((file, colIndex) => {
              const piece = boardPosition[rowIndex][colIndex]
              const isLight = isLightSquare(rowIndex, colIndex)
              const squareHighlight = getSquareHighlight(rowIndex, colIndex)
              
              return (
                <motion.div
                  key={`${file}${rank}`}
                  className={`
                    aspect-square flex items-center justify-center text-4xl relative cursor-pointer
                    ${isLight ? 'bg-amber-50' : 'bg-amber-800'}
                    ${squareHighlight}
                    hover:ring-2 hover:ring-blue-400 hover:ring-inset
                    transition-all duration-200
                  `}
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: isLastMoveSquare(rowIndex, colIndex) ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  title={`${file}${rank}${piece ? ` - ${piece.color}${piece.type}` : ''}`}
                >
                  {/* Chess piece */}
                  {piece && (
                    <motion.span
                      className={`text-4xl select-none ${getPieceColor(piece)}`}
                      style={{
                        filter: piece.color === 'w'
                          ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' 
                          : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20 
                      }}
                    >
                      {getPieceSymbol(piece)}
                    </motion.span>
                  )}

                  {/* Square coordinate labels (for corners) */}
                  {((rowIndex === 7 && colIndex === 0) || 
                    (rowIndex === 0 && colIndex === 7)) && (
                    <span className="absolute bottom-1 right-1 text-xs font-bold opacity-30">
                      {file}{rank}
                    </span>
                  )}

                  {/* Move indicator for highlighted squares */}
                  {isLastMoveSquare(rowIndex, colIndex) && (
                    <motion.div
                      className="absolute inset-0 bg-yellow-400/20 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}

                  {/* Check indicator */}
                  {isInCheck(rowIndex, colIndex) && (
                    <motion.div
                      className="absolute inset-0 bg-red-500/30 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              )
            })
          )}
        </div>

        {/* Board coordinates */}
        <div className="flex justify-between items-center mt-2 px-2">
          <div className="flex gap-1">
            {files.map(file => (
              <span key={file} className="text-white text-xs w-8 text-center opacity-60">
                {file}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Game status below the board */}
      <div className="mt-4 text-center">
        <motion.p 
          className="text-cyan-300 text-lg mb-2 flex items-center justify-center gap-2"
          animate={isThinking ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1.5, repeat: isThinking ? Infinity : 0 }}
        >
          <span>{isThinking ? '🤔' : '🧠'}</span>
          <span>{getGameStatusMessage()}</span>
        </motion.p>
        
        <p className="text-purple-300 text-sm">
          {getLastMoveDescription()}
          {gameState.status === 'playing' && isThinking && (
            <span className="ml-2">• Thinking...</span>
          )}
        </p>

        {/* Game statistics */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-purple-400">
          <span>Move: {Math.ceil(moves.length / 2)}</span>
          <span>•</span>
          <span>Ply: {moves.length}</span>
          {chess.isCheck() && (
            <>
              <span>•</span>
              <span className="text-red-400 font-bold">CHECK</span>
            </>
          )}
        </div>

        {/* FEN display for debugging */}
        <details className="mt-2">
          <summary className="text-xs text-purple-500 cursor-pointer hover:text-purple-400">
            Technical Info
          </summary>
          <div className="text-xs text-purple-400 mt-1 font-mono bg-black/20 p-2 rounded">
            <div>FEN: {chess.fen()}</div>
            <div>Turn: {chess.turn() === 'w' ? 'White' : 'Black'}</div>
            <div>Castling: {chess.fen().split(' ')[2] || '-'}</div>
            <div>En passant: {chess.fen().split(' ')[3] || '-'}</div>
          </div>
        </details>
      </div>
    </div>
  )
} 