import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const KEY = process.env.API_FOOTBALL_KEY!
const BASE = 'https://v3.football.api-sports.io'

async function check(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'x-apisports-key': KEY },
      cache: 'no-store',
    })
    const data = await res.json()
    return {
      results: data.results,
      errors: data.errors,
      sample: data.response?.[0] || null,
    }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function GET() {
  const [
    ligaArgentina,
    copaLibertadores,
    copaSudamericana,
    copaArgentina,
    primeraNacional,
    h2h,
    lesionados,
    resultadosEnVivo,
    cuotasPrePartido,
    estadisticasEquipo,
  ] = await Promise.all([
    check(`${BASE}/fixtures?league=128&season=2026&next=5`),
    check(`${BASE}/fixtures?league=13&season=2026&next=5`),
    check(`${BASE}/fixtures?league=11&season=2026&next=5`),
    check(`${BASE}/fixtures?league=130&season=2026&next=5`),
    check(`${BASE}/fixtures?league=129&season=2026&next=5`),
    check(`${BASE}/fixtures/headtohead?h2h=451-435&last=3`),
    check(`${BASE}/injuries?league=128&season=2026`),
    check(`${BASE}/fixtures?live=all`),
    check(`${BASE}/odds?league=128&season=2026&bet=1`),
    check(`${BASE}/teams/statistics?league=128&season=2026&team=451`),
  ])

  return NextResponse.json({
    ligaArgentina,
    copaLibertadores,
    copaSudamericana,
    copaArgentina,
    primeraNacional,
    h2h,
    lesionados,
    resultadosEnVivo,
    cuotasPrePartido,
    estadisticasEquipo,
  })
}
