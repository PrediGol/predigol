import { NextResponse } from 'next/server'
import { getMatchesByDate } from '@/lib/football-data'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const matches = await getMatchesByDate(today)

    let savedCount = 0

    for (const m of matches) {
      const homeTeam = m.homeTeam
      const awayTeam = m.awayTeam

      await supabase.from('teams').upsert({
        id: homeTeam.id,
        name: homeTeam.name,
        logo_url: homeTeam.crest,
        country: m.area?.name || '',
      })

      await supabase.from('teams').upsert({
        id: awayTeam.id,
        name: awayTeam.name,
        logo_url: awayTeam.crest,
        country: m.area?.name || '',
      })

      await supabase.from('matches').upsert({
        id: m.id,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        league: m.competition.name,
        match_date: m.utcDate,
        status: 'scheduled',
      })

      savedCount++
    }

    return NextResponse.json({
      success: true,
      matchesFound: matches.length,
      saved: savedCount,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
