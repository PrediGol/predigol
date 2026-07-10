export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase } from '@/lib/supabase'

export default async function Historial() {
  const { data: results } = await supabase
    .from('prediction_results')
    .select(`
      match_id,
      actual_home_score,
      actual_away_score,
      winner_correct,
      exact_score_correct,
      over_under_correct,
      matches (
        league,
        home_team:home_team_id ( name ),
        away_team:away_team_id ( name )
      )
    `)
    .order('updated_at', { ascending: false })

  const matchIds = results?.map((r: any) => r.match_id) ?? []

  const { data: predictionsData } = await supabase
    .from('predictions')
    .select('match_id, predicted_winner, predicted_score, over_under_25, confidence_winner, confidence_score, confidence_ou')
    .in('match_id', matchIds.length > 0 ? matchIds : [0])

  const total = results?.length ?? 0
  const winnerHits = results?.filter((r: any) => r.winner_correct).length ?? 0
  const accuracyPct = total > 0 ? Math.round((winnerHits / total) * 100) : 0

  return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <div className="text-lg font-bold mb-4">Historial de Predicciones</div>

      <div className="rounded-2xl p-5 mb-5 text-center bg-card border border-cardBorder">
        <div className="font-mono font-black text-4xl text-green">{accuracyPct}%</div>
        <div className="text-xs text-muted mt-1">de aciertos en ganador</div>
        <div className="flex justify-center gap-4 mt-3 text-[11px] text-muted">
          <span><b className="text-white">{total}</b> predicciones</span>
          <span><b className="text-white">{winnerHits}</b> acertadas</span>
        </div>
      </div>

      {total === 0 && (
        <div className="rounded-xl p-4 text-center bg-card border border-cardBorder text-sm text-muted">
          Todavía no hay resultados finalizados. Cuando los partidos de hoy terminen, vas a ver acá el detalle de cada predicción.
        </div>
      )}

      {results?.map((r: any) => {
        const pred = predictionsData?.find((p: any) => p.match_id === r.match_id)
        if (!pred) return null

        const categories = [
          { label: 'Gana', value: pred.predicted_winner, confidence: pred.confidence_winner ?? 0, correct: r.winner_correct },
          { label: 'Resultado', value: pred.predicted_score, confidence: pred.confidence_score ?? 0, correct: r.exact_score_correct },
          { label: 'Goles', value: pred.over_under_25, confidence: pred.confidence_ou ?? 0, correct: r.over_under_correct },
        ]

        const recommended = categories.reduce((best, curr) =>
          curr.confidence > best.confidence ? curr : best
        )

        return (
          <div
            key={r.match_id}
            className="rounded-xl p-3 mb-2 bg-card border border-cardBorder"
          >
            <div className="text-[10px] text-muted mb-1">{r.matches?.league}</div>

            <div className="text-sm font-semibold mb-3">
              {r.matches?.home_team?.name} {r.actual_home_score} vs {r.matches?.away_team?.name} {r.actual_away_score}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] font-bold text-amber mb-1">RECOMENDACIÓN DE LA APP</div>
                <div className="text-sm font-bold">
                  {recommended.label} {recommended.value}
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1 ${
                  recommended.correct ? 'bg-green/20 text-green' : 'bg-redc/20 text-redc'
                }`}
              >
                {recommended.correct ? '✅ ACERTADO' : '❌ NO ACERTADO'}
              </span>
            </div>
          </div>
        )
      })}
    </main>
  )
}
