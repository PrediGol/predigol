export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase } from '@/lib/supabase'
import { getArgentinaCurrentMonth, getMonthRange, MONTH_NAMES } from '@/lib/dateRange'
import HistorialCard from '@/components/HistorialCard'

const PAGE_SIZE = 10

export default async function Historial({
  searchParams,
}: {
  searchParams: { mes?: string; pagina?: string }
}) {
  const selectedMonth = searchParams.mes || getArgentinaCurrentMonth()
  const currentPage = parseInt(searchParams.pagina || '1', 10)

  const { startISO, endISO } = getMonthRange(selectedMonth)

  const { data: allResults } = await supabase
    .from('prediction_results')
    .select(`
      match_id,
      actual_home_score,
      actual_away_score,
      winner_correct,
      exact_score_correct,
      over_under_correct,
      updated_at,
      matches (
        league,
        match_date,
        home_team:home_team_id ( name ),
        away_team:away_team_id ( name )
      )
    `)
    .gte('updated_at', startISO)
    .lte('updated_at', endISO)
    .order('updated_at', { ascending: false })

  const matchIds = allResults?.map((r: any) => r.match_id) ?? []

  const { data: predictionsData } = await supabase
    .from('predictions')
    .select('match_id, predicted_winner, predicted_score, over_under_25, confidence_winner, confidence_score, confidence_ou')
    .in('match_id', matchIds.length > 0 ? matchIds : [0])

  const total = allResults?.length ?? 0
  const winnerHits = allResults?.filter((r: any) => r.winner_correct).length ?? 0
  const accuracyPct = total > 0 ? Math.round((winnerHits / total) * 100) : 0

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIdx = (safePage - 1) * PAGE_SIZE
  const pageResults = allResults?.slice(startIdx, startIdx + PAGE_SIZE) ?? []

  const [year, month] = selectedMonth.split('-')
  const monthLabel = `${MONTH_NAMES[month]} ${year}`

  const monthOptions: string[] = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthOptions.push(ym)
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <div className="text-lg font-bold mb-4">Historial de Predicciones</div>

            <form method="GET" className="mb-4 flex gap-2">
        <select
          name="mes"
          defaultValue={selectedMonth}
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-card border border-cardBorder"
        >
          {monthOptions.map((ym) => {
            const [y, m] = ym.split('-')
            return (
              <option key={ym} value={ym}>
                {MONTH_NAMES[m]} {y}
              </option>
            )
          })}
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-bold bg-amber text-bg"
        >
          Ver
        </button>
      </form>


      <div className="rounded-2xl p-5 mb-5 text-center bg-card border border-cardBorder">
        <div className="text-xs text-muted mb-1">{monthLabel}</div>
        <div className="font-mono font-black text-4xl text-green">{accuracyPct}%</div>
        <div className="text-xs text-muted mt-1">de aciertos en ganador</div>
        <div className="flex justify-center gap-4 mt-3 text-[11px] text-muted">
          <span><b className="text-white">{total}</b> predicciones</span>
          <span className="text-green"><b>{winnerHits}</b> acertadas</span>
          <span className="text-redc"><b>{total - winnerHits}</b> falladas</span>
        </div>
      </div>

      {total === 0 && (
        <div className="rounded-xl p-4 text-center bg-card border border-cardBorder text-sm text-muted">
          No hay resultados finalizados en {monthLabel}.
        </div>
      )}

      {pageResults.map((r: any) => {
        const pred = predictionsData?.find((p: any) => p.match_id === r.match_id)
        if (!pred) return null

        const categories = [
          { label: 'Gana', value: pred.predicted_winner, confidence: pred.confidence_winner ?? 0, correct: r.winner_correct },
          { label: 'Resultado', value: pred.predicted_score, confidence: pred.confidence_score ?? 0, correct: r.exact_score_correct },
          { label: 'Goles', value: pred.over_under_25, confidence: pred.confidence_ou ?? 0, correct: r.over_under_correct },
        ]

        return (
          <HistorialCard
            key={r.match_id}
            league={r.matches?.league}
            homeTeam={r.matches?.home_team?.name}
            awayTeam={r.matches?.away_team?.name}
            homeScore={r.actual_home_score}
            awayScore={r.actual_away_score}
            categories={categories}
          />
        )
      })}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {safePage > 1 && (
            <a
              href={`/historial?mes=${selectedMonth}&pagina=${safePage - 1}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-cardBorder"
            >
              ← Anterior
            </a>
          )}
          <span className="text-xs text-muted">
            Página {safePage} de {totalPages}
          </span>
          {safePage < totalPages && (
            <a
              href={`/historial?mes=${selectedMonth}&pagina=${safePage + 1}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-cardBorder"
            >
              Siguiente →
            </a>
          )}
        </div>
      )}
    </main>
  )
}
