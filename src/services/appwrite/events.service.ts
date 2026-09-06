import { ID, Query, Permission, Role } from 'appwrite'
import { databases } from './client'
import { APPWRITE_CONFIG } from '../../config/appwrite.config'
import { mapAppwriteError, AppError } from './errorMapper'
import { storageService } from './storage.service'
import type { EventDocument, CreateEventDTO, UpdateEventDTO, EventStatus } from '../../types/database.types'

// Only valid attributes in the Appwrite `events` collection schema:
// title, category, description, eventType, minTeamSize, maxTeamSize,
// maxTeamsAllowed, registrationDeadline, status, bannerUrl, venue

export class EventsService {

  /** Fetch all events from DB, optionally filtered by category / status */
  async getEvents(options?: {
    category?: string
    status?: EventStatus
    limit?: number
  }): Promise<EventDocument[]> {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.events,
      [Query.limit(options?.limit ?? 100), Query.orderDesc('$createdAt')],
    )

    let docs = response.documents as unknown as EventDocument[]

    if (options?.category && options.category !== 'all') {
      docs = docs.filter((e) => e.category?.toLowerCase() === options.category!.toLowerCase())
    }
    if (options?.status) {
      docs = docs.filter((e) => e.status === options.status)
    }

    return docs
  }

  /** Fetch a single event by its Appwrite document ID */
  async getEventById(eventId: string): Promise<EventDocument> {
    const doc = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.events,
      eventId,
    )
    return doc as unknown as EventDocument
  }

  /**
   * Create a new event (Admin only).
   * Only sends attributes that exist in the Appwrite schema.
   */
  async createEvent(data: CreateEventDTO): Promise<EventDocument> {
    if (!data.title?.trim()) throw new AppError('Event title is required.', 'UNKNOWN_ERROR', 400)
    if (!data.description?.trim()) throw new AppError('Event description is required.', 'UNKNOWN_ERROR', 400)

    const eventType = (data.eventType || data.format || 'team') as 'solo' | 'team'
    const isSolo = eventType === 'solo'

    // Build payload with ONLY the exact schema attributes
    const payload: Record<string, unknown> = {
      title:       data.title.trim(),
      category:    (data.category || 'other').trim().toLowerCase(),
      description: data.description.trim(),
      eventType,
      minTeamSize: isSolo ? 1 : Math.max(1, Number(data.minTeamSize) || 2),
      maxTeamSize: isSolo ? 1 : Math.max(1, Number(data.maxTeamSize) || 4),
      maxTeamsAllowed: Number(data.maxTeamsAllowed || data.maxTeams) || 50,
      status:      data.status || 'published',
    }

    // Optional: venue
    if (data.venue?.trim()) payload.venue = data.venue.trim()

    // Optional: bannerUrl
    if (data.bannerUrl?.trim()) payload.bannerUrl = data.bannerUrl.trim()

    // Optional: eventTiming — ISO datetime or formatted date
    if (data.eventTiming?.trim() || data.eventDate?.trim()) {
      const timeVal = (data.eventTiming || data.eventDate || '').trim()
      const parsed = new Date(timeVal)
      payload.eventTiming = !isNaN(parsed.getTime()) ? parsed.toISOString() : timeVal
    }

    // Optional: registrationDeadline — MUST be a valid ISO datetime
    if (data.registrationDeadline?.trim()) {
      const parsed = new Date(data.registrationDeadline.trim())
      if (!isNaN(parsed.getTime())) {
        payload.registrationDeadline = parsed.toISOString()
      }
    }

    try {
      const doc = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.events,
        ID.unique(),
        payload,
        [
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ],
      )
      return doc as unknown as EventDocument
    } catch (error) {
      throw mapAppwriteError(error, 'EventsService.createEvent')
    }
  }

  /**
   * Update an existing event (Admin only).
   * Sends only the fields that are provided.
   */
  async updateEvent(eventId: string, data: UpdateEventDTO): Promise<EventDocument> {
    const payload: Record<string, unknown> = {}

    if (data.title !== undefined)       payload.title       = data.title.trim()
    if (data.category !== undefined)    payload.category    = data.category.trim().toLowerCase()
    if (data.description !== undefined) payload.description = data.description.trim()
    if (data.status !== undefined)      payload.status      = data.status

    if (data.eventType !== undefined || data.format !== undefined) {
      payload.eventType = data.eventType || data.format
    }
    if (data.minTeamSize !== undefined) payload.minTeamSize = Number(data.minTeamSize)
    if (data.maxTeamSize !== undefined) payload.maxTeamSize = Number(data.maxTeamSize)
    if (data.maxTeamsAllowed !== undefined || data.maxTeams !== undefined) {
      payload.maxTeamsAllowed = Number(data.maxTeamsAllowed || data.maxTeams)
    }
    if (data.venue !== undefined) {
      payload.venue = data.venue?.trim() || null
    }
    if (data.bannerUrl !== undefined) {
      payload.bannerUrl = data.bannerUrl?.trim() || null
    }
    if (data.eventTiming !== undefined || data.eventDate !== undefined) {
      const timeVal = (data.eventTiming || data.eventDate || '').trim()
      if (timeVal) {
        const parsed = new Date(timeVal)
        payload.eventTiming = !isNaN(parsed.getTime()) ? parsed.toISOString() : timeVal
      } else {
        payload.eventTiming = null
      }
    }
    if (data.registrationDeadline !== undefined) {
      if (data.registrationDeadline?.trim()) {
        const parsed = new Date(data.registrationDeadline.trim())
        payload.registrationDeadline = !isNaN(parsed.getTime()) ? parsed.toISOString() : null
      } else {
        payload.registrationDeadline = null
      }
    }

    try {
      const doc = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.events,
        eventId,
        payload,
      )
      return doc as unknown as EventDocument
    } catch (error) {
      throw mapAppwriteError(error, 'EventsService.updateEvent')
    }
  }

  /**
   * Permanently delete an event by ID, cascade-deleting all associated records:
   * 1. event_registrations (all enrolled students)
   * 2. team_invitations (all pending/accepted invites)
   * 3. teams (all formed teams for this event)
   * 4. uploaded storage banner asset
   * 5. the event document itself
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      // 1. Fetch event metadata to locate storage banner
      let eventDoc: EventDocument | null = null
      try {
        eventDoc = await this.getEventById(eventId)
      } catch {
        // continue if getEventById fails
      }

      // 2. Cascade delete all event_registrations for this event
      try {
        let hasMoreRegs = true
        while (hasMoreRegs) {
          const regsRes = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.eventRegistrations,
            [Query.equal('eventId', eventId), Query.limit(100)],
          )
          if (regsRes.documents.length === 0) {
            hasMoreRegs = false
            break
          }
          await Promise.all(
            regsRes.documents.map((doc) =>
              databases
                .deleteDocument(
                  APPWRITE_CONFIG.databaseId,
                  APPWRITE_CONFIG.collections.eventRegistrations,
                  doc.$id,
                )
                .catch((err) => console.warn(`Error deleting registration ${doc.$id}:`, err)),
            ),
          )
          if (regsRes.documents.length < 100) {
            hasMoreRegs = false
          }
        }
      } catch (regsErr) {
        console.warn('Error during registrations cascade deletion:', regsErr)
      }

      // 3. Cascade delete all team_invitations for this event
      try {
        let hasMoreInvites = true
        while (hasMoreInvites) {
          const invitesRes = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teamInvitations,
            [Query.equal('eventId', eventId), Query.limit(100)],
          )
          if (invitesRes.documents.length === 0) {
            hasMoreInvites = false
            break
          }
          await Promise.all(
            invitesRes.documents.map((doc) =>
              databases
                .deleteDocument(
                  APPWRITE_CONFIG.databaseId,
                  APPWRITE_CONFIG.collections.teamInvitations,
                  doc.$id,
                )
                .catch((err) => console.warn(`Error deleting invitation ${doc.$id}:`, err)),
            ),
          )
          if (invitesRes.documents.length < 100) {
            hasMoreInvites = false
          }
        }
      } catch (invErr) {
        console.warn('Error during invitations cascade deletion:', invErr)
      }

      // 4. Cascade delete all teams for this event
      try {
        let hasMoreTeams = true
        while (hasMoreTeams) {
          const teamsRes = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teams,
            [Query.equal('eventId', eventId), Query.limit(100)],
          )
          if (teamsRes.documents.length === 0) {
            hasMoreTeams = false
            break
          }
          await Promise.all(
            teamsRes.documents.map(async (tDoc) => {
              // Delete any lingering invitations by teamId
              try {
                const lingering = await databases.listDocuments(
                  APPWRITE_CONFIG.databaseId,
                  APPWRITE_CONFIG.collections.teamInvitations,
                  [Query.equal('teamId', tDoc.$id), Query.limit(100)],
                )
                for (const li of lingering.documents) {
                  await databases
                    .deleteDocument(
                      APPWRITE_CONFIG.databaseId,
                      APPWRITE_CONFIG.collections.teamInvitations,
                      li.$id,
                    )
                    .catch(() => {})
                }
              } catch {
                // ignore
              }

              return databases
                .deleteDocument(
                  APPWRITE_CONFIG.databaseId,
                  APPWRITE_CONFIG.collections.teams,
                  tDoc.$id,
                )
                .catch((err) => console.warn(`Error deleting team ${tDoc.$id}:`, err))
            }),
          )
          if (teamsRes.documents.length < 100) {
            hasMoreTeams = false
          }
        }
      } catch (teamsErr) {
        console.warn('Error during teams cascade deletion:', teamsErr)
      }

      // 5. Delete banner file from Storage bucket if exists
      if (eventDoc?.bannerUrl) {
        try {
          const fileMatch = eventDoc.bannerUrl.match(/\/files\/([a-zA-Z0-9_-]+)\/(view|preview|download)/)
          if (fileMatch && fileMatch[1]) {
            await storageService.deleteEventBanner(fileMatch[1])
          }
        } catch (storageErr) {
          console.warn('Error deleting event banner asset:', storageErr)
        }
      }

      // 6. Delete the event document itself
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.events,
        eventId,
      )
    } catch (error) {
      throw mapAppwriteError(error, 'EventsService.deleteEvent')
    }
  }

  /** Toggle an event between published and closed */
  async toggleRegistration(eventId: string, isOpen: boolean): Promise<EventDocument> {
    return this.updateEvent(eventId, { status: isOpen ? 'published' : 'closed' })
  }

  /** Soft capacity check — called before registration. Non-blocking on failure. */
  async incrementRegistrations(eventId: string): Promise<void> {
    try {
      const event = await this.getEventById(eventId)
      if (event.status !== 'published') {
        throw new AppError('Registration is closed for this event.', 'EVENT_REGISTRATION_CLOSED', 400)
      }
      const maxAllowed = event.maxTeamsAllowed
      const current    = (event as any).currentRegistrations ?? 0
      if (maxAllowed && current >= maxAllowed) {
        throw new AppError('Event capacity has been reached.', 'EVENT_CAPACITY_REACHED', 400)
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      // Non-critical — don't block registration if check fails
    }
  }

  /** Check capacity before registering — alias of incrementRegistrations */
  async checkCapacity(eventId: string): Promise<void> {
    return this.incrementRegistrations(eventId)
  }
}

export const eventsService = new EventsService()
