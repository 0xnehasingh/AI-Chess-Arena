import { NextRequest, NextResponse } from 'next/server'
import { Chess } from 'chess.js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Common JSON schema for chess move selection
const chessMoveSchema = {
  type: 'object',
  properties: {
    move: {
      type: 'string',
      description: 'The chess move in standard algebraic notation (e.g., "e4", "Nf3", "O-O", "Qxe7+")'
    },
    reasoning: {
      type: 'string',
      description: 'Brief explanation of why this move was chosen (tactical, positional, or strategic reasoning)'
    }
  },
  required: ['move', 'reasoning']
} as const

// Initialize clients on server side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

interface ChessMoveResponse {
  move: string
  reasoning: string
}

/**
 * Get the best chess move from OpenAI using function calling
 */
async function getOpenAIMove(fen: string): Promise<string> {
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
  
  const systemPrompt = `You are a strong chess engine. Analyze the position and choose the best move.
  
Current position: ${fen}
Turn: ${currentTurn}
Move number: ${moveNumber}
${isInCheck ? 'WARNING: You are in check!' : ''}
${isCheckmate ? 'Position is checkmate' : ''}
${isStalemate ? 'Position is stalemate' : ''}

Available legal moves: ${legalMoves.join(', ')}

Consider:
1. Tactical opportunities (captures, checks, threats)
2. Positional factors (piece development, king safety, pawn structure)
3. Strategic goals (control of center, piece coordination)
4. Endgame principles if applicable

Choose the strongest move and explain your reasoning.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Analyze this chess position and select the best move from the available options: ${legalMoves.join(', ')}`
      }
    ],
    functions: [
      {
        name: 'select_chess_move',
        description: 'Select the best chess move from the available legal moves',
        parameters: chessMoveSchema
      }
    ],
    function_call: { name: 'select_chess_move' },
    temperature: 0.3,
    max_tokens: 500
  })

  const functionCall = response.choices[0]?.message?.function_call
  if (!functionCall || !functionCall.arguments) {
    throw new Error('OpenAI did not return a function call')
  }

  const moveResponse: ChessMoveResponse = JSON.parse(functionCall.arguments)
  const selectedMove = moveResponse.move

  // Validate the move is legal
  if (!legalMoves.includes(selectedMove)) {
    throw new Error(`OpenAI selected illegal move: ${selectedMove}. Legal moves: ${legalMoves.join(', ')}`)
  }

  // Apply the move and return new FEN
  const moveResult = chess.move(selectedMove)
  if (!moveResult) {
    throw new Error(`Failed to apply move: ${selectedMove}`)
  }

  console.log(`OpenAI selected: ${selectedMove} - ${moveResponse.reasoning}`)
  return chess.fen()
}

/**
 * Get the best chess move from Anthropic Claude using tool calling
 */
async function getAnthropicMove(fen: string): Promise<string> {
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
  
  const systemPrompt = `You are a strong chess engine with deep positional understanding. Analyze the given chess position and select the best move.

Current position FEN: ${fen}
Turn: ${currentTurn}
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

Use the select_chess_move tool to choose your move.`

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    temperature: 0.3,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Please analyze this chess position and select the best move from these legal options: ${legalMoves.join(', ')}`
      }
    ],
    tools: [
      {
        name: 'select_chess_move',
        description: 'Select the best chess move from the available legal moves',
        input_schema: {
          type: 'object',
          properties: {
            move: {
              type: 'string',
              description: 'The chess move in standard algebraic notation (e.g., "e4", "Nf3", "O-O", "Qxe7+")'
            },
            reasoning: {
              type: 'string',
              description: 'Brief explanation of why this move was chosen (tactical, positional, or strategic reasoning)'
            }
          },
          required: ['move', 'reasoning']
        }
      }
    ],
    tool_choice: { type: 'tool', name: 'select_chess_move' }
  })

  const toolUse = response.content.find(content => content.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a tool use response')
  }

  const moveResponse = toolUse.input as ChessMoveResponse
  const selectedMove = moveResponse.move

  // Validate the move is legal
  if (!legalMoves.includes(selectedMove)) {
    throw new Error(`Claude selected illegal move: ${selectedMove}. Legal moves: ${legalMoves.join(', ')}`)
  }

  // Apply the move and return new FEN
  const moveResult = chess.move(selectedMove)
  if (!moveResult) {
    throw new Error(`Failed to apply move: ${selectedMove}`)
  }

  console.log(`Claude selected: ${selectedMove} - ${moveResponse.reasoning}`)
  return chess.fen()
}

export async function POST(request: NextRequest) {
  let requestBody: any = null
  
  try {
    // Parse request body once and reuse it
    requestBody = await request.json()
    const { provider, fen } = requestBody

    // Validate input
    if (!provider || !fen) {
      return NextResponse.json(
        { error: 'Missing provider or fen parameter' },
        { status: 400 }
      )
    }

    if (provider !== 'openai' && provider !== 'anthropic') {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "openai" or "anthropic"' },
        { status: 400 }
      )
    }

    // Validate FEN format
    try {
      new Chess(fen)
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid FEN provided: ${fen}` },
        { status: 400 }
      )
    }

    // Check if API keys are available
    if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    let newFen: string

    if (provider === 'openai') {
      newFen = await getOpenAIMove(fen)
    } else {
      newFen = await getAnthropicMove(fen)
    }

    return NextResponse.json({
      success: true,
      newFen,
      provider
    })

  } catch (error) {
    console.error('AI move generation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: `AI move generation failed: ${errorMessage}`,
        provider: requestBody?.provider || 'unknown'
      },
      { status: 500 }
    )
  }
} 