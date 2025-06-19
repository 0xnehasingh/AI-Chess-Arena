'use client'

import { useState } from 'react'
import { getAIMove, testAIAvailability, getPositionInfo, getRandomMove } from '@/lib/agent'

export default function TestAIPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentFen, setCurrentFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

  const addResult = (result: any) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date() }])
  }

  const testAIAvailabilityFull = async () => {
    setIsLoading(true)
    addResult({ type: 'info', message: 'Testing AI availability...' })

    try {
      const openaiTest = await testAIAvailability('openai')
      const claudeTest = await testAIAvailability('anthropic')

      addResult({ 
        type: 'success', 
        message: `OpenAI available: ${openaiTest}, Claude available: ${claudeTest}` 
      })

      return { openai: openaiTest, claude: claudeTest }
    } catch (error) {
      addResult({ 
        type: 'error', 
        message: `Availability test failed: ${error}` 
      })
      return { openai: false, claude: false }
    } finally {
      setIsLoading(false)
    }
  }

  const testOpenAIMove = async () => {
    setIsLoading(true)
    addResult({ type: 'info', message: 'Testing OpenAI chess move...' })

    try {
      const startTime = Date.now()
      const newFen = await getAIMove('openai', currentFen)
      const endTime = Date.now()

      const positionInfo = getPositionInfo(newFen)
      
      addResult({ 
        type: 'success', 
        message: `OpenAI move successful in ${endTime - startTime}ms`,
        details: {
          oldFen: currentFen,
          newFen,
          turn: positionInfo.turn,
          moveNumber: positionInfo.moveNumber,
          isCheck: positionInfo.isCheck
        }
      })

      setCurrentFen(newFen)
      return newFen
    } catch (error) {
      addResult({ 
        type: 'error', 
        message: `OpenAI move failed: ${error}` 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testClaudeMove = async () => {
    setIsLoading(true)
    addResult({ type: 'info', message: 'Testing Claude chess move...' })

    try {
      const startTime = Date.now()
      const newFen = await getAIMove('anthropic', currentFen)
      const endTime = Date.now()

      const positionInfo = getPositionInfo(newFen)
      
      addResult({ 
        type: 'success', 
        message: `Claude move successful in ${endTime - startTime}ms`,
        details: {
          oldFen: currentFen,
          newFen,
          turn: positionInfo.turn,
          moveNumber: positionInfo.moveNumber,
          isCheck: positionInfo.isCheck
        }
      })

      setCurrentFen(newFen)
      return newFen
    } catch (error) {
      addResult({ 
        type: 'error', 
        message: `Claude move failed: ${error}` 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testAIvsAI = async () => {
    setIsLoading(true)
    addResult({ type: 'info', message: 'Starting AI vs AI test game...' })

    try {
      let gameFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      setCurrentFen(gameFen)

      for (let i = 0; i < 6; i++) { // Test 3 moves each
        const provider = i % 2 === 0 ? 'openai' : 'anthropic'
        const playerName = provider === 'openai' ? 'OpenAI' : 'Claude'

        addResult({ 
          type: 'info', 
          message: `Move ${Math.floor(i/2) + 1}: ${playerName} thinking...` 
        })

        const startTime = Date.now()
        gameFen = await getAIMove(provider, gameFen)
        const endTime = Date.now()

        const positionInfo = getPositionInfo(gameFen)
        
        addResult({ 
          type: 'success', 
          message: `${playerName} moved in ${endTime - startTime}ms`,
          details: {
            moveNumber: positionInfo.moveNumber,
            turn: positionInfo.turn,
            isCheck: positionInfo.isCheck,
            fen: gameFen.split(' ')[0] + '...'
          }
        })

        if (positionInfo.isGameOver) {
          addResult({ 
            type: 'info', 
            message: `Game ended: ${positionInfo.isCheckmate ? 'Checkmate' : positionInfo.isStalemate ? 'Stalemate' : 'Draw'}` 
          })
          break
        }

        // Small delay between moves
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      setCurrentFen(gameFen)
      addResult({ type: 'success', message: 'AI vs AI test completed successfully!' })

    } catch (error) {
      addResult({ 
        type: 'error', 
        message: `AI vs AI test failed: ${error}` 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetPosition = () => {
    setCurrentFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    addResult({ type: 'info', message: 'Position reset to starting position' })
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          🤖 AI Chess Agents Test Page
        </h1>
        
        {/* Current Position */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Position</h2>
          <div className="bg-black/20 p-3 rounded-lg font-mono text-sm text-green-300 break-all">
            {currentFen}
          </div>
          <div className="mt-2 text-purple-300 text-sm">
            {(() => {
              try {
                const info = getPositionInfo(currentFen)
                return `Turn: ${info.turn}, Move: ${info.moveNumber}, Legal moves: ${info.legalMoves.length}`
              } catch {
                return 'Invalid position'
              }
            })()}
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={testAIAvailabilityFull}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Test Availability
            </button>
            
            <button
              onClick={testOpenAIMove}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Test OpenAI Move
            </button>
            
            <button
              onClick={testClaudeMove}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Test Claude Move
            </button>
            
            <button
              onClick={testAIvsAI}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              AI vs AI Game
            </button>
            
            <button
              onClick={resetPosition}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Reset Position
            </button>
            
            <button
              onClick={clearResults}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Test Results</h2>
            {isLoading && (
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Testing...</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-purple-300 text-center py-8">
                No test results yet. Click a test button to get started!
              </p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    result.type === 'success'
                      ? 'bg-green-900/20 border-green-400 text-green-300'
                      : result.type === 'error'
                      ? 'bg-red-900/20 border-red-400 text-red-300'
                      : 'bg-blue-900/20 border-blue-400 text-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="flex-1">{result.message}</p>
                    <span className="text-xs opacity-70 ml-2">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {result.details && (
                    <div className="mt-2 text-xs opacity-80 bg-black/20 p-2 rounded font-mono">
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 