export const dynamic = 'force-dynamic'
export const revalidate = 0

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: '⏱ Programado', color: 'text-muted' },
  TIMED: { label: '⏱ Programado', color: 'text-muted' },
  IN_PLAY: { label: '🔴 En Vivo', color: 'text-redc' },
  PAUSED: { label: '⏸ Entretiempo', color: 'text-yellowc' },
  FINISHED: { label: '✅ Finalizado', color: 'text-green' },
  POSTPONED: { label: '⏸ Postergado', color: 'text-muted' },
  CANCELLED: { label: '❌ Cancelado', color: 'text-muted' },
}

const COMPETITIONS = ['WC', 'CL', 'PD', 'PL', 'SA', 'BL1', 'FL1', 'BSA']

export default async function Vivo() {
  const today = new Date().toISOString().split('T')[0]
  let allMatches: any[] = []

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
    allMatches = allMatches.concat(data.matches || [])
  }

  allMatches.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())

  return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <div className="text-lg font-bold mb-4">Partidos de Hoy</div>

      {allMatches.length === 0 && (
        <div className="rounded-xl p-4 text-center bg-card border border-cardBorder text-sm text-muted">
          No hay partidos programados para hoy en las ligas que seguimos.
        </div>
      )}

      {allMatches.map((m: any) => {
        const statusInfo = STATUS_LABELS[m.status] || { label: m.status, color: 'text-muted' }
        const timeLabel = new Date(m.utcDate).toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Argentina/Buenos_Aires',
        })

        const homeScore = m.score?.fullTime?.home
        const awayScore = m.score?.fullTime?.away
        const hasScore = homeScore !== null && homeScore !== undefined

        return (
          <div
            key={m.id}
            className="rounded-xl p-3 mb-2 bg-card border border-cardBorder"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted">{m.competition?.name}</span>
              <span className={`text-[10px] font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {m.homeTeam?.crest && (
                  <img src={m.homeTeam.crest} alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
                )}
                <span className="text-sm font-semibold">{m.homeTeam?.name}</span>
              </div>
              <span className="text-sm font-bold">{hasScore ? homeScore : timeLabel}</span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                {m.awayTeam?.crest && (
                  <img src={m.awayTeam.crest} alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
                )}
                <span className="text-sm font-semibold">{m.awayTeam?.name}</span>
              </div>
              <span className="text-sm font-bold">{hasScore ? awayScore : ''}</span>
            </div>
          </div>
        )
      })}
    </main>
  )
}
