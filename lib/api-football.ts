const API_BASE = 'https://v3.football.api-sports.io'

export async function getFixturesByDate(date: string) {
  const response = await fetch(`${API_BASE}/fixtures?date=${date}`, {
    headers: {
      'x-apisports-key': process.env.API_FOOTBALL_KEY!,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Error consultando API-Football: ${response.status}`)
  }

  const data = await response.json()

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football devolvió errores: ${JSON.stringify(data.errors)}`)
  }

  return data.response
}
