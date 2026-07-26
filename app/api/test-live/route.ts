import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const keyExists = !!process.env.API_FOOTBALL_KEY
    const keyPreview = process.env.API_FOOTBALL_KEY
      ? process.env.API_FOOTBALL_KEY.slice(0, 6) + '...'
      : 'NO CONFIGURADA'

    const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY || '' },
      cache: 'no-store',
    })

    const data = await response.json()

    return NextResponse.json({
      keyExists,
      keyPreview,
      httpStatus: response.status,
      apiResults: data.results,
      apiErrors: data.errors,
      totalLive: data.response?.length ?? 0,
      sample: data.response?.[0] || null,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
