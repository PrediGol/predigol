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
      corners_correct,
      matches (
        league,
        home_team:home_team_id ( name ),
        away_team:away_team_id ( name )
      )
    `)
    .order('updated_at', { ascending: false })

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

      {results?.map((r: any) => (
        <div
          key={r.match_id}
          className="rounded-xl p-3 mb-2 flex items-center justify-between bg-card border border-cardBorder"
        >
          <div>
            <div className="text-xs font-semibold">
              {r.matches?.home_team?.name} {r.actual_home_score}-{r.actual_away_score} {r.matches?.away_team?.name}
            </div>
            <div className="text-[10px] text-muted mt-0.5">{r.matches?.league}</div>
          </div>
          <div className="flex gap-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${r.winner_correct ? 'bg-green/20 text-green' : 'bg-redc/20 text-redc'}`}>
              Ganador
            </span>
          </div>
        </div>
      ))}
    </main>
  )
}
