import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const { user, error } = await getCurrentUser()

    if (error) {
      return NextResponse.json({
        success: false,
        error,
        hasUser: false
      })
    }

    if (!user) {
      return NextResponse.json({
        success: true,
        hasUser: false,
        message: 'No user logged in'
      })
    }

    // Test if ticket fields are included
    const ticketFields = {
      tickets_balance: user.tickets_balance,
      vouchers_balance: user.vouchers_balance,
      total_tickets_earned: user.total_tickets_earned,
      total_tickets_spent: user.total_tickets_spent
    }

    const hasAllTicketFields = Object.values(ticketFields).every(value => value !== undefined)

    return NextResponse.json({
      success: true,
      hasUser: true,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        ...ticketFields
      },
      ticketFieldsTest: {
        hasAllFields: hasAllTicketFields,
        fieldValues: ticketFields,
        missingFields: Object.entries(ticketFields)
          .filter(([_, value]) => value === undefined)
          .map(([key, _]) => key)
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 