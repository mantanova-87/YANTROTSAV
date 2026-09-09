import { randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const USERNAME_PATTERN = /^[a-z0-9._]{1,30}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[6-9]\d{9}$/
const ACADEMIC_STAGES = new Set([
  ...Array.from({ length: 12 }, (_, index) => String(index + 1)),
  ...Array.from({ length: 6 }, (_, index) => `year-${index + 1}`),
  'not-applicable',
])

function messageForAppwriteFailure(status: number, body: string): string {
  const lower = body.toLowerCase()
  if (status === 409 && (lower.includes('userid') || lower.includes('idx_userid'))) return 'This username is already taken.'
  if (status === 409 && lower.includes('email')) return 'An account with this email already exists.'
  if (status === 409 && lower.includes('roll')) return 'A student with this roll number is already registered.'
  return 'Registration could not be completed. Please try again.'
}

/** Public registration endpoint. Validation and writes happen here, never via a browser API key. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' })

  const source = req.body ?? {}
  const username = String(source.username ?? '').trim().toLowerCase().replace(/^@+/, '')
  const email = String(source.email ?? '').trim().toLowerCase()
  const password = String(source.password ?? '')
  const fullName = String(source.fullName ?? '').trim()
  const phone = String(source.phone ?? '').replace(/\D/g, '').slice(0, 10)
  const rollNumber = String(source.rollNumber ?? '').trim()
  const department = String(source.department ?? '').trim()
  const customDepartment = String(source.customDepartment ?? '').trim()
  const semester = String(source.semester ?? '').trim()

  if (!fullName || !rollNumber || !department) return res.status(400).json({ success: false, message: 'Complete all required registration fields.' })
  if (department === 'OTHER' && !customDepartment) return res.status(400).json({ success: false, message: 'Specify your department when selecting Other.' })
  if (!USERNAME_PATTERN.test(username) || username.startsWith('.') || username.endsWith('.') || username.includes('..')) {
    return res.status(400).json({ success: false, message: 'Username must be 1–30 lowercase letters, numbers, periods, or underscores.' })
  }
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' })
  if (!PHONE_PATTERN.test(phone)) return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number.' })
  if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' })
  if (!ACADEMIC_STAGES.has(semester)) return res.status(400).json({ success: false, message: 'Select a valid academic stage.' })

  const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID || '6a9be53300040e6fd485'
  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || '6a9be599001bf72a4855'
  const usersCollection = process.env.VITE_APPWRITE_COLLECTION_USERS || 'users'
  const apiKey = process.env.APPWRITE_API_KEY
  if (!apiKey) return res.status(503).json({ success: false, message: 'Registration service is not configured.' })

  const headers = { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey }
  const userId = randomUUID()
  const authResponse = await fetch(`${endpoint}/users`, {
    method: 'POST', headers,
    body: JSON.stringify({ userId, email, password, name: fullName.slice(0, 128) }),
  })
  if (!authResponse.ok) return res.status(authResponse.status === 409 ? 409 : 503).json({ success: false, message: messageForAppwriteFailure(authResponse.status, await authResponse.text()) })

  const data: Record<string, string> = {
    userId: username, fullName: fullName.slice(0, 128), email, phone, rollNumber: rollNumber.slice(0, 128), department, semester,
  }
  if (customDepartment) data.customDepartment = customDepartment.slice(0, 128)

  let profileResponse = await fetch(`${endpoint}/databases/${databaseId}/collections/${usersCollection}/documents`, {
    method: 'POST', headers,
    body: JSON.stringify({ documentId: userId, data, permissions: ['read("any")', 'update("any")', 'delete("any")'] }),
  })
  // Some projects do not have customDepartment in their schema. Retrying without it preserves all core data.
  if (!profileResponse.ok && customDepartment && (await profileResponse.clone().text()).toLowerCase().includes('customdepartment')) {
    delete data.customDepartment
    profileResponse = await fetch(`${endpoint}/databases/${databaseId}/collections/${usersCollection}/documents`, {
      method: 'POST', headers, body: JSON.stringify({ documentId: userId, data, permissions: ['read("any")', 'update("any")', 'delete("any")'] }),
    })
  }
  if (!profileResponse.ok) {
    const failure = await profileResponse.text()
    await fetch(`${endpoint}/users/${userId}`, { method: 'DELETE', headers }).catch(() => undefined)
    return res.status(profileResponse.status === 409 ? 409 : 503).json({ success: false, message: messageForAppwriteFailure(profileResponse.status, failure) })
  }

  return res.status(201).json({ success: true, userId })
}
