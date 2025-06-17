'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChessBoard } from './ChessBoard'

export interface ChessMove {
  id: string
  player: 'ChatGPT' | 'Claude'
  move: string
  notation: string
  timestamp: Date
  evaluation?: number
}

const mockMoves: ChessMove[] = [
  {
    id: '1',
    player: 'Claude',
    move: 'e2-e4',
    notation: 'e4',
    timestamp: new Date(Date.now() - 180000),
    evaluation: 0.2
  },
  {
    id: '2',
    player: 'ChatGPT',
    move: 'e7-e5',
    notation: 'e5',
    timestamp: new Date(Date.now() - 150000),
    evaluation: 0.1
  },
  {
    id: '3',
    player: 'Claude',
    move: 'g1-f3',
    notation: 'Nf3',
    timestamp: new Date(Date.now() - 120000),
    evaluation: 0.3
  },
  {
    id: '4',
    player: 'ChatGPT',
    move: 'b8-c6',
    notation: 'Nc6',
    timestamp: new Date(Date.now() - 90000),
    evaluation: 0.2
  }
]

export function LiveMatch() {
  const [moves, setMoves] = useState<ChessMove[]>(mockMoves)
  const [currentPlayer, setCurrentPlayer] = useState<'ChatGPT' | 'Claude'>('Claude')
  const [lastMove, setLastMove] = useState<ChessMove | null>(null)

  // Simulate live game updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate a new move every 15 seconds
      if (Math.random() > 0.5) {
        const newMove: ChessMove = {
          id: (moves.length + 1).toString(),
          player: currentPlayer,
          move: 'a1-a2', // This would be a real chess move
          notation: currentPlayer === 'Claude' ? 'Bb5' : 'a6',
          timestamp: new Date(),
          evaluation: Math.random() * 2 - 1 // Random evaluation between -1 and 1
        }

        setMoves(prev => [...prev, newMove])
        setLastMove(newMove)
        setCurrentPlayer(current => current === 'Claude' ? 'ChatGPT' : 'Claude')
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [moves.length, currentPlayer])

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
      <div className="p-6">
        {/* Game Status */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">Live Game</span>
          </div>
          <p className="text-purple-300 mt-2">
            🟢 Claude plays aggressive Sicilian defense
          </p>
          <p className="text-purple-400 text-sm">
            Last move: e4-e5 • Next move in 3.2s
          </p>
        </div>

        {/* Chess Board */}
        <ChessBoard 
          moves={moves} 
          currentPlayer={currentPlayer}
          lastMove={lastMove}
        />
      </div>
    </div>
  )
} 