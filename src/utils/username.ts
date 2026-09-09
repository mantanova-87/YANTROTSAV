/** Instagram-style handle: lowercase letters, digits, periods, underscores; 1–30 chars. */
export const USERNAME_PATTERN = /^[a-z0-9._]{1,30}$/

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/^@+/, '')
}

export function getUsernameError(value: string): string | null {
  if (!value) return 'Username is required.'
  if (!USERNAME_PATTERN.test(value)) {
    return 'Username must be 1–30 characters and use only lowercase letters, numbers, periods, or underscores.'
  }
  if (value.startsWith('.') || value.endsWith('.') || value.includes('..')) {
    return 'Username cannot start/end with a period or contain consecutive periods.'
  }
  return null
}
