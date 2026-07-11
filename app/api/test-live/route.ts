import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Buscamos el partido de España vs Belgica de hoy en football-data.org
    const fdResponse = await fetch(
      `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${new Date().toISOString().split('T')[0]}&dateTo=${new Date().toISOString().split('T')[0]}`,
      { headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN! }, cache: 'no-store' }
    )
    const fdData = await fdResponse.json()
    const fdMatch = fdData.matches?.find((m: any) =>
      m.homeTeam.name.includes('Spain') || m.awayTeam.name.includes('Spain')
    )

    // Buscamos el mismo partido en API-Football
    const afResponse = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${new Date().toISOString().split('T')[0]}&league=1&season=2026`,
      { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! }, cache: 'no-store' }
    )
    const afData = await afResponse.json()

    // Si encontramos el partido en API-Football, pedimos sus estadisticas (corners)
    let afStats = null
    const afMatch = afData.response?.find((f: any) =>
      f.teams.home.name.includes('Spain') || f.teams.away.name.includes('Spain')
    )
    if (afMatch) {
      const statsResponse = await fetch(
        `https://v3.football.api-sports.io/fixtures/statistics?fixture=${afMatch.fixture.id}`,
        { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! }, cache: 'no-store' }
      )
      afStats = await statsResponse.json()
    }

    return NextResponse.json({
      football_data_match: fdMatch ? { id: fdMatch.id, status: fdMatch.status } : 'no encontrado',
      api_football_match: afMatch ? { id: afMatch.fixture.id, status: afMatch.fixture.status } : afData.errors || 'no encontrado',
      api_football_stats: afStats,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
