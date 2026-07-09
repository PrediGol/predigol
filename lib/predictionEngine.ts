function poissonProb(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k)
}

function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1)
}

async function getStandings(competitionCode: string) {
  const response = await fetch(
    `https://api.football-data.org/v4/competitions/${competitionCode}/standings`,
    {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN! },
      cache: 'no-store',
    }
  )
  if (!response.ok) return null
  const data = await response.json()
  const table = data.standings?.[0]?.table || []
  return table
}

function findTeamStats(table: any[], teamId: number) {
  const team = table.find((t: any) => t.team.id === teamId)
  if (!team || team.playedGames === 0) return null
  return {
    played: team.playedGames,
    goalsFor: team.goalsFor,
    goalsAgainst: team.goalsAgainst,
    avgFor: team.goalsFor / team.playedGames,
    avgAgainst: team.goalsAgainst / team.playedGames,
  }
}

export async function generatePrediction(
  homeTeamId: number,
  awayTeamId: number,
  competitionCode: string
) {
  const table = await getStandings(competitionCode)
  if (!table || table.length === 0) return null

  const homeStats = findTeamStats(table, homeTeamId)
  const awayStats = findTeamStats(table, awayTeamId)

  // Si no hay suficientes datos historicos (ej: recien arranca la temporada), usamos valores neutros
  const leagueAvgGoals = 1.3
  const homeAttack = homeStats ? homeStats.avgFor / leagueAvgGoals : 1
  const homeDefense = homeStats ? homeStats.avgAgainst / leagueAvgGoals : 1
  const awayAttack = awayStats ? awayStats.avgFor / leagueAvgGoals : 1
  const awayDefense = awayStats ? awayStats.avgAgainst / leagueAvgGoals : 1

  const expectedHomeGoals = homeAttack * awayDefense * leagueAvgGoals * 1.1 // 1.1 = bonus localia
  const expectedAwayGoals = awayAttack * homeDefense * leagueAvgGoals

  const maxGoals = 6
  const matrix: number[][] = []
  for (let i = 0; i < maxGoals; i++) {
    matrix[i] = []
    for (let j = 0; j < maxGoals; j++) {
      matrix[i][j] = poissonProb(i, expectedHomeGoals) * poissonProb(j, expectedAwayGoals)
    }
  }

  let pHomeWin = 0, pDraw = 0, pAwayWin = 0
  let bestProb = 0, bestHome = 0, bestAway = 0
  let pOver25 = 0

  for (let i = 0; i < maxGoals; i++) {
    for (let j = 0; j < maxGoals; j++) {
      const p = matrix[i][j]
      if (i > j) pHomeWin += p
      else if (i === j) pDraw += p
      else pAwayWin += p

      if (p > bestProb) {
        bestProb = p
        bestHome = i
        bestAway = j
      }

      if (i + j > 2.5) pOver25 += p
    }
  }

  const probs = [pHomeWin, pDraw, pAwayWin].sort((a, b) => b - a)
  const diff = probs[0] - probs[1]
  const confidence = Math.min(95, Math.max(50, Math.round(50 + diff * 60)))

  let predictedWinner: string
  if (pHomeWin > pDraw && pHomeWin > pAwayWin) predictedWinner = 'home'
  else if (pAwayWin > pDraw && pAwayWin > pHomeWin) predictedWinner = 'away'
  else predictedWinner = 'draw'

  return {
    predicted_winner: predictedWinner,
    predicted_score: `${bestHome}-${bestAway}`,
    over_under_25: pOver25 > 0.5 ? 'Más de 2.5' : 'Menos de 2.5',
    corners_prediction: '+9.5', // placeholder, ajustamos mas adelante con datos reales de corners
    confidence_winner: confidence,
  }
}
