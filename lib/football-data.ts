const API_BASE = 'https://api.football-data.org/v4'

export async function getMatchesByDate(date: string) {
  const response = await fetch(`${API_BASE}/matches?dateFrom=${date}&dateTo=${date}`, {
    headers: {
      'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN!,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Error consultando football-data.org: ${response.status}`)
  }

  const data = await response.json()
  return data.matches
}
