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

export class AdminService {
  /**
   * Fetch core KPI statistics for the Admin Dashboard
   */
  async getAnalytics(): Promise<AdminAnalyticsKPI> {
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

      // Count unique registrations per event so duplicates do not inflate KPI cards
      const uniqueRegs = new Set<string>()
      for (const doc of regResponse.documents) {
        const d = doc as any
        const idKey = ((d.userEmail || d.userId || d.$id) as string).trim().toLowerCase()
        uniqueRegs.add(`${d.eventId}-${idKey}`)
      }
      const totalRegistrations = regResponse.documents.length > 0
        ? uniqueRegs.size
        : (regResponse.total || 0)

      return {
        totalRegistrations,
        totalUsers: userResponse.total || userResponse.documents.length,
        totalTeamsFormed:   teamResponse.documents.filter((t: any) => t.status === 'confirmed').length,
        activeEventsCount:  eventResponse.documents.filter((e: any) => e.status === 'published').length,
        pendingInvitesCount: inviteResponse.documents.filter((i: any) => i.status === 'pending').length,
      }
    } catch {
      return {
        totalRegistrations: 0,
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

      const documents = response.documents as unknown as EventRegistrationDocument[]
      const allUsers = usersRes.documents as unknown as UserProfile[]
      const allTeams = teamsRes.documents as unknown as TeamDocument[]

      const rawRoster = documents.map((doc) => {
        const user = allUsers.find(
          (u) =>
            u.$id === doc.userId ||
            (u as any).userId === doc.userId ||
            (u.email && doc.userEmail && u.email.toLowerCase() === doc.userEmail.toLowerCase())
        )
        const team = doc.teamId ? allTeams.find((t) => t.$id === doc.teamId) : undefined
        const event = allEvents.find((e) => e.$id === doc.eventId)

        const studentName = (user as any)?.fullName || (user as any)?.name || doc.userName || doc.studentName || 'Student'
        const username = (user as any)?.userId || (user as any)?.username || (doc.userEmail ? doc.userEmail.split('@')[0] : '')
        const studentRollNumber = (user as any)?.rollNumber || (user as any)?.rollNo || doc.studentRollNumber || doc.studentRollNo || 'N/A'
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
          studentEmail: doc.userEmail || (user as any)?.email || 'N/A',
          studentPhone,
          studentRollNumber,
          studentRollNo: studentRollNumber,
          department,
          semester,
          collegeName,
          teamName,
          isLeader: team ? team.leaderId === doc.userId || team.leaderEmail?.toLowerCase() === doc.userEmail?.toLowerCase() : undefined,
          checkedIn: doc.checkedIn || false,
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
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.eventRegistrations,
        registrationId,
        {
          checkedIn: true,
          checkedInAt: new Date().toISOString(),
        },
      )
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.checkInStudent')
    }
  }

  /**
   * Revert / Undo student check-in
   */
  async uncheckInStudent(registrationId: string): Promise<void> {
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
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.uncheckInStudent')
    }
  }

  /**
   * Delete an invalid or cancelled event registration
   */
  async deleteRegistration(registrationId: string, eventId?: string): Promise<void> {
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.eventRegistrations,
        registrationId,
      )
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
      return response.documents as unknown as UserProfile[]
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.getAllUsers')
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

      const teams = teamsRes.documents as unknown as TeamDocument[]
      const invites = allInvitesRes.documents as unknown as TeamInvitationDocument[]

      return teams.map((t) => {
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

        const existingRegs = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          [Query.equal('teamId', teamDoc.$id), Query.equal('userEmail', invite.inviteeEmail)],
        )

        if (existingRegs.documents.length === 0) {
          await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.eventRegistrations,
            ID.unique(),
            {
              eventId: teamDoc.eventId,
              teamId: teamDoc.$id,
              userId: invite.inviteeEmail,
              userName: invite.inviteeName || invite.inviteeEmail.split('@')[0],
              userEmail: invite.inviteeEmail,
              registeredAt: new Date().toISOString(),
            },
            [
              Permission.read(Role.any()),
              Permission.update(Role.any()),
              Permission.delete(Role.any()),
            ],
          )
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
   * Update team status (e.g. force confirm or disband)
   */
  async updateTeamStatus(teamId: string, status: 'confirmed' | 'pending' | 'disbanded'): Promise<void> {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teams,
        teamId,
        { status },
      )
    } catch (error) {
      throw mapAppwriteError(error, 'AdminService.updateTeamStatus')
    }
  }

  /**
   * Delete a team document and associated invitations
   */
  async deleteTeam(teamId: string): Promise<void> {
    try {
      // 1. Delete invitations for this team
      try {
        const invites = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teamInvitations,
          [Query.equal('teamId', teamId), Query.limit(100)],
        )
        for (const inv of invites.documents) {
          await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teamInvitations,
            inv.$id,
          )
        }
      } catch {
        // Continue even if deleting invites fails
      }

      // 2. Delete team
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teams,
        teamId,
      )
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

      const rows = roster.map((item) => [
        `"${item.registrationId}"`,
        `"${(item.eventTitle || '').replace(/"/g, '""')}"`,
        `"${item.registrationType}"`,
        `"${(item.studentName || '').replace(/"/g, '""')}"`,
        `"${(item.username || '').replace(/"/g, '""')}"`,
        `"${item.studentRollNumber || item.studentRollNo || ''}"`,
        `"${item.studentPhone || ''}"`,
        `"${item.studentEmail || ''}"`,
        `"${(item.department || '').replace(/"/g, '""')}"`,
        `"${item.semester || ''}"`,
        `"${(item.collegeName || '').replace(/"/g, '""')}"`,
        `"${(item.teamName || 'Solo').replace(/"/g, '""')}"`,
        `"${item.checkedIn ? 'Present' : 'Absent / Pending'}"`,
        `"${new Date(item.registeredAt).toLocaleString()}"`,
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
        `"${u.userId || u.$id}"`,
        `"${(u.fullName || u.name || '').replace(/"/g, '""')}"`,
        `"${u.rollNumber || u.rollNo || ''}"`,
        `"${u.email || ''}"`,
        `"${u.phone || ''}"`,
        `"${(u.department || u.branch || '').replace(/"/g, '""')}"`,
        `"${(u.customDepartment || '').replace(/"/g, '""')}"`,
        `"${u.semester || ''}"`,
        `"Central University of Jammu"`,
        `"${new Date(u.$createdAt).toLocaleString()}"`,
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

