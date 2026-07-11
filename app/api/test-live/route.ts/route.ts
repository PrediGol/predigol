import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/status`,
      {
        headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
        cache: 'no-store',
      }
    )

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
