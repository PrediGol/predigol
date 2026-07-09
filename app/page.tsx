export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default async function Home() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      id,
      league,
      match_date,
      home_team:home_team_id ( name ),
      away_team:away_team_id ( name ),
      predictions ( predicted_winner, predicted_score, over_under_25, corners_prediction, confidence_winner, confidence_score, confidence_ou )
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="PrediGol" width={44} height={44} priority style={{ objectFit: 'contain' }} />
          <span className="font-bold text-xl tracking-tight">PrediGol</span>
        </div>
        <div className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green/10 text-green">
          74% ACIERTO
        </div>
      </div>

      <p className="text-sm text-muted mb-6">
        Donde la intuición se vuelve estadística.
      </p>

      <div className="text-xs font-semibold text-muted mb-3">
        PARTIDOS DE HOY
      </div>

      {matches?.map((m: any) => {
        const p = Array.isArray(m.predictions) ? m.predictions[0] : m.predictions
        if (!p) return null

        const categories = [
          { key: 'winner', label: 'GANADOR', value: p.predicted_winner, confidence: p.confidence_winner ?? 0 },
          { key: 'score', label: 'RESULTADO EXACTO', value: p.predicted_score, confidence: p.confidence_score ?? 0 },
          { key: 'goals', label: 'GOLES', value: p.over_under_25, confidence: p.confidence_ou ?? 0 },
        ]

        const recommended = categories.reduce((best, curr) =>
          curr.confidence > best.confidence ? curr : best
        )

        const confColor = (val: number) =>
          val >= 80 ? 'text-green' : val >= 60 ? 'text-yellowc' : 'text-redc'

        return (
          <div
            key={m.id}
            className="rounded-2xl p-4 mb-3 bg-card border border-cardBorder"
          >
            <div className="text-[11px] font-semibold text-muted mb-3">
              {m.league}
            </div>

            <div className="mb-3">
              <div className="font-bold text-sm">{m.home_team?.name}</div>
              <div className="font-bold text-sm mt-1">{m.away_team?.name}</div>
            </div>

            <div className="rounded-xl p-3 mb-3" style={{ background: '#1C2330' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-amber mb-1">
                    ⭐ RECOMENDACIÓN DE LA APP
                  </div>
                  <div className="text-sm font-bold">
                    {recommended.label}: {recommended.value}
                  </div>
                </div>
                <div className={`font-mono font-bold text-xl ${confColor(recommended.confidence)}`}>
                  {recommended.confidence}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">GANADOR</div>
                <div className="text-xs font-bold">{p.predicted_winner}</div>
                <div className={`text-[10px] font-mono ${confColor(p.confidence_winner ?? 0)}`}>{p.confidence_winner ?? 0}%</div>
              </div>
              <div className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">RESULTADO</div>
                <div className="text-xs font-bold">{p.predicted_score}</div>
                <div className={`text-[10px] font-mono ${confColor(p.confidence_score ?? 0)}`}>{p.confidence_score ?? 0}%</div>
              </div>
              <div className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">GOLES</div>
                <div className="text-xs font-bold">{p.over_under_25}</div>
                <div className={`text-[10px] font-mono ${confColor(p.confidence_ou ?? 0)}`}>{p.confidence_ou ?? 0}%</div>
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
