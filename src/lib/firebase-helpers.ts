// Firebase Realtime Database rejects any value that's literally `undefined`.
// (It accepts `null` to mean "delete this field," but undefined throws
//  "value argument contains undefined in property ...".)
// Strip undefined entries before passing an object to set / update.
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) result[key] = obj[key]
  }
  return result as Partial<T>
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Format a YYYY-MM-DD string as "22 May 2026" for display in disabled fields.
export function formatDisplayDate(ymd: string): string {
  const [y, m, d] = ymd.split('-')
  if (!y || !m || !d) return ymd
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1] ?? m} ${y}`
}
