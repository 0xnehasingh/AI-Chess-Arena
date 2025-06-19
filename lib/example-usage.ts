import { getAIMove, getAvailableMoves, getPositionInfo, testAIAvailability, getRandomMove } from './agent'

/**
 * Example usage of the AI agent functions
 * This file demonstrates how to use the AI chess agents via API routes
 */

// Starting position FEN
const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

/**
 * Example: Get a move from OpenAI (ChatGPT) via API
 */
export async function exampleOpenAIMove() {
  try {
    console.log('Getting move from OpenAI via API...')
    const newFen = await getAIMove('openai', STARTING_FEN)
    console.log('OpenAI move result:', newFen)
    return newFen
  } catch (error) {
    console.error('OpenAI move failed:', error)
    throw error
  }
}

/**
 * Example: Get a move from Anthropic (Claude) via API
 */
export async function exampleAnthropicMove() {
  try {
    console.log('Getting move from Anthropic via API...')
    const newFen = await getAIMove('anthropic', STARTING_FEN)
    console.log('Anthropic move result:', newFen)
    return newFen
  } catch (error) {
    console.error('Anthropic move failed:', error)
    throw error
  }
}

/**
 * Example: Test AI availability before starting a game
 */
export async function exampleTestAIAvailability() {
  console.log('Testing AI provider availability...')
  
  const openaiAvailable = await testAIAvailability('openai')
  const anthropicAvailable = await testAIAvailability('anthropic')
  
  console.log('OpenAI available:', openaiAvailable)
  console.log('Anthropic available:', anthropicAvailable)
  
  return { openai: openaiAvailable, anthropic: anthropicAvailable }
}

/**
 * Example: Play a full game between OpenAI and Anthropic with fallbacks
 */
export async function exampleAIvsAI() {
  let currentFen = STARTING_FEN
  let moveCount = 0
  const maxMoves = 50 // Prevent infinite games
  
  console.log('Starting AI vs AI game...')
  console.log('Initial position:', currentFen)
  
  // Test AI availability first
  const availability = await exampleTestAIAvailability()
  
  while (moveCount < maxMoves) {
    const positionInfo = getPositionInfo(currentFen)
    
    if (positionInfo.isGameOver) {
      console.log('Game Over!')
      if (positionInfo.isCheckmate) {
        const winner = positionInfo.turn === 'white' ? 'Black (Claude)' : 'White (OpenAI)'
        console.log(`${winner} wins by checkmate!`)
      } else if (positionInfo.isStalemate) {
        console.log('Game ends in stalemate')
      } else if (positionInfo.isDraw) {
        console.log('Game ends in draw')
      }
      break
    }
    
    const currentPlayer = positionInfo.turn === 'white' ? 'OpenAI (White)' : 'Claude (Black)'
    const provider = positionInfo.turn === 'white' ? 'openai' : 'anthropic'
    const isProviderAvailable = provider === 'openai' ? availability.openai : availability.anthropic
    
    console.log(`\nMove ${positionInfo.moveNumber}: ${currentPlayer} to move`)
    console.log(`Available moves: ${positionInfo.legalMoves.join(', ')}`)
    
    try {
      let newFen: string
      
      if (isProviderAvailable) {
        // Try AI move
        console.log(`Using ${provider} AI for move...`)
        newFen = await getAIMove(provider, currentFen)
      } else {
        // Fallback to random move
        console.log(`${provider} AI not available, using random move...`)
        newFen = getRandomMove(currentFen)
      }
      
      currentFen = newFen
      moveCount++
      
      console.log(`New position: ${newFen}`)
      
      // Add delay between moves
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error) {
      console.error(`Move failed for ${currentPlayer}:`, error)
      
      // Try fallback to random move
      try {
        console.log('Falling back to random move...')
        currentFen = getRandomMove(currentFen)
        moveCount++
      } catch (fallbackError) {
        console.error('Fallback move also failed:', fallbackError)
        break
      }
    }
  }
  
  if (moveCount >= maxMoves) {
    console.log('Game stopped due to move limit')
  }
  
  return currentFen
}

/**
 * Example: Test position analysis (client-side only, no API needed)
 */
export function examplePositionAnalysis() {
  console.log('Analyzing starting position...')
  const info = getPositionInfo(STARTING_FEN)
  console.log('Position info:', info)
  
  console.log('\nAnalyzing a tactical position...')
  // Scholar's mate setup
  const tacticalFen = 'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3'
  const tacticalInfo = getPositionInfo(tacticalFen)
  console.log('Tactical position info:', tacticalInfo)
  
  return { starting: info, tactical: tacticalInfo }
}

/**
 * Example: Test move validation (client-side only, no API needed)
 */
export function exampleMoveValidation() {
  const moves = getAvailableMoves(STARTING_FEN)
  console.log('Legal opening moves:', moves)
  
  // Test some moves
  const testMoves = ['e4', 'e5', 'Ke2', 'axb8'] // Mix of legal and illegal
  
  testMoves.forEach(move => {
    try {
      const isValid = moves.includes(move)
      console.log(`Move "${move}": ${isValid ? 'LEGAL' : 'ILLEGAL'}`)
    } catch (error) {
      console.log(`Move "${move}": ERROR - ${error}`)
    }
  })
}

/**
 * Example: Test random move generation (for fallback scenarios)
 */
export function exampleRandomMoves() {
  console.log('Testing random move generation...')
  
  let currentFen = STARTING_FEN
  const moveCount = 5
  
  for (let i = 0; i < moveCount; i++) {
    try {
      const info = getPositionInfo(currentFen)
      console.log(`\nMove ${i + 1}: ${info.turn} to move`)
      console.log(`Available: ${info.legalMoves.join(', ')}`)
      
      currentFen = getRandomMove(currentFen)
      console.log(`After random move: ${currentFen}`)
      
    } catch (error) {
      console.error(`Random move ${i + 1} failed:`, error)
      break
    }
  }
  
  return currentFen
}

// Client-side testing (can be safely run in browser)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // These functions are safe to run in browser (no API calls)
  console.log('Running client-side chess examples...')
  
  // examplePositionAnalysis()
  // exampleMoveValidation()
  // exampleRandomMoves()
  
  // These require API calls and proper API keys:
  // exampleTestAIAvailability().then(console.log).catch(console.error)
  // exampleOpenAIMove().catch(console.error)
  // exampleAnthropicMove().catch(console.error)
  // exampleAIvsAI().catch(console.error)
} 