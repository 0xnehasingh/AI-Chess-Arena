import { NextRequest, NextResponse } from 'next/server'
import { Chess } from 'chess.js'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

interface ChessMoveResponse {
  move: string
  reasoning: string
}

/**
 * Get chess move from Claude for BOTH players
 * This version uses only Anthropic API, making ChatGPT also use Claude
 */
async function getClaudeMove(fen: string, playerName: string = 'Claude'): Promise<string> {
  const chess = new Chess(fen)
  const legalMoves = chess.moves()
  
  if (legalMoves.length === 0) {
    throw new Error('No legal moves available - game is over')
  }

  const currentTurn = chess.turn() === 'w' ? 'White' : 'Black'
  const moveNumber = Math.ceil(chess.moveNumber())
  
  // Get position evaluation context
  const isInCheck = chess.inCheck()
  const isCheckmate = chess.isCheckmate()
  const isStalemate = chess.isStalemate()
  
  const systemPrompt = `You are playing chess as ${playerName} (${currentTurn}). You are a strong chess player with deep positional understanding.

Current position FEN: ${fen}
Move number: ${moveNumber}
${isInCheck ? 'WARNING: You are in check and must respond!' : ''}
${isCheckmate ? 'Position is checkmate' : ''}
${isStalemate ? 'Position is stalemate' : ''}

Available legal moves: ${legalMoves.join(', ')}

Evaluate based on:
1. Immediate tactical threats and opportunities
2. Piece activity and development
3. King safety and pawn structure
4. Long-term strategic considerations
5. Endgame knowledge if applicable

Select the best move and provide reasoning.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using Haiku for faster responses
      max_tokens: 200,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please select the best chess move from these options: ${legalMoves.join(', ')}. Respond in this exact format:
MOVE: [your chosen move]
REASONING: [brief explanation]`
        }
      ]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse the response
    const text = content.text
    const moveMatch = text.match(/MOVE:\s*([^\n]+)/i)
    const reasoningMatch = text.match(/REASONING:\s*([^\n]+)/i)

    if (!moveMatch) {
      throw new Error('Could not parse move from Claude response')
    }

    const selectedMove = moveMatch[1].trim()
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'Strategic move'

    // Validate the move is legal
    if (!legalMoves.includes(selectedMove)) {
      // Try to find a close match
      const closeMatch = legalMoves.find(m => m.toLowerCase() === selectedMove.toLowerCase())
      if (closeMatch) {
        console.log(`Claude selected: ${closeMatch} (case-corrected) - ${reasoning}`)
        chess.move(closeMatch)
      } else {
        throw new Error(`Claude selected illegal move: ${selectedMove}. Legal moves: ${legalMoves.join(', ')}`)
      }
    } else {
      // Apply the move
      const moveResult = chess.move(selectedMove)
      if (!moveResult) {
        throw new Error(`Failed to apply move: ${selectedMove}`)
      }
      console.log(`${playerName} (Claude) selected: ${selectedMove} - ${reasoning}`)
    }

    return chess.fen()
  } catch (error) {
    console.error('Error getting move from Claude:', error)
    // Fallback: select a random legal move
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)]
    chess.move(randomMove)
    console.log(`Fallback: Random move selected: ${randomMove}`)
    return chess.fen()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fen, champion } = await request.json()
    
    if (!fen) {
      return NextResponse.json(
        { error: 'Missing FEN position' },
        { status: 400 }
      )
    }

    console.log(`\n🎮 ${champion || 'AI'} move requested for position:`, fen)
    
    // Both ChatGPT and Claude use the same Claude API
    const playerName = champion === 'ChatGPT' ? 'ChatGPT (powered by Claude)' : 'Claude'
    const newFen = await getClaudeMove(fen, playerName)
    
    return NextResponse.json({ 
      fen: newFen,
      message: `${champion} made a move using Claude AI`
    })
    
  } catch (error) {
    console.error('AI move error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate move' },
      { status: 500 }
    )
  }
}