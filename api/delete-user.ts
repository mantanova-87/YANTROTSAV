import type { VercelRequest, VercelResponse } from '@vercel/node'

/** Deletes the Auth user and matching users-table row as one retriable operation.
 * A 404 is a successful result: retrying after a lost connection must be safe.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' })

  const { docId, authUserId, email } = req.body ?? {}
  if (!docId && !authUserId && !email) {
    return res.status(400).json({ success: false, message: 'Missing user identification' })
  }

  const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID || '6a9be53300040e6fd485'
  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || '6a9be599001bf72a4855'
  const apiKey = process.env.APPWRITE_API_KEY
  if (!apiKey) {
    return res.status(503).json({ success: false, message: 'APPWRITE_API_KEY is not configured on the server.' })
  }

  const headers = { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey }
  const errors: string[] = []
  let targetAuthId = authUserId || docId

  // Prefer the canonical Auth ID, but resolve by email for legacy records whose IDs differ.
  if (email) {
    try {
      const lookup = await fetch(`${endpoint}/users?search=${encodeURIComponent(email)}`, { headers })
      if (lookup.ok) {
        const data = await lookup.json() as { users?: Array<{ $id: string; email?: string }> }
        const match = data.users?.find((user) => user.email?.toLowerCase() === email.toLowerCase())
        if (match) targetAuthId = match.$id
      }
    } catch (error: any) {
      errors.push(`Could not resolve Auth user: ${error.message}`)
    }
  }

  // Delete the profile first. If interrupted, the persisted browser operation retries the Auth delete.
  const profileId = docId || targetAuthId
  let tableDeleted = false
  if (profileId) {
    try {
      const response = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents/${profileId}`, { method: 'DELETE', headers })
      tableDeleted = response.ok || response.status === 404
      if (!tableDeleted) errors.push(`Profile delete returned ${response.status}: ${await response.text()}`)
    } catch (error: any) {
      errors.push(`Profile delete failed: ${error.message}`)
    }
  }

  let authDeleted = false
  if (targetAuthId) {
    try {
      const response = await fetch(`${endpoint}/users/${targetAuthId}`, { method: 'DELETE', headers })
      authDeleted = response.ok || response.status === 404
      if (!authDeleted) errors.push(`Auth delete returned ${response.status}: ${await response.text()}`)
    } catch (error: any) {
      errors.push(`Auth delete failed: ${error.message}`)
    }
  }

  const success = tableDeleted && authDeleted
  return res.status(success ? 200 : 503).json({ success, tableDeleted, authDeleted, errors: errors.length ? errors : undefined })
}
