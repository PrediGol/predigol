export const dynamic = 'force-dynamic'
export const revalidate = 0

const LEAGUES_OF_INTEREST = [
  1,   // Mundial
  2, 3, 848, // Champions, Europa League, Conference
  39, 140, 135, 78, 61, // Premier, LaLiga, Serie A, Bundesliga, Ligue 1
  128, 129, 130, 131, 132, 133, // Argentina: 1ra, 2da, 3ra, 4ta, Copa Arg, Supercopa Arg
  71, 72, // Brasil 1ra y 2da
  13, 11, // Libertadores, Sudamericana
  265, 270, 250, 239, // Chile, Uruguay, Paraguay, Colombia
]

export default async function Vivo() {
  const response = await fetch(
    'https://v3.football.api-sports.io/fixtures?live=all',
    {
      headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
      cache: 'no-store',
    }
  )

  const data = await response.json()
  const allLive = data.response || []

  const relevant = allLive.filter((f: any) => LEAGUES_OF_INTEREST.includes(f.league.id))

  return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <div className="text-lg font-bold mb-4">⚡ Partidos en Vivo</div>

      {relevant.length === 0 && (
        <div className="rounded-xl p-4 text-center bg-card border border-cardBorder text-sm text-muted">
          No hay partidos en vivo en este momento en las ligas que seguimos.
        </div>
      )}

      {relevant.map((f: any) => {
        const lastGoal = f.events
          ?.filter((e: any) => e.type === 'Goal')
          .slice(-1)[0]

        return (
          <div
            key={f.fixture.id}
            className="rounded-xl p-3 mb-3 bg-card border border-cardBorder"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted">{f.league.name}</span>
              <span className="text-[10px] font-bold text-redc">
                🔴 {f.fixture.status.elapsed}'
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

            {lastGoal && (
              <div className="text-[10px] text-muted mt-2 pt-2 border-t border-cardBorder">
                ⚽ Último gol: {lastGoal.player?.name} ({lastGoal.time?.elapsed}')
              </div>
            )}
          </div>
        )
      })}
    </main>
  )
}
