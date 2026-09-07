import { ID, Permission, Role } from 'appwrite'
import { storage } from './client'
import { APPWRITE_CONFIG } from '../../config/appwrite.config'
import { mapAppwriteError } from './errorMapper'

export interface UploadResult {
  fileId: string
  fileUrl: string
  name: string
  sizeOriginal: number
}

export class StorageService {
  private bucketId: string

  constructor() {
    this.bucketId = APPWRITE_CONFIG.storage.bucketId
  }

  /**
   * Upload an event banner image to Appwrite Storage with full access permissions
   * so all admins can view, update, and delete the asset.
   */
  async uploadEventBanner(file: File): Promise<UploadResult> {
    try {
      console.log('[StorageService] Starting upload:', file.name, file.type, file.size, 'bytes')
      console.log('[StorageService] Bucket ID:', this.bucketId)

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
      if (!validTypes.includes(file.type)) {
        throw new Error(`Invalid image format (${file.type}). Supported: JPEG, PNG, WEBP, GIF, SVG.`)
      }

      // Max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size exceeds 10MB limit.')
      }

      const fileId = ID.unique()
      console.log('[StorageService] Generated fileId:', fileId)

      console.log('[StorageService] Calling storage.createFile...')
      let uploadedFile: any
      try {
        uploadedFile = await storage.createFile(
          this.bucketId,
          fileId,
          file,
          [
            Permission.read(Role.any()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ],
        )
      } catch (permErr: any) {
        console.warn(
          '[StorageService] Upload with custom permissions failed, retrying with default bucket permissions:',
          permErr?.message,
        )
        // Fallback: inherit bucket-level permissions (required if File Security is disabled)
        uploadedFile = await storage.createFile(
          this.bucketId,
          fileId,
          file,
        )
      }
      console.log('[StorageService] Upload success! File $id:', uploadedFile.$id)

      // Build the public view URL
      const fileUrl = storage.getFileView(this.bucketId, uploadedFile.$id)
      const fileUrlString = fileUrl.toString()
      console.log('[StorageService] Public URL:', fileUrlString)

      return {
        fileId: uploadedFile.$id,
        fileUrl: fileUrlString,
        name: uploadedFile.name,
        sizeOriginal: uploadedFile.sizeOriginal,
      }
    } catch (error: any) {
      console.error('[StorageService] Upload FAILED:', error)
      console.error('[StorageService] Error code:', error?.code)
      console.error('[StorageService] Error type:', error?.type)
      console.error('[StorageService] Error message:', error?.message)
      throw mapAppwriteError(error, 'StorageService.uploadEventBanner')
    }
  }

  /**
   * Robustly extract Appwrite Storage fileId from any banner URL or raw ID string.
   */
  extractFileId(bannerUrl?: string | null): string | null {
    if (!bannerUrl || typeof bannerUrl !== 'string') return null
    const trimmed = bannerUrl.trim()
    if (!trimmed) return null

    // Pattern 1: Appwrite storage URL - .../files/:fileId(/view|preview|download)?...
    const match = trimmed.match(/\/files\/([a-zA-Z0-9_-]+)/)
    if (match && match[1]) {
      return match[1]
    }

    // Pattern 2: Raw fileId string (Appwrite unique IDs are alphanumeric)
    if (/^[a-zA-Z0-9_-]{10,40}$/.test(trimmed)) {
      return trimmed
    }

    return null
  }

  /**
   * Get direct preview URL for an image with optional dimensions
   */
  getBannerPreviewUrl(fileId: string, width = 800, height = 450, quality = 85): string {
    try {
      return storage.getFilePreview(
        this.bucketId,
        fileId,
        width,
        height,
        undefined,
        quality
      ).toString()
    } catch {
      return ''
    }
  }

  /**
   * Get direct view URL
   */
  getBannerViewUrl(fileId: string): string {
    try {
      return storage.getFileView(this.bucketId, fileId).toString()
    } catch {
      return ''
    }
  }

  /**
   * Delete a banner image from storage bucket.
   * Tries client SDK first, then falls back to server API if permissions or session restricts client delete.
   */
  async deleteEventBanner(fileId: string): Promise<boolean> {
    if (!fileId?.trim()) return false
    const safeFileId = fileId.trim()
    console.log(`[StorageService] Attempting to delete banner file ${safeFileId}...`)

    // Step 1: Direct client SDK deletion
    try {
      await storage.deleteFile(this.bucketId, safeFileId)
      console.log(`[StorageService] ✅ Successfully deleted file ${safeFileId} via client SDK`)
      return true
    } catch (clientErr: any) {
      console.warn(`[StorageService] Client SDK deleteFile failed for ${safeFileId}:`, clientErr?.message || clientErr)
    }

    // Step 2: Fallback to server endpoint (uses APPWRITE_API_KEY when available)
    try {
      const res = await fetch('/api/admin/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucketId: this.bucketId,
          fileId: safeFileId,
        }),
      })

      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data.success) {
          console.log(`[StorageService] ✅ Successfully deleted file ${safeFileId} via server fallback API`)
          return true
        }
      }
    } catch (fallbackErr) {
      console.warn(`[StorageService] Server fallback delete-file failed for ${safeFileId}:`, fallbackErr)
    }

    return false
  }

  /**
   * Helper to delete banner directly from a URL string
   */
  async deleteEventBannerFromUrl(bannerUrl?: string | null): Promise<boolean> {
    const fileId = this.extractFileId(bannerUrl)
    if (!fileId) return false
    return this.deleteEventBanner(fileId)
  }
}

export const storageService = new StorageService()

