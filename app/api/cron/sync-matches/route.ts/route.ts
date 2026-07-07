import { NextResponse } from 'next/server'
import { getFixturesByDate } from '@/lib/api-football'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// IDs de ligas que vamos a seguir (Premier League, LaLiga, Serie A, Bundesliga, Ligue 1, Liga Prof. Argentina)
const LEAGUES_TO_TRACK = [39, 140, 135, 78, 61, 128]

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const fixtures = await getFixturesByDate(today)

    const relevant = fixtures.filter((f: any) =>
      LEAGUES_TO_TRACK.includes(f.league.id)
    )

    let savedCount = 0

    for (const f of relevant) {
      const homeTeam = f.teams.home
      const awayTeam = f.teams.away

      await supabase.from('teams').upsert({
        id: homeTeam.id,
        name: homeTeam.name,
        logo_url: homeTeam.logo,
        country: f.league.country,
      })

      await supabase.from('teams').upsert({
        id: awayTeam.id,
        name: awayTeam.name,
        logo_url: awayTeam.logo,
        country: f.league.country,
      })

      await supabase.from('matches').upsert({
        id: f.fixture.id,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        league: f.league.name,
        match_date: f.fixture.date,
        status: 'scheduled',
      })

      savedCount++
    }

    return NextResponse.json({
      success: true,
      matchesFound: relevant.length,
      saved: savedCount,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
