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
  }
]

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  }

  try {
    // Test 1: Check environment variable
    const privateKey = process.env.WALLET_PRIVATE_KEY
    diagnostics.tests.privateKeyConfigured = {
      status: privateKey ? 'PASS' : 'FAIL',
      message: privateKey ? 'Private key is configured' : 'WALLET_PRIVATE_KEY not found in environment variables'
    }

    if (!privateKey) {
      return NextResponse.json({
        success: false,
        diagnostics,
        summary: 'Environment not configured'
      })
    }

    // Test 2: Check wallet format
    let wallet: ethers.Wallet
    try {
      wallet = new ethers.Wallet(privateKey)
      diagnostics.tests.walletFormat = {
        status: 'PASS',
        message: `Wallet address: ${wallet.address}`,
        address: wallet.address
      }
    } catch (error) {
      diagnostics.tests.walletFormat = {
        status: 'FAIL',
        message: `Invalid private key format: ${error instanceof Error ? error.message : String(error)}`
      }
      return NextResponse.json({
        success: false,
        diagnostics,
        summary: 'Invalid wallet configuration'
      })
    }

    // Test 3: Check RPC connection
    let provider: ethers.JsonRpcProvider
    try {
      provider = new ethers.JsonRpcProvider(RPC_URL)
      const network = await provider.getNetwork()
      diagnostics.tests.rpcConnection = {
        status: 'PASS',
        message: `Connected to network: ${network.name} (Chain ID: ${network.chainId})`,
        chainId: network.chainId.toString(),
        networkName: network.name
      }
    } catch (error) {
      diagnostics.tests.rpcConnection = {
        status: 'FAIL',
        message: `Failed to connect to RPC: ${error instanceof Error ? error.message : String(error)}`
      }
      return NextResponse.json({
        success: false,
        diagnostics,
        summary: 'RPC connection failed'
      })
    }

    // Test 4: Check wallet balance
    try {
      const walletWithProvider = new ethers.Wallet(privateKey, provider)
      const balance = await provider.getBalance(wallet.address)
      const balanceInEth = ethers.formatEther(balance)
      
      diagnostics.tests.walletBalance = {
        status: balance > BigInt(0) ? 'PASS' : 'WARN',
        message: `Balance: ${balanceInEth} DEV tokens`,
        balance: balanceInEth,
        hasBalance: balance > BigInt(0)
      }
    } catch (error) {
      diagnostics.tests.walletBalance = {
        status: 'FAIL',
        message: `Failed to check balance: ${error instanceof Error ? error.message : String(error)}`
      }
    }

    // Test 5: Check contract connection
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      const stats = await contract.getContractStats()
      
      diagnostics.tests.contractConnection = {
        status: 'PASS',
        message: 'Successfully connected to smart contract',
        contractStats: {
          totalMatches: stats._totalMatches.toString(),
          activeMatches: stats._activeMatches.toString(),
          completedMatches: stats._completedMatches.toString(),
          verifiedMatches: stats._verifiedMatches.toString()
        }
      }
    } catch (error) {
      diagnostics.tests.contractConnection = {
        status: 'FAIL',
        message: `Failed to connect to contract: ${error instanceof Error ? error.message : String(error)}`
      }
    }

    // Test 6: Check if wallet is authorized organizer
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      const isAuthorized = await contract.authorizedOrganizers(wallet.address)
      
      diagnostics.tests.organizerAuthorization = {
        status: isAuthorized ? 'PASS' : 'FAIL',
        message: isAuthorized 
          ? 'Wallet is authorized as organizer' 
          : 'Wallet is NOT authorized as organizer - contact contract owner',
        isAuthorized
      }
    } catch (error) {
      diagnostics.tests.organizerAuthorization = {
        status: 'FAIL',
        message: `Failed to check authorization: ${error instanceof Error ? error.message : String(error)}`
      }
    }

    // Determine overall status
    const passedTests = Object.values(diagnostics.tests).filter((test: any) => test.status === 'PASS').length
    const failedTests = Object.values(diagnostics.tests).filter((test: any) => test.status === 'FAIL').length
    const totalTests = Object.keys(diagnostics.tests).length

    let summary = `${passedTests}/${totalTests} tests passed`
    if (failedTests > 0) {
      summary += `, ${failedTests} failed`
    }

    return NextResponse.json({
      success: failedTests === 0,
      diagnostics,
      summary,
      readyForBlockchain: failedTests === 0
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      diagnostics,
      summary: 'Diagnostic test failed'
    }, { status: 500 })
  }
} 