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
  return data.standings?.[0]?.table || []
}

function findTeamStats(table: any[], teamId: number) {
  const team = table.find((t: any) => t.team.id === teamId)
  if (!team || team.playedGames === 0) return null
  return {
    avgFor: team.goalsFor / team.playedGames,
    avgAgainst: team.goalsAgainst / team.playedGames,
  }
}

// Para el Mundial: buscamos las estadisticas del equipo en sus partidos ya jugados del torneo
async function getWorldCupTeamStats(teamId: number) {
  const response = await fetch(
    `https://api.football-data.org/v4/teams/${teamId}/matches?competitions=WC&status=FINISHED`,
    {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN! },
      cache: 'no-store',
    }
  )
  if (!response.ok) return null
  const data = await response.json()
  const matches = data.matches || []
  if (matches.length === 0) return null

  let goalsFor = 0
  let goalsAgainst = 0

  for (const m of matches) {
    const isHome = m.homeTeam.id === teamId
    const teamScore = isHome ? m.score.fullTime.home : m.score.fullTime.away
    const opponentScore = isHome ? m.score.fullTime.away : m.score.fullTime.home
    goalsFor += teamScore ?? 0
    goalsAgainst += opponentScore ?? 0
  }

  return {
    avgFor: goalsFor / matches.length,
    avgAgainst: goalsAgainst / matches.length,
  }
}

export async function generatePrediction(
  homeTeamId: number,
  awayTeamId: number,
  competitionCode: string
) {
  let homeStats, awayStats

  if (competitionCode === 'WC') {
    homeStats = await getWorldCupTeamStats(homeTeamId)
    awayStats = await getWorldCupTeamStats(awayTeamId)
  } else {
    const table = await getStandings(competitionCode)
    homeStats = table ? findTeamStats(table, homeTeamId) : null
    awayStats = table ? findTeamStats(table, awayTeamId) : null
  }

  const leagueAvgGoals = 1.3
  const homeAttack = homeStats ? homeStats.avgFor / leagueAvgGoals : 1
  const homeDefense = homeStats ? homeStats.avgAgainst / leagueAvgGoals : 1
  const awayAttack = awayStats ? awayStats.avgFor / leagueAvgGoals : 1
  const awayDefense = awayStats ? awayStats.avgAgainst / leagueAvgGoals : 1

  const expectedHomeGoals = homeAttack * awayDefense * leagueAvgGoals * 1.1
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

  const winnerProbs = [pHomeWin, pDraw, pAwayWin].sort((a, b) => b - a)
  const winnerDiff = winnerProbs[0] - winnerProbs[1]
  const winnerConfidence = Math.min(95, Math.max(50, Math.round(50 + winnerDiff * 60)))

  const scoreConfidence = Math.min(60, Math.max(15, Math.round(bestProb * 250)))

  const pUnder25 = 1 - pOver25
  const goalsDiff = Math.abs(pOver25 - pUnder25)
  const goalsConfidence = Math.min(95, Math.max(50, Math.round(50 + goalsDiff * 90)))

  let predictedWinner: string
  if (pHomeWin > pDraw && pHomeWin > pAwayWin) predictedWinner = 'home'
  else if (pAwayWin > pDraw && pAwayWin > pHomeWin) predictedWinner = 'away'
  else predictedWinner = 'draw'

  return {
    predicted_winner: predictedWinner,
    predicted_score: `${bestHome}-${bestAway}`,
    over_under_25: pOver25 > 0.5 ? 'Más de 2.5' : 'Menos de 2.5',
    corners_prediction: '+9.5',
    confidence_winner: winnerConfidence,
    confidence_score: scoreConfidence,
    confidence_ou: goalsConfidence,
  }
}
