export const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function normalizeMobile(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10)
}

export function getContactError(email: string, phone: string): string | null {
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address, for example name@example.com.'
  if (!INDIAN_MOBILE_PATTERN.test(phone)) return 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
  return null
}
