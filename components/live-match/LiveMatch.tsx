'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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

export function LiveMatch() {
  const [chess] = useState(() => new Chess())
  const [moves, setMoves] = useState<ChessMove[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<'ChatGPT' | 'Claude'>('Claude')
  const [lastMove, setLastMove] = useState<ChessMove | null>(null)
  const [gameState, setGameState] = useState<GameState>({ status: 'playing' })
  const [boardPosition, setBoardPosition] = useState(chess.board())
  const [isThinking, setIsThinking] = useState(false)
  const [matchId, setMatchId] = useState<number | null>(null)

  // Function to create a match on blockchain
  const createMatchOnBlockchain = useCallback(async () => {
    try {
      console.log('🚀 Starting match creation on blockchain...')
      console.log('🎯 Match details:', {
        whitePlayer: 'Claude',
        blackPlayer: 'ChatGPT',
        initialFen: chess.fen()
      })

      const response = await fetch('/api/create-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whitePlayer: 'Claude',  // Claude plays white
          blackPlayer: 'ChatGPT', // ChatGPT plays black
          initialFen: chess.fen()
        }),
      })

      console.log('📡 Create match response status:', response.status)
      const result = await response.json()
      console.log('📡 Create match response data:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create match')
      }

      console.log('✅ Match created on blockchain successfully:', result)
      
      if (!result.matchId) {
        throw new Error('No match ID returned from blockchain')
      }
      
      const matchId = parseInt(result.matchId)
      console.log('🎯 Parsed match ID:', matchId)
      
      if (isNaN(matchId)) {
        throw new Error(`Invalid match ID returned: ${result.matchId}`)
      }
      
      return matchId
    } catch (error) {
      console.error('❌ Blockchain match creation error:', error)
      throw error
    }
  }, [chess])

  // Function to record move to blockchain
  const recordMoveToBlockchain = async (move: ChessMove, matchId: number) => {
    try {
      const response = await fetch('/api/record-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          player: move.player,
          moveNotation: move.notation,
          fromSquare: move.from,
          toSquare: move.to,
          fenPosition: move.fen,
          evaluation: move.evaluation || 0,
          isCheck: move.isCheck || false,
          isCheckmate: move.isCheckmate || false,
          isStalemate: move.isStalemate || false,
          isDraw: move.isDraw || false,
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to record move')
      }

      console.log('Move recorded to blockchain:', result)
      return result
    } catch (error) {
      console.error('Blockchain recording error:', error)
      throw error
    }
  }

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

  // Create match on blockchain when component mounts
  useEffect(() => {
    const initializeMatch = async () => {
      try {
        console.log('🚀 Attempting to create match on blockchain...')
        const newMatchId = await createMatchOnBlockchain()
        setMatchId(newMatchId)
        console.log('✅ Match initialized with ID:', newMatchId)
        alert(`✅ Match created on blockchain with ID: ${newMatchId}`)
      } catch (error) {
        console.error('❌ Failed to initialize match on blockchain:', error)
        console.log('🔄 Trying to create match via API as fallback...')
        
        // Try to create match via direct API call as fallback
        try {
          const apiResponse = await fetch('/api/create-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              whitePlayer: 'Claude',
              blackPlayer: 'ChatGPT',
              initialFen: chess.fen()
            })
          })
          
          if (apiResponse.ok) {
            const apiResult = await apiResponse.json()
            if (apiResult.success && apiResult.matchId) {
              setMatchId(parseInt(apiResult.matchId))
              console.log('✅ Fallback match created via API with ID:', apiResult.matchId)
              alert(`✅ Match created via API fallback with ID: ${apiResult.matchId}`)
              return
            }
          }
        } catch (apiError) {
          console.error('❌ API fallback also failed:', apiError)
        }
        
        // If both methods fail, disable blockchain recording
        setMatchId(null)
        console.log('❌ Both blockchain methods failed, playing without blockchain recording')
        alert(`❌ Failed to create match on blockchain. Game will continue without blockchain recording.`)
      }
    }

    initializeMatch()
  }, [createMatchOnBlockchain])

  // Generate AI move (simplified AI logic)
  const generateAIMove = useCallback(() => {
    console.log(`🤖 generateAIMove called for player: ${currentPlayer}`)
    console.log(`🎮 Game status: ${gameState.status}`)
    console.log(`🎯 Current match ID: ${matchId}`)

    if (gameState.status !== 'playing') {
      console.log('⏹️ Game not playing, skipping AI move generation')
      return
    }

    console.log(`🧠 ${currentPlayer} is starting to think...`)
    setIsThinking(true)
    
    // Real AI thinking time
    setTimeout(async () => {
      try {
        const possibleMoves = chess.moves({ verbose: true })
        
        if (possibleMoves.length === 0) {
          checkGameStatus()
          setIsThinking(false)
          return
        }

        console.log(`🤖 Calling real AI for ${currentPlayer}...`)
        
        // Call real AI (OpenAI for ChatGPT, Anthropic for Claude)
        const aiProvider = currentPlayer === 'ChatGPT' ? 'openai' : 'anthropic'
        
        try {
          // Get AI move using the agent
          const newFen = await getAIMove(aiProvider, chess.fen())
          
          // Parse the new FEN to get the move that was made
          const tempChess = new Chess(chess.fen())
          const history = tempChess.history({ verbose: true })
          
          // Load the new position and see what move was made
          const newChess = new Chess(newFen)
          const newHistory = newChess.history({ verbose: true })
          
          // The last move should be the AI's move
          const aiMove = newHistory[newHistory.length - 1]
          
          if (aiMove) {
            // Apply the move to our chess instance
            const moveResult = chess.move(aiMove)
            
            if (moveResult) {
              console.log(`🎯 ${currentPlayer} (${aiProvider}) chose: ${moveResult.san}`)
            } else {
              throw new Error('Failed to apply AI move')
            }
          } else {
            throw new Error('No move found in AI response')
          }
        } catch (aiError) {
          console.error(`❌ ${currentPlayer} AI failed:`, aiError)
          console.log('🔄 Falling back to random move...')
          
          // Fallback to random move if AI fails
          const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
          const moveResult = chess.move(randomMove)
          
          if (!moveResult) {
            throw new Error('Fallback move also failed')
          }
        }
        
        // At this point, a move has been made (either AI or fallback)
        const currentHistory = chess.history({ verbose: true })
        const lastMove = currentHistory[currentHistory.length - 1]
        
        if (!lastMove) {
          throw new Error('No move was actually made')
        }
        
        // Create move record from the last move made
        const evaluation = Math.random() * 2 - 1 // Random evaluation for demo
        const newMove: ChessMove = {
          id: Date.now().toString(),
          player: currentPlayer,
          move: `${lastMove.from}-${lastMove.to}`,
          notation: lastMove.san,
          timestamp: new Date(),
          evaluation: evaluation,
          from: lastMove.from,
          to: lastMove.to,
          fen: chess.fen(),
          isCheck: chess.inCheck(),
          isCheckmate: chess.isCheckmate(),
          isStalemate: chess.isStalemate(),
          isDraw: chess.isDraw()
        }

        console.log(`📊 AI Move Details:`, {
          player: currentPlayer,
          move: newMove.notation,
          from: newMove.from,
          to: newMove.to,
          evaluation: evaluation,
          matchId: matchId,
          fen: newMove.fen.substring(0, 50) + '...'
        })
          // Record move to blockchain
          if (matchId) {
            try {
              console.log(`🔗 Recording move to blockchain: ${newMove.notation} (Match ID: ${matchId})`)
              await recordMoveToBlockchain(newMove, matchId)
              console.log(`✅ Move ${newMove.notation} recorded to blockchain successfully`)
            } catch (error) {
              console.error('❌ Failed to record move to blockchain:', error)
              alert(`❌ Failed to record move ${newMove.notation}: ${error instanceof Error ? error.message : String(error)}`)
              // Continue with the game even if blockchain recording fails
            }
          } else {
            console.warn('⚠️ No match ID available, skipping blockchain recording')
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
      }
      
      setIsThinking(false)
    }, 2000 + Math.random() * 3000) // 2-5 seconds thinking time
  }, [chess, currentPlayer, gameState.status, checkGameStatus, matchId, recordMoveToBlockchain])

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
        
        // Record move to blockchain asynchronously (don't wait for it)
        if (matchId) {
          console.log(`🔗 Recording manual move to blockchain: ${newMove.notation} (Match ID: ${matchId})`)
          recordMoveToBlockchain(newMove, matchId)
            .then(() => {
              console.log(`✅ Manual move ${newMove.notation} recorded to blockchain successfully`)
            })
            .catch(error => {
              console.error('❌ Failed to record manual move to blockchain:', error)
              alert(`❌ Failed to record manual move ${newMove.notation}: ${error instanceof Error ? error.message : String(error)}`)
              // Continue with the game even if blockchain recording fails
            })
        } else {
          console.warn('⚠️ No match ID available for manual move, skipping blockchain recording')
        }
        
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
  }, [chess, currentPlayer, checkGameStatus, recordMoveToBlockchain])

  // Test blockchain function
  const testBlockchain = async () => {
    try {
      console.log('🔍 Running blockchain diagnostics...')
      const response = await fetch('/api/test-blockchain')
      const result = await response.json()
      
      console.log('🔍 Blockchain diagnostics result:', result)
      
      if (result.success) {
        alert('✅ Blockchain setup is working correctly!')
      } else {
        alert(`❌ Blockchain issues found:\n${result.summary}\n\nCheck console for details.`)
      }
    } catch (error) {
      console.error('❌ Failed to run blockchain diagnostics:', error)
      alert(`❌ Failed to run diagnostics: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Test move recording function
  const testMoveRecording = async () => {
    try {
      console.log('🧪 Testing move recording...')
      const response = await fetch('/api/test-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json()
      
      console.log('🧪 Test move result:', result)
      
      if (result.success) {
        alert(`✅ Test move recorded successfully!\nTx Hash: ${result.transactionHash}\nBlock: ${result.blockNumber}`)
      } else {
        alert(`❌ Test move failed:\n${result.error}\n\nCheck console for details.`)
      }
    } catch (error) {
      console.error('❌ Failed to test move recording:', error)
      alert(`❌ Test move error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Reset game function
  const resetGame = useCallback(() => {
    chess.reset()
    setMoves([])
    setLastMove(null)
    setCurrentPlayer('Claude')
    setGameState({ status: 'playing' })
    setBoardPosition(chess.board())
    setIsThinking(false)
    setMatchId(null)
    
    // Create a new match when resetting
    createMatchOnBlockchain()
      .then(newMatchId => {
        setMatchId(newMatchId)
        console.log('✅ New match created for reset with ID:', newMatchId)
      })
      .catch(error => {
        console.error('❌ Failed to create new match after reset:', error)
        setMatchId(1) // Fallback
      })
  }, [chess, createMatchOnBlockchain])

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Chess Board */}
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
              <span className="text-purple-300 text-xs">🧠 vs 🤖</span>
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
              {matchId && (
                <>
                  <span>•</span>
                  <span className="text-green-400">Match ID: {matchId}</span>
                </>
              )}
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
            
            {/* Blockchain Debug Section */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button 
                onClick={testBlockchain}
                className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
              >
                🔍 Test Setup
              </button>
              <button 
                onClick={testMoveRecording}
                className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
              >
                🧪 Test Move
              </button>
              {!matchId && (
                <span className="text-xs text-red-400">⚠️ No blockchain match</span>
              )}
              {matchId && (
                <span className="text-xs text-green-400">✅ Match ID: {matchId}</span>
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

      {/* Right Column - Commentary and History */}
      <div className="space-y-6">
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