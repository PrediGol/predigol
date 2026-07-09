import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date().toISOString()

    const { data: pendingMatches } = await supabase
      .from('matches')
      .select('id, home_team_id, away_team_id, match_date')
      .eq('status', 'scheduled')
      .lt('match_date', now)

    let resolvedCount = 0

    for (const match of pendingMatches || []) {
      const response = await fetch(
        `https://api.football-data.org/v4/matches/${match.id}`,
        {
          headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN! },
          cache: 'no-store',
        }
      )

      if (!response.ok) continue

      const data = await response.json()
      const apiMatch = data

      if (apiMatch.status !== 'FINISHED') continue

      const actualHomeScore = apiMatch.score.fullTime.home
      const actualAwayScore = apiMatch.score.fullTime.away

      const { data: prediction } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', match.id)
        .single()

      if (!prediction) continue

      let actualWinner: string
      if (actualHomeScore > actualAwayScore) actualWinner = 'home'
      else if (actualAwayScore > actualHomeScore) actualWinner = 'away'
      else actualWinner = 'draw'

      const { data: teams } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', [match.home_team_id, match.away_team_id])

      const homeTeamName = teams?.find((t: any) => t.id === match.home_team_id)?.name
      const awayTeamName = teams?.find((t: any) => t.id === match.away_team_id)?.name

      const predictedWinnerNormalized =
        prediction.predicted_winner === homeTeamName ? 'home'
        : prediction.predicted_winner === awayTeamName ? 'away'
        : 'draw'

      const winnerCorrect = predictedWinnerNormalized === actualWinner

      const [predHome, predAway] = prediction.predicted_score.split('-').map(Number)
      const exactScoreCorrect = predHome === actualHomeScore && predAway === actualAwayScore

      const actualTotalGoals = actualHomeScore + actualAwayScore
      const predictedOver = prediction.over_under_25 === 'Más de 2.5'
      const overUnderCorrect = predictedOver ? actualTotalGoals > 2.5 : actualTotalGoals <= 2.5

      await supabase.from('prediction_results').upsert({
        match_id: match.id,
        predicted_at: prediction.generated_at,
        actual_home_score: actualHomeScore,
        actual_away_score: actualAwayScore,
        winner_correct: winnerCorrect,
        exact_score_correct: exactScoreCorrect,
        over_under_correct: overUnderCorrect,
        corners_correct: null,
        updated_at: new Date().toISOString(),
      })

      await supabase.from('matches').update({ status: 'finished', home_score: actualHomeScore, away_score: actualAwayScore }).eq('id', match.id)

      resolvedCount++
    }

    return NextResponse.json({
      success: true,
      pendingChecked: pendingMatches?.length ?? 0,
      resolved: resolvedCount,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
