'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Chess } from 'chess.js'
import { ChessBoard } from './ChessBoard'

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

export function LiveMatch() {
  const [chess] = useState(() => new Chess())
  const [moves, setMoves] = useState<ChessMove[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<'ChatGPT' | 'Claude'>('Claude')
  const [lastMove, setLastMove] = useState<ChessMove | null>(null)
  const [gameState, setGameState] = useState<GameState>({ status: 'playing' })
  const [boardPosition, setBoardPosition] = useState(chess.board())
  const [isThinking, setIsThinking] = useState(false)

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

  // Generate AI move (simplified AI logic)
  const generateAIMove = useCallback(() => {
    if (gameState.status !== 'playing') return

    setIsThinking(true)
    
    // Simulate thinking time
    setTimeout(() => {
      try {
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
        
        if (moveResult) {
          const newMove: ChessMove = {
            id: Date.now().toString(),
            player: currentPlayer,
            move: `${moveResult.from}-${moveResult.to}`,
            notation: moveResult.san,
            timestamp: new Date(),
            evaluation: Math.random() * 2 - 1, // Random evaluation for demo
            from: moveResult.from,
            to: moveResult.to,
            fen: chess.fen(),
            isCheck: chess.inCheck(),
            isCheckmate: chess.isCheckmate(),
            isStalemate: chess.isStalemate(),
            isDraw: chess.isDraw()
          }
          //Todo : Implement on chiain data save

          //Prompt
          //create api endpoint to store Chessmove to smart contract
          // Contract address
          // ABI
          // Chain ID : 
          // RPC URL : 
             /**
  //    * @dev Record a chess move for a specific match
  //    */
  //   function recordMove(
  //     uint256 _matchId,
  //     PlayerType _player,
  //     string memory _notation,
  //     string memory _fromSquare,
  //     string memory _toSquare,
  //     string memory _fenPosition,
  //     int256 _evaluation,
  //     bool _isCheck,
  //     bool _isCheckmate,
  //     bool _isStalemate,
  //     bool _isDraw
  // ) external onlyAuthorizedOrganizer matchExists(_matchId) matchActive(_matchId) {
      
  //     Match storage currentMatch = matches[_matchId];
      
  //     // Create new move
  //     ChessMove memory newMove = ChessMove({
  //         moveId: matchMoves[_matchId].length + 1,
  //         player: _player,
  //         moveNotation: _notation,
  //         fromSquare: _fromSquare,
  //         toSquare: _toSquare,
  //         fenPosition: _fenPosition,
  //         timestamp: block.timestamp,
  //         evaluation: _evaluation,
  //         isCheck: _isCheck,
  //         isCheckmate: _isCheckmate,
  //         isStalemate: _isStalemate,
  //         isDraw: _isDraw,
  //         blockNumber: block.number
  //     });
      
  //     // Add move to match
  //     matchMoves[_matchId].push(newMove);
  //     currentMatch.totalMoves++;
      
  //     // Check if game ended
  //     if (_isCheckmate) {
  //         _endMatch(_matchId, GameStatus.Checkmate, _player, "Checkmate", _fenPosition);
  //     } else if (_isStalemate) {
  //         _endMatch(_matchId, GameStatus.Stalemate, PlayerType.Claude, "Stalemate", _fenPosition);
  //     } else if (_isDraw) {
  //         _endMatch(_matchId, GameStatus.Draw, PlayerType.Claude, "Draw", _fenPosition);
  //     }
      
  //     emit MoveRecorded(
  //         _matchId,
  //         newMove.moveId,
  //         _player,
  //         _notation,
  //         _fromSquare,
  //         _toSquare,
  //         _isCheck,
  //         block.timestamp
  //     );
  // }
  

          setMoves(prev => [...prev, newMove])
          setLastMove(newMove)
          setBoardPosition(chess.board())
          
          // Check if game ended
          if (!checkGameStatus()) {
            // Switch players
            setCurrentPlayer(current => current === 'Claude' ? 'ChatGPT' : 'Claude')
          }
        }
      } catch (error) {
        console.error('Error generating AI move:', error)
      }
      
      setIsThinking(false)
    }, 2000 + Math.random() * 3000) // 2-5 seconds thinking time
  }, [chess, currentPlayer, gameState.status, checkGameStatus])

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
  }, [chess])

  // Get game status message
  const getGameStatusMessage = () => {
    if (gameState.status === 'playing') {
      if (isThinking) {
        return `${currentPlayer} is thinking...`
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
          </div>
          
          <p className="text-purple-300 mt-2">
            {getGameStatusMessage()}
          </p>
          
          {chess.inCheck() && gameState.status === 'playing' && (
            <p className="text-red-400 text-sm mt-1">
              ⚠️ {currentPlayer} is in check!
            </p>
          )}
          
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-purple-400">
            <span>Move: {Math.ceil(moves.length / 2)}</span>
            <span>•</span>
            <span>FEN: {chess.fen().split(' ')[0]}...</span>
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
  )
} 