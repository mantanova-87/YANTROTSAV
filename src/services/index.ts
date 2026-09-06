import { authService } from './appwrite/auth.service'
import { eventsService } from './appwrite/events.service'
import { teamsService } from './appwrite/teams.service'
import { adminService } from './appwrite/admin.service'
import { client, account, databases, storage, teams } from './appwrite/client'
import { AppError, mapAppwriteError, logError } from './appwrite/errorMapper'

/**
 * Centralized Appwrite Facade Service
 */
export const appwriteService = {
  auth: authService,
  events: eventsService,
  teams: teamsService,
  admin: adminService,
  raw: {
    client,
    account,
    databases,
    storage,
    teams,
  },
}

// Re-export individual services and error utilities
export {
  authService,
  eventsService,
  teamsService,
  adminService,
  AppError,
  mapAppwriteError,
  logError,
}

export default appwriteService
