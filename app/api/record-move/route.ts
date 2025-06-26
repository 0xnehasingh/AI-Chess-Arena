import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xE47D88e3c52e0D2B14298Cd1Dd9A9800deAbf225'
const CHAIN_ID = 1287
const RPC_URL = 'https://rpc.testnet.moonbeam.network'

const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_matchId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "enum ChessTournament.PlayerType",
            "name": "player",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "moveNotation",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "fromSquare",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "toSquare",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "fenPosition",
            "type": "string"
          },
          {
            "internalType": "int256",
            "name": "evaluation",
            "type": "int256"
          },
          {
            "internalType": "bool",
            "name": "isCheck",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isCheckmate",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isStalemate",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isDraw",
            "type": "bool"
          }
        ],
        "internalType": "struct ChessTournament.MoveParams",
        "name": "_moveParams",
        "type": "tuple"
      }
    ],
    "name": "recordMove",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

interface ChessMoveData {
  matchId: number
  player: 'ChatGPT' | 'Claude'
  moveNotation: string
  fromSquare: string
  toSquare: string
  fenPosition: string
  evaluation: number
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Record move endpoint called')
    const moveData: ChessMoveData = await request.json()
    console.log('📝 Move data received:', {
      matchId: moveData.matchId,
      player: moveData.player,
      moveNotation: moveData.moveNotation,
      fromSquare: moveData.fromSquare,
      toSquare: moveData.toSquare
    })

    // Validate required fields
    if (!moveData.matchId || !moveData.player || !moveData.moveNotation) {
      console.error('❌ Missing required fields:', { 
        matchId: moveData.matchId, 
        player: moveData.player, 
        moveNotation: moveData.moveNotation 
      })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Set up provider and signer
    console.log('🌐 Setting up provider...')
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    
    // Test network connection
    try {
      const network = await provider.getNetwork()
      console.log('✅ Network connected:', { name: network.name, chainId: network.chainId.toString() })
    } catch (networkError) {
      console.error('❌ Network connection failed:', networkError)
      return NextResponse.json(
        { error: 'Failed to connect to blockchain network' },
        { status: 500 }
      )
    }
    
    // Get private key from environment variables
    const privateKey = process.env.WALLET_PRIVATE_KEY
    if (!privateKey) {
      console.error('❌ WALLET_PRIVATE_KEY not configured in environment variables')
      return NextResponse.json(
        { error: 'Wallet private key not configured. Please set WALLET_PRIVATE_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    console.log('🔑 Private key loaded, creating wallet...')
    let wallet: ethers.Wallet
    try {
      wallet = new ethers.Wallet(privateKey, provider)
      console.log('👛 Wallet created successfully:', wallet.address)
    } catch (walletError) {
      console.error('❌ Invalid private key format:', walletError)
      return NextResponse.json(
        { error: 'Invalid wallet private key format' },
        { status: 500 }
      )
    }

    // Check wallet balance
    try {
      const balance = await provider.getBalance(wallet.address)
      const balanceInEth = ethers.formatEther(balance)
      console.log('💰 Wallet balance:', balanceInEth, 'DEV tokens')
      
      if (balance === BigInt(0)) {
        console.warn('⚠️ Wallet has zero balance. Get DEV tokens from: https://apps.moonbeam.network/faucet/')
        return NextResponse.json(
          { error: 'Wallet has insufficient balance. Get DEV tokens from the Moonbeam testnet faucet.' },
          { status: 500 }
        )
      }
    } catch (balanceError) {
      console.error('❌ Failed to check wallet balance:', balanceError)
    }

    console.log('📄 Creating contract instance...')
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet)

    // Convert player name to enum value (0 = Claude, 1 = ChatGPT)
    const playerType = moveData.player === 'Claude' ? 0 : 1
    console.log('👤 Player type:', playerType, '(0=Claude, 1=ChatGPT)')

    // Convert evaluation to wei (multiply by 1e18 for precision)
    const evaluationWei = ethers.parseUnits(moveData.evaluation.toString(), 18)
    console.log('📊 Evaluation in wei:', evaluationWei.toString())

    // Prepare move parameters
    const moveParams = {
      player: playerType,
      moveNotation: moveData.moveNotation,
      fromSquare: moveData.fromSquare,
      toSquare: moveData.toSquare,
      fenPosition: moveData.fenPosition,
      evaluation: evaluationWei,
      isCheck: moveData.isCheck,
      isCheckmate: moveData.isCheckmate,
      isStalemate: moveData.isStalemate,
      isDraw: moveData.isDraw
    }

    console.log('🔧 Move params prepared:', {
      player: moveParams.player,
      moveNotation: moveParams.moveNotation,
      fromSquare: moveParams.fromSquare,
      toSquare: moveParams.toSquare,
      evaluation: moveParams.evaluation.toString()
    })

    // Estimate gas first to catch potential issues
    try {
      console.log('⛽ Estimating gas...')
      const gasEstimate = await contract.recordMove.estimateGas(moveData.matchId, moveParams)
      console.log('⛽ Gas estimate:', gasEstimate.toString())
    } catch (gasError) {
      console.error('❌ Gas estimation failed:', gasError)
      
      // Check if it's an authorization issue
      if (gasError instanceof Error && gasError.message.includes('OrganizerOnly')) {
        return NextResponse.json(
          { error: 'Wallet is not authorized as organizer. Contact the contract owner to add authorization.' },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: `Gas estimation failed: ${gasError instanceof Error ? gasError.message : String(gasError)}` },
        { status: 500 }
      )
    }

    // Record the move on the blockchain
    console.log('🚀 Sending transaction...')
    const tx = await contract.recordMove(moveData.matchId, moveParams)
    console.log('📤 Transaction sent:', tx.hash)
    
    // Wait for transaction confirmation
    console.log('⏳ Waiting for confirmation...')
    const receipt = await tx.wait()
    console.log('✅ Transaction confirmed:', {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    })

    return NextResponse.json({
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    })

  } catch (error) {
    console.error('Error recording move to blockchain:', error)
    
    let errorMessage = 'Failed to record move'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve match moves from blockchain
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId parameter is required' },
        { status: 400 }
      )
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_matchId",
            "type": "uint256"
          }
        ],
        "name": "getMatchMoves",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "moveId",
                "type": "uint256"
              },
              {
                "internalType": "enum ChessTournament.PlayerType",
                "name": "player",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "moveNotation",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "fromSquare",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "toSquare",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "fenPosition",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
              },
              {
                "internalType": "int256",
                "name": "evaluation",
                "type": "int256"
              },
              {
                "internalType": "bool",
                "name": "isCheck",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "isCheckmate",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "isStalemate",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "isDraw",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "blockNumber",
                "type": "uint256"
              }
            ],
            "internalType": "struct ChessTournament.ChessMove[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ], provider)

    const moves = await contract.getMatchMoves(parseInt(matchId))

    // Format the moves for frontend consumption
    const formattedMoves = moves.map((move: any) => ({
      moveId: move.moveId.toString(),
      player: move.player === 0 ? 'Claude' : 'ChatGPT',
      moveNotation: move.moveNotation,
      fromSquare: move.fromSquare,
      toSquare: move.toSquare,
      fenPosition: move.fenPosition,
      timestamp: new Date(Number(move.timestamp) * 1000).toISOString(),
      evaluation: ethers.formatUnits(move.evaluation, 18),
      isCheck: move.isCheck,
      isCheckmate: move.isCheckmate,
      isStalemate: move.isStalemate,
      isDraw: move.isDraw,
      blockNumber: move.blockNumber.toString()
    }))

    return NextResponse.json({
      success: true,
      moves: formattedMoves
    })

  } catch (error) {
    console.error('Error retrieving moves from blockchain:', error)
    
    let errorMessage = 'Failed to retrieve moves'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 