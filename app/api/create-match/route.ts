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
  },
  {
    "inputs": [],
    "name": "getContractStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "_totalMatches",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_activeMatches",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_completedMatches",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_verifiedMatches",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "matchId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum ChessTournament.PlayerType",
        "name": "whitePlayer",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "enum ChessTournament.PlayerType",
        "name": "blackPlayer",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "initialFen",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "MatchCreated",
    "type": "event"
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

    // Get private key from environment variables first
    const privateKey = process.env.WALLET_PRIVATE_KEY
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Wallet private key not configured' },
        { status: 500 }
      )
    }

    // Set up provider with timeout
    const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
      staticNetwork: ethers.Network.from(1287)
    })
    
    // Test network connection
    try {
      console.log('📡 Testing network connection...')
      const network = await Promise.race([
        provider.getNetwork(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network connection timeout')), 15000)
        )
      ]) as ethers.Network
      
      console.log('✅ Network connected:', network.chainId.toString())
    } catch (networkError) {
      console.error('❌ Network connection failed:', networkError)
      return NextResponse.json(
        { error: 'Failed to connect to blockchain network' },
        { status: 503 }
      )
    }

    const wallet = new ethers.Wallet(privateKey, provider)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet)

    // Convert player names to enum values (0 = Claude, 1 = ChatGPT)
    const whitePlayerType = matchData.whitePlayer === 'Claude' ? 0 : 1
    const blackPlayerType = matchData.blackPlayer === 'Claude' ? 0 : 1

    // Use provided FEN or default starting position
    const initialFen = matchData.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

    // Get current stats to predict the next match ID
    const statsBefore = await contract.getContractStats()
    const expectedMatchId = parseInt(statsBefore._totalMatches.toString()) + 1
    console.log('🎯 Creating match with players:', { whitePlayerType, blackPlayerType })
    console.log('📊 Expected match ID:', expectedMatchId)
    
    // Call the contract function and wait for the result
    const tx = await contract.createMatch(whitePlayerType, blackPlayerType, initialFen)
    console.log('📤 Transaction sent:', tx.hash)
    
    // Wait for transaction confirmation
    const receipt = await tx.wait()
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber)

    // First try to extract match ID from events
    let matchId = null
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log)
        if (parsedLog?.name === 'MatchCreated') {
          matchId = parsedLog.args.matchId.toString()
          console.log('🎯 Match ID extracted from event:', matchId)
          break
        }
      } catch (error) {
        // Skip logs that can't be parsed
        continue
      }
    }

    // If event parsing fails, use the expected sequential match ID
    if (!matchId) {
      console.log('⚠️ Could not parse MatchCreated event, using expected sequential ID...')
      
      // Get updated stats to confirm the match was created
      try {
        const statsAfter = await contract.getContractStats()
        const actualTotalMatches = parseInt(statsAfter._totalMatches.toString())
        
        if (actualTotalMatches > parseInt(statsBefore._totalMatches.toString())) {
          // Match was created successfully, use the expected ID
          matchId = expectedMatchId.toString()
          console.log('✅ Using sequential match ID:', matchId)
        } else {
          // Fallback to block number if something went wrong
          matchId = receipt.blockNumber.toString()
          console.log('⚠️ Fallback to block number as match ID:', matchId)
        }
      } catch (error) {
        // Final fallback
        matchId = expectedMatchId.toString()
        console.log('🔄 Using expected match ID as fallback:', matchId)
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
    let errorDetails = null
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    }

    // Add environment info for debugging
    const debugInfo = {
      nodeEnv: process.env.NODE_ENV,
      hasPrivateKey: !!process.env.WALLET_PRIVATE_KEY,
      vercelRegion: process.env.VERCEL_REGION || 'local',
      contractAddress: CONTRACT_ADDRESS,
      rpcUrl: RPC_URL
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        debug: debugInfo,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 