'use client'

import { useState, useEffect, useCallback } from 'react'
import { Chess } from 'chess.js'
import { ChessBoard } from './ChessBoard'
import { LiveCommentary } from './LiveCommentary'
import { MoveHistory } from './MoveHistory'
import { getAIMove } from '@/lib/agent'

export interface ChessMove {
  id: string
  player: 'ChatGPT' | 'Claude'
  move: string
  notation: string
  timestamp: Date
  evaluation?: number
  from: string
  to: string
  fen: string
  isCheck?: boolean
  isCheckmate?: boolean
  isStalemate?: boolean
  isDraw?: boolean
}

interface GameState {
  status: 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'waiting'
  winner?: 'ChatGPT' | 'Claude' | 'draw'
  reason?: string
}

interface GameSettings {
  useRealAI: boolean
  thinkingTimeMin: number
  thinkingTimeMax: number
}

export function LiveMatchContainer() {
  const [chess] = useState(() => new Chess())
  const [moves, setMoves] = useState<ChessMove[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<'ChatGPT' | 'Claude'>('Claude')
  const [lastMove, setLastMove] = useState<ChessMove | null>(null)
  const [gameState, setGameState] = useState<GameState>({ status: 'playing' })
  const [boardPosition, setBoardPosition] = useState(chess.board())
  const [isThinking, setIsThinking] = useState(false)
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    useRealAI: false, // Start with mock AI, can be toggled
    thinkingTimeMin: 2000,
    thinkingTimeMax: 5000
  })
  const [aiError, setAiError] = useState<string | null>(null)

  // Check game status and update state
  const checkGameStatus = useCallback(() => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'ChatGPT' : 'Claude'
      setGameState({
        status: 'checkmate',
        winner: winner === 'ChatGPT' ? 'Claude' : 'ChatGPT', // Opposite since turn switched
        reason: 'Checkmate'
      })
      return true
    }

    if (chess.isStalemate()) {
      setGameState({
        status: 'stalemate',
        winner: 'draw',
        reason: 'Stalemate'
      })
      return true
    }

    if (chess.isDraw()) {
      let reason = 'Draw'
      if (chess.isInsufficientMaterial()) {
        reason = 'Insufficient material'
      } else if (chess.isThreefoldRepetition()) {
        reason = 'Threefold repetition'
      }
      
      setGameState({
        status: 'draw',
        winner: 'draw',
        reason
      })
      return true
    }

    return false
  }, [chess])

  // Generate AI move using real AI providers or fallback to random
  const generateAIMove = useCallback(async () => {
    if (gameState.status !== 'playing') return

    setIsThinking(true)
    setAiError(null)
    
    const thinkingTime = gameSettings.thinkingTimeMin + 
      Math.random() * (gameSettings.thinkingTimeMax - gameSettings.thinkingTimeMin)
    
    // Simulate minimum thinking time
    await new Promise(resolve => setTimeout(resolve, thinkingTime))

    try {
      let newFen: string
      let selectedMoveNotation: string

      if (gameSettings.useRealAI) {
        // Use real AI providers
        const provider = currentPlayer === 'Claude' ? 'anthropic' : 'openai'
        const currentFen = chess.fen()
        
        console.log(`Getting move from ${provider} for ${currentPlayer}...`)
        newFen = await getAIMove(provider, currentFen)
        
        // Parse the move that was made by comparing FENs
        const tempChess = new Chess(currentFen)
        const legalMoves = tempChess.moves({ verbose: true })
        
        // Find which move was made by trying each one
        let moveResult = null
        for (const move of legalMoves) {
          const testChess = new Chess(currentFen)
          const testResult = testChess.move(move)
          if (testResult && testChess.fen() === newFen) {
            moveResult = testResult
            break
          }
        }
        
        if (!moveResult) {
          throw new Error('Could not determine the move made by AI')
        }
        
        selectedMoveNotation = moveResult.san
        
        // Update the main chess instance to match
        chess.load(newFen)
        
      } else {
        // Fallback to random moves (existing logic)
        const possibleMoves = chess.moves({ verbose: true })
        
        if (possibleMoves.length === 0) {
          checkGameStatus()
          setIsThinking(false)
          return
        }

        // Simple AI: Random move with slight preference for captures and checks
        let selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
        
        // Prefer captures (simplified AI logic)
        const captures = possibleMoves.filter(move => move.captured)
        if (captures.length > 0 && Math.random() > 0.7) {
          selectedMove = captures[Math.floor(Math.random() * captures.length)]
        }

        // Prefer checks
        const checks = possibleMoves.filter(move => {
          const tempChess = new Chess(chess.fen())
          tempChess.move(move)
          return tempChess.inCheck()
        })
        if (checks.length > 0 && Math.random() > 0.8) {
          selectedMove = checks[Math.floor(Math.random() * checks.length)]
        }

        // Make the move
        const moveResult = chess.move(selectedMove)
        if (!moveResult) {
          throw new Error(`Failed to apply random move: ${selectedMove}`)
        }
        
        selectedMoveNotation = moveResult.san
        newFen = chess.fen()
      }

      // Create move record
      const newMove: ChessMove = {
        id: Date.now().toString(),
        player: currentPlayer,
        move: `${selectedMoveNotation}`, // Simplified for now
        notation: selectedMoveNotation,
        timestamp: new Date(),
        evaluation: Math.random() * 2 - 1, // Random evaluation for demo
        from: '', // Would need to parse this from move comparison
        to: '',   // Would need to parse this from move comparison
        fen: newFen,
        isCheck: chess.inCheck(),
        isCheckmate: chess.isCheckmate(),
        isStalemate: chess.isStalemate(),
        isDraw: chess.isDraw()
      }

      setMoves(prev => [...prev, newMove])
      setLastMove(newMove)
      setBoardPosition(chess.board())
      
      // Check if game ended
      if (!checkGameStatus()) {
        // Switch players
        setCurrentPlayer(current => current === 'Claude' ? 'ChatGPT' : 'Claude')
      }

    } catch (error) {
      console.error('Error generating AI move:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown AI error'
      setAiError(errorMessage)
      
      // Fallback to random move if AI fails
      if (gameSettings.useRealAI) {
        console.log('Falling back to random move due to AI error')
        setGameSettings(prev => ({ ...prev, useRealAI: false }))
        // Retry with random move
        setTimeout(() => generateAIMove(), 1000)
        return
      }
    }
    
    setIsThinking(false)
  }, [chess, currentPlayer, gameState.status, checkGameStatus, gameSettings])

  // Auto-play game
  useEffect(() => {
    if (gameState.status === 'playing' && !isThinking) {
      const timer = setTimeout(() => {
        generateAIMove()
      }, 1000) // 1 second delay between moves

      return () => clearTimeout(timer)
    }
  }, [generateAIMove, gameState.status, isThinking, moves.length])

  // Manual move function (for testing or manual play)
  const makeMove = useCallback((from: string, to: string, promotion?: string) => {
    try {
      const moveOptions: any = { from, to }
      if (promotion) moveOptions.promotion = promotion

      const moveResult = chess.move(moveOptions)
      
      if (moveResult) {
        const newMove: ChessMove = {
          id: Date.now().toString(),
          player: currentPlayer,
          move: `${moveResult.from}-${moveResult.to}`,
          notation: moveResult.san,
          timestamp: new Date(),
          from: moveResult.from,
          to: moveResult.to,
          fen: chess.fen(),
          isCheck: chess.inCheck(),
          isCheckmate: chess.isCheckmate(),
          isStalemate: chess.isStalemate(),
          isDraw: chess.isDraw()
        }

        setMoves(prev => [...prev, newMove])
        setLastMove(newMove)
        setBoardPosition(chess.board())
        
        if (!checkGameStatus()) {
          setCurrentPlayer(current => current === 'Claude' ? 'ChatGPT' : 'Claude')
        }

        return true
      }
      return false
    } catch (error) {
      console.error('Invalid move:', error)
      return false
    }
  }, [chess, currentPlayer, checkGameStatus])

  // Reset game function
  const resetGame = useCallback(() => {
    chess.reset()
    setMoves([])
    setLastMove(null)
    setCurrentPlayer('Claude')
    setGameState({ status: 'playing' })
    setBoardPosition(chess.board())
    setIsThinking(false)
    setAiError(null)
  }, [chess])

  // Toggle AI mode
  const toggleAIMode = useCallback(() => {
    setGameSettings(prev => ({ ...prev, useRealAI: !prev.useRealAI }))
    setAiError(null)
  }, [])

  // Get game status message
  const getGameStatusMessage = () => {
    if (gameState.status === 'playing') {
      if (isThinking) {
        const aiType = gameSettings.useRealAI ? 'AI' : 'Random'
        return `${currentPlayer} (${aiType}) is thinking...`
      }
      return `${currentPlayer} to move`
    }
    
    if (gameState.status === 'checkmate') {
      return `Checkmate! ${gameState.winner} wins!`
    }
    
    if (gameState.status === 'stalemate') {
      return `Game ends in stalemate`
    }
    
    if (gameState.status === 'draw') {
      return `Game ends in a draw - ${gameState.reason}`
    }
    
    return 'Game status unknown'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Chess Board */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6">
          {/* Game Status */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
              <div className={`w-2 h-2 rounded-full ${
                gameState.status === 'playing' ? 'bg-green-400 animate-pulse' : 
                gameState.status === 'checkmate' ? 'bg-red-400' : 'bg-yellow-400'
              }`}></div>
              <span className="text-white text-sm font-medium">
                {gameState.status === 'playing' ? 'Live Game' : 'Game Over'}
              </span>
              <span className="text-purple-300 text-xs">
                ({gameSettings.useRealAI ? 'Real AI' : 'Random'})
              </span>
            </div>
            
            <p className="text-purple-300 mt-2">
              {getGameStatusMessage()}
            </p>
            
            {chess.inCheck() && gameState.status === 'playing' && (
              <p className="text-red-400 text-sm mt-1">
                ⚠️ {currentPlayer} is in check!
              </p>
            )}

            {aiError && (
              <p className="text-red-400 text-xs mt-1 bg-red-500/10 px-2 py-1 rounded">
                AI Error: {aiError}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-purple-400">
              <span>Move: {Math.ceil(moves.length / 2)}</span>
              <span>•</span>
              <span>FEN: {chess.fen().split(' ')[0]}...</span>
              <span>•</span>
              <button 
                onClick={toggleAIMode}
                className="text-cyan-400 hover:text-cyan-300 underline"
                disabled={isThinking || gameState.status !== 'playing'}
              >
                {gameSettings.useRealAI ? 'Use Random' : 'Use Real AI'}
              </button>
              {gameState.status !== 'playing' && (
                <>
                  <span>•</span>
                  <button 
                    onClick={resetGame}
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    New Game
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Chess Board */}
          <ChessBoard 
            moves={moves} 
            currentPlayer={currentPlayer}
            lastMove={lastMove}
            boardPosition={boardPosition}
            gameState={gameState}
            chess={chess}
            onMove={makeMove}
            isThinking={isThinking}
          />
        </div>
      </div>

      {/* Right Sidebar - Commentary and History */}
      <div className="space-y-4">
        {/* Live Commentary */}
        <LiveCommentary 
          moves={moves}
          currentPlayer={currentPlayer}
          gameState={gameState}
          isThinking={isThinking}
        />
        
        {/* Move History */}
        <MoveHistory moves={moves} />
      </div>
    </div>
  )
} 