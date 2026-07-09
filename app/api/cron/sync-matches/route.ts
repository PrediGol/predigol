import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const today = '2026-07-11'

    const response = await fetch(
      `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${today}&dateTo=${today}`,
      {
        headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN! },
        cache: 'no-store',
      }
    )

    const rawText = await response.text()

    return NextResponse.json({
      status: response.status,
      raw: rawText.slice(0, 1500),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
