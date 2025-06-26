import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xE47D88e3c52e0D2B14298Cd1Dd9A9800deAbf225'
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

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test move endpoint called')
    
    // Test data
    const testMoveData = {
      matchId: 1,
      player: 'Claude' as 'ChatGPT' | 'Claude',
      moveNotation: 'e4',
      fromSquare: 'e2',
      toSquare: 'e4',
      fenPosition: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      evaluation: 0.1,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false
    }

    console.log('🧪 Test move data:', testMoveData)

    // Get private key from environment variables
    const privateKey = process.env.WALLET_PRIVATE_KEY
    if (!privateKey) {
      console.error('❌ No private key found')
      return NextResponse.json(
        { error: 'Wallet private key not configured' },
        { status: 500 }
      )
    }

    console.log('🔑 Private key loaded')

    // Set up provider and signer
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    console.log('🌐 Provider created')

    const wallet = new ethers.Wallet(privateKey, provider)
    console.log('👛 Wallet created:', wallet.address)

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet)
    console.log('📄 Contract instance created')

    // Convert player name to enum value (0 = Claude, 1 = ChatGPT)
    const playerType = testMoveData.player === 'Claude' ? 0 : 1
    console.log('👤 Player type:', playerType)

    // Convert evaluation to wei (multiply by 1e18 for precision)
    const evaluationWei = ethers.parseUnits(testMoveData.evaluation.toString(), 18)
    console.log('📊 Evaluation in wei:', evaluationWei.toString())

    // Prepare move parameters
    const moveParams = {
      player: playerType,
      moveNotation: testMoveData.moveNotation,
      fromSquare: testMoveData.fromSquare,
      toSquare: testMoveData.toSquare,
      fenPosition: testMoveData.fenPosition,
      evaluation: evaluationWei,
      isCheck: testMoveData.isCheck,
      isCheckmate: testMoveData.isCheckmate,
      isStalemate: testMoveData.isStalemate,
      isDraw: testMoveData.isDraw
    }

    console.log('🔧 Move params prepared:', moveParams)

    // Estimate gas first
    try {
      const gasEstimate = await contract.recordMove.estimateGas(testMoveData.matchId, moveParams)
      console.log('⛽ Gas estimate:', gasEstimate.toString())
    } catch (gasError) {
      console.error('❌ Gas estimation failed:', gasError)
      return NextResponse.json(
        { error: 'Gas estimation failed: ' + (gasError instanceof Error ? gasError.message : String(gasError)) },
        { status: 500 }
      )
    }

    // Record the move on the blockchain
    console.log('🚀 Sending transaction...')
    const tx = await contract.recordMove(testMoveData.matchId, moveParams)
    console.log('📤 Transaction sent:', tx.hash)
    
    // Wait for transaction confirmation
    console.log('⏳ Waiting for confirmation...')
    const receipt = await tx.wait()
    console.log('✅ Transaction confirmed:', receipt.hash)

    return NextResponse.json({
      success: true,
      message: 'Test move recorded successfully',
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      testData: testMoveData
    })

  } catch (error) {
    console.error('❌ Test move failed:', error)
    
    let errorMessage = 'Failed to record test move'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage, details: error },
      { status: 500 }
    )
  }
} 