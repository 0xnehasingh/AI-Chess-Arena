import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xE47D88e3c52e0D2B14298Cd1Dd9A9800deAbf225'
const RPC_URL = 'https://rpc.testnet.moonbeam.network'

const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "enum ChessTournament.PlayerType",
        "name": "_whitePlayer",
        "type": "uint8"
      },
      {
        "internalType": "enum ChessTournament.PlayerType",
        "name": "_blackPlayer",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "_initialFen",
        "type": "string"
      }
    ],
    "name": "createMatch",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

interface CreateMatchData {
  whitePlayer: 'ChatGPT' | 'Claude'
  blackPlayer: 'ChatGPT' | 'Claude'
  initialFen?: string
}

export async function POST(request: NextRequest) {
  try {
    const matchData: CreateMatchData = await request.json()

    // Validate required fields
    if (!matchData.whitePlayer || !matchData.blackPlayer) {
      return NextResponse.json(
        { error: 'Missing required fields: whitePlayer and blackPlayer' },
        { status: 400 }
      )
    }

    // Set up provider and signer
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    
    // Get private key from environment variables
    const privateKey = process.env.WALLET_PRIVATE_KEY
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Wallet private key not configured' },
        { status: 500 }
      )
    }

    const wallet = new ethers.Wallet(privateKey, provider)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet)

    // Convert player names to enum values (0 = Claude, 1 = ChatGPT)
    const whitePlayerType = matchData.whitePlayer === 'Claude' ? 0 : 1
    const blackPlayerType = matchData.blackPlayer === 'Claude' ? 0 : 1

    // Use provided FEN or default starting position
    const initialFen = matchData.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

    // Create the match on the blockchain
    const tx = await contract.createMatch(whitePlayerType, blackPlayerType, initialFen)
    
    // Wait for transaction confirmation
    const receipt = await tx.wait()

    // Extract match ID from transaction logs
    let matchId = null
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log)
        if (parsedLog?.name === 'MatchCreated') {
          matchId = parsedLog.args.matchId.toString()
          break
        }
      } catch (error) {
        // Skip logs that can't be parsed
        continue
      }
    }

    return NextResponse.json({
      success: true,
      matchId,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      whitePlayer: matchData.whitePlayer,
      blackPlayer: matchData.blackPlayer,
      initialFen
    })

  } catch (error) {
    console.error('Error creating match on blockchain:', error)
    
    let errorMessage = 'Failed to create match'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 