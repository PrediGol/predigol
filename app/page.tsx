export default function Home() {
  const matches = [
    {
      league: 'Mundial 2026 - 16avos',
      time: 'Vie 19:00',
      home: 'Argentina',
      away: 'Cabo Verde',
      pick: 'Argentina',
      score: '2-0',
      overUnder: 'Menos de 2.5',
      corners: '+8.5',
      confidence: 82,
    },
    {
      league: 'LaLiga',
      time: '18:30',
      home: 'Real Madrid',
      away: 'Sevilla',
      pick: 'Real Madrid',
      score: '2-0',
      overUnder: 'Más de 2.5',
      corners: '+9.5',
      confidence: 87,
    },
    {
      league: 'Liga Prof. Argentina',
      time: '21:00',
      home: 'River Plate',
      away: 'Racing',
      pick: 'River Plate',
      score: '1-0',
      overUnder: 'Menos de 2.5',
      corners: '+8.5',
      confidence: 62,
    },
  ]

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

      {matches.map((m, i) => {
        const confColor =
          m.confidence >= 80
            ? 'text-green'
            : m.confidence >= 60
            ? 'text-yellowc'
            : 'text-redc'

        return (
          <div
            key={i}
            className="rounded-2xl p-4 mb-3 bg-card border border-cardBorder"
          >
            <div className="text-[11px] font-semibold text-muted mb-3">
              {m.league} · {m.time}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-sm">{m.home}</div>
                <div className="font-bold text-sm mt-1">{m.away}</div>
              </div>
              <div className="text-center">
                <div className={`font-mono font-bold text-xl ${confColor}`}>
                  {m.confidence}%
                </div>
                <div className="text-[9px] text-muted">CONFIANZA IA</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">GANADOR</div>
                <div className="text-xs font-bold">{m.pick}</div>
              </div>
              <div className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">RESULTADO</div>
                <div className="text-xs font-bold">{m.score}</div>
              </div>
              <div className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">GOLES</div>
                <div className="text-xs font-bold">{m.overUnder}</div>
              </div>
              <div className="rounded-lg py-2 text-center bg-bg">
                <div className="text-[9px] text-muted">CORNERS</div>
                <div className="text-xs font-bold">{m.corners}</div>
              </div>
            </div>
          </div>
        )
      })}
    </main>
  )
}
