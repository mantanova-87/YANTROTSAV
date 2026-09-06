import { Client, Account, Databases, Storage, Teams } from 'appwrite'
import { APPWRITE_CONFIG } from '../../config/appwrite.config'

/**
 * Initialize Appwrite Client singleton
 */
const client = new Client()

client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)

// Appwrite SDK Service Instances
export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const teams = new Teams(client)

export { client }
