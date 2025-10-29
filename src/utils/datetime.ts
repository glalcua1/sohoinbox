export function formatRelativeTime(isoOrDate: string | Date): string {
  const now = Date.now()
  const t = typeof isoOrDate === 'string' ? new Date(isoOrDate).getTime() : isoOrDate.getTime()
  let seconds = Math.max(1, Math.floor((now - t) / 1000))

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.348, 'week'], // approx
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ]

  let unitIndex = 0
  let value = seconds
  for (const [step] of units) {
    if (value < step) {
      const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
      const unitForValue = (unitIndex === 0 ? 'second' : units[unitIndex][1]) as Intl.RelativeTimeFormatUnit
      const display = -Math.floor(value)
      return rtf.format(display, unitForValue)
    }
    value = value / step
    unitIndex++
  }
  return 'just now'
}

export function lastInboundTimestampISO<T extends { inbound: boolean; timestamp: string }>(messages: T[]): string | undefined {
  const m = [...messages].reverse().find((msg) => msg.inbound)
  return m?.timestamp
}


