'use client'

import { useState } from 'react'

type Category = {
  label: string
  value: string
  confidence: number
  correct: boolean
}

export default function HistorialCard({
  league,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  categories,
}: {
  league: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  categories: Category[]
}) {
  const [expanded, setExpanded] = useState(false)

  const recommended = categories.reduce((best, curr) =>
    curr.confidence > best.confidence ? curr : best
  )

  return (
    <div className="rounded-xl mb-2 bg-card border border-cardBorder overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3"
      >
        <div className="text-[10px] text-muted mb-1">{league}</div>
        <div className="text-sm font-semibold mb-3">
          {homeTeam} {homeScore} vs {awayTeam} {awayScore}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold text-amber mb-1">RECOMENDACIÓN DE LA APP</div>
            <div className="text-sm font-bold">
              {recommended.label} {recommended.value}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1 ${
                recommended.correct ? 'bg-green/20 text-green' : 'bg-redc/20 text-redc'
              }`}
            >
              {recommended.correct ? '✅ ACERTADO' : '❌ NO ACERTADO'}
            </span>
            <span className="text-muted text-xs">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-cardBorder">
          <div className="text-[9px] text-muted mb-2 mt-2">TODAS LAS PREDICCIONES</div>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c, i) => (
              <div key={i} className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">{c.label}</div>
                <div className="text-xs font-bold">{c.value}</div>
                <div className="text-[10px] font-mono text-muted">{c.confidence}%</div>
                <div className={`text-[10px] font-bold mt-1 ${c.correct ? 'text-green' : 'text-redc'}`}>
                  {c.correct ? '✅' : '❌'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
