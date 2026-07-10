import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}&league=1&season=2026`,
      {
        headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
        cache: 'no-store',
      }
    )

    const data = await response.json()

    return NextResponse.json({
      results: data.results,
      errors: data.errors,
      sample: data.response?.[0] || null,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
