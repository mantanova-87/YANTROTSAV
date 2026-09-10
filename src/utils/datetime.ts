/** Format a Date/ISO string for `<input type="datetime-local">` (local wall-clock, no Z). */
export function toDatetimeLocalValue(value?: string | null): string {
  if (!value?.trim()) return ''

  const raw = value.trim()
  // Values already produced by datetime-local must not be re-parsed as UTC.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
    return raw.slice(0, 16)
  }

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
