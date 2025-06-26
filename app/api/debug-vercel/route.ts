import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: {
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || 'unknown'
    },
    checks: {}
  }

  try {
    // Check 1: Environment variables
    diagnostics.checks.environmentVariables = {
      WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'undefined'
    }

    // Check 2: Basic functionality
    try {
      const testResponse = await fetch('/api/test-blockchain')
      diagnostics.checks.testBlockchainEndpoint = {
        status: testResponse.status,
        ok: testResponse.ok
      }
    } catch (error) {
      diagnostics.checks.testBlockchainEndpoint = {
        error: error instanceof Error ? error.message : String(error)
      }
    }

    // Check 3: Match creation test
    if (process.env.WALLET_PRIVATE_KEY) {
      try {
        const matchResponse = await fetch('/api/create-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            whitePlayer: 'Claude',
            blackPlayer: 'ChatGPT',
            initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
          })
        })

        const matchResult = await matchResponse.json()
        
        diagnostics.checks.matchCreation = {
          status: matchResponse.status,
          ok: matchResponse.ok,
          hasMatchId: !!matchResult.matchId,
          result: matchResult
        }
      } catch (error) {
        diagnostics.checks.matchCreation = {
          error: error instanceof Error ? error.message : String(error)
        }
      }
    } else {
      diagnostics.checks.matchCreation = {
        skipped: 'No WALLET_PRIVATE_KEY'
      }
    }

    return NextResponse.json({
      success: true,
      diagnostics
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      diagnostics
    }, { status: 500 })
  }
} 