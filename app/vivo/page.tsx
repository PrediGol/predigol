export const dynamic = 'force-dynamic'
export const revalidate = 0

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

export default async function Vivo() {
  const today = new Date().toISOString().split('T')[0]

  const [liveMatches, todayMatches] = await Promise.all([
    fetchFixtures('https://v3.football.api-sports.io/fixtures?live=all'),
    fetchFixtures(`https://v3.football.api-sports.io/fixtures?date=${today}`),
  ])

  const relevantLive = liveMatches.filter((f: any) => LEAGUES_OF_INTEREST.includes(f.league.id))

  const relevantFinished = todayMatches.filter(
    (f: any) =>
      LEAGUES_OF_INTEREST.includes(f.league.id) &&
      f.fixture.status.short === 'FT' &&
      !relevantLive.some((live: any) => live.fixture.id === f.fixture.id)
  )

  function renderMatch(f: any, isLive: boolean) {
    const goals = f.events?.filter((e: any) => e.type === 'Goal') || []

    return (
      <div
        key={f.fixture.id}
        className="rounded-xl p-3 mb-3 bg-card border border-cardBorder"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted">{f.league.name}</span>
          <span className={`text-[10px] font-bold ${isLive ? 'text-redc' : 'text-green'}`}>
            {isLive ? `🔴 ${f.fixture.status.elapsed}'` : '✅ Finalizado'}
          </span>
        </div>

        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {f.teams.home.logo && (
              <img src={f.teams.home.logo} alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
            )}
            <span className="text-sm font-semibold">{f.teams.home.name}</span>
          </div>
          <span className="text-sm font-bold">{f.goals.home}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {f.teams.away.logo && (
              <img src={f.teams.away.logo} alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
            )}
            <span className="text-sm font-semibold">{f.teams.away.name}</span>
          </div>
          <span className="text-sm font-bold">{f.goals.away}</span>
        </div>

        {goals.length > 0 && (
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

  return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <div className="text-lg font-bold mb-4">⚡ Partidos de Hoy</div>

      {relevantLive.length === 0 && relevantFinished.length === 0 && (
        <div className="rounded-xl p-4 text-center bg-card border border-cardBorder text-sm text-muted">
          No hay partidos en vivo ni finalizados hoy en las ligas que seguimos.
        </div>
      )}

      {relevantLive.length > 0 && (
        <>
          <div className="text-xs font-semibold text-muted mb-2">EN VIVO</div>
          {relevantLive.map((f: any) => renderMatch(f, true))}
        </>
      )}

      {relevantFinished.length > 0 && (
        <>
          <div className="text-xs font-semibold text-muted mb-2 mt-4">FINALIZADOS</div>
          {relevantFinished.map((f: any) => renderMatch(f, false))}
        </>
      )}
    </main>
  )
}
