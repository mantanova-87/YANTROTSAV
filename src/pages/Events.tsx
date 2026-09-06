import { useState, useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Sparkles,
  Filter,
  CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import poster from '../assets/images/poster.png'
import EventRegistrationModal from '../components/events/EventRegistrationModal'
import CyberLoader from '../components/common/CyberLoader'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchEventsThunk } from '../store/slices/eventsSlice'
import { useAuth } from '../context/AuthContext'
import { teamsService } from '../services/appwrite/teams.service'
import type { EventDocument } from '../types/database.types'

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'ALL EVENTS', value: 'all' },
  { label: 'CODING', value: 'coding' },
  { label: 'ROBOTICS', value: 'robotics' },
  { label: 'GAMING', value: 'gaming' },
  { label: 'DESIGN', value: 'design' },
  { label: 'WORKSHOP', value: 'workshop' },
  { label: 'OTHER', value: 'other' },
]

function Events() {
  const shouldReduceMotion = useReducedMotion()
  const dispatch = useAppDispatch()
  const { events, status } = useAppSelector((state) => state.events)

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedEvent, setSelectedEvent] = useState<EventDocument | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { user, profile } = useAuth()
  const [enrolledEventIds, setEnrolledEventIds] = useState<Set<string>>(new Set())

  // Load user's registered event IDs to prevent duplicate registration
  useEffect(() => {
    if (!user) {
      setEnrolledEventIds(new Set())
      return
    }

    let isMounted = true
    const userIdentifiers = [
      profile?.userId,
      user.email,
      user.email.split('@')[0],
      (user.prefs as Record<string, any>)?.username,
      profile?.username,
      profile?.rollNumber,
      profile?.rollNo,
    ].filter(Boolean) as string[]

    Promise.all([
      teamsService.getUserRegistrations(user.$id, userIdentifiers).catch(() => []),
      teamsService.getUserTeams(user.$id, userIdentifiers).catch(() => []),
    ]).then(([regs, teams]) => {
      if (!isMounted) return
      const ids = new Set<string>()
      regs.forEach((r) => ids.add(r.eventId))
      teams.forEach((t) => ids.add(t.eventId))
      setEnrolledEventIds(ids)
    })

    return () => {
      isMounted = false
    }
  }, [user, profile])

  // Fetch events from Appwrite database with intelligent Redux caching
  useEffect(() => {
    dispatch(fetchEventsThunk())
  }, [dispatch])

  // Filter events based on active category
  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return events
    return events.filter(
      (e) => e.category?.toLowerCase() === selectedCategory.toLowerCase()
    )
  }, [events, selectedCategory])

  // Derive schedule dynamically from database events
  const dynamicSchedule = useMemo(() => {
    return events.map((event) => {
      const rawTiming = event.eventTiming || event.eventDate
      let dateStr = '18-19 OCT 2026'
      let timeStr = 'TBA'

      if (rawTiming) {
        const parsed = new Date(rawTiming)
        if (!isNaN(parsed.getTime())) {
          dateStr = parsed.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          timeStr = parsed.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })
        } else if (rawTiming.includes('•')) {
          const parts = rawTiming.split('•')
          dateStr = parts[0]?.trim() || dateStr
          timeStr = parts[1]?.trim() || timeStr
        } else {
          dateStr = rawTiming
        }
      }

      return {
        day: dateStr,
        time: timeStr,
        event: event.title,
        venue: event.venue,
      }
    })
  }, [events])

  const handleOpenRegistration = (event: EventDocument) => {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  const reveal = {
    hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 45 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-[#F8FAFC]">
      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-[1400px] px-5 pb-20 pt-36 md:px-8 md:pb-28 md:pt-44">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
        <div className="pointer-events-none absolute left-0 top-24 h-28 w-px bg-gradient-to-b from-[#00E5FF] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-36 h-36 w-px bg-gradient-to-b from-[#FF6B00] to-transparent" />

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-7 flex items-center gap-3"
        >
          <span className="font-mono text-[10px] tracking-[0.25em] text-[#FF6B00]">
            03
          </span>
          <span className="h-px w-10 bg-[#FF6B00]" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            Event Catalogue / Yantrotsav 2026
          </span>
        </motion.div>

        <motion.h1
          initial={shouldReduceMotion ? false : { opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="max-w-5xl text-[clamp(4rem,12vw,10rem)] font-black leading-[0.78] tracking-[-0.07em]"
        >
          EVENTS
          <span className="text-[#00E5FF]">.</span>
        </motion.h1>

        <div className="mt-10 grid gap-8 border-t border-white/10 pt-7 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00E5FF]">
              / {events.length} Challenges Live / 02 Days / Central University of Jammu
            </p>
          </motion.div>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="max-w-2xl text-sm leading-7 text-slate-400 md:text-base"
          >
            High-pressure technology challenges, robotics arenas, coding battles, and innovation stages.
            Explore the official Yantrotsav 2026 event catalogue and enroll solo or with your team.
          </motion.p>
        </div>
      </section>

      {/* SCHEDULE TABLE */}
      {dynamicSchedule.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-5 pb-24 md:px-8 md:pb-32">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative"
          >
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[#FF6B00]">
                  01 / Timeline
                </p>
                <h2 className="text-2xl font-bold uppercase tracking-[-0.03em] md:text-3xl">
                  Schedule at a glance
                </h2>
              </div>
              <CalendarDays size={20} strokeWidth={1.5} className="text-slate-600" />
            </div>

            <div className="relative border border-white/10 bg-[#080A0F]">
              <div className="pointer-events-none absolute -left-px -top-px h-7 w-7 border-l-2 border-t-2 border-[#00E5FF]" />
              <div className="pointer-events-none absolute -right-px -top-px h-7 w-7 border-r-2 border-t-2 border-[#FF6B00]" />
              <div className="pointer-events-none absolute -bottom-px -left-px h-7 w-7 border-b-2 border-l-2 border-[#FF6B00]" />
              <div className="pointer-events-none absolute -bottom-px -right-px h-7 w-7 border-b-2 border-r-2 border-[#00E5FF]" />

              <div className="grid grid-cols-[80px_1fr_1fr_1.2fr] border-b border-white/10 bg-[#050816] px-5 py-3 font-mono text-[8px] uppercase tracking-[0.22em] text-slate-500 sm:grid-cols-[100px_140px_1fr_1.2fr] sm:px-8">
                <div>Date</div>
                <div>Time</div>
                <div>Event</div>
                <div>Venue</div>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {dynamicSchedule.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[80px_1fr_1fr_1.2fr] items-center px-5 py-4 text-xs transition-colors duration-200 hover:bg-white/[0.03] sm:grid-cols-[100px_140px_1fr_1.2fr] sm:px-8 sm:text-sm"
                  >
                    <div className="font-mono text-[10px] text-[#00E5FF] sm:text-xs">
                      {item.day}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 sm:text-xs">
                      {item.time}
                    </div>
                    <div className="font-bold uppercase tracking-tight text-white">
                      {item.event}
                    </div>
                    <div className="font-mono text-[10px] uppercase text-slate-400 sm:text-xs">
                      {item.venue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* FILTER BUTTONS & EVENT CARDS */}
      <section className="mx-auto max-w-[1240px] px-5 pb-28 md:px-8 md:pb-40">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-6">
          <div>
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[#00E5FF]">
              02 / Registry
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
              Featured Challenges
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={14} className="text-slate-500 mr-1" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] border transition-all ${
                  selectedCategory === cat.value
                    ? 'border-[#00E5FF] bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE WITH CYBER LOADER */}
        {status === 'loading' && events.length === 0 ? (
          <CyberLoader variant="inline" text="INITIALIZING FESTIVAL EVENT GRID..." />
        ) : filteredEvents.length === 0 ? (
          <div className="border border-white/10 bg-[#080A0F] py-20 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400">
              No events found under this category.
            </p>
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24">
            {filteredEvents.map((event, index) => {
              const isReversed = index % 2 !== 0
              const eventNumber = String(index + 1).padStart(2, '0')
              
              const rawTiming = event.eventTiming || event.eventDate
              let dateStr = '18-19 OCT 2026'
              let timeStr = 'Schedule on Arena'

              if (rawTiming) {
                const parsed = new Date(rawTiming)
                if (!isNaN(parsed.getTime())) {
                  dateStr = parsed.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  timeStr = parsed.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                } else if (rawTiming.includes('•')) {
                  const parts = rawTiming.split('•')
                  dateStr = parts[0]?.trim() || dateStr
                  timeStr = parts[1]?.trim() || timeStr
                } else {
                  dateStr = rawTiming
                }
              }

              return (
                <motion.article
                  key={event.$id}
                  variants={reveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className={`group relative ${
                    isReversed ? 'md:ml-auto md:max-w-[1080px]' : 'md:mr-auto md:max-w-[1080px]'
                  }`}
                >
                  <div className="relative border border-white/10 bg-[#080A0F] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white/20">
                    {/* Bookmark Notch */}
                    <div
                      className={`absolute top-0 h-10 w-10 bg-[#050816] ${
                        isReversed ? 'right-0' : 'left-0'
                      }`}
                      style={{
                        clipPath: isReversed
                          ? 'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)'
                          : 'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)',
                      }}
                    />
                    <div
                      className={`absolute top-0 h-10 w-10 ${
                        isReversed ? 'right-0' : 'left-0'
                      } bg-[#FF6B00] opacity-80`}
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)',
                      }}
                    />

                    <div className="grid md:grid-cols-[280px_1fr]">
                      {/* Visual Block with Banner Image */}
                      <div className="relative min-h-[240px] overflow-hidden border-b border-white/10 bg-[#050816] md:border-b-0 md:border-r">
                        <img
                          src={event.bannerUrl || poster}
                          alt={event.title}
                          className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.22] grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-[0.4] group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/15 via-transparent to-[#FF6B00]/15" />

                        <div className="absolute inset-0 p-6">
                          <div className="flex items-start justify-between">
                            <span className="font-mono text-[10px] text-[#FF6B00]">
                              EVENT / {eventNumber}
                            </span>
                            <Sparkles
                              size={15}
                              strokeWidth={1.5}
                              className="text-slate-600 transition-colors duration-300 group-hover:text-[#00E5FF]"
                            />
                          </div>

                          <div className="absolute bottom-6 left-6">
                            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-500">
                              YANTROTSAV 2026
                            </span>
                            <div className="mt-2 h-px w-20 bg-[#00E5FF]" />
                          </div>
                        </div>

                        <span className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-[#FF6B00]/60" />
                      </div>

                      {/* Information Block */}
                      <div className="relative p-6 md:p-8 lg:p-10">
                        <div className="mb-7 flex flex-wrap items-center gap-3">
                          <span className="border border-[#00E5FF]/30 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-[#00E5FF]">
                            {event.category}
                          </span>

                          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-slate-400">
                            {(event.eventType || event.format) === 'solo'
                              ? 'INDIVIDUAL EVENT'
                              : `TEAM (${event.minTeamSize || 1}-${event.maxTeamSize || 4} MEMBERS)`}
                          </span>

                          {enrolledEventIds.has(event.$id) && (
                            <span className="border border-emerald-500/60 bg-emerald-950/40 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={10} /> ENROLLED ✓
                            </span>
                          )}
                        </div>

                        <div className="max-w-3xl">
                          <h3 className="text-4xl font-black uppercase tracking-[-0.05em] transition-colors duration-300 group-hover:text-[#00E5FF] md:text-5xl">
                            {event.title}
                            <span className="text-[#FF6B00]">.</span>
                          </h3>

                          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
                            {event.description}
                          </p>
                        </div>

                        {/* Date / Time / Venue row */}
                        <div className="mt-9 grid border-y border-white/[0.08] py-5 sm:grid-cols-3">
                          <div className="border-b border-white/[0.07] pb-4 sm:border-b-0 sm:border-r sm:pb-0">
                            <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600">
                              Date
                            </span>
                            <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
                              {dateStr}
                            </span>
                          </div>

                          <div className="border-b border-white/[0.07] py-4 sm:border-b-0 sm:border-r sm:px-5 sm:py-0">
                            <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600">
                              Time
                            </span>
                            <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
                              {timeStr}
                            </span>
                          </div>

                          <div className="pt-4 sm:px-5 sm:pt-0">
                            <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600">
                              Venue
                            </span>
                            <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
                              {event.venue}
                            </span>
                          </div>
                        </div>

                        {/* Footer Action */}
                        {(() => {
                          const isDeadlinePassed = Boolean(
                            event.registrationDeadline && new Date(event.registrationDeadline).getTime() < Date.now()
                          )
                          const isRegistrationOpen = event.status === 'published' && !isDeadlinePassed

                          return (
                            <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                <span
                                  className={`h-1.5 w-1.5 ${
                                    enrolledEventIds.has(event.$id)
                                      ? 'bg-emerald-400'
                                      : isRegistrationOpen
                                        ? 'animate-pulse bg-emerald-400'
                                        : 'bg-red-400'
                                  }`}
                                />
                                <span
                                  className={`font-mono text-[9px] uppercase tracking-[0.2em] ${
                                    enrolledEventIds.has(event.$id)
                                      ? 'text-emerald-400'
                                      : isRegistrationOpen
                                        ? 'text-emerald-400'
                                        : 'text-red-400'
                                  }`}
                                >
                                  {enrolledEventIds.has(event.$id)
                                    ? 'Pass Confirmed'
                                    : isRegistrationOpen
                                      ? 'Registration Active'
                                      : isDeadlinePassed
                                        ? 'Deadline Passed'
                                        : 'Registration Closed'}
                                </span>
                              </div>

                              {enrolledEventIds.has(event.$id) ? (
                                <Link
                                  to="/dashboard"
                                  className="flex cursor-pointer items-center justify-center gap-2 border border-emerald-500/60 bg-emerald-500/10 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-400 transition-all hover:bg-emerald-500 hover:text-black shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Already Enrolled ✓</span>
                                </Link>
                              ) : isRegistrationOpen ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRegistration(event)}
                                  className="flex cursor-pointer items-center justify-center gap-3 border border-[#00E5FF] bg-[#00E5FF]/10 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#00E5FF] transition-all hover:bg-[#00E5FF] hover:text-black"
                                >
                                  <span>Register Now</span>
                                  {isReversed ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                </button>
                              ) : (
                                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 border border-white/10 px-4 py-2">
                                  {isDeadlinePassed ? 'Deadline Passed' : 'Registrations Closed'}
                                </span>
                              )}
                            </div>
                          )
                        })()}

                        <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-[#00E5FF] transition-all duration-700 group-hover:w-full" />
                        <span className="pointer-events-none absolute right-0 top-0 h-px w-0 bg-[#FF6B00] transition-all duration-700 group-hover:w-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Bookmark tail */}
                  <div
                    className={`absolute -bottom-3 h-7 w-9 bg-[#FF6B00] ${
                      isReversed ? 'right-8' : 'left-8'
                    }`}
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)',
                    }}
                  />
                </motion.article>
              )
            })}
          </div>
        )}
      </section>

      {/* REGISTRATION MODAL */}
      <EventRegistrationModal
        event={selectedEvent}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  )
}

export default Events
