// Calcula el rango de "hoy" completo (00:00 a 23:59) en hora Argentina (UTC-3, sin horario de verano)
export function getArgentinaToday() {
  const ARG_OFFSET_MS = 3 * 60 * 60 * 1000

  const nowUTC = new Date()
  const nowArg = new Date(nowUTC.getTime() - ARG_OFFSET_MS)

  const year = nowArg.getUTCFullYear()
  const month = nowArg.getUTCMonth()
  const date = nowArg.getUTCDate()

  // Medianoche de hoy en hora Argentina, convertida a UTC real
  const startUTC = new Date(Date.UTC(year, month, date, 0, 0, 0) + ARG_OFFSET_MS)
  // 23:59:59 de hoy en hora Argentina, convertida a UTC real
  const endUTC = new Date(Date.UTC(year, month, date, 23, 59, 59) + ARG_OFFSET_MS)

  return {
    startISO: startUTC.toISOString(),
    endISO: endUTC.toISOString(),
  }
}
