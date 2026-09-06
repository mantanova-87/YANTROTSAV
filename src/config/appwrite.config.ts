/**
 * Centralized Appwrite Configuration
 *
 * Provides typed access to environment variables with fallback values.
 * Database: TablesDB
 * Tables/Collections: users, events, teams, team_invitations, event_registrations
 */

export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a9be53300040e6fd485',
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '6a9be599001bf72a4855',
  collections: {
    users: import.meta.env.VITE_APPWRITE_COLLECTION_USERS || 'users',
    profiles: import.meta.env.VITE_APPWRITE_COLLECTION_USERS || 'users',
    events: import.meta.env.VITE_APPWRITE_COLLECTION_EVENTS || 'events',
    teams: import.meta.env.VITE_APPWRITE_COLLECTION_TEAMS || 'teams',
    teamInvitations: import.meta.env.VITE_APPWRITE_COLLECTION_TEAM_INVITATIONS || 'team_invitations',
    eventRegistrations: import.meta.env.VITE_APPWRITE_COLLECTION_EVENT_REGISTRATIONS || 'event_registrations',
  },
  storage: {
    bucketId: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || 'event_banners',
  },
  adminTeamId: import.meta.env.VITE_APPWRITE_ADMIN_TEAM_ID || '6a9c31f2000700d2d6c9',
  appUrl: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'),
} as const

export type AppwriteConfig = typeof APPWRITE_CONFIG
