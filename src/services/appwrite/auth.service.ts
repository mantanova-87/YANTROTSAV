import { ID, Permission, Role, Query } from 'appwrite'
import { account, teams, databases } from './client'
import { APPWRITE_CONFIG } from '../../config/appwrite.config'
import { mapAppwriteError, AppError } from './errorMapper'
import type { Models } from 'appwrite'
import type { UserProfile, RegisterPayload } from '../../types/database.types'
import { getUsernameError, normalizeUsername } from '../../utils/username'
import { getContactError, normalizeEmail, normalizeMobile } from '../../utils/profileValidation'

export class AuthService {
  /**
   * Register a new student account and create database profile in `users` collection
   * under `TablesDB`.
   *
   * Steps:
   * 1. account.create(ID.unique(), email, password, fullName)
   * 2. account.createEmailPasswordSession(email, password)
   * 3. databases.createDocument(databaseId, 'users', authUser.$id, profileData)
   */
  async registerStudent(payload: RegisterPayload): Promise<{
    account: Models.User<Models.Preferences>
    userProfile: UserProfile
  }> {
    // 0. Strict validation: Sab kuch sahi hone ke baad hi account & DB row create karenge
    const fullName = payload.fullName?.trim() || ''
    const email = normalizeEmail(payload.email || '')
    const password = payload.password || ''
    const rollNumber = payload.rollNumber?.trim() || ''
    const phone = normalizeMobile(payload.phone || '')
    const department = payload.department?.trim() || ''
    const semester = payload.semester?.trim() || ''
    const username = normalizeUsername(payload.username || '')

    if (!fullName) throw new AppError('Full Name is required.', 'UNKNOWN_ERROR', 400)
    if (!email) throw new AppError('Email is required.', 'UNKNOWN_ERROR', 400)
    if (!password || password.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 'UNKNOWN_ERROR', 400)
    }
    if (!rollNumber) throw new AppError('Roll Number is required.', 'UNKNOWN_ERROR', 400)
    if (!department) throw new AppError('Department is required.', 'UNKNOWN_ERROR', 400)
    const contactError = getContactError(email, phone)
    if (contactError) throw new AppError(contactError, 'UNKNOWN_ERROR', 400)
    const usernameError = getUsernameError(username)
    if (usernameError) throw new AppError(usernameError, 'UNKNOWN_ERROR', 400)

    // Production registrations are created by the server, which owns the API key and creates
    // Auth plus the profile document together. A 404 only occurs in local Vite development,
    // where the legacy SDK path below remains available for local testing.
    try {
      const serverResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, username, email, phone, fullName, rollNumber, department, semester }),
      })
      if (serverResponse.status !== 404) {
        const result = await serverResponse.json().catch(() => null)
        if (!serverResponse.ok || !result?.success) {
          throw new AppError(result?.message || 'Registration could not be completed. Please try again.', 'UNKNOWN_ERROR', serverResponse.status)
        }
        await account.createEmailPasswordSession(email, password)
        const authUser = await account.get()
        const profile = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.users,
          authUser.$id,
        )
        return { account: authUser, userProfile: profile as unknown as UserProfile }
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      // A connection failure is handled by the SDK recovery path below, which can detect an
      // account whose server response was lost after it was created.
    }

    try {
      // This improves the error message; the unique `userId` index remains the race-safe authority.
      const existingUsername = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        [Query.equal('userId', username), Query.limit(1)],
      )
      if (existingUsername.documents.length) {
        throw new AppError('This username is already taken. Please choose another one.', 'ALREADY_REGISTERED', 409)
      }

      // 1. Generate primary auth user or recover existing auth user if table profile was deleted
      let authUser: Models.User<Models.Preferences>
      let isExistingAuthUser = false

      try {
        authUser = await account.create(
          ID.unique(),
          email,
          password,
          fullName,
        )
      } catch (authErr: any) {
        const errType = authErr?.type || ''
        const errMsg = authErr?.message?.toLowerCase() || ''
        if (errType === 'user_already_exists' || errMsg.includes('already exists') || !navigator.onLine || !errType) {
          // A slow connection can lose the response after Appwrite has already created the account.
          // Signing in verifies that case and lets us finish the missing profile instead of creating a partial account.
          try {
            await account.createEmailPasswordSession(email, password)
            const currentAcc = await account.get()
            const existingDoc = await databases
              .getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                currentAcc.$id,
              )
              .catch(() => null)

            if (!existingDoc) {
              // The user account exists in Appwrite Auth, but their database table document was deleted!
              // Seamlessly recreate their profile in the database table and finish registration.
              authUser = currentAcc
              isExistingAuthUser = true
            } else {
              await account.deleteSession('current').catch(() => {})
              throw authErr
            }
          } catch (sessionErr: any) {
            throw authErr
          }
        } else {
          throw authErr
        }
      }

      // 2. If new auth user, sign in to establish active session token
      if (!isExistingAuthUser) {
        await account.createEmailPasswordSession(email, password)
      }

      // Save username in account preferences if provided
      if (username) {
        try {
          await account.updatePrefs({ username })
        } catch (prefErr) {
          console.warn('Could not save username in prefs:', prefErr)
        }
      }

      // 3. Write student profile document using authUser.$id as Document ID,
      // and put chosen username into the existing `userId` DB field
      const chosenUserId = username
      const profileData: Record<string, any> = {
        userId: chosenUserId.slice(0, 128),
        fullName: fullName.slice(0, 128),
        email: email.slice(0, 128),
        phone: phone.slice(0, 32),
        semester: semester.slice(0, 32),
        rollNumber: rollNumber.slice(0, 128),
        department,
      }

      if (payload.customDepartment?.trim()) {
        profileData.customDepartment = payload.customDepartment.trim().slice(0, 128)
      }

      const docPermissions = [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]

      const createProfileDocument = () => databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        authUser.$id,
        profileData,
        docPermissions,
      )

      let profileDoc: UserProfile
      try {
        const doc = await createProfileDocument()
        profileDoc = doc as unknown as UserProfile
      } catch (docError: any) {
        // A request can time out after Appwrite commits the document. Read it before retrying,
        // making profile provisioning idempotent instead of reporting a false failure.
        if (docError?.code === 409 || docError?.type === 'document_already_exists') {
          const existing = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.users,
            authUser.$id,
          )
          profileDoc = existing as unknown as UserProfile
        } else {
        // Fallback in case customDepartment attribute is not in schema or required
        const errMsg = docError?.message?.toLowerCase() || ''
        if (errMsg.includes('customdepartment') || docError?.code === 400) {
          if ('customDepartment' in profileData) {
            delete profileData.customDepartment
          }
          const doc = await createProfileDocument()
          profileDoc = doc as unknown as UserProfile
        } else {
          // Map database unique constraint errors (e.g. idx_rollNumber, idx_email, idx_userId)
          throw mapAppwriteError(docError, 'AuthService.registerStudent (createDocument)')
        }
        }
      }

      return {
        account: authUser,
        userProfile: profileDoc,
      }
    } catch (error) {
      throw mapAppwriteError(error, 'AuthService.registerStudent')
    }
  }

  /**
   * Backward-compatible register method
   */
  async register(params: {
    name: string
    email: string
    password: string
    phone?: string
    rollNo?: string
    college?: string
    branch?: string
    semester?: string
  }): Promise<Models.User<Models.Preferences>> {
    const result = await this.registerStudent({
      fullName: params.name,
      email: params.email,
      password: params.password,
      rollNumber: params.rollNo || '',
      phone: params.phone || '',
      department: params.branch || '',
      semester: params.semester || '',
    })
    return result.account
  }

  /**
   * Log in with Email, Username, or Roll Number & Password
   */
  async login(identifier: string, password: string): Promise<Models.Session> {
    try {
      // Clear any previous or lingering active session first
      try {
        await account.deleteSession('current')
      } catch {
        // Safe to ignore if no session was active
      }

      let emailToUse = identifier.trim()
      const isRealEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToUse)

      // If user did not provide a well-formed email, treat identifier as Username or Roll Number
      if (!isRealEmail) {
        const cleanHandle = emailToUse.toLowerCase().replace(/^@/, '')
        const cleanRoll = emailToUse.toUpperCase()
        try {
          // 1. Check by userId (which stores username)
          const userDocQuery = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.users,
            [
              Query.equal('userId', cleanHandle),
              Query.limit(1),
            ],
          ).catch(() => ({ documents: [] }))

          if (userDocQuery.documents.length > 0) {
            emailToUse = (userDocQuery.documents[0] as any).email
          } else {
            // 2. Check by rollNumber
            const rollQuery = await databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.users,
              [
                Query.equal('rollNumber', cleanRoll),
                Query.limit(1),
              ],
            ).catch(() => ({ documents: [] }))

            if (rollQuery.documents.length > 0) {
              emailToUse = (rollQuery.documents[0] as any).email
            } else {
              // 3. Fallback: Search all recent users case-insensitively
              const allUsers = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                [Query.limit(100)],
              ).catch(() => ({ documents: [] }))

              const matched = allUsers.documents.find((u: any) => {
                const uId = (u.userId || '').toLowerCase().replace(/^@/, '')
                const uRoll = (u.rollNumber || '').toUpperCase()
                return uId === cleanHandle || uRoll === cleanRoll || (u.rollNumber || '').toLowerCase() === cleanHandle
              })

              if (matched && (matched as any).email) {
                emailToUse = (matched as any).email
              } else {
                // Determine user-friendly specific message based on input format
                const hasRollPattern = /\d/.test(identifier)
                if (hasRollPattern) {
                  throw new AppError(
                    `No student registered with Roll Number "${identifier}". Please verify your roll number or log in with your email address.`,
                    'AUTH_INVALID_CREDENTIALS',
                    404,
                  )
                } else if (identifier.startsWith('@') || !identifier.includes('@')) {
                  throw new AppError(
                    `No student registered with Username "${identifier}". Please check your username or log in with your email address.`,
                    'AUTH_INVALID_CREDENTIALS',
                    404,
                  )
                } else {
                  throw new AppError(
                    `"${identifier}" is not a valid email, username, or roll number. Please enter a valid email address (e.g. name@example.com).`,
                    'AUTH_INVALID_CREDENTIALS',
                    400,
                  )
                }
              }
            }
          }
        } catch (lookupErr: any) {
          if (lookupErr instanceof AppError) throw lookupErr
          // Fall back to direct login attempt
        }
      }

      try {
        return await account.createEmailPasswordSession(emailToUse, password)
      } catch (sessionErr: any) {
        const errCode = sessionErr?.code || sessionErr?.status
        const errMsg = sessionErr?.message || ''
        if (errCode === 401 || errMsg.toLowerCase().includes('invalid credentials')) {
          throw new AppError(
            'Invalid credentials. The password entered is incorrect for this account.',
            'AUTH_INVALID_CREDENTIALS',
            401,
            sessionErr,
          )
        }
        if (errCode === 400 && errMsg.toLowerCase().includes('email')) {
          throw new AppError(
            `"${identifier}" was not recognized as a registered student account. Please check your roll number, username, or email.`,
            'AUTH_INVALID_CREDENTIALS',
            400,
            sessionErr,
          )
        }
        throw sessionErr
      }
    } catch (error) {
      throw mapAppwriteError(error, 'AuthService.login')
    }
  }

  /**
   * Update student profile in `users` collection and Appwrite auth account
   */
  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // 1. Prepare clean payload containing only valid schema attributes
      const updateData: Record<string, any> = {}
      const requestedUsername = data.username !== undefined
        ? normalizeUsername(data.username)
        : data.userId !== undefined
          ? normalizeUsername(data.userId)
          : undefined

      if (requestedUsername !== undefined) {
        const usernameError = getUsernameError(requestedUsername)
        if (usernameError) throw new AppError(usernameError, 'UNKNOWN_ERROR', 400)
        const matches = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.users,
          [Query.equal('userId', requestedUsername), Query.limit(2)],
        )
        if (matches.documents.some((document) => document.$id !== userId)) {
          throw new AppError('This username is already taken. Please choose another one.', 'ALREADY_REGISTERED', 409)
        }
      }

      if (data.fullName !== undefined) updateData.fullName = data.fullName.trim().slice(0, 128)
      if (data.phone !== undefined) updateData.phone = data.phone.trim().slice(0, 32)
      if (data.department !== undefined) updateData.department = data.department.trim()
      if (data.customDepartment !== undefined) updateData.customDepartment = data.customDepartment.trim().slice(0, 128)
      if (data.semester !== undefined) updateData.semester = data.semester.trim().slice(0, 32)
      if (data.rollNumber !== undefined) updateData.rollNumber = data.rollNumber.trim().slice(0, 128)
      if (requestedUsername !== undefined) {
        updateData.userId = requestedUsername
      }

      // 2. Update database document in users collection
      const updatedDoc = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        userId,
        updateData,
      )

      // 3. If full name was modified, synchronize with Appwrite Auth User name
      if (data.fullName?.trim()) {
        try {
          await account.updateName(data.fullName.trim())
        } catch {
          // ignore auth name update failure if session is read-only
        }
      }

      // 4. If username was provided, synchronize with Appwrite Auth User preferences
      const chosenUserHandle = requestedUsername
      if (chosenUserHandle !== undefined) {
        try {
          const authUser = await account.get()
          await account.updatePrefs({ ...(authUser.prefs || {}), username: chosenUserHandle })
        } catch (prefErr) {
          console.warn('Could not update username in prefs:', prefErr)
        }
      }

      const userProfile = updatedDoc as unknown as UserProfile
      if (chosenUserHandle !== undefined) {
        userProfile.username = chosenUserHandle
        userProfile.userId = chosenUserHandle
      }
      return userProfile
    } catch (error) {
      throw mapAppwriteError(error, 'AuthService.updateProfile')
    }
  }

  /**
   * Terminate current active session
   */
  async logout(): Promise<void> {
    try {
      await account.deleteSession('current')
    } catch (error) {
      throw mapAppwriteError(error, 'AuthService.logout')
    }
  }

  /**
   * Fetch current authenticated account object from Appwrite
   */
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await account.get()
    } catch {
      return null
    }
  }

  /**
   * Retrieve extended student profile from `users` collection in `yantrotsav_db`
   *
   * Steps:
   * 1. account.get()
   * 2. databases.getDocument(databaseId, 'users', user.$id)
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const authUser = await account.get()
      if (!authUser) return null

      const doc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        authUser.$id,
      )

      const profile = doc as unknown as UserProfile
      if (profile.userId) {
        profile.username = profile.userId
      } else if ((authUser.prefs as any)?.username && !profile.username) {
        profile.username = (authUser.prefs as any).username
      }
      return profile
    } catch {
      return null
    }
  }

  /**
   * Fetch current authenticated session
   */
  async getSession(): Promise<Models.Session | null> {
    try {
      return await account.getSession('current')
    } catch {
      return null
    }
  }

  /**
   * Check if current user has Admin privileges
   * Evaluates user.labels ('admin') or Appwrite Team membership
   */
  async checkIsAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return false

      // Check Appwrite user labels
      if (Array.isArray(user.labels) && user.labels.includes('admin')) {
        return true
      }

      // Check Appwrite Admin Team membership if configured
      if (APPWRITE_CONFIG.adminTeamId && APPWRITE_CONFIG.adminTeamId !== 'placeholder_admin_team_id') {
        try {
          const userTeams = await teams.list()
          const isAdminTeamMember = userTeams.teams.some(
            (team) => team.$id === APPWRITE_CONFIG.adminTeamId,
          )
          if (isAdminTeamMember) return true
        } catch {
          // Ignore team lookup failure and fall back
        }
      }

      return false
    } catch (error) {
      console.warn('Admin check warning:', error)
      return false
    }
  }

  /**
   * Fetch user profile from database by userId
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const doc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        userId,
      )
      return doc as unknown as UserProfile
    } catch {
      return null
    }
  }
}

export const authService = new AuthService()
