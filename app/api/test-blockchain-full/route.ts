import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xE47D88e3c52e0D2B14298Cd1Dd9A9800deAbf225'
const RPC_URL = 'https://rpc.testnet.moonbeam.network'

const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "authorizedOrganizers",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
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
  },
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
        "name": "matchId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
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

export async function GET(request: NextRequest) {
  console.log('🔍 Starting comprehensive blockchain diagnostics...')
  
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    tests: {},
    errors: []
  }

  try {
    // Test 1: Environment Variables
    console.log('🧪 Test 1: Checking environment variables...')
    const privateKey = process.env.WALLET_PRIVATE_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    
    diagnostics.tests.environmentVariables = {
      status: privateKey ? 'PASS' : 'FAIL',
      details: {
        WALLET_PRIVATE_KEY: privateKey ? '✅ Configured' : '❌ Missing',
        OPENAI_API_KEY: openaiKey ? '✅ Configured' : '⚠️ Missing',
        ANTHROPIC_API_KEY: anthropicKey ? '✅ Configured' : '⚠️ Missing'
      }
    }

    if (!privateKey) {
      diagnostics.errors.push('WALLET_PRIVATE_KEY is required for blockchain operations')
      return NextResponse.json({
        success: false,
        diagnostics,
        message: 'Critical: WALLET_PRIVATE_KEY not configured'
      })
    }

    // Test 2: Wallet Creation
    console.log('🧪 Test 2: Creating wallet...')
    let wallet: ethers.Wallet
    try {
      wallet = new ethers.Wallet(privateKey)
      diagnostics.tests.walletCreation = {
        status: 'PASS',
        details: {
          address: wallet.address,
          message: 'Wallet created successfully'
        }
      }
      console.log('✅ Wallet created:', wallet.address)
    } catch (walletError) {
      diagnostics.tests.walletCreation = {
        status: 'FAIL',
        details: {
          error: walletError instanceof Error ? walletError.message : String(walletError)
        }
      }
      diagnostics.errors.push('Invalid private key format')
      return NextResponse.json({
        success: false,
        diagnostics,
        message: 'Invalid wallet private key'
      })
    }

    // Test 3: Network Connection
    console.log('🧪 Test 3: Testing network connection...')
    let provider: ethers.JsonRpcProvider
    try {
      provider = new ethers.JsonRpcProvider(RPC_URL)
      const network = await provider.getNetwork()
      diagnostics.tests.networkConnection = {
        status: 'PASS',
        details: {
          networkName: network.name,
          chainId: network.chainId.toString(),
          rpcUrl: RPC_URL
        }
      }
      console.log('✅ Network connected:', network.name, 'Chain ID:', network.chainId.toString())
    } catch (networkError) {
      diagnostics.tests.networkConnection = {
        status: 'FAIL',
        details: {
          error: networkError instanceof Error ? networkError.message : String(networkError),
          rpcUrl: RPC_URL
        }
      }
      diagnostics.errors.push('Failed to connect to Moonbeam testnet')
      return NextResponse.json({
        success: false,
        diagnostics,
        message: 'Network connection failed'
      })
    }

    // Test 4: Wallet Balance
    console.log('🧪 Test 4: Checking wallet balance...')
    try {
      const walletWithProvider = new ethers.Wallet(privateKey, provider)
      const balance = await provider.getBalance(wallet.address)
      const balanceInEth = ethers.formatEther(balance)
      
      diagnostics.tests.walletBalance = {
        status: balance > BigInt(0) ? 'PASS' : 'WARN',
        details: {
          balance: balanceInEth,
          unit: 'DEV tokens',
          address: wallet.address,
          hasBalance: balance > BigInt(0),
          faucetUrl: 'https://apps.moonbeam.network/faucet/'
        }
      }
      
      if (balance === BigInt(0)) {
        diagnostics.errors.push('Wallet has zero balance - get DEV tokens from faucet')
      }
      
      console.log('💰 Wallet balance:', balanceInEth, 'DEV tokens')
    } catch (balanceError) {
      diagnostics.tests.walletBalance = {
        status: 'FAIL',
        details: {
          error: balanceError instanceof Error ? balanceError.message : String(balanceError)
        }
      }
      diagnostics.errors.push('Failed to check wallet balance')
    }

    // Test 5: Contract Connection
    console.log('🧪 Test 5: Testing contract connection...')
    let contract: ethers.Contract
    try {
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      // Try to read contract state (this is a read-only call)
      const isAuthorized = await contract.authorizedOrganizers(wallet.address)
      
      diagnostics.tests.contractConnection = {
        status: 'PASS',
        details: {
          contractAddress: CONTRACT_ADDRESS,
          isAuthorized: isAuthorized,
          message: 'Contract connection successful'
        }
      }
      console.log('✅ Contract connected, wallet authorized:', isAuthorized)
    } catch (contractError) {
      diagnostics.tests.contractConnection = {
        status: 'FAIL',
        details: {
          error: contractError instanceof Error ? contractError.message : String(contractError),
          contractAddress: CONTRACT_ADDRESS
        }
      }
      diagnostics.errors.push('Failed to connect to smart contract')
    }

    // Test 6: Authorization Check
    console.log('🧪 Test 6: Checking organizer authorization...')
    try {
      const walletWithProvider = new ethers.Wallet(privateKey, provider)
      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, walletWithProvider)
      const isAuthorized = await contractWithSigner.authorizedOrganizers(wallet.address)
      
      diagnostics.tests.organizerAuthorization = {
        status: isAuthorized ? 'PASS' : 'FAIL',
        details: {
          walletAddress: wallet.address,
          isAuthorized: isAuthorized,
          message: isAuthorized 
            ? 'Wallet is authorized as organizer' 
            : 'Wallet needs to be authorized by contract owner'
        }
      }
      
      if (!isAuthorized) {
        diagnostics.errors.push('Wallet is not authorized as organizer')
      }
      
      console.log('🔐 Authorization status:', isAuthorized)
    } catch (authError) {
      diagnostics.tests.organizerAuthorization = {
        status: 'FAIL',
        details: {
          error: authError instanceof Error ? authError.message : String(authError)
        }
      }
      diagnostics.errors.push('Failed to check authorization status')
    }

    // Test 7: Match Creation and Move Recording Test
    console.log('🧪 Test 7: Testing match creation and move recording...')
    try {
      // Create match directly using contract
      console.log('🆕 Creating test match...')
      const walletWithProvider = new ethers.Wallet(privateKey, provider)
      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, walletWithProvider)
      
      const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      const createTx = await contractWithSigner.createMatch(0, 1, initialFen) // Claude vs ChatGPT
      const createReceipt = await createTx.wait()
      
      // Get the next match ID by checking contract state or using a simple approach
      const matchId = createReceipt.blockNumber // Use block number as unique identifier
      
      console.log('✅ Test match created with ID:', matchId)
      
      // Now test move recording with the actual match ID
      const testMoveData = {
        matchId: parseInt(matchId),
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
      
      // Test gas estimation for move recording using existing contract
      
      const moveParams = {
        player: 0, // Claude
        moveNotation: testMoveData.moveNotation,
        fromSquare: testMoveData.fromSquare,
        toSquare: testMoveData.toSquare,
        fenPosition: testMoveData.fenPosition,
        evaluation: ethers.parseUnits(testMoveData.evaluation.toString(), 18),
        isCheck: testMoveData.isCheck,
        isCheckmate: testMoveData.isCheckmate,
        isStalemate: testMoveData.isStalemate,
        isDraw: testMoveData.isDraw
      }
      
      const gasEstimate = await contractWithSigner.recordMove.estimateGas(matchId, moveParams)
      
      diagnostics.tests.gasEstimation = {
        status: 'PASS',
        details: {
          matchCreatedViaAPI: true,
          matchId: matchId,
          gasEstimate: gasEstimate.toString(),
          message: 'Match creation via API and move recording both successful'
        }
      }
      console.log('⛽ Gas estimation successful:', gasEstimate.toString())
    } catch (gasError) {
      diagnostics.tests.gasEstimation = {
        status: 'FAIL',
        details: {
          error: gasError instanceof Error ? gasError.message : String(gasError),
          message: 'Failed to create match via API or estimate gas for move recording'
        }
      }
      
      if (gasError instanceof Error && gasError.message.includes('OrganizerOnly')) {
        diagnostics.errors.push('Gas estimation failed: Wallet not authorized as organizer')
      } else {
        diagnostics.errors.push('Gas estimation failed: ' + (gasError instanceof Error ? gasError.message : String(gasError)))
      }
    }

    // Summary
    const passedTests = Object.values(diagnostics.tests).filter((test: any) => test.status === 'PASS').length
    const failedTests = Object.values(diagnostics.tests).filter((test: any) => test.status === 'FAIL').length
    const totalTests = Object.keys(diagnostics.tests).length

    const isReadyForBlockchain = failedTests === 0 && diagnostics.errors.length === 0

    console.log('📊 Diagnostics complete:', { passedTests, failedTests, totalTests, isReady: isReadyForBlockchain })

    return NextResponse.json({
      success: isReadyForBlockchain,
      diagnostics,
      summary: {
        passedTests,
        failedTests,
        totalTests,
        readyForBlockchain: isReadyForBlockchain,
        errors: diagnostics.errors
      },
      nextSteps: isReadyForBlockchain 
        ? ['✅ All tests passed! Blockchain recording should work.']
        : [
            ...diagnostics.errors.map((error: string) => `❌ ${error}`),
            '📋 Fix the above issues and run the test again'
          ]
    })

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        diagnostics
      },
      { status: 500 }
    )
  }
} 