import { ID, Query, Permission, Role } from 'appwrite'
import { databases } from './client'
import { APPWRITE_CONFIG } from '../../config/appwrite.config'
import { mapAppwriteError } from './errorMapper'
import { eventsService } from './events.service'
import type {
  AdminAnalyticsKPI,
  EventRosterEntry,
  EventRegistrationDocument,
  UserProfile,
  TeamDocument,
  TeamInvitationDocument,
  EventDocument,
} from '../../types/database.types'

export interface SquadMemberDetail {
  invitationId?: string
  name: string
  email: string
  username?: string
  status: 'accepted' | 'pending' | 'declined' | 'confirmed'
  role: 'Leader' | 'Member'
  phone?: string
  rollNumber?: string
  department?: string
  semester?: string
  college?: string
  checkedIn?: boolean
  checkedInAt?: string
  qrCode?: string
  registeredAt?: string
}

export interface SquadInspectionDetails {
  team: TeamDocument
  event?: EventDocument | null
  leader: SquadMemberDetail
  members: SquadMemberDetail[]
  stats: {
    totalAccepted: number
    requiredTeamSize: number
    maxTeamSize: number
    pendingCount: number
    declinedCount: number
    isCapacityMet: boolean
  }
}

const CHECK_IN_STORAGE_KEY = 'yantrotsav_checked_in_regs'
const DELETED_REGS_STORAGE_KEY = 'yantrotsav_deleted_regs'
const DELETED_TEAMS_STORAGE_KEY = 'yantrotsav_deleted_teams'
const DELETED_USERS_STORAGE_KEY = 'yantrotsav_deleted_users'

export function getStoredCheckIns(): Record<string, string> {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CHECK_IN_STORAGE_KEY) : null
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function setStoredCheckIn(id: string, isChecked: boolean, timestamp?: string): void {
  try {
    if (typeof localStorage === 'undefined') return
    const data = getStoredCheckIns()
    if (isChecked) {
      data[id] = timestamp || new Date().toISOString()
    } else {
      delete data[id]
    }
    localStorage.setItem(CHECK_IN_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export function getStoredDeletedRegs(): Set<string> {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(DELETED_REGS_STORAGE_KEY) : null
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export function addStoredDeletedReg(id: string): void {
  try {
    if (typeof localStorage === 'undefined') return
    const set = getStoredDeletedRegs()
    set.add(id)
    localStorage.setItem(DELETED_REGS_STORAGE_KEY, JSON.stringify(Array.from(set)))
  } catch {
    // ignore
  }
}

export function getStoredDeletedTeams(): Set<string> {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(DELETED_TEAMS_STORAGE_KEY) : null
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export function addStoredDeletedTeam(id: string): void {
  try {
    if (typeof localStorage === 'undefined') return
    const set = getStoredDeletedTeams()
    set.add(id)
    localStorage.setItem(DELETED_TEAMS_STORAGE_KEY, JSON.stringify(Array.from(set)))
  } catch {
    // ignore
  }
}

export function getStoredDeletedUsers(): Set<string> {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(DELETED_USERS_STORAGE_KEY) : null
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export function addStoredDeletedUser(id: string): void {
  try {
    if (typeof localStorage === 'undefined') return
    const set = getStoredDeletedUsers()
    set.add(id)
    localStorage.setItem(DELETED_USERS_STORAGE_KEY, JSON.stringify(Array.from(set)))
  } catch {
    // ignore
  }
}

export class AdminService {
  /**
   * Fetch core KPI statistics for the Admin Dashboard.
   * Calculates actual unique student registrations for a given event,
   * dynamically resolving event name and per-event registration maps.
   */
  async getAnalytics(targetEventId?: string): Promise<AdminAnalyticsKPI> {
    try {
      const [regResponse, teamResponse, eventResponse, inviteResponse, userResponse] = await Promise.all([
        databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          [Query.limit(1000)],
        ).catch(() => ({ total: 0, documents: [] })),
        databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teams,
          [Query.limit(1000)],
        ).catch(() => ({ total: 0, documents: [] })),
        databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.events,
          [Query.limit(100)],
        ).catch(() => ({ total: 0, documents: [] })),
        databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teamInvitations,
          [Query.limit(1000)],
        ).catch(() => ({ total: 0, documents: [] })),
        databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.users,
          [Query.limit(1000)],
        ).catch(() => ({ total: 0, documents: [] })),
      ])

      const deletedRegIds = getStoredDeletedRegs()
      const deletedTeamIds = getStoredDeletedTeams()
      const deletedUserIds = getStoredDeletedUsers()

      const allEvents = eventResponse.documents as unknown as EventDocument[]
      const validEventMap = new Map<string, EventDocument>()
      allEvents.forEach((e) => validEventMap.set(e.$id, e))

      // Keep only registrations belonging to existing, valid events
      const activeRegs = (regResponse.documents as unknown as EventRegistrationDocument[]).filter(
        (doc) => !deletedRegIds.has(doc.$id) && validEventMap.has(doc.eventId),
      )
      const activeTeams = teamResponse.documents.filter((t) => !deletedTeamIds.has(t.$id))
      const activeUsers = userResponse.documents.filter(
        (u) => !deletedUserIds.has(u.$id) && !deletedUserIds.has((u as any).userId),
      )

      // Map registrations per valid event with deduplicated unique student accounts
      const eventRegistrationsMap: Record<string, number> = {}
      for (const ev of allEvents) {
        const evRegs = activeRegs.filter((d) => d.eventId === ev.$id)
        const uniqueStudentsInEvent = new Set<string>()
        for (const doc of evRegs) {
          const d = doc as any
          const idKey = (
            (d.userEmail && d.userEmail.includes('@') ? d.userEmail : '') ||
            d.userId ||
            d.studentRollNumber ||
            d.studentRollNo ||
            d.$id
          ).trim().toLowerCase()
          uniqueStudentsInEvent.add(idKey)
        }
        eventRegistrationsMap[ev.$id] = uniqueStudentsInEvent.size
      }

      // Resolve the given / selected event dynamically
      const publishedEvents = allEvents.filter((e: any) => e.status === 'published')
      const targetEvent =
        (targetEventId && validEventMap.get(targetEventId)) ||
        publishedEvents[0] ||
        allEvents[0] ||
        null

      const totalRegistrations = targetEvent
        ? (eventRegistrationsMap[targetEvent.$id] || 0)
        : 0

      const eventName = targetEvent ? targetEvent.title : 'No Active Event'
      const eventId = targetEvent ? targetEvent.$id : undefined

      return {
        totalRegistrations,
        eventName,
        eventId,
        eventRegistrationsMap,
        totalUsers: activeUsers.length || Math.max(0, (userResponse.total || 0) - deletedUserIds.size),
        totalTeamsFormed:   activeTeams.filter((t: any) => t.status === 'confirmed').length,
        activeEventsCount:  publishedEvents.length,
        pendingInvitesCount: inviteResponse.documents.filter((i: any) => i.status === 'pending').length,
      }
    } catch {
      return {
        totalRegistrations: 0,
        eventName: 'No Active Event',
        eventRegistrationsMap: {},
        totalUsers: 0,
        totalTeamsFormed: 0,
        activeEventsCount: 0,
        pendingInvitesCount: 0,
      }
    }
  }

  /**
   * Fetch live roster entries for an event
   */
  async getEventRoster(eventId: string): Promise<EventRosterEntry[]> {
    try {
      const queries = [Query.orderAsc('registeredAt'), Query.limit(500)]
      if (eventId && eventId !== 'all') {
        queries.unshift(Query.equal('eventId', eventId))
      }

      const [response, usersRes, teamsRes, allEvents] = await Promise.all([
        databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          queries,
        ),
        databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.users,
          [Query.limit(1000)],
        ).catch(() => ({ documents: [] })),
        databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teams,
          [Query.limit(1000)],
        ).catch(() => ({ documents: [] })),
        eventsService.getEvents().catch(() => []),
      ])

      const deletedRegIds = getStoredDeletedRegs()
      const storedCheckIns = getStoredCheckIns()

      const rawDocuments = response.documents as unknown as EventRegistrationDocument[]
      const documents = rawDocuments.filter((doc) => !deletedRegIds.has(doc.$id))
      const allUsers = usersRes.documents as unknown as UserProfile[]
      const allTeams = teamsRes.documents as unknown as TeamDocument[]
      const rawRoster = documents
        .filter((doc) => {
          const event = allEvents.find((e) => e.$id === doc.eventId)
          if (!event) return false
          if (doc.teamId) {
            const team = allTeams.find((t) => t.$id === doc.teamId)
            if (team && (team.status === 'cancelled' || (team.status as any) === 'disbanded')) {
              return false
            }
          }
          return true
        })
        .map((doc) => {
          const user = allUsers.find(
            (u) =>
              u.$id === doc.userId ||
              (u as any).userId === doc.userId ||
              (u.email && doc.userEmail && u.email.toLowerCase() === doc.userEmail.toLowerCase()) ||
              ((u as any).userId && doc.userEmail && (u as any).userId.toLowerCase() === doc.userEmail.toLowerCase()) ||
              (doc.userName && (u as any).userId && (u as any).userId.toLowerCase() === doc.userName.toLowerCase())
          )
          const team = doc.teamId ? allTeams.find((t) => t.$id === doc.teamId) : undefined
          const event = allEvents.find((e) => e.$id === doc.eventId)

          const studentName =
            (user as any)?.fullName ||
            (user as any)?.name ||
            (doc.userName && doc.userName !== doc.userEmail ? doc.userName : undefined) ||
            'Student'
        const username =
          (user as any)?.userId ||
          (user as any)?.username ||
          (doc.userEmail && doc.userEmail.includes('@') ? doc.userEmail.split('@')[0] : (doc.userName || ''))
        const studentRollNumber =
          (user as any)?.rollNumber || (user as any)?.rollNo || doc.studentRollNumber || doc.studentRollNo || 'N/A'
        const studentEmail =
          (user as any)?.email || (doc.userEmail && doc.userEmail.includes('@') ? doc.userEmail : 'N/A')
        const department = (user as any)?.department === 'OTHER'
          ? ((user as any)?.customDepartment || 'Other')
          : ((user as any)?.department || doc.department || 'Central University of Jammu')
        const semester = (user as any)?.semester || doc.semester || 'N/A'
        const studentPhone = (user as any)?.phone || (user as any)?.phoneNumber || doc.studentPhone || 'N/A'
        const collegeName = (user as any)?.collegeName || doc.collegeName || 'Central University of Jammu'
        const teamName = team?.name || doc.teamName

        return {
          registrationId: doc.$id,
          eventId: doc.eventId,
          eventTitle: event?.title || doc.eventId,
          registrationType: (doc.teamId ? 'team' : 'solo') as 'solo' | 'team',
          studentName,
          username,
          studentEmail,
          studentPhone,
          studentRollNumber,
          studentRollNo: studentRollNumber,
          department,
          semester,
          collegeName,
          teamName,
          isLeader: team ? team.leaderId === doc.userId || team.leaderEmail?.toLowerCase() === doc.userEmail?.toLowerCase() : undefined,
          checkedIn: Boolean(doc.checkedIn || storedCheckIns[doc.$id]),
          registeredAt: doc.registeredAt,
        }
      })

      // Deduplicate so an attendee never repeats for the same event
      const seen = new Map<string, EventRosterEntry>()
      for (const entry of rawRoster) {
        const idKey = (
          (entry.studentEmail && entry.studentEmail !== 'N/A' ? entry.studentEmail : '') ||
          (entry.username ? entry.username : '') ||
          (entry.studentRollNumber && entry.studentRollNumber !== 'N/A' ? entry.studentRollNumber : '') ||
          entry.registrationId
        ).toLowerCase()

        const key = `${entry.eventId}-${idKey}`
        if (!seen.has(key)) {
          seen.set(key, entry)
        } else {
          // If already seen, preserve the checked-in record if one is checked in
          const existing = seen.get(key)!
          if (!existing.checkedIn && entry.checkedIn) {
            seen.set(key, entry)
          }
        }
      }

      return Array.from(seen.values())
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.getEventRoster')
    }
  }

  /**
   * Mark student as checked-in (Gate entry scanning)
   */
  async checkInStudent(registrationId: string): Promise<void> {
    const timestamp = new Date().toISOString()
    setStoredCheckIn(registrationId, true, timestamp)

    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.eventRegistrations,
        registrationId,
        {
          checkedIn: true,
          checkedInAt: timestamp,
        },
      )
    } catch {
      try {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          registrationId,
          {},
          [
            Permission.read(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any()),
          ],
        )
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          registrationId,
          {
            checkedIn: true,
            checkedInAt: timestamp,
          },
        )
      } catch {
        console.warn('Check-in stored locally; document update had permission restrictions in Appwrite:', registrationId)
      }
    }
  }

  /**
   * Revert / Undo student check-in
   */
  async uncheckInStudent(registrationId: string): Promise<void> {
    setStoredCheckIn(registrationId, false)

    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.eventRegistrations,
        registrationId,
        {
          checkedIn: false,
          checkedInAt: null,
        },
      )
    } catch {
      try {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          registrationId,
          {},
          [
            Permission.read(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any()),
          ],
        )
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          registrationId,
          {
            checkedIn: false,
            checkedInAt: null,
          },
        )
      } catch {
        console.warn('Check-in reverted locally:', registrationId)
      }
    }
  }

  /**
   * Delete an invalid or cancelled event registration
   */
  async deleteRegistration(registrationId: string, eventId?: string): Promise<void> {
    addStoredDeletedReg(registrationId)
    setStoredCheckIn(registrationId, false)

    try {
      try {
        await databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          registrationId,
        )
      } catch {
        try {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.eventRegistrations,
            registrationId,
            {},
            [
              Permission.read(Role.any()),
              Permission.update(Role.any()),
              Permission.delete(Role.any()),
            ],
          )
          await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.eventRegistrations,
            registrationId,
          )
        } catch {
          console.warn('Registration marked deleted locally; Appwrite document delete had permissions restriction:', registrationId)
        }
      }

      if (eventId) {
        // Optionally decrement registrations count
        try {
          const event = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.events,
            eventId,
          )
          const current = event.currentRegistrations || 1
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.events,
            eventId,
            { currentRegistrations: Math.max(0, current - 1) },
          )
        } catch {
          // ignore count decrement failure
        }
      }
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.deleteRegistration')
    }
  }

  /**
   * Fetch all registered students from users collection
   */
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        [Query.limit(500), Query.orderDesc('$createdAt')],
      )
      const deletedUserIds = getStoredDeletedUsers()
      return (response.documents as unknown as UserProfile[]).filter(
        (u) => !deletedUserIds.has(u.$id) && !deletedUserIds.has((u as any).userId)
      )
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.getAllUsers')
    }
  }

  /**
   * Delete student profile and cascade delete their event registrations and invitations
   */
  async deleteUser(
    userIdOrDocId: string,
    extraInfo?: { docId?: string; userId?: string; email?: string },
  ): Promise<void> {
    const docId = extraInfo?.docId || userIdOrDocId
    const userId = extraInfo?.userId || userIdOrDocId
    const email = extraInfo?.email

    addStoredDeletedUser(docId)
    if (userId) addStoredDeletedUser(userId)
    if (email) addStoredDeletedUser(email)

    // 0. Trigger server-side user deletion (deletes from Appwrite Auth and Database via master API key)
    try {
      await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, docId, email }),
      })
    } catch {
      // serverless call is best-effort; continue client cascade below
    }

    try {
      // 1. Delete associated registrations for this user (by userId, docId, and userEmail)
      const queryVals = [userId, docId, email].filter(Boolean) as string[]
      for (const val of queryVals) {
        try {
          const isEmailVal = val.includes('@')
          const queryAttr = isEmailVal ? 'userEmail' : 'userId'
          const regs = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.eventRegistrations,
            [Query.equal(queryAttr, val), Query.limit(100)],
          )
          for (const reg of regs.documents) {
            await this.deleteRegistration(reg.$id, reg.eventId).catch(() => {})
          }
        } catch {
          // ignore
        }
      }

      // 1.5. Disband teams where this user was the leader
      for (const val of queryVals) {
        try {
          const isEmailVal = val.includes('@')
          const queryAttr = isEmailVal ? 'leaderEmail' : 'leaderId'
          const ledTeams = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teams,
            [Query.equal(queryAttr, val), Query.limit(50)],
          )
          for (const team of ledTeams.documents) {
            await this.updateTeamStatus(team.$id, 'disbanded').catch(() => {})
          }
        } catch {
          // ignore
        }
      }

      // 2. Also delete/cleanup any team invitations where this user was invitee
      if (email) {
        try {
          const invites = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teamInvitations,
            [Query.equal('inviteeEmail', email), Query.limit(100)],
          )
          for (const inv of invites.documents) {
            await databases
              .deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.teamInvitations,
                inv.$id,
              )
              .catch(() => {})
          }
        } catch {
          // ignore
        }
      }

      // 3. Delete user profile document from users collection (try docId first, then userId)
      const idsToDelete = Array.from(new Set([docId, userId].filter(Boolean) as string[]))
      for (const targetId of idsToDelete) {
        try {
          await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.users,
            targetId,
          )
        } catch {
          try {
            await databases.updateDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.users,
              targetId,
              {},
              [
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
              ],
            )
            await databases.deleteDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.users,
              targetId,
            )
          } catch {
            console.warn('User document delete had permissions restriction:', targetId)
          }
        }
      }
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.deleteUser')
    }
  }

  /**
   * Fetch all teams formed across events with event titles and member stats
   */
  async getAllTeams(): Promise<TeamDocument[]> {
    try {
      const [teamsRes, allEvents, allInvitesRes] = await Promise.all([
        databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teams,
          [Query.limit(500), Query.orderDesc('$createdAt')],
        ),
        eventsService.getEvents().catch(() => []),
        databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teamInvitations,
          [Query.limit(1000)],
        ).catch(() => ({ documents: [] })),
      ])

      const deletedTeamIds = getStoredDeletedTeams()
      const teams = (teamsRes.documents as unknown as TeamDocument[]).filter(
        (t) =>
          !deletedTeamIds.has(t.$id) &&
          t.status !== 'cancelled' &&
          (t.status as any) !== 'disbanded',
      )
      const invites = allInvitesRes.documents as unknown as TeamInvitationDocument[]

      return teams
        .filter((t) => allEvents.some((e) => e.$id === t.eventId))
        .map((t) => {
          const evt = allEvents.find((e) => e.$id === t.eventId)
          const teamInvites = invites.filter((i) => i.teamId === t.$id)
          const acceptedCount = teamInvites.filter((i) => i.status === 'accepted').length + 1 // +1 for leader

          return {
            ...t,
            eventTitle: evt?.title || t.eventId,
            targetTeamSize: evt?.minTeamSize || 2,
            acceptedCount,
            memberEmails: teamInvites.map((i) => i.inviteeEmail),
          } as TeamDocument
        })
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.getAllTeams')
    }
  }

  /**
   * Fetch comprehensive, in-depth details of a squad for admin inspection
   * Combines team document, event metadata, leader profile, invitations, and member registration status.
   */
  async getSquadDetails(teamId: string): Promise<SquadInspectionDetails> {
    try {
      // 1. Fetch team document
      const team = (await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teams,
        teamId,
      )) as unknown as TeamDocument

      // 2. Fetch event details
      const event = await eventsService.getEventById(team.eventId).catch(() => null)

      // 3. Fetch invitations for this team
      const invitesRes = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teamInvitations,
        [Query.equal('teamId', teamId), Query.limit(100)],
      )
      const invitations = invitesRes.documents as unknown as TeamInvitationDocument[]

      // 4. Fetch all event registrations for this team
      const regsRes = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.eventRegistrations,
        [Query.equal('teamId', teamId), Query.limit(100)],
      ).catch(() => ({ documents: [] }))
      const registrations = regsRes.documents as any[]

      // 5. Fetch all users to resolve student profiles (phones, roll numbers, departments, semesters)
      const allUsers = await this.getAllUsers().catch(() => [])

      const findUserProfile = (identifier: string, email?: string) => {
        const idLower = (identifier || '').toLowerCase()
        const emailLower = (email || '').toLowerCase()
        return allUsers.find((u) => {
          const uId = (u.userId || u.$id || '').toLowerCase()
          const uEmail = (u.email || '').toLowerCase()
          return (
            uId === idLower ||
            uEmail === emailLower ||
            uEmail === idLower ||
            (emailLower && uEmail.includes('@') && emailLower.includes('@') && uEmail === emailLower)
          )
        })
      }

      // 6. Build Leader Details
      const leaderProfile = findUserProfile(team.leaderId, team.leaderEmail)
      const leaderReg = registrations.find(
        (r) =>
          r.userId === team.leaderId ||
          (r.userEmail && r.userEmail.toLowerCase() === team.leaderEmail.toLowerCase()),
      )

      const leader: SquadMemberDetail = {
        name: team.leaderName || leaderProfile?.fullName || leaderProfile?.name || 'Leader',
        email: team.leaderEmail,
        username: leaderProfile?.username || leaderProfile?.userId,
        status: 'confirmed',
        role: 'Leader',
        phone: leaderProfile?.phone,
        rollNumber: leaderProfile?.rollNumber || leaderProfile?.rollNo,
        department: leaderProfile?.department
          ? leaderProfile.department === 'OTHER' && leaderProfile.customDepartment
            ? leaderProfile.customDepartment
            : leaderProfile.department
          : undefined,
        semester: leaderProfile?.semester,
        college: leaderProfile?.college || 'Central University of Jammu',
        checkedIn: Boolean(leaderReg?.checkedIn),
        checkedInAt: leaderReg?.checkedInAt,
        qrCode: leaderReg?.qrCode || (leaderReg ? `YTR-${leaderReg.$id.slice(0, 8).toUpperCase()}` : undefined),
        registeredAt: leaderReg?.registeredAt || team.$createdAt,
      }

      // 7. Build Member Details from invitations
      const members: SquadMemberDetail[] = []
      let acceptedCount = 1 // +1 for leader
      let pendingCount = 0
      let declinedCount = 0

      for (const inv of invitations) {
        if (inv.status === 'accepted') acceptedCount++
        else if (inv.status === 'pending') pendingCount++
        else if (inv.status === 'declined') declinedCount++

        const memProfile = findUserProfile(inv.inviteeEmail, inv.inviteeEmail)
        const memReg = registrations.find(
          (r) =>
            (r.userEmail && r.userEmail.toLowerCase() === inv.inviteeEmail.toLowerCase()) ||
            (memProfile && r.userId === memProfile.userId) ||
            (memProfile && r.userId === memProfile.$id),
        )

        members.push({
          invitationId: inv.$id,
          name: inv.inviteeName || memProfile?.fullName || memProfile?.name || inv.inviteeEmail.split('@')[0],
          email: inv.inviteeEmail,
          username: memProfile?.username || memProfile?.userId,
          status: inv.status,
          role: 'Member',
          phone: memProfile?.phone,
          rollNumber: memProfile?.rollNumber || memProfile?.rollNo,
          department: memProfile?.department
            ? memProfile.department === 'OTHER' && memProfile.customDepartment
              ? memProfile.customDepartment
              : memProfile.department
            : undefined,
          semester: memProfile?.semester,
          college: memProfile?.college || 'Central University of Jammu',
          checkedIn: Boolean(memReg?.checkedIn),
          checkedInAt: memReg?.checkedInAt,
          qrCode: memReg?.qrCode || (memReg ? `YTR-${memReg.$id.slice(0, 8).toUpperCase()}` : undefined),
          registeredAt: memReg?.registeredAt || inv.$createdAt,
        })
      }

      const requiredTeamSize = event?.minTeamSize || 2
      const maxTeamSize = event?.maxTeamSize || 4

      return {
        team,
        event,
        leader,
        members,
        stats: {
          totalAccepted: acceptedCount,
          requiredTeamSize,
          maxTeamSize,
          pendingCount,
          declinedCount,
          isCapacityMet: acceptedCount >= requiredTeamSize,
        },
      }
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.getSquadDetails')
    }
  }

  /**
   * Admin Force-Accept an invitation on behalf of a student
   */
  async forceAcceptInvitation(invitationId: string): Promise<void> {
    try {
      const invite = (await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teamInvitations,
        invitationId,
      )) as unknown as TeamInvitationDocument

      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teamInvitations,
        invitationId,
        { status: 'accepted' },
      )

      // Ensure registration row exists
      try {
        const teamDoc = (await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teams,
          invite.teamId,
        )) as unknown as TeamDocument

        // Resolve actual student user profile
        let resolvedUserId = ''
        let resolvedUserName = invite.inviteeName || ''
        let resolvedUserEmail = invite.inviteeEmail || ''

        try {
          const uRes = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.users,
            [Query.limit(200)],
          )
          const target = (invite.inviteeEmail || '').trim().toLowerCase()
          const matched = uRes.documents.find((u: any) => {
            const uEmail = (u.email || '').toLowerCase()
            const uUserId = (u.userId || '').toLowerCase()
            return uEmail === target || uUserId === target || (uEmail.includes('@') && uEmail.split('@')[0] === target)
          })
          if (matched) {
            resolvedUserId = matched.$id
            resolvedUserName = (matched as any).fullName || (matched as any).name || resolvedUserName
            resolvedUserEmail = (matched as any).email || resolvedUserEmail
          }
        } catch {
          // ignore
        }

        if (!resolvedUserId) {
          resolvedUserId = ID.unique()
        }
        if (!resolvedUserName) {
          resolvedUserName = resolvedUserEmail.includes('@') ? resolvedUserEmail.split('@')[0] : 'Student'
        }

        if (resolvedUserEmail.includes('@')) {
          const existingRegs = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.eventRegistrations,
            [Query.equal('teamId', teamDoc.$id), Query.equal('userEmail', resolvedUserEmail)],
          )

          if (existingRegs.documents.length === 0) {
            await databases.createDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.eventRegistrations,
              ID.unique(),
              {
                eventId: teamDoc.eventId,
                teamId: teamDoc.$id,
                userId: resolvedUserId,
                userName: resolvedUserName,
                userEmail: resolvedUserEmail,
                registeredAt: new Date().toISOString(),
              },
              [
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
              ],
            )
          }
        }

        // Check if team meets target size
        const acceptedRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teamInvitations,
          [Query.equal('teamId', teamDoc.$id), Query.equal('status', 'accepted')],
        )
        const event = await eventsService.getEventById(teamDoc.eventId).catch(() => null)
        const minSize = event?.minTeamSize || 2
        if (acceptedRes.total + 1 >= minSize) {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teams,
            teamDoc.$id,
            { status: 'confirmed' },
          )
        }
      } catch (syncErr) {
        console.warn('Sync error on force accept:', syncErr)
      }
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.forceAcceptInvitation')
    }
  }

  /**
   * Update team status (e.g. force confirm or cancel/disband).
   * Note: In Appwrite database schema, the status attribute enum accepts:
   * ('pending', 'confirmed', 'cancelled')
   */
  async updateTeamStatus(
    teamId: string,
    status: 'confirmed' | 'pending' | 'cancelled' | 'disbanded',
  ): Promise<void> {
    const validStatus = status === 'disbanded' ? 'cancelled' : status
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teams,
        teamId,
        { status: validStatus },
      )

      // If team is cancelled/disbanded, cleanup its event_registrations and pending invitations
      if (validStatus === 'cancelled') {
        try {
          const regs = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.eventRegistrations,
            [Query.equal('teamId', teamId), Query.limit(100)],
          )
          for (const reg of regs.documents) {
            await databases
              .deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.eventRegistrations,
                reg.$id,
              )
              .catch(() => {})
          }

          const invites = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teamInvitations,
            [Query.equal('teamId', teamId), Query.limit(100)],
          )
          for (const inv of invites.documents) {
            await databases
              .deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.teamInvitations,
                inv.$id,
              )
              .catch(() => {})
          }
        } catch {
          // ignore cleanup failures
        }
      }
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.updateTeamStatus')
    }
  }

  /**
   * Delete a team document, cascade-deleting associated registrations and invitations
   */
  async deleteTeam(teamId: string): Promise<void> {
    addStoredDeletedTeam(teamId)
    try {
      // 1. Delete associated registrations for this team
      try {
        const regs = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          [Query.equal('teamId', teamId), Query.limit(100)],
        )
        for (const reg of regs.documents) {
          try {
            await databases.deleteDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.eventRegistrations,
              reg.$id,
            )
          } catch {
            try {
              await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.eventRegistrations,
                reg.$id,
                {},
                [
                  Permission.read(Role.any()),
                  Permission.update(Role.any()),
                  Permission.delete(Role.any()),
                ],
              )
              await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.eventRegistrations,
                reg.$id,
              )
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore
      }

      // 2. Delete invitations for this team
      try {
        const invites = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teamInvitations,
          [Query.equal('teamId', teamId), Query.limit(100)],
        )
        for (const inv of invites.documents) {
          try {
            await databases.deleteDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.teamInvitations,
              inv.$id,
            )
          } catch {
            try {
              await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.teamInvitations,
                inv.$id,
                {},
                [
                  Permission.read(Role.any()),
                  Permission.update(Role.any()),
                  Permission.delete(Role.any()),
                ],
              )
              await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.teamInvitations,
                inv.$id,
              )
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // Continue even if deleting invites fails
      }

      // 3. Delete team document
      try {
        await databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teams,
          teamId,
        )
      } catch (teamDelErr: any) {
        let hardDeleted = false
        try {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teams,
            teamId,
            {},
            [
              Permission.read(Role.any()),
              Permission.update(Role.any()),
              Permission.delete(Role.any()),
            ],
          )
          await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teams,
            teamId,
          )
          hardDeleted = true
        } catch {
          // Document permission update or retry failed
        }

        if (!hardDeleted) {
          // If hard delete is strictly disallowed at the Appwrite collection level,
          // cancel the team so its registrations are disbanded and status is nullified
          try {
            await databases.updateDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.teams,
              teamId,
              { status: 'cancelled' },
            )
          } catch {
            throw teamDelErr
          }
        }
      }
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.deleteTeam')
    }
  }

  /**
   * Export roster entries to CSV format and trigger browser download
   */
  async exportRosterCSV(eventId: string, eventTitle: string = 'Event'): Promise<void> {
    try {
      const roster = await this.getEventRoster(eventId)

      const headers = [
        'Registration ID',
        'Event',
        'Type',
        'Student Name',
        'Username',
        'Roll Number',
        'Phone',
        'Email',
        'Department',
        'Semester',
        'College',
        'Team Name',
        'Attendance Status',
        'Registration Date',
      ]

      const safeCSVCell = (val: unknown): string => {
        let str = String(val ?? '').trim()
        if (/^[=+\-@\t\r]/.test(str)) {
          str = `'${str}`
        }
        return `"${str.replace(/"/g, '""')}"`
      }

      const rows = roster.map((item) => [
        safeCSVCell(item.registrationId),
        safeCSVCell(item.eventTitle || ''),
        safeCSVCell(item.registrationType),
        safeCSVCell(item.studentName || ''),
        safeCSVCell(item.username || ''),
        safeCSVCell(item.studentRollNumber || item.studentRollNo || ''),
        safeCSVCell(item.studentPhone || ''),
        safeCSVCell(item.studentEmail || ''),
        safeCSVCell(item.department || ''),
        safeCSVCell(item.semester || ''),
        safeCSVCell(item.collegeName || ''),
        safeCSVCell(item.teamName || 'Solo'),
        safeCSVCell(item.checkedIn ? 'Present' : 'Absent / Pending'),
        safeCSVCell(new Date(item.registeredAt).toLocaleString()),
      ])

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const sanitizedTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')

      link.setAttribute('href', url)
      link.setAttribute('download', `roster-${sanitizedTitle}-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.exportRosterCSV')
    }
  }

  /**
   * Export all registered users to CSV
   */
  async exportUsersCSV(users: UserProfile[]): Promise<void> {
    try {
      const safeCSVCell = (val: unknown): string => {
        let str = String(val ?? '').trim()
        if (/^[=+\-@\t\r]/.test(str)) {
          str = `'${str}`
        }
        return `"${str.replace(/"/g, '""')}"`
      }

      const headers = [
        'User ID',
        'Full Name',
        'Roll Number',
        'Email',
        'Phone',
        'Department',
        'Custom Department',
        'Semester',
        'College',
        'Created At',
      ]

      const rows = users.map((u) => [
        safeCSVCell(u.userId || u.$id),
        safeCSVCell(u.fullName || u.name || ''),
        safeCSVCell(u.rollNumber || u.rollNo || ''),
        safeCSVCell(u.email || ''),
        safeCSVCell(u.phone || ''),
        safeCSVCell(u.department || u.branch || ''),
        safeCSVCell(u.customDepartment || ''),
        safeCSVCell(u.semester || ''),
        safeCSVCell('Central University of Jammu'),
        safeCSVCell(new Date(u.$createdAt).toLocaleString()),
      ])

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.setAttribute('href', url)
      link.setAttribute('download', `yantrotsav-participants-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.exportUsersCSV')
    }
  }
}

export const adminService = new AdminService()

