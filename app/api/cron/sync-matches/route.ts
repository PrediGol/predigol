import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generatePrediction } from '@/lib/predictionEngine'

export const dynamic = 'force-dynamic'

const COMPETITIONS = ['WC', 'CL', 'PD', 'PL', 'SA', 'BL1', 'FL1', 'BSA']

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    let savedCount = 0
    let predictionsCount = 0
    let totalFound = 0

    for (const comp of COMPETITIONS) {
      const response = await fetch(
        `https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${today}&dateTo=${today}`,
        {
          headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN! },
          cache: 'no-store',
        }
      )

      if (!response.ok) continue

      const data = await response.json()
      const matches = data.matches || []
      totalFound += matches.length

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

        const { data: existingPrediction } = await supabase
          .from('predictions')
          .select('match_id')
          .eq('match_id', m.id)
          .single()

        if (!existingPrediction) {
          const prediction = await generatePrediction(homeTeam.id, awayTeam.id, comp)
          if (prediction) {
            const winnerName =
              prediction.predicted_winner === 'home' ? homeTeam.name
              : prediction.predicted_winner === 'away' ? awayTeam.name
              : 'Empate'

            await supabase.from('predictions').upsert({
              match_id: m.id,
              predicted_winner: winnerName,
              predicted_score: prediction.predicted_score,
              over_under_25: prediction.over_under_25,
              corners_prediction: prediction.corners_prediction,
              confidence_winner: prediction.confidence_winner,
              confidence_score: prediction.confidence_score,
              confidence_ou: prediction.confidence_ou,
              tier: 'free',
              generated_at: new Date().toISOString(),
            })
            predictionsCount++
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalFound,
      saved: savedCount,
      predictionsGenerated: predictionsCount,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
