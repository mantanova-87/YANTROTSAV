import { ID, Permission, Role, Query } from 'appwrite'
import { account, teams, databases } from './client'
import { APPWRITE_CONFIG } from '../../config/appwrite.config'
import { mapAppwriteError, AppError } from './errorMapper'
import type { Models } from 'appwrite'
import type { UserProfile, RegisterPayload } from '../../types/database.types'

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
    const email = payload.email?.trim() || ''
    const password = payload.password || ''
    const rollNumber = payload.rollNumber?.trim() || ''
    const phone = payload.phone?.trim() || ''
    const department = payload.department?.trim() || ''
    const semester = payload.semester?.trim() || ''

    if (!fullName) throw new AppError('Full Name is required.', 'UNKNOWN_ERROR', 400)
    if (!email) throw new AppError('Email is required.', 'UNKNOWN_ERROR', 400)
    if (!password || password.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 'UNKNOWN_ERROR', 400)
    }
    if (!rollNumber) throw new AppError('Roll Number is required.', 'UNKNOWN_ERROR', 400)
    if (!department) throw new AppError('Department is required.', 'UNKNOWN_ERROR', 400)

    try {
      // 1. Generate primary auth user
      const authUser = await account.create(
        ID.unique(),
        email,
        password,
        fullName,
      )

      // 2. Automatically sign in to establish active session token
      await account.createEmailPasswordSession(email, password)

      // Save username in account preferences if provided
      if (payload.username?.trim()) {
        try {
          await account.updatePrefs({ username: payload.username.trim() })
        } catch (prefErr) {
          console.warn('Could not save username in prefs:', prefErr)
        }
      }

      // 3. Write student profile document using authUser.$id as Document ID,
      // and put chosen username into the existing `userId` DB field
      const chosenUserId = payload.username?.trim() || email.split('@')[0]
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
        Permission.update(Role.user(authUser.$id)),
        Permission.delete(Role.user(authUser.$id)),
      ]

      let profileDoc: UserProfile
      try {
        const doc = await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.users,
          authUser.$id,
          profileData,
          docPermissions,
        )
        profileDoc = doc as unknown as UserProfile
      } catch (docError: any) {
        // Fallback in case customDepartment attribute is not in schema or required
        const errMsg = docError?.message?.toLowerCase() || ''
        if (errMsg.includes('customdepartment') || docError?.code === 400) {
          if ('customDepartment' in profileData) {
            delete profileData.customDepartment
          }
          const doc = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.users,
            authUser.$id,
            profileData,
            docPermissions,
          )
          profileDoc = doc as unknown as UserProfile
        } else {
          // Map database unique constraint errors (e.g. idx_rollNumber, idx_email, idx_userId)
          throw mapAppwriteError(docError, 'AuthService.registerStudent (createDocument)')
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

      // If user provided a username/userId or roll number without '@', look up their email
      if (!emailToUse.includes('@')) {
        try {
          // 1. Check by userId (which stores username)
          const userDocQuery = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.users,
            [
              Query.equal('userId', emailToUse),
              Query.limit(1),
            ],
          )

          if (userDocQuery.documents.length > 0) {
            emailToUse = (userDocQuery.documents[0] as any).email
          } else {
            // 2. Check by rollNumber
            const rollQuery = await databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.users,
              [
                Query.equal('rollNumber', emailToUse),
                Query.limit(1),
              ],
            )
            if (rollQuery.documents.length > 0) {
              emailToUse = (rollQuery.documents[0] as any).email
            }
          }
        } catch {
          // Fall back to direct login attempt
        }
      }

      return await account.createEmailPasswordSession(emailToUse, password)
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

      if (data.fullName !== undefined) updateData.fullName = data.fullName.trim().slice(0, 128)
      if (data.phone !== undefined) updateData.phone = data.phone.trim().slice(0, 32)
      if (data.department !== undefined) updateData.department = data.department.trim()
      if (data.customDepartment !== undefined) updateData.customDepartment = data.customDepartment.trim().slice(0, 128)
      if (data.semester !== undefined) updateData.semester = data.semester.trim().slice(0, 32)
      if (data.rollNumber !== undefined) updateData.rollNumber = data.rollNumber.trim().slice(0, 128)
      if (data.username !== undefined && data.username.trim()) {
        updateData.userId = data.username.trim().slice(0, 128)
      } else if (data.userId !== undefined && data.userId.trim()) {
        updateData.userId = data.userId.trim().slice(0, 128)
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
      const chosenUserHandle = data.username || data.userId
      if (chosenUserHandle !== undefined) {
        try {
          const authUser = await account.get()
          await account.updatePrefs({ ...(authUser.prefs || {}), username: chosenUserHandle.trim() })
        } catch (prefErr) {
          console.warn('Could not update username in prefs:', prefErr)
        }
      }

      const userProfile = updatedDoc as unknown as UserProfile
      if (chosenUserHandle !== undefined) {
        userProfile.username = chosenUserHandle.trim()
        userProfile.userId = chosenUserHandle.trim()
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
