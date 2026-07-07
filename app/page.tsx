export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      id,
      league,
      match_date,
      home_team:home_team_id ( name ),
      away_team:away_team_id ( name ),
      predictions ( predicted_winner, predicted_score, over_under_25, corners_prediction, confidence_winner )
    `)
    .order('match_date')

  if (error) {
    return (
      <main className="max-w-sm mx-auto px-4 py-6 text-redc">
        Error cargando partidos: {error.message}
      </main>
    )
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm bg-amber text-bg">
            P
          </div>
          <span className="font-bold text-lg tracking-tight">PrediGol</span>
        </div>
        <div className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green/10 text-green">
          74% ACIERTO
        </div>
      </div>

      <div className="text-xs font-semibold text-muted mb-3">
        PARTIDOS DE HOY
      </div>

      {matches?.map((m: any) => {
                const p = Array.isArray(m.predictions) ? m.predictions[0] : m.predictions

        if (!p) return null

        const confColor =
          p.confidence_winner >= 80
            ? 'text-green'
            : p.confidence_winner >= 60
            ? 'text-yellowc'
            : 'text-redc'

        return (
          <div
            key={m.id}
            className="rounded-2xl p-4 mb-3 bg-card border border-cardBorder"
          >
            <div className="text-[11px] font-semibold text-muted mb-3">
              {m.league}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-sm">{m.home_team?.name}</div>
                <div className="font-bold text-sm mt-1">{m.away_team?.name}</div>
              </div>
              <div className="text-center">
                <div className={`font-mono font-bold text-xl ${confColor}`}>
                  {p.confidence_winner}%
                </div>
                <div className="text-[9px] text-muted">CONFIANZA IA</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">GANADOR</div>
                <div className="text-xs font-bold">{p.predicted_winner}</div>
              </div>
              <div className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">RESULTADO</div>
                <div className="text-xs font-bold">{p.predicted_score}</div>
              </div>
              <div className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">GOLES</div>
                <div className="text-xs font-bold">{p.over_under_25}</div>
              </div>
              <div className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">CORNERS</div>
                <div className="text-xs font-bold">{p.corners_prediction}</div>
              </div>
            </div>
          </div>
        )
      })}
    </main>
  )
}