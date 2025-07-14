'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Chess } from 'chess.js'
import { ChessBoard } from './ChessBoard'
import { LiveCommentary } from './LiveCommentary'
import { MoveHistory } from './MoveHistory'
import { getAIMove } from '@/lib/agent'
import { BettingPanel } from '../betting/BettingPanel'
import { useTournament } from '@/components/providers/TournamentProvider'

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
  const { selectedTournament } = useTournament()
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
              return
            }
          }
        } catch (apiError) {
          console.error('❌ API fallback also failed:', apiError)
        }
        
        // If both methods fail, disable blockchain recording
        setMatchId(null)
        console.log('❌ Both blockchain methods failed, playing without blockchain recording')
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
        console.log('✅ Blockchain setup is working correctly!')
      } else {
        console.log(`❌ Blockchain issues found: ${result.summary}`)
      }
    } catch (error) {
      console.error('❌ Failed to run blockchain diagnostics:', error)
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
        console.log(`✅ Test move recorded successfully! Tx Hash: ${result.transactionHash}, Block: ${result.blockNumber}`)
      } else {
        console.log(`❌ Test move failed: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Failed to test move recording:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tournament Header */}
        {selectedTournament && (
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`bg-gradient-to-r ${selectedTournament.theme.gradient} backdrop-blur-md rounded-2xl p-6 border border-white/20`}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-4xl">{selectedTournament.emoji}</div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{selectedTournament.name}</h1>
                  <p className="text-purple-200">{selectedTournament.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-purple-300 text-sm">Prize Pool</div>
                  <div className="text-white font-bold text-lg">{selectedTournament.prizePool}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-purple-300 text-sm">Participants</div>
                  <div className="text-white font-bold text-lg">{selectedTournament.participants}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-purple-300 text-sm">Time Left</div>
                  <div className="text-white font-bold text-lg">{selectedTournament.timeLeft}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Chess Board */}
          <motion.div 
            className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 p-2">
              <div className="bg-white/5 rounded-2xl p-6">
                {/* Enhanced Game Status */}
                <div className="text-center mb-8">
                  <motion.div 
                    className="mb-6"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-3">Current Position</h2>
                    <div className="text-lg text-purple-300 font-medium">
                      {getGameStatusMessage()}
                    </div>
                  </motion.div>
                  
                  {/* Enhanced Player Turn Indicator */}
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <motion.div 
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all ${
                        currentPlayer === 'Claude' ? 'border-purple-400 bg-purple-400/20' : 'border-white/20 bg-white/5'
                      }`}
                      animate={currentPlayer === 'Claude' ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <span className="text-2xl">🧠</span>
                      <span className="text-white font-semibold">Claude</span>
                      {currentPlayer === 'Claude' && isThinking && (
                        <div className="flex space-x-1">
                          <motion.div className="w-1 h-1 bg-purple-400 rounded-full" animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} />
                          <motion.div className="w-1 h-1 bg-purple-400 rounded-full" animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />
                          <motion.div className="w-1 h-1 bg-purple-400 rounded-full" animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} />
                        </div>
                      )}
                    </motion.div>
                    
                    <div className="text-white/50 text-xl font-bold">VS</div>
                    
                    <motion.div 
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all ${
                        currentPlayer === 'ChatGPT' ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/20 bg-white/5'
                      }`}
                      animate={currentPlayer === 'ChatGPT' ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <span className="text-2xl">🤖</span>
                      <span className="text-white font-semibold">ChatGPT</span>
                      {currentPlayer === 'ChatGPT' && isThinking && (
                        <div className="flex space-x-1">
                          <motion.div className="w-1 h-1 bg-cyan-400 rounded-full" animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} />
                          <motion.div className="w-1 h-1 bg-cyan-400 rounded-full" animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />
                          <motion.div className="w-1 h-1 bg-cyan-400 rounded-full" animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} />
                        </div>
                      )}
                    </motion.div>
          </div>
          
          {chess.inCheck() && gameState.status === 'playing' && (
                    <motion.div 
                      className="bg-red-500/20 border border-red-400/50 rounded-xl p-3 mb-4"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <p className="text-red-400 font-bold flex items-center justify-center gap-2">
              ⚠️ {currentPlayer} is in check!
            </p>
                    </motion.div>
                  )}
                  
                  {/* Enhanced Game Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="text-purple-300 text-sm">Move</div>
                      <div className="text-white text-xl font-bold">{Math.ceil(moves.length / 2)}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="text-purple-300 text-sm">Pieces</div>
                      <div className="text-white text-xl font-bold">{chess.board().flat().filter(piece => piece !== null).length}</div>
                    </div>
                    {matchId && (
                      <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-3">
                        <div className="text-green-300 text-sm">Match ID</div>
                        <div className="text-green-400 text-xl font-bold">{matchId}</div>
                      </div>
                    )}
            {gameState.status !== 'playing' && (
                      <div className="col-span-1">
                        <motion.button 
                  onClick={resetGame}
                          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-xl transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                >
                  New Game
                        </motion.button>
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced Blockchain Debug Section */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <motion.button 
                      onClick={testBlockchain}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all text-sm font-medium border border-purple-500/50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🔍 Test Setup
                    </motion.button>
                    <motion.button 
                      onClick={testMoveRecording}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all text-sm font-medium border border-blue-500/50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🧪 Test Move
                    </motion.button>
                    {!matchId && (
                      <div className="bg-red-500/10 border border-red-400/30 px-3 py-2 rounded-xl">
                        <span className="text-red-400 text-xs font-medium">⚠️ No blockchain match</span>
                      </div>
            )}
          </div>
        </div>

                {/* Chess Board Container */}
                <motion.div 
                  className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl shadow-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
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
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Betting, Commentary and History */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
                                              >
            {/* Betting Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <BettingPanel 
                isGameActive={gameState.status === 'playing'}
                currentPlayer={currentPlayer}
              />
            </motion.div>
            
            {/* Live Commentary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <LiveCommentary 
                moves={moves}
                currentPlayer={currentPlayer}
                gameState={gameState}
                isThinking={isThinking}
              />
            </motion.div>
            
            {/* Move History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <MoveHistory moves={moves} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 