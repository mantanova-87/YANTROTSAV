import type { Models } from 'appwrite'

// ==============================================================================
// ENUMS & CONSTANTS
// ==============================================================================

export type EventFormat = 'solo' | 'team'
export type EventCategory = 'coding' | 'robotics' | 'gaming' | 'design' | 'workshop' | 'other'
export type EventStatus = 'draft' | 'published' | 'closed'

export type TeamStatus = 'pending' | 'confirmed' | 'cancelled' | 'disbanded'
export type InvitationStatus = 'pending' | 'accepted' | 'declined'
export type RegistrationType = 'solo' | 'team'

// ==============================================================================
// APPWRITE DOCUMENT MODELS
// ==============================================================================

/**
 * Event Document stored in `events` collection
 */
export interface EventDocument extends Models.Document {
  title: string
  category: string
  description: string
  eventType: EventFormat
  minTeamSize: number
  maxTeamSize: number
  maxTeamsAllowed?: number
  registrationDeadline?: string
  status: EventStatus
  bannerUrl?: string
  venue?: string
  eventTiming?: string
  // Optional computed/alias properties for backwards compatibility
  format?: EventFormat
  maxTeams?: number
  currentRegistrations?: number
  eventDate?: string
  slug?: string
  shortDescription?: string
  prizes?: string
  rules?: string[]
}

/**
 * Team Document stored in `teams` collection
 */
export interface TeamDocument extends Models.Document {
  name: string
  eventId: string
  leaderId: string
  leaderName: string
  leaderEmail: string
  status: TeamStatus
  // Optional client-side fields
  teamName?: string
  eventTitle?: string
  targetTeamSize?: number
  acceptedCount?: number
  memberEmails?: string[]
}

/**
 * Team Invitation Document stored in `team_invitations` collection
 */
export interface TeamInvitationDocument extends Models.Document {
  teamId: string
  eventId: string
  eventTitle: string
  inviterId: string
  inviterName: string
  inviteeEmail: string
  status: InvitationStatus
  // Optional aliases for compatibility
  teamName?: string
  invitedByUserId?: string
  invitedByUserName?: string
  inviteeName?: string
  respondedAt?: string
}

/**
 * Event Registration Document stored in `event_registrations` collection
 */
export interface EventRegistrationDocument extends Models.Document {
  eventId: string
  teamId?: string
  userId: string
  userName: string
  userEmail: string
  registeredAt: string
  // Optional / Joined fields
  eventTitle?: string
  registrationType?: RegistrationType
  studentName?: string
  studentEmail?: string
  studentPhone?: string
  studentRollNumber?: string
  studentRollNo?: string
  collegeName?: string
  department?: string
  semester?: string
  teamName?: string
  qrCode?: string
  checkedIn?: boolean
  checkedInAt?: string
}

/**
 * Department Enum Options for registration & profile dropdowns
 */
export const DEPARTMENT_OPTIONS = [
  { value: 'CSE', label: 'CSE' },
  { value: 'CCS', label: 'CCS' },
  { value: 'ECE', label: 'ECE' },
  { value: 'ECA', label: 'ECA' },
  { value: 'MNC', label: 'MNC' },
  { value: 'OTHER', label: 'OTHER' },
] as const

/**
 * Semester Options (Semesters 1 through 8)
 */
export const SEMESTER_OPTIONS = [
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
] as const

/**
 * User Profile Document stored in `users` collection under `TablesDB`
 * Attributes: userId, fullName, email, phone, college, department (enum), customDepartment (string 128), semester, rollNumber
 */
export interface UserProfile extends Models.Document {
  userId: string
  fullName: string
  email: string
  phone: string
  college?: string
  department: string
  customDepartment?: string
  semester: string
  rollNumber: string
  username?: string
  // Compatibility aliases
  name?: string
  rollNo?: string
  branch?: string
  collegeName?: string
  qrCode?: string
  isAdmin?: boolean
}

export type UserProfileDocument = UserProfile

/**
 * Registration Payload for form submissions
 */
export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  rollNumber: string
  phone: string
  college?: string
  department: string
  customDepartment?: string
  semester: string
  username?: string
}

// ==============================================================================
// DATA TRANSFER OBJECTS (DTOs) & INPUT TYPES
// ==============================================================================

export interface CreateEventDTO {
  title: string
  category: string
  description: string
  eventType?: EventFormat
  format?: EventFormat
  minTeamSize?: number
  maxTeamSize?: number
  maxTeamsAllowed?: number
  maxTeams?: number
  registrationDeadline?: string
  status?: EventStatus
  bannerUrl?: string
  venue?: string
  eventTiming?: string
  // Optional client-side fields
  eventDate?: string
  slug?: string
  shortDescription?: string
  prizes?: string
  rules?: string[]
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  status?: EventStatus
}

export interface CreateTeamDTO {
  teamName: string
  eventId: string
  leaderId: string
  leaderName: string
  leaderEmail: string
  memberEmails: string[]
}

export interface SoloRegistrationDTO {
  eventId: string
  userId: string
  studentName: string
  studentEmail: string
  studentPhone?: string
  studentRollNumber?: string
  studentRollNo?: string
  collegeName?: string
  department?: string
  semester?: string
}

export interface TeamInviteEmailPayload {
  toEmail: string
  inviteeName?: string
  teamName: string
  eventTitle: string
  actionUrl: string
}

// ==============================================================================
// DASHBOARD & ANALYTICS TYPES
// ==============================================================================

export interface AdminAnalyticsKPI {
  totalRegistrations: number
  eventName?: string
  eventId?: string
  eventRegistrationsMap?: Record<string, number>
  totalUsers?: number
  totalTeamsFormed: number
  activeEventsCount: number
  pendingInvitesCount: number
}

export interface EventRosterEntry {
  registrationId: string
  eventId?: string
  eventTitle?: string
  registrationType: RegistrationType
  studentName: string
  username?: string
  studentEmail: string
  studentPhone: string
  studentRollNumber: string
  studentRollNo: string // compatibility alias
  collegeName: string
  department: string
  semester: string
  teamName?: string
  isLeader?: boolean
  checkedIn: boolean
  registeredAt: string
}
