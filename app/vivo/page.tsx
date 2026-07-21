export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getArgentinaToday } from '@/lib/dateRange'

const LEAGUES_OF_INTEREST = [
  1,
  2, 3, 848,
  39, 140, 135, 78, 61,
  128, 129, 130, 131, 132, 133,
  71, 72,
  13, 11,
  265, 270, 250, 239,
  253,
]

async function fetchFixtures(url: string) {
  const response = await fetch(url, {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
    cache: 'no-store',
  })
  const data = await response.json()
  return data.response || []
}

function groupByLeague(matches: any[]) {
  const groups: Record<string, any[]> = {}
  for (const m of matches) {
    const leagueName = m.league.name
    if (!groups[leagueName]) groups[leagueName] = []
    groups[leagueName].push(m)
  }
  return groups
}

export default async function Vivo() {
  const today = new Date().toISOString().split('T')[0]

  const [liveMatches, todayMatches] = await Promise.all([
    fetchFixtures('https://v3.football.api-sports.io/fixtures?live=all'),
    fetchFixtures(`https://v3.football.api-sports.io/fixtures?date=${today}`),
  ])

  const relevantLive = liveMatches.filter((f: any) => LEAGUES_OF_INTEREST.includes(f.league.id))

  const relevantToday = todayMatches.filter((f: any) => LEAGUES_OF_INTEREST.includes(f.league.id))

  const finishedStatuses = ['FT', 'AET', 'PEN']
  const scheduledStatuses = ['NS', 'TBD']

  const relevantFinished = relevantToday.filter(
    (f: any) =>
      finishedStatuses.includes(f.fixture.status.short) &&
      !relevantLive.some((live: any) => live.fixture.id === f.fixture.id)
  )

  const relevantUpcoming = relevantToday.filter(
    (f: any) =>
      scheduledStatuses.includes(f.fixture.status.short) &&
      !relevantLive.some((live: any) => live.fixture.id === f.fixture.id)
  )

  function renderMatch(f: any, mode: 'live' | 'finished' | 'upcoming') {
    const goals = f.events?.filter((e: any) => e.type === 'Goal') || []
    const timeLabel = new Date(f.fixture.date).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    return (
      <div
        key={f.fixture.id}
        className="rounded-xl p-3 mb-2 bg-card border border-cardBorder"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted">
            {mode === 'upcoming' ? `${timeLabel} hs` : ''}
          </span>
          {mode === 'live' && (
            <span className="text-[10px] font-bold text-redc">🔴 {f.fixture.status.elapsed}'</span>
          )}
          {mode === 'finished' && (
            <span className="text-[10px] font-bold text-green">✅ Finalizado</span>
          )}
        </div>

        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {f.teams.home.logo && (
              <img src={f.teams.home.logo} alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
            )}
            <span className="text-sm font-semibold">{f.teams.home.name}</span>
          </div>
          <span className="text-sm font-bold">{mode !== 'upcoming' ? f.goals.home : ''}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {f.teams.away.logo && (
              <img src={f.teams.away.logo} alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
            )}
            <span className="text-sm font-semibold">{f.teams.away.name}</span>
          </div>
          <span className="text-sm font-bold">{mode !== 'upcoming' ? f.goals.away : ''}</span>
        </div>

        {(mode === 'live' || mode === 'finished') && goals.length > 0 && (
          <div className="mt-2 pt-2 border-t border-cardBorder">
            <div className="text-[9px] text-muted mb-1">GOLES</div>
            {goals.map((g: any, i: number) => (
              <div key={i} className="text-[10px] text-muted">
                ⚽ {g.player?.name} — {g.team?.name} ({g.time?.elapsed}')
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  function renderSection(title: string, matches: any[], mode: 'live' | 'finished' | 'upcoming') {
    if (matches.length === 0) return null
    const grouped = groupByLeague(matches)

    return (
      <>
        <div className="text-xs font-semibold text-muted mb-2 mt-4">{title}</div>
        {Object.entries(grouped).map(([leagueName, leagueMatches]) => (
          <div key={leagueName} className="mb-3">
            <div className="text-[10px] font-bold text-amber mb-1">{leagueName}</div>
            {leagueMatches.map((m) => renderMatch(m, mode))}
          </div>
        ))}
      </>
    )
  }

  const hasAnyMatch = relevantLive.length > 0 || relevantFinished.length > 0 || relevantUpcoming.length > 0

  return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <div className="text-lg font-bold mb-4">⚡ Partidos de Hoy</div>

      {!hasAnyMatch && (
        <div className="rounded-xl p-4 text-center bg-card border border-cardBorder text-sm text-muted">
          No hay partidos hoy en las ligas que seguimos.
        </div>
      )}

      {renderSection('🔴 EN VIVO', relevantLive, 'live')}
      {renderSection('⏱ PRÓXIMOS', relevantUpcoming, 'upcoming')}
      {renderSection('✅ FINALIZADOS', relevantFinished, 'finished')}
    </main>
  )
}
