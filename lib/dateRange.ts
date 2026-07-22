// Calcula el rango de "hoy" completo (00:00 a 23:59) en hora Argentina (UTC-3, sin horario de verano)
export function getArgentinaToday() {
  const ARG_OFFSET_MS = 3 * 60 * 60 * 1000

  const nowUTC = new Date()
  const nowArg = new Date(nowUTC.getTime() - ARG_OFFSET_MS)

  const year = nowArg.getUTCFullYear()
  const month = nowArg.getUTCMonth()
  const date = nowArg.getUTCDate()

  const startUTC = new Date(Date.UTC(year, month, date, 0, 0, 0) + ARG_OFFSET_MS)
  const endUTC = new Date(Date.UTC(year, month, date, 23, 59, 59) + ARG_OFFSET_MS)

  return {
    startISO: startUTC.toISOString(),
    endISO: endUTC.toISOString(),
  }
}

// Devuelve el mes actual en formato 'YYYY-MM', segun hora Argentina
export function getArgentinaCurrentMonth() {
  const ARG_OFFSET_MS = 3 * 60 * 60 * 1000
  const nowArg = new Date(Date.now() - ARG_OFFSET_MS)
  const year = nowArg.getUTCFullYear()
  const month = String(nowArg.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// Dado un string 'YYYY-MM', devuelve el rango completo de ese mes en hora Argentina
export function getMonthRange(yearMonth: string) {
  const ARG_OFFSET_MS = 3 * 60 * 60 * 1000
  const [year, month] = yearMonth.split('-').map(Number)

  const startUTC = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0) + ARG_OFFSET_MS)
  const endUTC = new Date(Date.UTC(year, month, 0, 23, 59, 59) + ARG_OFFSET_MS)

  return {
    startISO: startUTC.toISOString(),
    endISO: endUTC.toISOString(),
  }
}

export const MONTH_NAMES: Record<string, string> = {
  '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
  '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
  '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
}
