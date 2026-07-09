const API_BASE = 'https://v3.football.api-sports.io'

export async function getFixturesByDate(date: string) {
  const response = await fetch(`${API_BASE}/fixtures?date=${d