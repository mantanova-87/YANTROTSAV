import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { fileId, bucketId } = req.body ?? {}
  if (!fileId?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Missing fileId parameter',
    })
  }

  const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID || '6a9be53300040e6fd485'
  const targetBucketId = bucketId?.trim() || process.env.VITE_APPWRITE_STORAGE_BUCKET_ID || 'event_banners'
  const apiKey = process.env.APPWRITE_API_KEY || process.env.VITE_APPWRITE_API_KEY

  if (!apiKey) {
    return res.status(200).json({
      success: false,
      message: 'APPWRITE_API_KEY not configured on server. Server-level deletion skipped.',
    })
  }

  try {
    const targetFileId = fileId.trim()
    const deleteUrl = `${endpoint}/storage/buckets/${targetBucketId}/files/${targetFileId}`
    console.log(`[API delete-file] Requesting delete from Appwrite: ${deleteUrl}`)

    const delRes = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
      },
    })

    if (delRes.ok || delRes.status === 204 || delRes.status === 404) {
      console.log(`[API delete-file] File ${targetFileId} deleted successfully or already removed (status: ${delRes.status})`)
      return res.status(200).json({
        success: true,
        message: `File ${targetFileId} deleted successfully.`,
      })
    }

    const errText = await delRes.text()
    console.warn(`[API delete-file] Appwrite responded with status ${delRes.status}: ${errText}`)
    return res.status(200).json({
      success: false,
      message: `Appwrite delete file returned ${delRes.status}: ${errText}`,
    })
  } catch (err: any) {
    console.error('[API delete-file] Error deleting file:', err)
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error while deleting file',
    })
  }
}
