import { ID, Query, Permission, Role } from 'appwrite'
import { databases } from './client'
import { APPWRITE_CONFIG } from '../../config/appwrite.config'
import { eventsService } from './events.service'
import { mapAppwriteError, AppError } from './errorMapper'
import type {
  TeamDocument,
  TeamInvitationDocument,
  EventRegistrationDocument,
  CreateTeamDTO,
  SoloRegistrationDTO,
  TeamInviteEmailPayload,
} from '../../types/database.types'

export interface UserTeamInfo extends TeamDocument {
  userRole: 'Leader' | 'Member'
  eventTitle?: string
  teamName: string
  members?: { name: string; email: string; role: 'Leader' | 'Member'; status: string }[]
}

export class TeamsService {
  /**
   * Register a user for a Solo event
   * Direct document write to event_registrations collection
   */
  async registerSolo(data: SoloRegistrationDTO): Promise<EventRegistrationDocument> {
    try {
      // 1. Fetch and validate event
      const event = await eventsService.getEventById(data.eventId)
      if (event.status !== 'published') {
        throw new AppError('Registration is closed for this event.', 'EVENT_REGISTRATION_CLOSED', 400)
      }

      // Strict validation: studentEmail must be a valid email
      if (!data.userId || !data.userId.trim()) {
        throw new AppError('Student User ID is required.', 'UNKNOWN_ERROR', 400)
      }
      if (!data.studentEmail || !data.studentEmail.includes('@')) {
        throw new AppError('A valid student email address is required.', 'UNKNOWN_ERROR', 400)
      }
      if (!data.studentName || !data.studentName.trim()) {
        throw new AppError('Student name is required.', 'UNKNOWN_ERROR', 400)
      }

      // 2. Comprehensive check for duplicate registration (solo, team leader, or member)
      const isAlreadyEnrolled = await this.checkUserEventEnrollment(
        data.eventId,
        data.userId,
        [data.studentEmail, data.studentName],
      )
      if (isAlreadyEnrolled.enrolled) {
        throw new AppError(
          `You are already enrolled in this event (${isAlreadyEnrolled.reason || 'Existing registration'}). Duplicate registrations are not permitted.`,
          'ALREADY_REGISTERED',
          409,
        )
      }

      // 3. Ensure document does not already exist before creating
      try {
        const existingCheck = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          [Query.equal('eventId', data.eventId), Query.limit(100)],
        )
        const alreadyExists = existingCheck.documents.some((d: any) => {
          const dUserId = ((d as any).userId || '').toLowerCase()
          const dEmail = ((d as any).userEmail || '').toLowerCase()
          return (
            (data.userId && dUserId === data.userId.toLowerCase()) ||
            (data.studentEmail && dEmail === data.studentEmail.trim().toLowerCase())
          )
        })
        if (alreadyExists) {
          throw new AppError(
            'You are already registered for this event. Duplicate registrations are not permitted.',
            'ALREADY_REGISTERED',
            409,
          )
        }
      } catch (err: any) {
        if (err instanceof AppError) throw err
      }

      const docPermissions = [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]

      const regDoc = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.eventRegistrations,
        ID.unique(),
        {
          eventId: data.eventId,
          userId: data.userId,
          userName: data.studentName,
          userEmail: data.studentEmail,
          registeredAt: new Date().toISOString(),
        },
        docPermissions,
      )

      // 5. Increment event counter
      await eventsService.incrementRegistrations(data.eventId).catch(() => {})

      return {
        ...regDoc,
        eventTitle: event.title,
        registrationType: 'solo',
        studentName: data.studentName,
        studentEmail: data.studentEmail,
      } as unknown as EventRegistrationDocument
    } catch (error) {
      throw mapAppwriteError(error, 'TeamsService.registerSolo')
    }
  }

  /**
   * Create a Team and dispatch invitations to prospective members
   */
  async createTeam(data: CreateTeamDTO): Promise<TeamDocument> {
    try {
      const event = await eventsService.getEventById(data.eventId)

      if (event.status !== 'published') {
        throw new AppError('Registration is closed for this event.', 'EVENT_REGISTRATION_CLOSED', 400)
      }

      // Validate leader credentials
      if (!data.leaderEmail || !data.leaderEmail.includes('@')) {
        throw new AppError('A valid leader email address is required.', 'UNKNOWN_ERROR', 400)
      }
      if (!data.leaderName || !data.leaderName.trim()) {
        throw new AppError('Leader name is required.', 'UNKNOWN_ERROR', 400)
      }

      // Filter out leader's own email/username if passed in members list
      const cleanMemberEmails = [
        ...new Set(
          data.memberEmails
            .map((item) => item.trim())
            .filter((item) => item && item.toLowerCase() !== data.leaderEmail.trim().toLowerCase()),
        ),
      ]

      // Fetch users list for resolving student handles (username, roll number, or email)
      const allUsersRes = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        [Query.limit(500)],
      ).catch(() => ({ documents: [] }))

      // Pre-resolve all teammates to guaranteed valid registered emails and student names
      const resolvedMembers: Array<{
        rawHandle: string
        email: string
        name: string
        userId: string
      }> = []

      for (const rawMember of cleanMemberEmails) {
        const cleanHandle = rawMember.replace(/^@/, '').trim()
        let resolvedEmail = ''
        let inviteeName = ''
        let inviteeUserId = ''

        if (cleanHandle.includes('@')) {
          resolvedEmail = cleanHandle.toLowerCase()
          const matched = allUsersRes.documents.find(
            (u: any) => (u.email || '').toLowerCase() === resolvedEmail,
          )
          if (matched) {
            inviteeName = (matched as any).fullName || (matched as any).name || cleanHandle.split('@')[0]
            inviteeUserId = matched.$id
          } else {
            inviteeName = cleanHandle.split('@')[0]
          }
        } else {
          // Username or rollNumber: match against registered student profiles
          const target = cleanHandle.toLowerCase()
          const matched = allUsersRes.documents.find((u: any) => {
            const uUserId = (u.userId || '').toLowerCase()
            const uRoll = (u.rollNumber || '').toLowerCase()
            const uEmail = (u.email || '').toLowerCase()
            const uName = (u.fullName || '').toLowerCase()
            return (
              uUserId === target ||
              uRoll === target ||
              uEmail === target ||
              (uEmail.includes('@') && uEmail.split('@')[0] === target) ||
              uName === target
            )
          })

          if (matched && (matched as any).email && (matched as any).email.includes('@')) {
            resolvedEmail = (matched as any).email.trim().toLowerCase()
            inviteeName = (matched as any).fullName || (matched as any).name || cleanHandle
            inviteeUserId = matched.$id
          } else {
            throw new AppError(
              `Could not find registered student with username "@${cleanHandle}". Please verify their username or invite them using their registered email.`,
              'UNKNOWN_ERROR',
              404,
            )
          }
        }

        if (!resolvedEmail || !resolvedEmail.includes('@')) {
          throw new AppError(
            `Invalid email format for teammate "${rawMember}". Please enter a valid registered email or username.`,
            'UNKNOWN_ERROR',
            400,
          )
        }

        if (resolvedEmail === data.leaderEmail.trim().toLowerCase()) {
          throw new AppError('You cannot invite yourself as a teammate.', 'UNKNOWN_ERROR', 400)
        }

        if (resolvedMembers.some((m) => m.email === resolvedEmail)) {
          throw new AppError(`Teammate "${rawMember}" is added more than once.`, 'UNKNOWN_ERROR', 400)
        }

        // Check if invited teammate is already enrolled for this event
        const memberEnrolled = await this.checkUserEventEnrollment(
          data.eventId,
          inviteeUserId || resolvedEmail,
          [resolvedEmail, cleanHandle, inviteeName],
        )
        if (memberEnrolled.enrolled) {
          throw new AppError(
            `Teammate "${inviteeName || cleanHandle}" is already enrolled in this event (${memberEnrolled.reason || 'Existing registration'}).`,
            'ALREADY_REGISTERED',
            409,
          )
        }

        resolvedMembers.push({
          rawHandle: cleanHandle,
          email: resolvedEmail,
          name: inviteeName,
          userId: inviteeUserId,
        })
      }

      const targetTeamSize = resolvedMembers.length + 1 // Including leader

      if (targetTeamSize < event.minTeamSize) {
        throw new AppError(
          `Minimum team size for ${event.title} is ${event.minTeamSize}.`,
          'UNKNOWN_ERROR',
          400,
        )
      }

      if (targetTeamSize > event.maxTeamSize) {
        throw new AppError(
          `Maximum team size for ${event.title} is ${event.maxTeamSize}.`,
          'TEAM_FULL',
          400,
        )
      }

      // Check if leader is already enrolled or formed a team for this event
      const isAlreadyEnrolled = await this.checkUserEventEnrollment(
        data.eventId,
        data.leaderId,
        [data.leaderEmail, data.leaderName],
      )
      if (isAlreadyEnrolled.enrolled) {
        throw new AppError(
          `You are already enrolled in this event (${isAlreadyEnrolled.reason || 'Existing registration'}). Duplicate registrations are not permitted.`,
          'ALREADY_REGISTERED',
          409,
        )
      }

      const docPermissions = [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]

      // 1. Create team document matching exact Appwrite schema attributes
      const teamDoc = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teams,
        ID.unique(),
        {
          name: data.teamName.trim(),
          eventId: data.eventId,
          leaderId: data.leaderId,
          leaderName: data.leaderName.trim(),
          leaderEmail: data.leaderEmail.trim().toLowerCase(),
          status: 'pending',
        },
        docPermissions,
      )

      // Register leader immediately in event_registrations (if not already registered)
      try {
        const existingLeaderReg = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          [Query.equal('eventId', data.eventId), Query.limit(100)],
        ).catch(() => ({ documents: [] }))

        const alreadyRegistered = existingLeaderReg.documents.some((d: any) => {
          const dUserId = ((d as any).userId || '').toLowerCase()
          const dEmail = ((d as any).userEmail || '').toLowerCase()
          return (
            (data.leaderId && dUserId === data.leaderId.toLowerCase()) ||
            (data.leaderEmail && dEmail === data.leaderEmail.trim().toLowerCase())
          )
        })

        if (!alreadyRegistered) {
          await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.eventRegistrations,
            ID.unique(),
            {
              eventId: data.eventId,
              teamId: teamDoc.$id,
              userId: data.leaderId,
              userName: data.leaderName.trim(),
              userEmail: data.leaderEmail.trim().toLowerCase(),
              registeredAt: new Date().toISOString(),
            },
            [
              Permission.read(Role.any()),
              Permission.update(Role.any()),
              Permission.delete(Role.any()),
            ],
          )
        }
      } catch (leaderRegErr) {
        console.warn('Leader registration note:', leaderRegErr)
      }

      // 2. Batch create invitations with validated emails and names
      for (const member of resolvedMembers) {
        try {
          const invitePermissions = [
            Permission.read(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any()),
          ]

          await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teamInvitations,
            ID.unique(),
            {
              teamId: teamDoc.$id,
              eventId: data.eventId,
              eventTitle: event.title,
              inviterId: data.leaderId,
              inviterName: data.leaderName.trim(),
              inviteeEmail: member.email,
              status: 'pending',
            },
            invitePermissions,
          )

          // 3. Dispatch automated cyber-styled email via serverless function
          await this.dispatchInviteEmail({
            toEmail: member.email,
            inviteeName: member.name,
            teamName: data.teamName.trim(),
            eventTitle: event.title,
            actionUrl: `${APPWRITE_CONFIG.appUrl}/dashboard`,
          })
        } catch (inviteErr) {
          console.warn(`Failed to process invitation for ${member.email}:`, inviteErr)
        }
      }

      return teamDoc as unknown as TeamDocument
    } catch (error) {
      throw mapAppwriteError(error, 'TeamsService.createTeam')
    }
  }

  /**
   * Handle student invitation response (Accept / Decline)
   * Auto-confirms team and writes event_registrations once target size is met
   */
  async respondToInvitation(params: {
    invitationId: string
    response: 'accepted' | 'declined'
    student: {
      userId: string
      name: string
      email: string
      phone?: string
      rollNo?: string
      college?: string
    }
  }): Promise<void> {
    try {
      const invite = (await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teamInvitations,
        params.invitationId,
      )) as unknown as TeamInvitationDocument

      if (invite.status !== 'pending') {
        throw new AppError(
          'This invitation has already been processed.',
          'INVITATION_ALREADY_RESPONDED',
          400,
        )
      }

      // Update invitation document status
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teamInvitations,
        params.invitationId,
        {
          status: params.response,
        },
      )

      if (params.response === 'declined') {
        return
      }

      // Fetch team
      const team = (await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teams,
        invite.teamId,
      )) as unknown as TeamDocument

      // Fetch event to know required team size
      const event = await eventsService.getEventById(team.eventId).catch(() => null)
      const targetTeamSize = event?.minTeamSize || 2

      // Count accepted invitations for this team
      const acceptedInvitesRes = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teamInvitations,
        [
          Query.equal('teamId', team.$id),
          Query.equal('status', 'accepted'),
        ],
      )

      const totalAccepted = acceptedInvitesRes.total + 1 // +1 for leader

      // Immediately create registration for this accepted student (if not already registered)
      try {
        let studentUserId = (params.student.userId || '').trim()
        let studentEmail = (params.student.email || '').trim().toLowerCase()
        let studentName = (params.student.name || '').trim()

        // Fallback: If studentEmail does not contain @, try invite.inviteeEmail
        if (!studentEmail.includes('@') && invite.inviteeEmail && invite.inviteeEmail.includes('@')) {
          studentEmail = invite.inviteeEmail.trim().toLowerCase()
        }

        // If studentName is empty or equals email/userId, fetch from invite or username
        if (!studentName || studentName === studentEmail || studentName === studentUserId) {
          studentName = invite.inviteeName || (studentEmail.includes('@') ? studentEmail.split('@')[0] : 'Student')
        }

        // Only create registration if studentEmail is a valid email
        if (studentEmail.includes('@')) {
          const existing = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.eventRegistrations,
            [
              Query.equal('eventId', team.eventId),
              Query.limit(100),
            ],
          )

          const alreadyExists = existing.documents.some((d: any) => {
            const dUserId = ((d as any).userId || '').toLowerCase()
            const dEmail = ((d as any).userEmail || '').toLowerCase()
            return (
              (studentUserId && dUserId === studentUserId.toLowerCase()) ||
              (studentEmail && dEmail === studentEmail)
            )
          })

          if (!alreadyExists) {
            await databases.createDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.eventRegistrations,
              ID.unique(),
              {
                eventId: team.eventId,
                teamId: team.$id,
                userId: studentUserId,
                userName: studentName,
                userEmail: studentEmail,
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
      } catch (regErr) {
        console.warn('Member event registration creation error:', regErr)
      }

      // Also ensure leader is registered (if not already registered)
      try {
        const leaderId = (team.leaderId || '').trim().toLowerCase()
        const leaderEmail = (team.leaderEmail || '').trim().toLowerCase()
        const leaderCheck = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          [
            Query.equal('eventId', team.eventId),
            Query.limit(100),
          ],
        )
        const leaderAlreadyRegistered = leaderCheck.documents.some((d: any) => {
          const dUserId = ((d as any).userId || '').toLowerCase()
          const dEmail = ((d as any).userEmail || '').toLowerCase()
          return (
            (leaderId && dUserId === leaderId) ||
            (leaderEmail && dEmail === leaderEmail)
          )
        })
        if (!leaderAlreadyRegistered) {
          await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.eventRegistrations,
            ID.unique(),
            {
              eventId: team.eventId,
              teamId: team.$id,
              userId: team.leaderId,
              userName: team.leaderName,
              userEmail: team.leaderEmail,
              registeredAt: new Date().toISOString(),
            },
            [
              Permission.read(Role.any()),
              Permission.update(Role.any()),
              Permission.delete(Role.any()),
            ],
          )
        }
      } catch (leaderErr) {
        console.warn('Leader registration note in accept:', leaderErr)
      }

      // When all required members accepted, confirm team
      if (totalAccepted >= targetTeamSize) {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teams,
          team.$id,
          {
            status: 'confirmed',
          },
        )

        // Increment event registrations
        await eventsService.incrementRegistrations(team.eventId).catch(() => {})
      }
    } catch (error) {
      throw mapAppwriteError(error, 'TeamsService.respondToInvitation')
    }
  }

  /**
   * List invitations matching any of the student's identifiers (email, username, roll number, email handle)
   */
  async getUserInvitations(emailOrIdentifiers: string | string[]): Promise<TeamInvitationDocument[]> {
    try {
      const identifiers = Array.isArray(emailOrIdentifiers)
        ? emailOrIdentifiers
        : [emailOrIdentifiers]

      const cleanIds = [
        ...new Set(
          identifiers
            .map((id) => (typeof id === 'string' ? id.trim().toLowerCase() : ''))
            .filter((id): id is string => Boolean(id && id.length > 0)),
        ),
      ]

      if (cleanIds.length === 0) return []

      const foundDocsMap = new Map<string, TeamInvitationDocument>()

      // 1. Try querying Appwrite with array of identifiers
      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teamInvitations,
          [
            Query.equal('inviteeEmail', cleanIds),
            Query.orderDesc('$createdAt'),
            Query.limit(100),
          ],
        )
        for (const doc of response.documents) {
          foundDocsMap.set(doc.$id, doc as unknown as TeamInvitationDocument)
        }
      } catch {
        // Fallback to querying each identifier individually if array query is not indexed
        for (const id of cleanIds) {
          try {
            const singleRes = await databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.teamInvitations,
              [
                Query.equal('inviteeEmail', id),
                Query.orderDesc('$createdAt'),
                Query.limit(50),
              ],
            )
            for (const doc of singleRes.documents) {
              foundDocsMap.set(doc.$id, doc as unknown as TeamInvitationDocument)
            }
          } catch {
            // continue
          }
        }
      }

      // 2. Also fetch all pending invitations to catch any match where inviter typed username or partial handle
      try {
        const pendingResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teamInvitations,
          [
            Query.equal('status', 'pending'),
            Query.orderDesc('$createdAt'),
            Query.limit(100),
          ],
        )

        for (const doc of pendingResponse.documents) {
          const inv = doc as unknown as TeamInvitationDocument
          const invEmail = (inv.inviteeEmail || '').trim().toLowerCase()
          if (!invEmail) continue

          const isMatch = cleanIds.some(
            (myId) =>
              invEmail === myId ||
              (invEmail.includes('@') && invEmail.split('@')[0] === myId) ||
              (myId.includes('@') && myId.split('@')[0] === invEmail),
          )

          if (isMatch) {
            foundDocsMap.set(inv.$id, inv)
          }
        }
      } catch {
        // Safe to ignore if broad pending list is restricted
      }

      const allEvents = await eventsService.getEvents().catch(() => [])
      const teamsRes = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teams,
        [Query.limit(500)],
      ).catch(() => ({ documents: [] }))
      const activeTeamsMap = new Map(teamsRes.documents.map((t: any) => [t.$id, t]))

      const results = Array.from(foundDocsMap.values()).filter((inv) => {
        const evt = allEvents.find((e) => e.$id === inv.eventId)
        if (!evt) {
          // Event was deleted; clean up invitation
          databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teamInvitations,
            inv.$id,
          ).catch(() => {})
          return false
        }
        if (inv.teamId) {
          const parentTeam = activeTeamsMap.get(inv.teamId)
          if (parentTeam && (parentTeam.status === 'cancelled' || parentTeam.status === 'disbanded')) {
            return false
          }
        }
        return true
      })
      results.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
      return results
    } catch (error) {
      throw mapAppwriteError(error, 'TeamsService.getUserInvitations')
    }
  }

  /**
   * List teams led by a specific user
   */
  async getLeaderTeams(leaderId: string): Promise<TeamDocument[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teams,
        [Query.equal('leaderId', leaderId), Query.orderDesc('$createdAt')],
      )

      return (response.documents as unknown as TeamDocument[]).filter(
        (t) => t.status !== 'cancelled' && (t.status as any) !== 'disbanded',
      )
    } catch (error) {
      throw mapAppwriteError(error, 'TeamsService.getLeaderTeams')
    }
  }

  /**
   * List all teams a user is part of (both as Leader and as accepted Member)
   */
  async getUserTeams(userId: string, emailOrIdentifiers?: string | string[]): Promise<UserTeamInfo[]> {
    try {
      const teamsMap = new Map<string, UserTeamInfo>()
      const allEvents = await eventsService.getEvents().catch(() => [])

      // 1. Fetch teams where user is leader
      try {
        const leaderRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teams,
          [Query.equal('leaderId', userId), Query.orderDesc('$createdAt'), Query.limit(100)],
        )
        for (const doc of leaderRes.documents) {
          const t = doc as unknown as TeamDocument
          // Filter out cancelled or disbanded teams
          if (t.status === 'cancelled' || (t.status as any) === 'disbanded') {
            continue
          }
          const evt = allEvents.find((e) => e.$id === t.eventId)
          // If the event no longer exists, clean up orphaned team and do not display
          if (!evt) {
            databases.deleteDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.teams,
              t.$id,
            ).catch(() => {})
            continue
          }

          teamsMap.set(t.$id, {
            ...t,
            userRole: 'Leader',
            teamName: t.name || t.teamName || 'Team',
            eventTitle: evt.title,
          })
        }
      } catch (err) {
        console.warn('Error fetching leader teams:', err)
      }

      // 2. Fetch accepted invitations to find teams where user is an accepted Member
      const identifiers = emailOrIdentifiers
        ? Array.isArray(emailOrIdentifiers)
          ? emailOrIdentifiers
          : [emailOrIdentifiers]
        : []

      const cleanIds = [
        userId,
        ...identifiers.map((id) => (typeof id === 'string' ? id.trim().toLowerCase() : '')),
      ].filter((id): id is string => Boolean(id && id.length > 0))

      try {
        const acceptedInvitesRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teamInvitations,
          [Query.equal('status', 'accepted'), Query.limit(100)],
        )

        for (const inv of acceptedInvitesRes.documents) {
          const invData = inv as unknown as TeamInvitationDocument
          const invEmail = (invData.inviteeEmail || '').trim().toLowerCase()
          const isMatch = cleanIds.some(
            (id) =>
              id === invEmail ||
              (invEmail.includes('@') && invEmail.split('@')[0] === id) ||
              (id.includes('@') && id.split('@')[0] === invEmail),
          )

          if (isMatch && invData.teamId && !teamsMap.has(invData.teamId)) {
            try {
              const teamDoc = (await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.teams,
                invData.teamId,
              )) as unknown as TeamDocument

              if (teamDoc.status === 'cancelled' || (teamDoc.status as any) === 'disbanded') {
                continue
              }

              const evt = allEvents.find((e) => e.$id === teamDoc.eventId)
              if (!evt) {
                // Event was deleted; purge orphaned invitation
                databases.deleteDocument(
                  APPWRITE_CONFIG.databaseId,
                  APPWRITE_CONFIG.collections.teamInvitations,
                  invData.$id,
                ).catch(() => {})
                continue
              }

              teamsMap.set(teamDoc.$id, {
                ...teamDoc,
                userRole: teamDoc.leaderId === userId ? 'Leader' : 'Member',
                teamName: teamDoc.name || teamDoc.teamName || 'Team',
                eventTitle: evt.title,
              })
            } catch (teamFetchErr) {
              // Team document was deleted; clean up orphaned invitation
              databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.teamInvitations,
                invData.$id,
              ).catch(() => {})
            }
          }
        }
      } catch (inviteErr) {
        console.warn('Error fetching accepted team invitations:', inviteErr)
      }

      // 3. For each team, fetch member roster (Leader + Accepted Invites)
      const teamsList = Array.from(teamsMap.values())
      for (const team of teamsList) {
        try {
          const invites = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.teamInvitations,
            [Query.equal('teamId', team.$id), Query.limit(50)],
          )

          const members: { name: string; email: string; role: 'Leader' | 'Member'; status: string }[] = [
            {
              name: team.leaderName,
              email: team.leaderEmail,
              role: 'Leader',
              status: 'confirmed',
            },
          ]

          for (const inv of invites.documents) {
            const i = inv as unknown as TeamInvitationDocument
            if (i.status === 'accepted') {
              members.push({
                name: i.inviteeName || i.inviteeEmail.split('@')[0],
                email: i.inviteeEmail,
                role: 'Member',
                status: i.status,
              })
            }
          }

          team.members = members
        } catch {
          // ignore roster fetch error
        }
      }

      return teamsList.sort(
        (a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
      )
    } catch (error) {
      throw mapAppwriteError(error, 'TeamsService.getUserTeams')
    }
  }

  /**
   * List confirmed event registrations for a student.
   * Cross-references event_registrations collection, leader teams, and accepted invitations,
   * auto-repairing / synthesizing any missing registrations.
   */
  async getUserRegistrations(
    userId: string,
    emailOrIdentifiers?: string | string[],
  ): Promise<EventRegistrationDocument[]> {
    try {
      const allEvents = await eventsService.getEvents().catch(() => [])
      const regMap = new Map<string, EventRegistrationDocument>()

      const identifiers = emailOrIdentifiers
        ? Array.isArray(emailOrIdentifiers)
          ? emailOrIdentifiers
          : [emailOrIdentifiers]
        : []

      const cleanIds = [
        userId,
        ...identifiers.map((id) => (typeof id === 'string' ? id.trim().toLowerCase() : '')),
      ].filter((id): id is string => Boolean(id && id.length > 0))

      // 1. Check eventRegistrations collection by userId
      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          [Query.equal('userId', userId), Query.orderDesc('registeredAt'), Query.limit(100)],
        )
        for (const doc of response.documents) {
          regMap.set(doc.eventId, doc as unknown as EventRegistrationDocument)
        }
      } catch (err) {
        console.warn('Error querying registrations by userId:', err)
      }

      // 2. Also check eventRegistrations by user email and identifiers
      for (const id of cleanIds) {
        if (id.includes('@')) {
          try {
            const emailRes = await databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.eventRegistrations,
              [Query.equal('userEmail', id), Query.limit(50)],
            )
            for (const doc of emailRes.documents) {
              if (!regMap.has(doc.eventId)) {
                regMap.set(doc.eventId, doc as unknown as EventRegistrationDocument)
              }
            }
          } catch {
            // continue
          }
        } else if (id !== userId) {
          try {
            const idRes = await databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.eventRegistrations,
              [Query.equal('userId', id), Query.limit(50)],
            )
            for (const doc of idRes.documents) {
              if (!regMap.has(doc.eventId)) {
                regMap.set(doc.eventId, doc as unknown as EventRegistrationDocument)
              }
            }
          } catch {
            // continue
          }
        }
      }

      // 3. Fallback in-memory synthesis: Check accepted team invitations.
      // If user accepted an invitation but event_registrations row doesn't exist, synthesize pass in-memory (DO NOT MUTATE DB)
      try {
        const acceptedInvites = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teamInvitations,
          [Query.equal('status', 'accepted'), Query.limit(100)],
        )

        for (const inv of acceptedInvites.documents) {
          const invData = inv as unknown as TeamInvitationDocument
          const invEmail = (invData.inviteeEmail || '').trim().toLowerCase()
          const isMatch = cleanIds.some(
            (id) =>
              id === invEmail ||
              (invEmail.includes('@') && invEmail.split('@')[0] === id) ||
              (id.includes('@') && id.split('@')[0] === invEmail),
          )

          if (isMatch && invData.eventId) {
            const matchingEvt = allEvents.find((e) => e.$id === invData.eventId)
            // If the event was deleted, skip and clean up invitation
            if (!matchingEvt) {
              databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.teamInvitations,
                invData.$id,
              ).catch(() => {})
              continue
            }

            if (!regMap.has(invData.eventId)) {
              let teamName = invData.teamName || 'Team'
              try {
                const teamDoc = (await databases.getDocument(
                  APPWRITE_CONFIG.databaseId,
                  APPWRITE_CONFIG.collections.teams,
                  invData.teamId,
                )) as any

                if (teamDoc.status === 'cancelled' || teamDoc.status === 'disbanded') {
                  continue
                }
                teamName = teamDoc.name || teamName
              } catch {
                // Team document was deleted; skip
                continue
              }

              regMap.set(invData.eventId, {
                $id: `syn-${invData.$id}`,
                $collectionId: APPWRITE_CONFIG.collections.eventRegistrations,
                $databaseId: APPWRITE_CONFIG.databaseId,
                $createdAt: invData.$createdAt || new Date().toISOString(),
                $updatedAt: invData.$updatedAt || new Date().toISOString(),
                $permissions: [],
                eventId: invData.eventId,
                teamId: invData.teamId,
                teamName,
                userId,
                userName: invData.inviteeName || invData.inviteeEmail.split('@')[0],
                userEmail: invData.inviteeEmail,
                registeredAt: invData.$createdAt || new Date().toISOString(),
                eventTitle: matchingEvt.title,
                registrationType: 'team',
              } as unknown as EventRegistrationDocument)
            }
          }
        }
      } catch (autoHealErr) {
        console.warn('Error checking accepted invitations for registration sync:', autoHealErr)
      }

      // 4. Fallback in-memory synthesis: Check leader teams.
      // If user leads an active team but event_registrations row doesn't exist, synthesize pass in-memory (DO NOT MUTATE DB)
      try {
        const leaderTeamsRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teams,
          [Query.equal('leaderId', userId), Query.notEqual('status', 'cancelled'), Query.limit(50)],
        )

        for (const tDoc of leaderTeamsRes.documents) {
          const t = tDoc as unknown as TeamDocument
          if (t.eventId && !regMap.has(t.eventId)) {
            const matchingEvt = allEvents.find((e) => e.$id === t.eventId)
            if (!matchingEvt) {
              // Event was deleted; skip
              continue
            }

            regMap.set(t.eventId, {
              $id: `syn-${t.$id}`,
              $collectionId: APPWRITE_CONFIG.collections.eventRegistrations,
              $databaseId: APPWRITE_CONFIG.databaseId,
              $createdAt: t.$createdAt || new Date().toISOString(),
              $updatedAt: t.$updatedAt || new Date().toISOString(),
              $permissions: [],
              eventId: t.eventId,
              teamId: t.$id,
              teamName: t.name,
              userId,
              userName: t.leaderName,
              userEmail: t.leaderEmail,
              registeredAt: t.$createdAt || new Date().toISOString(),
              eventTitle: matchingEvt.title,
              registrationType: 'team',
            } as unknown as EventRegistrationDocument)
          }
        }
      } catch (leaderHealErr) {
        console.warn('Error checking leader teams for registration sync:', leaderHealErr)
      }

      // 5. Enrich all registrations with event title and team name, filtering out deleted events and cancelled teams
      const result: EventRegistrationDocument[] = []
      for (const [_, reg] of regMap) {
        const matchingEvt = allEvents.find((e) => e.$id === reg.eventId)
        // If the event does not exist, it was deleted! Purge orphaned record and skip.
        if (!matchingEvt) {
          if (!reg.$id.startsWith('syn-')) {
            databases.deleteDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.eventRegistrations,
              reg.$id,
            ).catch(() => {})
          }
          continue
        }

        let teamName = reg.teamName
        if (reg.teamId) {
          try {
            const teamDoc = (await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.teams,
              reg.teamId,
            )) as any

            // If the team was cancelled/disbanded, this registration is no longer active
            if (!teamDoc || teamDoc.status === 'cancelled' || teamDoc.status === 'disbanded') {
              if (!reg.$id.startsWith('syn-')) {
                databases.deleteDocument(
                  APPWRITE_CONFIG.databaseId,
                  APPWRITE_CONFIG.collections.eventRegistrations,
                  reg.$id,
                ).catch(() => {})
              }
              continue
            }
            teamName = teamDoc.name || teamName
          } catch {
            // Team document was deleted from database! Purge orphaned registration
            if (!reg.$id.startsWith('syn-')) {
              databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.eventRegistrations,
                reg.$id,
              ).catch(() => {})
            }
            continue
          }
        }

        result.push({
          ...reg,
          eventTitle: matchingEvt.title,
          registrationType: reg.teamId ? 'team' : 'solo',
          teamName: teamName || (reg.teamId ? 'Team Squad' : undefined),
        } as EventRegistrationDocument)
      }

      return result.sort(
        (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime(),
      )
    } catch (error) {
      throw mapAppwriteError(error, 'TeamsService.getUserRegistrations')
    }
  }

  /**
   * Check if a user is already enrolled for an event (solo, team leader, or accepted team member)
   */
  async checkUserEventEnrollment(
    eventId: string,
    userId: string,
    identifiers: string[] = [],
  ): Promise<{ enrolled: boolean; reason?: string; teamName?: string; registrationType?: 'solo' | 'team' }> {
    try {
      const cleanIds = [
        userId,
        ...identifiers.map((id) => (typeof id === 'string' ? id.trim().toLowerCase() : '')),
      ].filter((id): id is string => Boolean(id && id.length > 0))

      // 1. Check event_registrations
      try {
        const regRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.eventRegistrations,
          [Query.equal('eventId', eventId), Query.limit(100)],
        )

        for (const doc of regRes.documents) {
          const docUserId = ((doc as any).userId || '').toLowerCase()
          const docEmail = ((doc as any).userEmail || '').toLowerCase()
          const isMatch = cleanIds.some(
            (id) =>
              id === docUserId ||
              id === docEmail ||
              (docEmail.includes('@') && docEmail.split('@')[0] === id) ||
              (id.includes('@') && id.split('@')[0] === docEmail),
          )
          if (isMatch) {
            return {
              enrolled: true,
              reason: doc.teamId ? 'Enrolled in Team' : 'Solo Registration',
              registrationType: doc.teamId ? 'team' : 'solo',
            }
          }
        }
      } catch (err) {
        console.warn('Check event_registrations err:', err)
      }

      // 2. Check active teams as leader
      try {
        const teamRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teams,
          [
            Query.equal('eventId', eventId),
            Query.equal('leaderId', userId),
            Query.notEqual('status', 'cancelled'),
          ],
        )
        if (teamRes.documents.length > 0) {
          const t = teamRes.documents[0] as any
          return {
            enrolled: true,
            reason: `Team Leader (${t.name || 'Team'})`,
            teamName: t.name,
            registrationType: 'team',
          }
        }
      } catch (err) {
        console.warn('Check teams err:', err)
      }

      // 3. Check accepted invitations as member
      try {
        const inviteRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.teamInvitations,
          [
            Query.equal('eventId', eventId),
            Query.equal('status', 'accepted'),
            Query.limit(50),
          ],
        )
        for (const inv of inviteRes.documents) {
          const invEmail = ((inv as any).inviteeEmail || '').toLowerCase()
          const isMatch = cleanIds.some(
            (id) =>
              id === invEmail ||
              (invEmail.includes('@') && invEmail.split('@')[0] === id) ||
              (id.includes('@') && id.split('@')[0] === invEmail),
          )
          if (isMatch) {
            return {
              enrolled: true,
              reason: `Team Member (${(inv as any).teamName || 'Team'})`,
              teamName: (inv as any).teamName,
              registrationType: 'team',
            }
          }
        }
      } catch (err) {
        console.warn('Check invitations err:', err)
      }

      return { enrolled: false }
    } catch {
      return { enrolled: false }
    }
  }

  /**
   * Dispatch automated email via Vercel serverless function
   */
  private async dispatchInviteEmail(payload: TeamInviteEmailPayload): Promise<void> {
    try {
      await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.warn('Unable to dispatch invite email:', err)
    }
  }
}

export const teamsService = new TeamsService()
