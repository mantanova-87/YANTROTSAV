import { useState, useEffect, useCallback, useMemo, type FormEvent, type ChangeEvent } from 'react'
import {
  ShieldAlert,
  Calendar,
  Plus,
  ToggleLeft,
  ToggleRight,
  Filter,
  Loader2,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Search,
  UserCheck,
  User,
  Users,
  Layers,
  GraduationCap,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppDispatch } from '../store/hooks'
import { invalidateEventsCache } from '../store/slices/eventsSlice'
import { adminService, type SquadInspectionDetails } from '../services/appwrite/admin.service'
import { eventsService } from '../services/appwrite/events.service'
import { storageService } from '../services/appwrite/storage.service'
import CyberLoader from '../components/common/CyberLoader'
import { DEPARTMENT_OPTIONS } from '../types/database.types'
import type {
  AdminAnalyticsKPI,
  EventDocument,
  EventRosterEntry,
  CreateEventDTO,
  UpdateEventDTO,
  EventCategory,
  EventFormat,
  UserProfile,
  TeamDocument,
} from '../types/database.types'

type AdminTab = 'events' | 'roster' | 'users' | 'teams'

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading, openAuthModal } = useAuth()
  const dispatch = useAppDispatch()

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('events')

  // KPI states
  const [kpi, setKpi] = useState<AdminAnalyticsKPI>({
    totalRegistrations: 0,
    totalTeamsFormed: 0,
    activeEventsCount: 0,
    pendingInvitesCount: 0,
  })

  // Events & Roster state
  const [eventsList, setEventsList] = useState<EventDocument[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [roster, setRoster] = useState<EventRosterEntry[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingRoster, setLoadingRoster] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [statusNotice, setStatusNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Search & Filter states for each tab
  const [eventsSearch, setEventsSearch] = useState('')
  const [eventsCategoryFilter, setEventsCategoryFilter] = useState('all')

  const [rosterSearch, setRosterSearch] = useState('')
  const [rosterCheckInFilter, setRosterCheckInFilter] = useState<'all' | 'checked' | 'unchecked'>('all')

  // Users Directory state
  const [usersList, setUsersList] = useState<UserProfile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userDeptFilter, setUserDeptFilter] = useState('all')
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null)

  // Teams Directory state
  const [teamsList, setTeamsList] = useState<TeamDocument[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [teamsSearch, setTeamsSearch] = useState('')
  const [teamsStatusFilter, setTeamsStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'disbanded'>('all')

  // Squad Inspector State
  const [inspectingTeamId, setInspectingTeamId] = useState<string | null>(null)
  const [squadDetails, setSquadDetails] = useState<SquadInspectionDetails | null>(null)
  const [loadingSquadDetails, setLoadingSquadDetails] = useState(false)
  const [squadActionLoading, setSquadActionLoading] = useState<string | null>(null)
  const [copiedSquadDossier, setCopiedSquadDossier] = useState(false)

  // Create Event Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [createBannerFile, setCreateBannerFile] = useState<File | null>(null)
  const [createBannerPreview, setCreateBannerPreview] = useState<string | null>(null)
  const [newEvent, setNewEvent] = useState<CreateEventDTO>({
    title: '',
    description: '',
    shortDescription: '',
    category: 'coding',
    format: 'team',
    minTeamSize: 2,
    maxTeamSize: 4,
    maxTeams: 50,
    venue: '',
    eventDate: '',
    registrationDeadline: '',
  })

  // Edit Event Modal State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventDocument | null>(null)
  const [updatingEvent, setUpdatingEvent] = useState(false)
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null)
  const [editBannerPreview, setEditBannerPreview] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<UpdateEventDTO>({})

  // Delete Event Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<EventDocument | null>(null)
  const [deletingEvent, setDeletingEvent] = useState(false)

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusNotice({ message, type })
    setTimeout(() => setStatusNotice(null), 5000)
  }


  const loadAdminOverview = useCallback(async () => {
    setLoadingStats(true)
    try {
      const [analytics, allEvents] = await Promise.all([
        adminService.getAnalytics().catch(() => ({
          totalRegistrations: 0,
          totalTeamsFormed: 0,
          activeEventsCount: 0,
          pendingInvitesCount: 0,
        })),
        eventsService.getEvents({ status: undefined }).catch(() => []),
      ])

      setKpi(analytics)
      setEventsList(allEvents)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const loadRoster = useCallback(async (eventId: string) => {
    setLoadingRoster(true)
    try {
      const data = await adminService.getEventRoster(eventId)
      setRoster(data)
    } catch {
      setRoster([])
    } finally {
      setLoadingRoster(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const users = await adminService.getAllUsers()
      setUsersList(users)
    } catch {
      setUsersList([])
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  const loadTeams = useCallback(async () => {
    setLoadingTeams(true)
    try {
      const teams = await adminService.getAllTeams()
      setTeamsList(teams)
    } catch {
      setTeamsList([])
    } finally {
      setLoadingTeams(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadAdminOverview()
    }
  }, [isAdmin, loadAdminOverview])

  useEffect(() => {
    if (isAdmin && activeTab === 'roster') {
      loadRoster(selectedEventId)
    } else if (isAdmin && activeTab === 'users') {
      loadUsers()
    } else if (isAdmin && activeTab === 'teams') {
      loadTeams()
    }
  }, [isAdmin, activeTab, selectedEventId, loadRoster, loadUsers, loadTeams])

  // Banner image selection handler for Create Modal
  const handleCreateImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCreateBannerFile(file)
      setCreateBannerPreview(URL.createObjectURL(file))
    }
  }

  // Banner image selection handler for Edit Modal
  const handleEditImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditBannerFile(file)
      setEditBannerPreview(URL.createObjectURL(file))
    }
  }

  const handleCreateEventSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setCreatingEvent(true)
    try {
      let bannerUrl = ''

      // Step 1: Upload banner if selected
      if (createBannerFile) {
        console.log('[Admin] Uploading banner:', createBannerFile.name)
        const uploadRes = await storageService.uploadEventBanner(createBannerFile)
        bannerUrl = uploadRes.fileUrl
        console.log('[Admin] Banner uploaded successfully:', bannerUrl)
      }

      // Step 2: Create the event document
      await eventsService.createEvent({
        ...newEvent,
        bannerUrl,
      })

      dispatch(invalidateEventsCache())
      showNotification(`✅ Event "${newEvent.title}" created successfully!${bannerUrl ? ' (with banner)' : ''}`)
      setCreateModalOpen(false)
      setCreateBannerFile(null)
      setCreateBannerPreview(null)
      setNewEvent({
        title: '',
        description: '',
        shortDescription: '',
        category: 'coding',
        format: 'team',
        minTeamSize: 2,
        maxTeamSize: 4,
        maxTeams: 50,
        venue: '',
        eventDate: '',
        registrationDeadline: '',
      })
      await loadAdminOverview()
    } catch (err: any) {
      console.error('[Admin] Create event failed:', err)
      showNotification(err?.message || 'Failed to create event', 'error')
    } finally {
      setCreatingEvent(false)
    }
  }

  const openEditModal = (event: EventDocument) => {
    setEditingEvent(event)
    setEditFormData({
      title: event.title,
      description: event.description,
      shortDescription: event.shortDescription || '',
      category: event.category,
      format: event.format || event.eventType,
      minTeamSize: event.minTeamSize,
      maxTeamSize: event.maxTeamSize,
      maxTeams: event.maxTeamsAllowed || event.maxTeams || 50,
      venue: event.venue || '',
      eventDate: event.eventTiming || event.eventDate || '',
      eventTiming: event.eventTiming || event.eventDate || '',
      registrationDeadline: event.registrationDeadline || '',
      bannerUrl: event.bannerUrl || '',
    })
    setEditBannerPreview(event.bannerUrl || null)
    setEditBannerFile(null)
    setEditModalOpen(true)
  }

  const handleUpdateEventSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingEvent) return
    setUpdatingEvent(true)
    try {
      let bannerUrl = editFormData.bannerUrl || ''
      if (editBannerFile) {
        const uploadRes = await storageService.uploadEventBanner(editBannerFile)
        bannerUrl = uploadRes.fileUrl
      }

      await eventsService.updateEvent(editingEvent.$id, {
        ...editFormData,
        bannerUrl,
      })

      dispatch(invalidateEventsCache())
      showNotification(`Event "${editFormData.title}" updated successfully!`)
      setEditModalOpen(false)
      setEditingEvent(null)
      setEditBannerFile(null)
      setEditBannerPreview(null)
      await loadAdminOverview()
    } catch (err: any) {
      showNotification(err?.message || 'Failed to update event', 'error')
    } finally {
      setUpdatingEvent(false)
    }
  }

  // 1-Click Clone / Duplicate Event
  const handleCloneEvent = async (event: EventDocument) => {
    try {
      const clonedDTO: CreateEventDTO = {
        title: `${event.title} (Copy)`,
        category: event.category,
        description: event.description,
        format: event.format || event.eventType,
        minTeamSize: event.minTeamSize,
        maxTeamSize: event.maxTeamSize,
        maxTeams: event.maxTeamsAllowed || event.maxTeams || 50,
        venue: event.venue || '',
        eventDate: event.eventTiming || event.eventDate || '',
        eventTiming: event.eventTiming || event.eventDate || '',
        registrationDeadline: event.registrationDeadline || '',
        bannerUrl: event.bannerUrl || '',
        status: 'draft',
      }

      await eventsService.createEvent(clonedDTO)
      dispatch(invalidateEventsCache())
      showNotification(`Event "${clonedDTO.title}" cloned as draft!`)
      await loadAdminOverview()
    } catch (err: any) {
      showNotification(err?.message || 'Failed to clone event', 'error')
    }
  }

  const confirmDeleteEvent = (event: EventDocument) => {
    setEventToDelete(event)
    setDeleteModalOpen(true)
  }

  const handleDeleteEventSubmit = async () => {
    if (!eventToDelete) return
    setDeletingEvent(true)
    try {
      await eventsService.deleteEvent(eventToDelete.$id)
      dispatch(invalidateEventsCache())
      showNotification(`Event "${eventToDelete.title}" and all related teams, passes, and invites deleted successfully!`)
      setDeleteModalOpen(false)
      setEventToDelete(null)
      await loadAdminOverview()
      if (activeTab === 'roster') await loadRoster(selectedEventId)
      if (activeTab === 'teams') await loadTeams()
    } catch (err: any) {
      showNotification(err?.message || 'Failed to delete event', 'error')
    } finally {
      setDeletingEvent(false)
    }
  }

  const handleToggleEventStatus = async (event: EventDocument) => {
    const isPublished = event.status === 'published'
    try {
      await eventsService.toggleRegistration(event.$id, !isPublished)
      dispatch(invalidateEventsCache())
      showNotification(
        `Event "${event.title}" is now ${!isPublished ? 'LIVE' : 'CLOSED'}`
      )
      await loadAdminOverview()
    } catch (err: any) {
      showNotification(err?.message || 'Failed to toggle status', 'error')
    }
  }

  // Gate Attendance Verification & Undo
  const handleCheckInToggle = async (row: EventRosterEntry) => {
    try {
      if (row.checkedIn) {
        await adminService.uncheckInStudent(row.registrationId)
        showNotification(`Reverted check-in for ${row.studentName}`)
      } else {
        await adminService.checkInStudent(row.registrationId)
        showNotification(`Gate Verified: ${row.studentName}`)
      }
      await loadRoster(selectedEventId)
    } catch (err: any) {
      showNotification(err?.message || 'Failed to update check-in status', 'error')
    }
  }

  // Delete Individual Registration
  const handleDeleteRegistration = async (registrationId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to cancel the registration for ${studentName}?`)) return
    try {
      await adminService.deleteRegistration(registrationId, selectedEventId !== 'all' ? selectedEventId : undefined)
      showNotification(`Registration cancelled for ${studentName}`)
      await loadRoster(selectedEventId)
      await loadAdminOverview()
    } catch (err: any) {
      showNotification(err?.message || 'Failed to cancel registration', 'error')
    }
  }

  // Team Admin Actions
  const handleUpdateTeamStatus = async (teamId: string, status: 'confirmed' | 'pending' | 'disbanded') => {
    try {
      await adminService.updateTeamStatus(teamId, status)
      showNotification(`Team status updated to "${status.toUpperCase()}"`)
      await loadTeams()
      await loadAdminOverview()
    } catch (err: any) {
      showNotification(err?.message || 'Failed to update team', 'error')
    }
  }

  const handleDeleteTeam = async (team: TeamDocument) => {
    const displayName = team.name || team.teamName || 'Team'
    if (!window.confirm(`Permanently delete team "${displayName}" and all member invitations?`)) return
    try {
      await adminService.deleteTeam(team.$id)
      showNotification(`Team "${displayName}" removed`)
      await loadTeams()
      await loadAdminOverview()
    } catch (err: any) {
      showNotification(err?.message || 'Failed to delete team', 'error')
    }
  }

  // Squad Inspection Handlers
  const handleInspectSquad = async (teamId: string) => {
    setInspectingTeamId(teamId)
    setLoadingSquadDetails(true)
    setCopiedSquadDossier(false)
    try {
      const data = await adminService.getSquadDetails(teamId)
      setSquadDetails(data)
    } catch (err: any) {
      showNotification(err?.message || 'Failed to load squad dossier.', 'error')
      setInspectingTeamId(null)
    } finally {
      setLoadingSquadDetails(false)
    }
  }

  const handleForceAcceptMember = async (invitationId: string) => {
    if (!inspectingTeamId) return
    setSquadActionLoading(invitationId)
    try {
      await adminService.forceAcceptInvitation(invitationId)
      showNotification('Member invitation marked as accepted by admin.')
      const updated = await adminService.getSquadDetails(inspectingTeamId)
      setSquadDetails(updated)
      await loadTeams()
      await loadAdminOverview()
    } catch (err: any) {
      showNotification(err?.message || 'Failed to accept invitation.', 'error')
    } finally {
      setSquadActionLoading(null)
    }
  }

  const handleCopySquadDossier = () => {
    if (!squadDetails) return
    const lines: string[] = [
      `=== SQUAD DOSSIER: ${squadDetails.team.name || squadDetails.team.teamName} ===`,
      `Event: ${squadDetails.event?.title || squadDetails.team.eventId}`,
      `Status: ${squadDetails.team.status.toUpperCase()}`,
      `Capacity: ${squadDetails.stats.totalAccepted} / ${squadDetails.stats.requiredTeamSize} Confirmed (Max ${squadDetails.stats.maxTeamSize})`,
      ``,
      `--- SQUAD LEADER ---`,
      `Name: ${squadDetails.leader.name}`,
      `Email: ${squadDetails.leader.email}`,
      `Phone: ${squadDetails.leader.phone || 'N/A'}`,
      `Roll No: ${squadDetails.leader.rollNumber || 'N/A'}`,
      `Department: ${squadDetails.leader.department || 'N/A'}`,
      `Semester: ${squadDetails.leader.semester || 'N/A'}`,
      `Check-In: ${squadDetails.leader.checkedIn ? 'Checked-In' : 'Pending Entry'}`,
      `Clearance Pass: ${squadDetails.leader.qrCode || 'N/A'}`,
      ``,
      `--- SQUAD MEMBERS (${squadDetails.members.length}) ---`,
    ]

    squadDetails.members.forEach((m, idx) => {
      lines.push(
        `[#${idx + 1}] ${m.name} (${m.email}) - Status: ${m.status.toUpperCase()} | Phone: ${m.phone || 'N/A'} | Roll: ${m.rollNumber || 'N/A'} | Dept: ${m.department || 'N/A'} | Sem: ${m.semester || 'N/A'} | Entry: ${m.checkedIn ? 'Checked-In' : 'Pending'}`
      )
    })

    navigator.clipboard.writeText(lines.join('\n'))
    setCopiedSquadDossier(true)
    setTimeout(() => setCopiedSquadDossier(false), 3000)
    showNotification('Squad roster copied to clipboard.')
  }

  // CSV Export Actions
  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const currentEvt = eventsList.find((e) => e.$id === selectedEventId)
      const eventName = selectedEventId === 'all' ? 'all-events' : currentEvt?.title || 'event'
      await adminService.exportRosterCSV(selectedEventId, eventName)
      showNotification('Roster CSV exported successfully.')
    } catch (err: any) {
      showNotification(err?.message || 'Failed to export CSV', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleExportUsersCSV = async () => {
    setExporting(true)
    try {
      await adminService.exportUsersCSV(filteredUsers)
      showNotification('Participants directory CSV exported successfully.')
    } catch (err: any) {
      showNotification(err?.message || 'Failed to export users CSV', 'error')
    } finally {
      setExporting(false)
    }
  }

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return eventsList.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(eventsSearch.toLowerCase()) ||
        (e.venue || '').toLowerCase().includes(eventsSearch.toLowerCase())
      const matchCategory = eventsCategoryFilter === 'all' || e.category === eventsCategoryFilter
      return matchSearch && matchCategory
    })
  }, [eventsList, eventsSearch, eventsCategoryFilter])

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return roster.filter((r) => {
      const q = rosterSearch.toLowerCase()
      const matchSearch =
        r.studentName.toLowerCase().includes(q) ||
        (r.username || '').toLowerCase().includes(q) ||
        (r.eventTitle || '').toLowerCase().includes(q) ||
        r.studentEmail.toLowerCase().includes(q) ||
        r.studentRollNumber.toLowerCase().includes(q) ||
        (r.teamName || '').toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)

      const matchCheckIn =
        rosterCheckInFilter === 'all' ||
        (rosterCheckInFilter === 'checked' && r.checkedIn) ||
        (rosterCheckInFilter === 'unchecked' && !r.checkedIn)

      return matchSearch && matchCheckIn
    })
  }, [roster, rosterSearch, rosterCheckInFilter])

  // Roster Statistics
  const rosterStats = useMemo(() => {
    const total = roster.length
    const checked = roster.filter((r) => r.checkedIn).length
    const rate = total > 0 ? Math.round((checked / total) * 100) : 0
    return { total, checked, remaining: total - checked, rate }
  }, [roster])

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = userSearch.toLowerCase()
      const matchSearch =
        (u.fullName || u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.rollNumber || u.rollNo || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        (u.department || u.branch || '').toLowerCase().includes(q)

      const matchDept = userDeptFilter === 'all' || u.department === userDeptFilter
      return matchSearch && matchDept
    })
  }, [usersList, userSearch, userDeptFilter])

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    return teamsList.filter((t) => {
      const q = teamsSearch.toLowerCase()
      const matchSearch =
        (t.name || t.teamName || '').toLowerCase().includes(q) ||
        t.leaderName.toLowerCase().includes(q) ||
        t.leaderEmail.toLowerCase().includes(q) ||
        (t.eventTitle || '').toLowerCase().includes(q)

      const matchStatus = teamsStatusFilter === 'all' || t.status === teamsStatusFilter
      return matchSearch && matchStatus
    })
  }, [teamsList, teamsSearch, teamsStatusFilter])

  if (authLoading) {
    return <CyberLoader variant="fullscreen" text="VALIDATING ADMIN PRIVILEGES..." />
  }

  // Access Protection Guard
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] px-4 pt-20 text-white">
        <div className="relative w-full max-w-lg border border-red-500/40 bg-[#080A0F] p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.15)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/50 bg-red-950/30 text-red-400">
            <ShieldAlert size={32} />
          </div>
          <span className="mt-4 block font-mono text-[9px] uppercase tracking-[0.25em] text-red-400">
            [ACCESS DENIED // 403 FORBIDDEN]
          </span>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
            Admin Enclave Protected
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            This module is reserved for YANTROTSAV event administrators. Your current account ({user?.email || 'Guest'}) does not belong to the Admin Team or possess the required role.
          </p>

          {!user ? (
            <button
              onClick={() => openAuthModal('login')}
              className="mt-6 border border-[#00E5FF] bg-[#00E5FF] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-black hover:bg-transparent hover:text-[#00E5FF]"
            >
              Sign In with Admin Account
            </button>
          ) : (
            <div className="mt-5 border border-white/10 bg-white/[0.02] p-4 text-left font-mono text-[11px] text-slate-300">
              <span className="text-[#FF6B00] font-bold block mb-1">To Grant Admin Access:</span>
              1. Open Appwrite Console &gt; Auth &gt; Users &gt; {user.email}<br />
              2. Add Label: <span className="text-[#00E5FF]">admin</span> OR add user to Team <span className="text-[#00E5FF]">6a9c31f2000700d2d6c9</span>.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-24 pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="relative mb-8 border-b border-white/10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FF6B00]">
                [MASTER SYSTEM // POWER GRID]
              </span>
              <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl flex items-center gap-3">
                <span>Admin Command Center</span>
                <span className="text-xs font-mono font-normal border border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF] px-2.5 py-1 rounded">
                  SUPERUSER ACTIVE
                </span>
              </h1>
              <p className="mt-1 font-mono text-xs text-slate-400">
                Full lifecycle management: Events catalog, bucket storage, student registry, squad rosters, gate verification, and CSV exports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 border border-[#FF6B00] bg-[#FF6B00] px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] transition-all hover:bg-transparent hover:text-[#FF6B00]"
              >
                <Plus size={14} />
                <span>Deploy Event</span>
              </button>
            </div>
          </div>

          {/* Status feedback toast */}
          {statusNotice && (
            <div
              className={`mt-4 flex items-center gap-2 border p-3 font-mono text-xs transition-all ${
                statusNotice.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400'
                  : 'border-red-500/40 bg-red-950/30 text-red-400'
              }`}
            >
              {statusNotice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{statusNotice.message}</span>
            </div>
          )}
        </div>

        {/* Analytics KPI Row */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="relative overflow-hidden border border-white/10 bg-[#080A0F] p-5 shadow-lg">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-400 block">
              Total Registrations
            </span>
            <div className="mt-2 font-mono text-3xl font-black text-white">
              {loadingStats ? '...' : kpi.totalRegistrations}
            </div>
            <span className="mt-1 block font-mono text-[9px] text-[#00E5FF]">
              Event passes booked
            </span>
            <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#00E5FF]" />
          </div>

          <div className="relative overflow-hidden border border-white/10 bg-[#080A0F] p-5 shadow-lg">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-400 block">
              Registered Students
            </span>
            <div className="mt-2 font-mono text-3xl font-black text-purple-400">
              {loadingStats ? '...' : (kpi.totalUsers || usersList.length || 0)}
            </div>
            <span className="mt-1 block font-mono text-[9px] text-purple-300">
              Unique student accounts
            </span>
            <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-purple-400" />
          </div>

          <div className="relative overflow-hidden border border-white/10 bg-[#080A0F] p-5 shadow-lg">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-400 block">
              Teams Formed
            </span>
            <div className="mt-2 font-mono text-3xl font-black text-[#FF6B00]">
              {loadingStats ? '...' : kpi.totalTeamsFormed}
            </div>
            <span className="mt-1 block font-mono text-[9px] text-[#FF6B00]">
              Active student teams
            </span>
            <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#FF6B00]" />
          </div>

          <div className="relative overflow-hidden border border-white/10 bg-[#080A0F] p-5 shadow-lg">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-400 block">
              Active Events
            </span>
            <div className="mt-2 font-mono text-3xl font-black text-[#00E5FF]">
              {loadingStats ? '...' : kpi.activeEventsCount}
            </div>
            <span className="mt-1 block font-mono text-[9px] text-slate-400">
              Published fest events
            </span>
            <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#00E5FF]" />
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap border-b border-white/10">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
              activeTab === 'events'
                ? 'border-[#FF6B00] text-[#FF6B00]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Calendar size={14} />
            <span>Manage Events ({eventsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
              activeTab === 'roster'
                ? 'border-[#00E5FF] text-[#00E5FF]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck size={14} />
            <span>Registrations & Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
              activeTab === 'users'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap size={14} />
            <span>Registered Students</span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
              activeTab === 'teams'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>Teams & Members</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: EVENTS LIFECYCLE & BANNER MANAGEMENT
        ========================================================================= */}
        {activeTab === 'events' && (
          <div className="mt-6 border border-white/10 bg-[#080A0F] p-6 shadow-xl">
            {/* Header / Filter Toolbar */}
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white">
                  Events Catalog & Storage Controls
                </h2>
                <p className="mt-1 font-mono text-[9px] text-slate-500">
                  Deploy, edit, clone, delete events and manage banner images in Appwrite Storage.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={eventsSearch}
                    onChange={(e) => setEventsSearch(e.target.value)}
                    placeholder="Search events or venue..."
                    className="border border-white/15 bg-[#050816] pl-9 pr-3 py-1.5 font-mono text-xs text-white outline-none focus:border-[#FF6B00] w-48 sm:w-60"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={eventsCategoryFilter}
                  onChange={(e) => setEventsCategoryFilter(e.target.value)}
                  className="border border-white/15 bg-[#050816] px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-[#FF6B00]"
                >
                  <option value="all">All Categories</option>
                  <option value="coding">Coding</option>
                  <option value="robotics">Robotics</option>
                  <option value="gaming">Gaming</option>
                  <option value="design">Design</option>
                  <option value="workshop">Workshop</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {loadingStats ? (
              <CyberLoader variant="inline" text="FETCHING EVENTS CATALOG..." size="sm" />
            ) : filteredEvents.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                  No matching events found in database.
                </p>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="border border-[#FF6B00] bg-[#FF6B00]/10 px-5 py-2.5 font-mono text-xs font-bold text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white transition-colors"
                  >
                    + Deploy First Event
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-white/5">
                {filteredEvents.map((ev) => (
                  <div
                    key={ev.$id}
                    className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center hover:bg-white/[0.01] px-2 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Event Banner thumbnail */}
                      {ev.bannerUrl ? (
                        <img
                          src={ev.bannerUrl}
                          alt={ev.title}
                          className="h-16 w-24 object-cover border border-white/10 shrink-0 bg-[#050816]"
                        />
                      ) : (
                        <div className="flex h-16 w-24 items-center justify-center border border-white/10 bg-[#050816] text-slate-600 shrink-0">
                          <ImageIcon size={20} />
                        </div>
                      )}

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-white">{ev.title}</span>
                          <span className="border border-white/15 px-1.5 py-0.5 font-mono text-[8px] uppercase text-slate-400">
                            {ev.category}
                          </span>
                          <span className="font-mono text-[8px] uppercase text-[#00E5FF]">
                            {ev.format || ev.eventType} ({ev.minTeamSize}-{ev.maxTeamSize})
                          </span>
                          {ev.status === 'published' ? (
                            <span className="border border-emerald-500/40 bg-emerald-950/30 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-400">
                              LIVE
                            </span>
                          ) : (
                            <span className="border border-amber-500/40 bg-amber-950/30 px-1.5 py-0.5 font-mono text-[8px] uppercase text-amber-400">
                              CLOSED / DRAFT
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-4 font-mono text-[10px] text-slate-400">
                          <span>Venue: {ev.venue || 'TBA'}</span>
                          <span>•</span>
                          <span>
                            Schedule:{' '}
                            {ev.eventTiming || ev.eventDate
                              ? (() => {
                                  const d = new Date(ev.eventTiming || ev.eventDate || '')
                                  return !isNaN(d.getTime())
                                    ? d.toLocaleString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : ev.eventTiming || ev.eventDate
                                })()
                              : 'TBA'}
                          </span>
                          <span>•</span>
                          <span className="text-[#FF6B00]">
                            Enrolled: {ev.currentRegistrations || 0} / {ev.maxTeamsAllowed || ev.maxTeams || '∞'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(ev)}
                        className="flex items-center gap-1 border border-white/15 bg-white/5 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:border-[#00E5FF] hover:text-[#00E5FF] transition-colors"
                        title="Edit event details"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>

                      {/* 1-Click Clone Button */}
                      <button
                        onClick={() => handleCloneEvent(ev)}
                        className="flex items-center gap-1 border border-white/15 bg-white/5 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:border-purple-400 hover:bg-purple-950/20 transition-colors"
                        title="Duplicate as new event"
                      >
                        <Copy size={12} />
                        <span>Clone</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => confirmDeleteEvent(ev)}
                        className="flex items-center gap-1 border border-red-500/30 bg-red-950/20 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-black transition-colors"
                        title="Delete event"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>

                      {/* Status Toggle Button */}
                      <button
                        onClick={() => handleToggleEventStatus(ev)}
                        className={`flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          ev.status === 'published'
                            ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
                            : 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
                        }`}
                      >
                        {ev.status === 'published' ? (
                          <>
                            <ToggleRight size={14} />
                            <span>Live</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={14} />
                            <span>Closed</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: REGISTRATIONS & ATTENDANCE
        ========================================================================= */}
        {activeTab === 'roster' && (
          <div className="mt-6 border border-white/10 bg-[#080A0F] p-6 shadow-xl">
            {/* Top Toolbar */}
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
              {/* Event Picker & Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <Filter size={16} className="text-[#00E5FF]" />
                <span className="font-mono text-xs uppercase text-slate-400">Filter by Event:</span>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="border border-white/15 bg-[#050816] px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-[#00E5FF]"
                >
                  <option value="all">-- ALL EVENTS (Global) --</option>
                  {eventsList.map((ev) => (
                    <option key={ev.$id} value={ev.$id}>
                      {ev.title} ({ev.currentRegistrations || 0} registered)
                    </option>
                  ))}
                </select>

                {/* Attendance Status Filter */}
                <select
                  value={rosterCheckInFilter}
                  onChange={(e) => setRosterCheckInFilter(e.target.value as any)}
                  className="border border-white/15 bg-[#050816] px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-[#00E5FF]"
                >
                  <option value="all">All Students</option>
                  <option value="checked">Present (Attended)</option>
                  <option value="unchecked">Not Yet Arrived</option>
                </select>
              </div>

              {/* Live Search & CSV Export */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search student, @username, roll, team..."
                    className="border border-white/15 bg-[#050816] pl-9 pr-3 py-1.5 font-mono text-xs text-white outline-none focus:border-[#00E5FF] w-52 sm:w-64"
                  />
                </div>

                <button
                  onClick={handleExportCSV}
                  disabled={exporting || roster.length === 0}
                  className="flex items-center gap-2 border border-emerald-500/50 bg-emerald-950/20 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-black disabled:opacity-40"
                >
                  {exporting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <FileSpreadsheet size={14} />
                  )}
                  <span>Export Attendee List</span>
                </button>
              </div>
            </div>

            {/* Attendance Progress & Summary */}
            {roster.length > 0 && (
              <div className="mt-4 border border-white/10 bg-[#050816] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">
                      Attendance Progress
                    </span>
                    <span className="font-mono text-2xl font-black text-[#00E5FF]">
                      {rosterStats.rate}%
                    </span>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="font-mono text-xs flex flex-wrap gap-4">
                    <span className="text-white">
                      Total Registered: <strong className="text-white">{rosterStats.total}</strong>
                    </span>
                    <span className="text-emerald-400">
                      Present: <strong>{rosterStats.checked}</strong>
                    </span>
                    <span className="text-slate-400">
                      Not Yet Arrived: <strong>{rosterStats.remaining}</strong>
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full sm:w-64 bg-white/10 h-3 overflow-hidden rounded-full">
                  <div
                    className="bg-[#00E5FF] h-full transition-all duration-500 shadow-[0_0_10px_#00E5FF]"
                    style={{ width: `${rosterStats.rate}%` }}
                  />
                </div>
              </div>
            )}

            {/* Registrations & Attendance Table */}
            <div className="mt-6 overflow-x-auto">
              {loadingRoster ? (
                <CyberLoader variant="inline" text="LOADING ATTENDANCE DATA..." size="sm" />
              ) : filteredRoster.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">
                  No event registrations found for this filter.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                    <tr>
                      <th className="pb-3 pr-4">Student</th>
                      <th className="pb-3 pr-4">Event</th>
                      <th className="pb-3 pr-4">Roll Number</th>
                      <th className="pb-3 pr-4">Department & Sem</th>
                      <th className="pb-3 pr-4">Phone</th>
                      <th className="pb-3 pr-4">College</th>
                      <th className="pb-3 pr-4">Team</th>
                      <th className="pb-3 text-center">Attendance</th>
                      <th className="pb-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRoster.map((row) => (
                      <tr key={row.registrationId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-4">
                          <div className="font-bold text-white text-[13px]">{row.studentName}</div>
                          {row.username ? (
                            <div className="font-mono text-[11px] text-[#00E5FF]">@{row.username}</div>
                          ) : null}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-block px-2 py-0.5 border border-white/15 bg-white/5 font-mono text-[10px] text-slate-200">
                            {row.eventTitle || 'Event'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-[11px] text-[#00E5FF]">
                          {row.studentRollNumber || row.studentRollNo || '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="text-slate-300">{row.department}</div>
                          <div className="font-mono text-[10px] text-slate-500">Sem: {row.semester || 'N/A'}</div>
                        </td>
                        <td className="py-3 pr-4 font-mono text-[10px] text-slate-300">
                          {row.studentPhone && row.studentPhone !== 'N/A' ? row.studentPhone : '—'}
                        </td>
                        <td className="py-3 pr-4 text-slate-400">{row.collegeName}</td>
                        <td className="py-3 pr-4 font-mono">
                          {row.teamName ? (
                            <span className="text-[#FF6B00] font-medium">{row.teamName}</span>
                          ) : (
                            <span className="text-slate-500">Solo Entry</span>
                          )}
                          {row.isLeader && (
                            <span className="ml-1.5 px-1 py-0.2 border border-amber-500/40 bg-amber-950/20 text-amber-300 text-[8px] uppercase">
                              LEADER
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleCheckInToggle(row)}
                            className={`px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] border transition-all ${
                              row.checkedIn
                                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400 hover:border-red-500/50 hover:bg-red-950/30 hover:text-red-400'
                                : 'border-white/15 bg-white/5 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/20'
                            }`}
                            title={row.checkedIn ? 'Click to undo attendance' : 'Click to mark student present'}
                          >
                            {row.checkedIn ? 'Present ✓' : 'Mark Present ✓'}
                          </button>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteRegistration(row.registrationId, row.studentName)}
                            className="text-slate-600 hover:text-red-400 transition-colors p-1"
                            title="Cancel Registration"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: STUDENT DIRECTORY
        ========================================================================= */}
        {activeTab === 'users' && (
          <div className="mt-6 border border-white/10 bg-[#080A0F] p-6 shadow-xl">
            {/* Header / Filter Toolbar */}
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white">
                  Student & Participant Registry
                </h2>
                <p className="mt-1 font-mono text-[9px] text-slate-500">
                  Directory of all registered students with verified profiles and credentials.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name, roll, phone..."
                    className="border border-white/15 bg-[#050816] pl-9 pr-3 py-1.5 font-mono text-xs text-white outline-none focus:border-purple-400 w-48 sm:w-60"
                  />
                </div>

                {/* Department Filter */}
                <select
                  value={userDeptFilter}
                  onChange={(e) => setUserDeptFilter(e.target.value)}
                  className="border border-white/15 bg-[#050816] px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-purple-400"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* CSV Export Action */}
                <button
                  onClick={handleExportUsersCSV}
                  disabled={exporting || usersList.length === 0}
                  className="flex items-center gap-2 border border-purple-500/50 bg-purple-950/20 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-purple-400 transition-colors hover:bg-purple-500 hover:text-black disabled:opacity-40"
                >
                  {exporting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <FileSpreadsheet size={14} />
                  )}
                  <span>Export Users CSV</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="mt-6 overflow-x-auto">
              {loadingUsers ? (
                <CyberLoader variant="inline" text="FETCHING PARTICIPANT REGISTRY..." size="sm" />
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">
                  No registered participants found matching criteria.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                    <tr>
                      <th className="pb-3 pr-4">Student</th>
                      <th className="pb-3 pr-4">Roll Number</th>
                      <th className="pb-3 pr-4">Department & Sem</th>
                      <th className="pb-3 pr-4">Phone</th>
                      <th className="pb-3 pr-4">College</th>
                      <th className="pb-3 text-right">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u) => (
                      <tr key={u.$id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-purple-400" />
                            <div>
                              <div className="font-bold text-white text-[13px]">{u.fullName || u.name || 'Student'}</div>
                              <div className="font-mono text-[11px] text-[#00E5FF]">
                                @{u.userId || (u as any).username || (u.email ? u.email.split('@')[0] : 'user')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-mono text-[11px] text-[#00E5FF]">
                          {u.rollNumber || u.rollNo || '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="text-slate-300">
                            {u.department || u.branch} {u.customDepartment ? `(${u.customDepartment})` : ''}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500">Sem: {u.semester || 'N/A'}</div>
                        </td>
                        <td className="py-3 pr-4 font-mono text-[10px] text-slate-300">{u.phone || '—'}</td>
                        <td className="py-3 pr-4 text-slate-400 text-xs">Central University of Jammu</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedUserProfile(u)}
                            className="border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[9px] uppercase text-purple-400 hover:border-purple-400 hover:bg-purple-950/30 transition-colors"
                          >
                            Inspect Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: TEAM SQUADS MANAGEMENT
        ========================================================================= */}
        {activeTab === 'teams' && (
          <div className="mt-6 border border-white/10 bg-[#080A0F] p-6 shadow-xl">
            {/* Top Toolbar */}
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white">
                  Squad & Team Formations
                </h2>
                <p className="mt-1 font-mono text-[9px] text-slate-500">
                  Inspect multi-player squads, force confirm rosters, and disband inactive teams.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={teamsSearch}
                    onChange={(e) => setTeamsSearch(e.target.value)}
                    placeholder="Search squad or leader..."
                    className="border border-white/15 bg-[#050816] pl-9 pr-3 py-1.5 font-mono text-xs text-white outline-none focus:border-emerald-400 w-48 sm:w-60"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={teamsStatusFilter}
                  onChange={(e) => setTeamsStatusFilter(e.target.value as any)}
                  className="border border-white/15 bg-[#050816] px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-emerald-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending Invites</option>
                  <option value="disbanded">Disbanded</option>
                </select>
              </div>
            </div>

            {/* Teams Grid / List */}
            <div className="mt-6">
              {loadingTeams ? (
                <CyberLoader variant="inline" text="FETCHING SQUAD DATA..." size="sm" />
              ) : filteredTeams.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">
                  No teams found matching current filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTeams.map((team) => (
                    <div
                      key={team.$id}
                      className="border border-white/10 bg-[#050816] p-5 flex flex-col justify-between hover:border-[#00E5FF]/40 transition-colors shadow-lg"
                    >
                      <div>
                        {/* Top: Event Title, Team Name, Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#00E5FF] block mb-1">
                              {team.eventTitle || 'Tournament Squad'}
                            </span>
                            <h4 className="text-base font-bold text-white flex items-center gap-2">
                              <span>{team.name || team.teamName}</span>
                            </h4>
                          </div>

                          <span
                            className={`px-2 py-0.5 border font-mono text-[8px] uppercase tracking-wider ${
                              team.status === 'confirmed'
                                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400'
                                : team.status === 'pending'
                                ? 'border-amber-500/40 bg-amber-950/30 text-amber-400'
                                : 'border-red-500/40 bg-red-950/30 text-red-400'
                            }`}
                          >
                            {team.status === 'confirmed' ? 'CONFIRMED' : team.status === 'pending' ? 'WAITING' : 'DISBANDED'}
                          </span>
                        </div>

                        {/* Leader & Roster stats */}
                        <div className="mt-3 space-y-1 text-xs font-mono text-slate-300">
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-slate-500">Leader:</span>
                            <span className="text-white font-medium">{team.leaderName}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-slate-500">Confirmed Members:</span>
                            <span className="text-[#00E5FF] font-bold">
                              {team.acceptedCount || 1} / {team.targetTeamSize || 2}
                            </span>
                            {(team.memberEmails?.length || 0) > 0 && (
                              <span className="text-slate-500 text-[10px]">
                                ({team.memberEmails?.length} invited)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Admin Team Controls */}
                      <div className="mt-5 border-t border-white/10 pt-3 flex flex-wrap items-center justify-between gap-2">
                        {/* Primary Inspect Action */}
                        <button
                          onClick={() => handleInspectSquad(team.$id)}
                          className="flex items-center gap-1.5 border border-[#00E5FF] bg-[#00E5FF]/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black transition-all shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                        >
                          <Search size={12} />
                          <span>Inspect Squad</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {team.status !== 'confirmed' && (
                            <button
                              onClick={() => handleUpdateTeamStatus(team.$id, 'confirmed')}
                              className="border border-emerald-500/40 bg-emerald-950/20 px-2 py-1 font-mono text-[9px] uppercase text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
                            >
                              Force Confirm
                            </button>
                          )}
                          {team.status !== 'disbanded' && (
                            <button
                              onClick={() => handleUpdateTeamStatus(team.$id, 'disbanded')}
                              className="border border-amber-500/40 bg-amber-950/20 px-2 py-1 font-mono text-[9px] uppercase text-amber-400 hover:bg-amber-500 hover:text-black transition-colors"
                            >
                              Disband
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTeam(team)}
                            className="border border-red-500/30 bg-red-950/20 px-2 py-1 font-mono text-[9px] uppercase text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          STUDENT PROFILE INSPECTOR MODAL
      ========================================================================= */}
      {selectedUserProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg border border-purple-500/40 bg-[#080A0F] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap size={20} className="text-purple-400" />
                <h3 className="text-lg font-black uppercase tracking-tight text-white">
                  Student Verified Dossier
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserProfile(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-bold text-white">{selectedUserProfile.fullName || selectedUserProfile.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Roll Number:</span>
                <span className="text-[#00E5FF] font-bold">{selectedUserProfile.rollNumber || selectedUserProfile.rollNo}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Email Address:</span>
                <span className="text-white">{selectedUserProfile.email}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Contact Phone:</span>
                <span className="text-white">{selectedUserProfile.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Department:</span>
                <span className="text-white">{selectedUserProfile.department || selectedUserProfile.branch}</span>
              </div>
              {selectedUserProfile.customDepartment && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Specified Specialization:</span>
                  <span className="text-purple-400">{selectedUserProfile.customDepartment}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Current Semester:</span>
                <span className="text-white">{selectedUserProfile.semester}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">College / Institution:</span>
                <span className="text-white">Central University of Jammu</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Account ID:</span>
                <span className="text-[10px] text-slate-500">{selectedUserProfile.userId || selectedUserProfile.$id}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUserProfile(null)}
                className="border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs uppercase text-slate-300 hover:text-white"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SQUAD INSPECTOR DOSSIER MODAL
      ========================================================================= */}
      {inspectingTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#00E5FF]/40 bg-[#080A0F] p-6 shadow-[0_0_50px_rgba(0,229,255,0.2)]">
            {/* Cyber framing corners */}
            <div className="pointer-events-none absolute inset-0">
              <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#00E5FF]" />
              <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#FF6B00]" />
              <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#FF6B00]" />
              <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#00E5FF]" />
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#00E5FF]">
                  [SQUAD INSPECTOR // FULL TELEMETRY]
                </span>
                <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                  <span>{squadDetails?.team.name || squadDetails?.team.teamName || 'Squad Telemetry'}</span>
                  {squadDetails && (
                    <span
                      className={`px-2 py-0.5 border font-mono text-[9px] uppercase tracking-widest ${
                        squadDetails.team.status === 'confirmed'
                          ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-400'
                          : squadDetails.team.status === 'pending'
                          ? 'border-amber-500/60 bg-amber-950/40 text-amber-400'
                          : 'border-red-500/60 bg-red-950/40 text-red-400'
                      }`}
                    >
                      {squadDetails.team.status}
                    </span>
                  )}
                </h3>
              </div>

              <button
                onClick={() => {
                  setInspectingTeamId(null)
                  setSquadDetails(null)
                }}
                className="rounded p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {loadingSquadDetails || !squadDetails ? (
              <div className="py-16 text-center">
                <CyberLoader variant="inline" text="DECRYPTING LIVE SQUAD TELEMETRY..." />
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {/* 1. Event & Capacity Overview Card */}
                <div className="border border-white/10 bg-[#050816] p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Event Title</span>
                      <span className="text-white font-bold">{squadDetails.event?.title || squadDetails.team.eventId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Venue</span>
                      <span className="text-slate-300">{squadDetails.event?.venue || 'TBA'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Schedule</span>
                      <span className="text-[#00E5FF]">{squadDetails.event?.eventTiming || squadDetails.event?.eventDate || 'Festival Days'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Capacity Status</span>
                      <span className={`font-bold ${squadDetails.stats.isCapacityMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {squadDetails.stats.totalAccepted} / {squadDetails.stats.requiredTeamSize} Confirmed
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-1.5 w-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          squadDetails.stats.isCapacityMet ? 'bg-emerald-400' : 'bg-[#FF6B00]'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.round((squadDetails.stats.totalAccepted / squadDetails.stats.requiredTeamSize) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Squad Leader Card */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF6B00] flex items-center gap-1.5">
                      <User size={12} />
                      SQUAD LEADER
                    </span>
                    {squadDetails.leader.checkedIn ? (
                      <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-emerald-400 border border-emerald-500/40 bg-emerald-950/20 px-2 py-0.5">
                        <ShieldCheck size={10} /> Gate Checked-In
                      </span>
                    ) : (
                      <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400 border border-white/10 px-2 py-0.5">
                        Pending Entry
                      </span>
                    )}
                  </div>

                  <div className="border border-[#FF6B00]/40 bg-[#050816] p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase">Full Name</span>
                        <span className="text-white font-bold text-sm">{squadDetails.leader.name}</span>
                        {squadDetails.leader.username && (
                          <span className="text-[#00E5FF] text-[11px] block">@{squadDetails.leader.username}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase">Email Contact</span>
                        <span className="text-slate-200">{squadDetails.leader.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase">Roll Number</span>
                        <span className="text-[#00E5FF] font-bold">{squadDetails.leader.rollNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase">Phone / WhatsApp</span>
                        <span className="text-slate-300">{squadDetails.leader.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase">Department & Sem</span>
                        <span className="text-slate-300">
                          {squadDetails.leader.department || 'N/A'} {squadDetails.leader.semester ? `(Sem ${squadDetails.leader.semester})` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase">Pass Clearance ID</span>
                        <span className="text-emerald-400 font-bold tracking-wider">
                          {squadDetails.leader.qrCode || `YTR-${squadDetails.team.$id.slice(0, 8).toUpperCase()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Squad Members & Invitations Dossier */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#00E5FF] flex items-center gap-1.5">
                      <Users size={12} />
                      SQUAD MEMBERS & INVITATIONS ({squadDetails.members.length})
                    </span>
                    <span className="font-mono text-[9px] text-slate-500">
                      Accepted: {squadDetails.members.filter((m) => m.status === 'accepted').length} • Pending: {squadDetails.stats.pendingCount}
                    </span>
                  </div>

                  {squadDetails.members.length === 0 ? (
                    <div className="border border-white/10 bg-[#050816] p-6 text-center text-xs font-mono text-slate-500">
                      No additional members invited for this squad yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {squadDetails.members.map((member, idx) => (
                        <div
                          key={member.invitationId || idx}
                          className="border border-white/10 bg-[#050816] p-4 transition-colors hover:border-white/20"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-sm">
                                  {member.name}
                                </span>
                                {member.username && (
                                  <span className="text-[#00E5FF] font-mono text-xs">@{member.username}</span>
                                )}

                                <span
                                  className={`px-2 py-0.5 border font-mono text-[8px] uppercase tracking-wider flex items-center gap-1 ${
                                    member.status === 'accepted'
                                      ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400'
                                      : member.status === 'pending'
                                      ? 'border-amber-500/50 bg-amber-950/30 text-amber-400'
                                      : 'border-red-500/50 bg-red-950/30 text-red-400'
                                  }`}
                                >
                                  {member.status === 'accepted' ? (
                                    <>
                                      <CheckCircle2 size={10} /> ACCEPTED
                                    </>
                                  ) : member.status === 'pending' ? (
                                    <>
                                      <Loader2 size={10} className="animate-spin" /> PENDING INVITE
                                    </>
                                  ) : (
                                    <>
                                      <X size={10} /> DECLINED
                                    </>
                                  )}
                                </span>

                                {member.checkedIn && (
                                  <span className="border border-emerald-500/40 bg-emerald-950/20 px-1.5 py-0.2 font-mono text-[8px] text-emerald-400">
                                    Checked-In
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 font-mono text-[11px] text-slate-300 mt-2">
                                <div>
                                  <span className="text-slate-500">Email:</span> {member.email}
                                </div>
                                <div>
                                  <span className="text-slate-500">Phone:</span> {member.phone || 'N/A'}
                                </div>
                                <div>
                                  <span className="text-slate-500">Roll No:</span>{' '}
                                  <span className="text-[#00E5FF]">{member.rollNumber || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Dept:</span> {member.department || 'N/A'}
                                </div>
                                <div>
                                  <span className="text-slate-500">Semester:</span> {member.semester || 'N/A'}
                                </div>
                                <div>
                                  <span className="text-slate-500">Pass ID:</span>{' '}
                                  <span className="text-emerald-400">{member.qrCode || 'Pending Entry'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action for member (e.g. Force Accept if student confirmed offline) */}
                            {member.status === 'pending' && member.invitationId && (
                              <button
                                disabled={squadActionLoading === member.invitationId}
                                onClick={() => handleForceAcceptMember(member.invitationId!)}
                                className="flex items-center gap-1 border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 font-mono text-[9px] uppercase font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors disabled:opacity-50 shrink-0 self-start md:self-center"
                              >
                                {squadActionLoading === member.invitationId ? (
                                  <Loader2 size={11} className="animate-spin" />
                                ) : (
                                  <Check size={11} />
                                )}
                                <span>Force Accept</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Admin Operations Toolbar */}
                <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={handleCopySquadDossier}
                    className="flex items-center gap-1.5 border border-white/20 bg-white/5 px-4 py-2 font-mono text-xs text-slate-200 hover:border-[#00E5FF] hover:text-[#00E5FF] transition-colors"
                  >
                    {copiedSquadDossier ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedSquadDossier ? 'Dossier Copied!' : 'Copy Squad Dossier'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {squadDetails.team.status !== 'confirmed' && (
                      <button
                        onClick={async () => {
                          await handleUpdateTeamStatus(squadDetails.team.$id, 'confirmed')
                          const updated = await adminService.getSquadDetails(squadDetails.team.$id)
                          setSquadDetails(updated)
                        }}
                        className="border border-emerald-500 bg-emerald-500 px-4 py-2 font-mono text-xs font-bold uppercase text-black hover:bg-emerald-400 transition-colors"
                      >
                        Force Confirm Squad
                      </button>
                    )}
                    {squadDetails.team.status !== 'disbanded' && (
                      <button
                        onClick={async () => {
                          await handleUpdateTeamStatus(squadDetails.team.$id, 'disbanded')
                          const updated = await adminService.getSquadDetails(squadDetails.team.$id)
                          setSquadDetails(updated)
                        }}
                        className="border border-amber-500/60 bg-amber-950/20 px-3 py-2 font-mono text-xs font-bold uppercase text-amber-400 hover:bg-amber-500 hover:text-black transition-colors"
                      >
                        Disband
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setInspectingTeamId(null)
                        setSquadDetails(null)
                      }}
                      className="border border-white/15 px-4 py-2 font-mono text-xs uppercase text-slate-400 hover:text-white transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE EVENT MODAL WITH BANNER UPLOAD
      ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl border border-white/10 bg-[#080A0F] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Deploy New Festival Event
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              {/* Event Title */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. ROBOFORGE, CODE//BREAK, NEXUS"
                  className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Category, Format, Capacities */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Category *
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, category: e.target.value as EventCategory })
                    }
                    className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  >
                    <option value="coding">Coding</option>
                    <option value="robotics">Robotics</option>
                    <option value="gaming">Gaming</option>
                    <option value="design">Design</option>
                    <option value="workshop">Workshop</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Format *
                  </label>
                  <select
                    value={newEvent.format}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, format: e.target.value as EventFormat })
                    }
                    className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  >
                    <option value="team">Team Event</option>
                    <option value="solo">Solo Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Max Teams Capacity
                  </label>
                  <input
                    type="number"
                    value={newEvent.maxTeams}
                    onChange={(e) => setNewEvent({ ...newEvent, maxTeams: Number(e.target.value) })}
                    className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              {newEvent.format === 'team' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                      Min Team Size
                    </label>
                    <input
                      type="number"
                      value={newEvent.minTeamSize}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, minTeamSize: Number(e.target.value) })
                      }
                      className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                      Max Team Size
                    </label>
                    <input
                      type="number"
                      value={newEvent.maxTeamSize}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, maxTeamSize: Number(e.target.value) })
                      }
                      className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                    />
                  </div>
                </div>
              )}

              {/* Venue & Schedule */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Venue Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    placeholder="e.g. MAIN AUDITORIUM / COMPUTING LAB"
                    className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Event Date & Time (Timing) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.eventTiming || (newEvent.eventDate && !isNaN(new Date(newEvent.eventDate).getTime()) ? new Date(newEvent.eventDate).toISOString().slice(0, 16) : '')}
                    onChange={(e) => {
                      const val = e.target.value
                      setNewEvent({ ...newEvent, eventTiming: val, eventDate: val })
                    }}
                    className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              {/* Registration Deadline */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Registration Deadline (Date & Time)
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.registrationDeadline || ''}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, registrationDeadline: e.target.value })
                  }
                  className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Banner Image Upload */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Event Banner Image (Stored in Appwrite Bucket)
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2 border border-dashed border-[#00E5FF]/50 bg-[#050816] px-4 py-2.5 font-mono text-xs text-[#00E5FF] hover:bg-[#00E5FF]/10">
                    <Upload size={14} />
                    <span>{createBannerFile ? createBannerFile.name : 'Choose Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCreateImageSelect}
                      className="hidden"
                    />
                  </label>
                  {createBannerPreview && (
                    <img
                      src={createBannerPreview}
                      alt="Banner Preview"
                      className="h-12 w-20 object-cover border border-white/20"
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Description & Rules Overview *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Detailed event overview, problem statement, and guidelines..."
                  className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 font-mono text-xs uppercase text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingEvent}
                  className="flex items-center gap-2 border border-[#FF6B00] bg-[#FF6B00] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-transparent hover:text-[#FF6B00] disabled:opacity-50"
                >
                  {creatingEvent ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Deploying & Uploading...</span>
                    </>
                  ) : (
                    <span>Deploy Event to DB</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT EVENT MODAL
      ========================================================================= */}
      {editModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl border border-white/10 bg-[#080A0F] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Edit Event // {editingEvent.title}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateEventSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Category
                  </label>
                  <select
                    value={editFormData.category || 'coding'}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: e.target.value as EventCategory,
                      })
                    }
                    className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  >
                    <option value="coding">Coding</option>
                    <option value="robotics">Robotics</option>
                    <option value="gaming">Gaming</option>
                    <option value="design">Design</option>
                    <option value="workshop">Workshop</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Format
                  </label>
                  <select
                    value={editFormData.format || 'team'}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        format: e.target.value as EventFormat,
                      })
                    }
                    className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  >
                    <option value="team">Team Event</option>
                    <option value="solo">Solo Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Max Teams Capacity
                  </label>
                  <input
                    type="number"
                    value={editFormData.maxTeams || 50}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, maxTeams: Number(e.target.value) })
                    }
                    className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Venue Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.venue || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                    className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Event Date & Time (Timing) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={
                      editFormData.eventTiming
                        ? (() => {
                            try {
                              const d = new Date(editFormData.eventTiming)
                              return !isNaN(d.getTime()) ? d.toISOString().slice(0, 16) : ''
                            } catch {
                              return ''
                            }
                          })()
                        : editFormData.eventDate && !isNaN(new Date(editFormData.eventDate).getTime())
                        ? new Date(editFormData.eventDate).toISOString().slice(0, 16)
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value
                      setEditFormData({ ...editFormData, eventTiming: val, eventDate: val })
                    }}
                    className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              {/* Registration Deadline */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Registration Deadline (Date & Time)
                </label>
                <input
                  type="datetime-local"
                  value={
                    editFormData.registrationDeadline
                      ? (() => {
                          try {
                            const d = new Date(editFormData.registrationDeadline)
                            return !isNaN(d.getTime()) ? d.toISOString().slice(0, 16) : ''
                          } catch {
                            return ''
                          }
                        })()
                      : ''
                  }
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, registrationDeadline: e.target.value })
                  }
                  className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Update Banner Image
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2 border border-dashed border-[#00E5FF]/50 bg-[#050816] px-4 py-2.5 font-mono text-xs text-[#00E5FF] hover:bg-[#00E5FF]/10">
                    <Upload size={14} />
                    <span>{editBannerFile ? editBannerFile.name : 'Replace Banner Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageSelect}
                      className="hidden"
                    />
                  </label>
                  {editBannerPreview && (
                    <img
                      src={editBannerPreview}
                      alt="Banner Preview"
                      className="h-12 w-20 object-cover border border-white/20"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editFormData.description || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 font-mono text-xs uppercase text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingEvent}
                  className="flex items-center gap-2 border border-[#00E5FF] bg-[#00E5FF] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-black hover:bg-transparent hover:text-[#00E5FF] disabled:opacity-50"
                >
                  {updatingEvent ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
      ========================================================================= */}
      {deleteModalOpen && eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md border border-red-500/40 bg-[#080A0F] p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-black uppercase tracking-tight text-white">
                Confirm Event Deletion
              </h3>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Are you sure you want to permanently delete event{' '}
              <strong className="text-white">"{eventToDelete.title}"</strong>? This will permanently delete the event along with all its registered attendees, teams, invitations, and uploaded assets.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 font-mono text-xs uppercase text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingEvent}
                onClick={handleDeleteEventSubmit}
                className="flex items-center gap-2 border border-red-500 bg-red-500 px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-transparent hover:text-red-400 disabled:opacity-50"
              >
                {deletingEvent ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Event</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

