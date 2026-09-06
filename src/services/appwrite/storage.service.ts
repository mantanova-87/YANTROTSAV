import { ID } from 'appwrite'
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
   * Upload an event banner image to Appwrite Storage
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
      // Passing undefined for permissions lets Appwrite use Bucket-level permissions
      const uploadedFile = await storage.createFile(
        this.bucketId,
        fileId,
        file
      )
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
   * Delete a banner image from storage bucket
   */
  async deleteEventBanner(fileId: string): Promise<void> {
    try {
      await storage.deleteFile(this.bucketId, fileId)
    } catch (error) {
      console.warn(`[StorageService] Failed to delete file ${fileId}:`, error)
    }
  }
}

export const storageService = new StorageService()
