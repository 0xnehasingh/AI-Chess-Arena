import { Chess } from 'chess.js'

/**
 * Client-side AI agent that calls server-side API routes
 * This avoids exposing API keys in the browser
 */

interface AIResponse {
  success: boolean
  newFen?: string
  provider?: string
  error?: string
}

/**
 * Get AI move from specified provider via API route
 * @param provider - Either 'openai' or 'anthropic'
 * @param fen - Current board position in FEN notation
 * @returns Promise<string> - New FEN position after the AI move
 * @throws Error if move is illegal or API call fails
 */
export async function getAIMove(provider: 'openai' | 'anthropic', fen: string): Promise<string> {
  // Validate FEN format on client side
  try {
    new Chess(fen)
  } catch (error) {
    throw new Error(`Invalid FEN provided: ${fen}`)
  }

  try {
    const response = await fetch('/api/ai-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider, fen }),
    })

    const data: AIResponse = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    if (!data.success || !data.newFen) {
      throw new Error(data.error || 'AI move generation failed')
    }

    return data.newFen

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI move generation failed: ${error.message}`)
    }
    throw new Error('AI move generation failed with unknown error')
  }
}

/**
 * Utility function to get available moves for a position
 */
export function getAvailableMoves(fen: string): string[] {
  try {
    const chess = new Chess(fen)
    return chess.moves()
  } catch (error) {
    throw new Error(`Invalid FEN provided: ${fen}`)
  }
}

/**
 * Utility function to validate if a move is legal in a position
 */
export function isValidMove(fen: string, move: string): boolean {
  try {
    const chess = new Chess(fen)
    const result = chess.move(move)
    return result !== null
  } catch {
    return false
  }
}

/**
 * Utility function to get position evaluation context
 */
export function getPositionInfo(fen: string) {
  try {
    const chess = new Chess(fen)
    return {
      turn: chess.turn() === 'w' ? 'white' : 'black',
      moveNumber: chess.moveNumber(),
      isCheck: chess.inCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isDraw: chess.isDraw(),
      isGameOver: chess.isGameOver(),
      legalMoves: chess.moves(),
      fen: chess.fen()
    }
  } catch (error) {
    throw new Error(`Invalid FEN provided: ${fen}`)
  }
}

/**
 * Test if AI API is available (useful for graceful degradation)
 */
export async function testAIAvailability(provider: 'openai' | 'anthropic'): Promise<boolean> {
  try {
    // Test with starting position
    const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    await getAIMove(provider, startingFen)
    return true
  } catch {
    return false
  }
}

/**
 * Get a random legal move (fallback when AI is not available)
 */
export function getRandomMove(fen: string): string {
  const chess = new Chess(fen)
  const legalMoves = chess.moves()
  
  if (legalMoves.length === 0) {
    throw new Error('No legal moves available - game is over')
  }
  
  const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)]
  const moveResult = chess.move(randomMove)
  
  if (!moveResult) {
    throw new Error(`Failed to apply random move: ${randomMove}`)
  }
  
  return chess.fen()
} 