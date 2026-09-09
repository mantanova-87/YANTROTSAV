import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Models } from 'appwrite'
import { authService } from '../services/appwrite/auth.service'
import type { UserProfile, RegisterPayload } from '../types/database.types'
import { showToast } from '../utils/toast'

interface AuthContextType {
  // Primary state matching architecture specification
  account: Models.User<Models.Preferences> | null
  userProfile: UserProfile | null

  // Backward-compatibility aliases
  user: Models.User<Models.Preferences> | null
  profile: UserProfile | null

  isAdmin: boolean
  loading: boolean

  login: (email: string, pass: string) => Promise<void>
  registerStudent: (payload: RegisterPayload) => Promise<void>
  register: (payload: RegisterPayload | any) => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>

  openAuthModal: (mode?: 'login' | 'register') => void
  closeAuthModal: () => void
  authModalOpen: boolean
  authModalMode: 'login' | 'register'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Two primary pieces of state: account (Appwrite Auth) and userProfile (users table document)
  const [account, setAccount] = useState<Models.User<Models.Preferences> | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setAuthModalOpen(false)
  }

  /**
   * Check for active sessions and fetch both account and userProfile in parallel
   */
  const syncAuthSession = async () => {
    try {
      const [currentAccount, profileDoc] = await Promise.all([
        authService.getCurrentUser(),
        authService.getCurrentUserProfile(),
      ])

      const prefs = (currentAccount?.prefs as Record<string, any>) || {}
      if (profileDoc && prefs.username && !profileDoc.username) {
        profileDoc.username = prefs.username
      }

      setAccount(currentAccount)

      if (currentAccount && !profileDoc) {
        const safeName =
          currentAccount.name ||
          (currentAccount.prefs as any)?.username ||
          currentAccount.email.split('@')[0]
        const fallbackProfile: UserProfile = {
          $id: currentAccount.$id,
          $createdAt: currentAccount.$createdAt,
          $updatedAt: currentAccount.$updatedAt,
          userId: (currentAccount.prefs as any)?.username || currentAccount.email.split('@')[0],
          username: (currentAccount.prefs as any)?.username || currentAccount.email.split('@')[0],
          fullName: safeName,
          name: safeName,
          email: currentAccount.email,
          phone: currentAccount.phone || '',
          rollNumber: '',
          department: '',
          semester: '',
          college: 'Central University of Jammu',
        } as unknown as UserProfile
        setUserProfile(fallbackProfile)
      } else {
        setUserProfile(profileDoc)
      }

      if (currentAccount) {
        const adminStatus = await authService.checkIsAdmin()
        setIsAdmin(adminStatus)
      } else {
        setIsAdmin(false)
      }
    } catch {
      setAccount(null)
      setUserProfile(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    syncAuthSession()
  }, [])

  /**
   * Log in and strictly synchronize both account and userProfile
   */
  const login = async (email: string, pass: string) => {
    setLoading(true)
    try {
      await authService.login(email, pass)
      await syncAuthSession()
      setAuthModalOpen(false)
      showToast.dismiss()
      showToast.success('Logged in successfully!')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Register student, create users collection document, and synchronize state
   */
  const registerStudent = async (payload: RegisterPayload) => {
    setLoading(true)
    try {
      const result = await authService.registerStudent(payload)
      setAccount(result.account)
      setUserProfile(result.userProfile)

      const adminStatus = await authService.checkIsAdmin()
      setIsAdmin(adminStatus)
      setAuthModalOpen(false)
      showToast.dismiss()
      showToast.success(`Welcome to Yantrotsav, ${payload.fullName}!`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Universal register method supporting both RegisterPayload and legacy param formats
   */
  const register = async (params: any) => {
    const payload: RegisterPayload = {
      fullName: params.fullName || params.name || '',
      username: params.username || undefined,
      email: params.email || '',
      password: params.password || '',
      rollNumber: params.rollNumber || params.rollNo || '',
      phone: params.phone || '',
      department: params.department || params.branch || '',
      customDepartment: params.customDepartment || undefined,
      semester: params.semester || '',
    }
    await registerStudent(payload)
  }

  /**
   * Update student profile in database and refresh state
   */
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!account) throw new Error('Not authenticated')
    setLoading(true)
    try {
      const updated = await authService.updateProfile(account.$id, data)
      setUserProfile(updated)
      await syncAuthSession()
      showToast.success('Profile updated successfully!')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Logout and clear all session states
   */
  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
      setAccount(null)
      setUserProfile(null)
      setIsAdmin(false)
      setAuthModalOpen(false)
      showToast.dismiss()
      showToast.info('Logged out successfully.')
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      account,
      userProfile,
      user: account,
      profile: userProfile,
      isAdmin,
      loading,
      login,
      registerStudent,
      register,
      updateProfile,
      updateUserProfile: updateProfile,
      logout,
      refreshUser: syncAuthSession,
      openAuthModal,
      closeAuthModal,
      authModalOpen,
      authModalMode,
    }),
    [account, userProfile, isAdmin, loading, authModalOpen, authModalMode],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
