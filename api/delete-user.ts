import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { userId, docId, email } = req.body ?? {}
  if (!userId && !docId && !email) {
    return res.status(400).json({
      success: false,
      message: 'Missing user identification (userId, docId, or email)',
    })
  }

  const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID || '6a9be53300040e6fd485'
  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || '6a9be599001bf72a4855'
  const apiKey = process.env.APPWRITE_API_KEY || process.env.VITE_APPWRITE_API_KEY

  let authDeleted = false
  let tableDeleted = false
  const errors: string[] = []

  if (apiKey) {
    try {
      let targetAuthId = userId
      if (email) {
        try {
          const listRes = await fetch(`${endpoint}/users?search=${encodeURIComponent(email)}`, {
            headers: {
              'X-Appwrite-Project': projectId,
              'X-Appwrite-Key': apiKey,
            },
          })
          if (listRes.ok) {
            const listData = (await listRes.json()) as any
            const matched = listData.users?.find(
              (u: any) => u.email?.toLowerCase() === email.toLowerCase(),
            )
            if (matched) {
              targetAuthId = matched.$id
            }
          }
        } catch (e: any) {
          console.warn('Could not search user by email in Appwrite Auth:', e.message)
        }
      }

      if (targetAuthId) {
        const delAuthRes = await fetch(`${endpoint}/users/${targetAuthId}`, {
          method: 'DELETE',
          headers: {
            'X-Appwrite-Project': projectId,
            'X-Appwrite-Key': apiKey,
          },
        })
        if (delAuthRes.ok || delAuthRes.status === 404) {
          authDeleted = true
        } else {
          const errText = await delAuthRes.text()
          errors.push(`Auth delete status: ${delAuthRes.status} ${errText}`)
        }
      }

      const targetDocId = docId || userId
      if (targetDocId) {
        const delDocRes = await fetch(
          `${endpoint}/databases/${databaseId}/collections/users/documents/${targetDocId}`,
          {
            method: 'DELETE',
            headers: {
              'X-Appwrite-Project': projectId,
              'X-Appwrite-Key': apiKey,
            },
          },
        )
        if (delDocRes.ok || delDocRes.status === 404) {
          tableDeleted = true
        } else {
          const errText = await delDocRes.text()
          errors.push(`Table delete status: ${delDocRes.status} ${errText}`)
        }
      }
    } catch (err: any) {
      errors.push(`Server API error: ${err.message}`)
    }
  } else {
    errors.push('APPWRITE_API_KEY is not configured in environment. Auth deletion skipped.')
  }

  return res.status(200).json({
    success: true,
    authDeleted,
    tableDeleted,
    warnings: errors.length > 0 ? errors : undefined,
  })
}
