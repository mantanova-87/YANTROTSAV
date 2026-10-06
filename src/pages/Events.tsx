import { useState, useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import EventDetailsModal from '../components/events/EventDetailsModal'
import GeneralGuidelines from '../pages/GeneralGuidelines'
import {
  CalendarDays,
  Filter,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import fallbackBanner from '../assets/images/event-fallback.jpg'
import CyberLoader from '../components/common/CyberLoader'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchEventsThunk } from '../store/slices/eventsSlice'
import { useAuth } from '../context/AuthContext'
import { teamsService, MAX_EVENT_REGISTRATIONS_PER_USER } from '../services/appwrite/teams.service'
import type { EventDocument } from '../types/database.types'
import { isEventFullyBooked, getEventSeatsSummary } from '../utils/eventCapacity'
import { FaMedal } from 'react-icons/fa6'
import type { IconType } from 'react-icons/lib'
const eventLogos = import.meta.glob('../assets/event-logos/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const getPositionColor = (position: string) => {
  switch (position) {
    case '1ST POSITION':
      return '#FFD700' // Gold

    case '2ND POSITION':
      return '#C0C0C0' // Silver

    case '3RD POSITION':
      return '#7e2d2d' // Bronze
    case 'ADVANCED MODEL':
      return '#FFD700' // Gold

    case 'BASIC MODEL':
      return '#C0C0C0' // Silver
    default:
      return '#94A3B8'
  }
}
const getEventLogo = (filename: string) => {
  return eventLogos[`../assets/event-logos/${filename}`] ?? ''
}
type Winner = {
  position: string
  name: string
  members?: string[]
  icon: IconType
}

type EventResult = {
  eventLogo: string
  eventName: string
  eventType: 'SOLO' | 'TEAM'
  winners: Winner[]
}

const results: EventResult[] =
  [
    {
      eventLogo: 'fff.png',
      eventName: 'FASTEST FINGER FIRST',
      eventType: 'SOLO',
      winners: [
        {
          position: '1ST POSITION',
          name: 'Adarsh Raj Kushwaha (26BECCS02)',
          icon: FaMedal,
        },
        {
          position: '2ND POSITION',
          name: 'Ajay Kumar (26BECSE03)',
          icon: FaMedal
        },
        {
          position: '3RD POSITION',
          name: 'Shubham Kumar (26BECSE56)',
          icon: FaMedal
        },
      ],
    },
    {
      eventLogo: 'det.jpg',
      eventName: 'THE DETECTIVE',
      eventType: 'TEAM',
      winners: [
        {
          position: '1ST POSITION',
          icon: FaMedal,
          name: 'NIGHTOWL',
          members: [
            'Manpreet Kaur(25BECCS42)', 'Kajal Kumari (25BEMNC26)', 'Ayush Kumar(25BEMNC16)'
          ],
        },
        {
          position: '2ND POSITION',
          icon: FaMedal,
          name: 'BHARAT',
          members: [
            'Ankit Gupta (26BECCS06)', 'Aashish Pandey (26BECCS11)', 'Pinkal Bharia, (26BECCS41)'

          ],
        },
        {
          position: '3RD POSITION',
          icon: FaMedal,
          name: 'PANTHEON',
          members: [
            'Lakshit Bansal (25BECCS39)', 'Harshdeep Kaur Raina (25beccs29)', 'Navneet Kour (25BECSE02)'
          ],
        },
      ],
    },
    {
      eventLogo: 'tiw.jpg',
      eventName: 'THE IDEA WALL',
      eventType: 'TEAM',
      winners: [
        {
          position: '1ST POSITION',
          icon: FaMedal,
          name: 'SAMBA KE ASTER',
          members: [
            'Sahil khanna (24BECSE50)', 'Ruhaan Fariz (24BECSE49)'
          ],
        },
        {
          position: '2ND POSITION',
          icon: FaMedal,
          name: 'FINAL_FINAL_REAL',
          members: [
            'Bhanu Jangra (24BECCS13)', 'Cherry Bohra (24BECCS16)'

          ],
        },
        {
          position: '3RD POSITION',
          icon: FaMedal,
          name: 'LITTIOKLA',
          members: [
            'Anshu Raj (26BEMNC07)', 'Tanya Popat (26BEMNC47)'
          ],
        },
      ],
    },
    {
      eventLogo: 'tfp.jpg',
      eventName: "THE FOUNDER'S PITCH",
      eventType: 'TEAM',
      winners: [
        {
          position: '1ST POSITION',
          icon: FaMedal,
          name: 'THE UNPAID INTERNS',
          members: [
            'Vyom Upadhyay (25BECSE72)', 'Aman Sharma (25BECSE01)', 'Raghuvansh Yudhvir (25BECCS59)'
          ],
        },
        {
          position: '2ND POSITION',
          icon: FaMedal,
          name: 'NOTS',
          members: [
            'Juttuga Mohit Krishna (26BECCS26)', 'Ankit Rawat (26BECCS08)', 'Likhit Chawla, (26BECSE34)'

          ],
        },
        {
          position: '3RD POSITION',
          icon: FaMedal,
          name: 'YUVA',
          members: [
            'Ankit Gupta (26BECCS06)', 'Aashish Pandey (26BECCS11)', 'Pinkal Bharia (26BECCS41)'
          ],
        },
      ],
    },
    {
      eventLogo: 'survivor.jpg',
      eventName: 'SURVIVOR (FREE-FIRE)',
      eventType: 'TEAM',
      winners: [
        {
          position: '1ST POSITION',
          icon: FaMedal,
          name: 'NOTS',
          members: [
            'Aditya Yadav (24BECSE02)', 'Rudra Vijay Saha (26BECCS48)', 'Ankit Rawat (26BECCS08)', 'Priyanshu Shekhawat (24BECSE44)'
          ],
        },
        {
          position: '2ND POSITION',
          icon: FaMedal,
          name: 'USEEN GODS',
          members: [
            'Sanjit Singh (24BECCS45)', 'Prashant Singh (24BECCS38)', 'Anil Prajapati (24BECCS07)', 'Anubhav Prakash (25BECCS19)'

          ],
        },
        {
          position: '3RD POSITION',
          icon: FaMedal,
          name: 'APEX PREDATORS',
          members: [
            'Md Sakib (26BEECE26)', 'Shourya Minhas', 'Atik Ahmad (26BECCS13)', 'Abdul Rafey (26BEECA01)'],
        },
      ],
    },
    {
      eventLogo: 'survivor.jpg',
      eventName: 'SURVIVOR(BGMI)',
      eventType: 'TEAM',
      winners: [
        {
          position: '1ST POSITION',
          icon: FaMedal,
          name: 'TEAM ECONOMICS',
          members: [
            'Saksham Ajay (24IECO21)', 'Tanvir Singh (24IECO28)', 'VINIT SANGRAL (24IECO30)', 'AAYUSHMAAN (26IECO01)'
          ],
        },
        {
          position: '2ND POSITION',
          icon: FaMedal,
          name: '_',
          members: [
            '_'

          ],
        },
        {
          position: '3RD POSITION',
          icon: FaMedal,
          name: '_',
          members: [
            '_'
          ],
        },
      ],
    },
    {
      eventLogo: 'coc.png',
      eventName: 'CLASH OF CODE 2.0',
      eventType: 'SOLO',
      winners: [
        {
          position: '1ST POSITION',
          icon: FaMedal,
          name: 'Cherry Bohra (24BECCS16)',
        },
        {
          position: '2ND POSITION',
          icon: FaMedal,
          name: 'Darsh Dhawan (25BECCS22)',
        },
        {
          position: '3RD POSITION',
          icon: FaMedal,
          name: 'MD Anees Alam (23BECSE13)',
        },
      ],
    },
    {
      eventLogo: 'stc.jpg',
      eventName: 'STACK SCRAMBLE',
      eventType: 'SOLO',
      winners: [
        {
          position: '1ST POSITION',
          icon: FaMedal,
          name: 'Shreyash Prajapati (26BECCS55)',
        },
        {
          position: '2ND POSITION',
          icon: FaMedal,
          name: 'Harisankaran (26beccs21)',
        },
        {
          position: '3RD POSITION',
          icon: FaMedal,
          name: 'Tanya Popat (26BEMNC47)',
        },
      ],
    },
    {
      eventLogo: 'robo.png',
      eventName: 'ROBOTRAVERSE',
      eventType: 'TEAM',
      winners: [
        {
          position: 'ADVANCED MODEL',
          icon: FaMedal,
          name: 'Traversal Masters',
          members:
            ['Shubh Aryan ( 25BECSE67 )', 'Kaushal Kumar ( 25BEMNC28 )', 'Sukhdeep Kaur ( 25BEMNC56 )'],
        },
        {
          position: 'BASIC MODEL',
          icon: FaMedal,
          name: 'Churma',
          members: [
            'Samkit Mishra (25BECSE62)', 'Sahdev Choudhary (25BECSE58)', 'Prashant Bhandari (25BECSE50)'],
        },

      ],
    },
  ]

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
  const [guidelinesOpen, setGuidelinesOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsEvent, setDetailsEvent] = useState<EventDocument | null>(null)

  const { user, profile } = useAuth()

  const [enrolledEventIds, setEnrolledEventIds] = useState<Set<string>>(
    new Set()
  )

  const refreshEnrollments = useMemo(() => {
    return () => {
      if (!user) {
        setEnrolledEventIds(new Set())
        return
      }

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
        teamsService
          .getUserRegistrations(user.$id, userIdentifiers)
          .catch(() => []),
        teamsService
          .getUserTeams(user.$id, userIdentifiers)
          .catch(() => []),
      ]).then(([regs, teams]) => {
        const ids = new Set<string>()
        regs.forEach((r) => ids.add(r.eventId))
        teams.forEach((t) => ids.add(t.eventId))
        setEnrolledEventIds(ids)
      })
    }
  }, [user, profile])

  // Load user's registered event IDs to prevent duplicate registration
  useEffect(() => {
    refreshEnrollments()
  }, [refreshEnrollments])

  // Load events with live occupancy so seat counts stay accurate, and persist
  // deadline/capacity closures on the server instead of serving a stale cache.
  useEffect(() => {
    dispatch(fetchEventsThunk({ force: true }))
  }, [dispatch])

  // Re-render when a registration deadline elapses while the page is open.
  const [, setDeadlineTick] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setDeadlineTick((tick) => tick + 1), 15000)
    return () => window.clearInterval(timer)
  }, [])

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

  const reveal = {
    hidden: shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 45 },

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
      {/* ========================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================= */}

      <section className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-36 md:px-8 md:pb-16 md:pt-44">
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
            2.1
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
              / {events.length} Challenges Live / 02 Days / Central University
              of Jammu
            </p>
          </motion.div>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="max-w-2xl text-sm leading-7 text-slate-400 md:text-base"
          >
            High-pressure technology challenges, robotics arenas, coding
            battles, and innovation stages. Explore the Yantrotsav 2026 event
            catalogue and enroll solo or with your team.
          </motion.p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* POLICY MARQUEE BANNER (MAX 3 EVENTS PER STUDENT) */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-[1400px] px-5 pb-10 md:px-8">
        <div className="relative flex items-center overflow-hidden border border-[#00E5FF]/30 bg-[#080A0F] py-3 px-4 shadow-[0_4px_25px_rgba(0,229,255,0.06)]">
          {/* Cyber accents */}
          <span className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-[#00E5FF]" />
          <span className="absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-[#FF6B00]" />
          <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#FF6B00]" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#00E5FF]" />

          {/* Badge indicator */}
          <div className="mr-3 sm:mr-4 flex shrink-0 items-center gap-2 border border-red-500/50 bg-red-950/30 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span>REGISTRATIONS CLOSED</span>
          </div>

          {/* Simple Marquee Ticker */}
          <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
            <div className="animate-cyber-marquee whitespace-nowrap py-0.5">
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-6 pr-6 font-mono text-[11px] tracking-[0.12em] text-slate-300">
                  <span className="text-red-400 font-semibold">
                    Online registrations for all Yantrotsav 2026 events are now officially closed.
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-slate-300">
                    Existing participants can access their squads and passes in the Student Dashboard.
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-slate-400">
                    For any support or queries, please reach out to the organizing team.
                  </span>
                  <span className="text-white/30">•</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Quota Quick Status Badge */}
          {user ? (
            <Link
              to="/dashboard"
              className="ml-3 sm:ml-4 flex shrink-0 items-center gap-2 border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] transition-all hover:scale-105"
              style={{
                borderColor: enrolledEventIds.size >= MAX_EVENT_REGISTRATIONS_PER_USER ? 'rgba(245, 158, 11, 0.6)' : 'rgba(0, 229, 255, 0.4)',
                backgroundColor: enrolledEventIds.size >= MAX_EVENT_REGISTRATIONS_PER_USER ? 'rgba(245, 158, 11, 0.12)' : 'rgba(0, 229, 255, 0.08)',
                color: enrolledEventIds.size >= MAX_EVENT_REGISTRATIONS_PER_USER ? '#F59E0B' : '#00E5FF',
              }}
              title="Click to view your registered events on Dashboard"
            >
              <ShieldAlert size={12} />
              <span>
                MY EVENTS: {enrolledEventIds.size}/{MAX_EVENT_REGISTRATIONS_PER_USER}
              </span>
            </Link>
          ) : (
            <div className="ml-3 sm:ml-4 hidden md:flex shrink-0 items-center gap-1.5 border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              <span>LIMIT: 3 EVENTS</span>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SCHEDULE TABLE */}
      {/* ========================================================= */}

      {dynamicSchedule.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-5 pb-8 md:px-8 md:pb-16">
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
                  2.2 / Timeline
                </p>

                <h2 className="text-2xl font-bold uppercase tracking-[-0.03em] md:text-3xl">
                  Schedule at a glance
                </h2>
              </div>

              <CalendarDays
                size={20}
                strokeWidth={1.5}
                className="text-slate-600"
              />
            </div>

            {/* ========================================================= */}
            {/* ANIMATED TABLE FRAME */}
            {/* ========================================================= */}

            <motion.div
              initial={
                shouldReduceMotion
                  ? {
                    opacity: 1,
                  }
                  : {
                    opacity: 0,
                  }
              }
              whileInView={{
                opacity: 1,
              }}
              viewport={{
                once: true,
                amount: 0.35,
              }}
              transition={{
                duration: 0.2,
              }}
              className="relative"
            >
              {/* Animated top border */}
              <motion.span
                initial={
                  shouldReduceMotion
                    ? { scaleX: 1 }
                    : { scaleX: 0 }
                }
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.8,
                  delay: 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: 'left center',
                }}
                className="pointer-events-none absolute left-0 top-0 z-40 h-px w-full bg-gradient-to-r from-[#00E5FF] via-white/30 to-[#FF6B00]"
              />

              {/* Animated bottom border */}
              <motion.span
                initial={
                  shouldReduceMotion
                    ? { scaleX: 1 }
                    : { scaleX: 0 }
                }
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.8,
                  delay: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: 'right center',
                }}
                className="pointer-events-none absolute bottom-0 left-0 z-40 h-px w-full bg-gradient-to-r from-[#FF6B00] via-white/30 to-[#00E5FF]"
              />

              {/* Animated left border */}
              <motion.span
                initial={
                  shouldReduceMotion
                    ? { scaleY: 1 }
                    : { scaleY: 0 }
                }
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.7,
                  delay: 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: 'top center',
                }}
                className="pointer-events-none absolute bottom-0 left-0 z-40 h-full w-px bg-[#00E5FF]"
              />

              {/* Animated right border */}
              <motion.span
                initial={
                  shouldReduceMotion
                    ? { scaleY: 1 }
                    : { scaleY: 0 }
                }
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.7,
                  delay: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: 'bottom center',
                }}
                className="pointer-events-none absolute bottom-0 right-0 z-40 h-full w-px bg-[#FF6B00]"
              />

              <div className="relative border border-white/10 bg-[#080A0F]">
                {/* Corner brackets */}
                <div className="pointer-events-none absolute -left-px -top-px h-7 w-7 border-l-2 border-t-2 border-[#00E5FF]" />

                <div className="pointer-events-none absolute -right-px -top-px h-7 w-7 border-r-2 border-t-2 border-[#FF6B00]" />

                <div className="pointer-events-none absolute -bottom-px -left-px h-7 w-7 border-b-2 border-l-2 border-[#FF6B00]" />

                <div className="pointer-events-none absolute -bottom-px -right-px h-7 w-7 border-b-2 border-r-2 border-[#00E5FF]" />

                {/* Table header */}
                <div className="relative z-10 grid grid-cols-[80px_1fr_1fr_1.2fr] border-b border-white/10 bg-[#050816] px-5 py-3 font-mono text-[8px] uppercase tracking-[0.22em] text-slate-500 sm:grid-cols-[100px_140px_1fr_1.2fr] sm:px-8">
                  <div>Date</div>
                  <div>Time</div>
                  <div>Event</div>
                  <div>Venue</div>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  {dynamicSchedule.map((item, index) => {
                    const fromLeft = index % 2 === 0

                    return (
                      <div
                        key={index}
                        className="relative overflow-hidden"
                      >
                        {/* REAL TABLE ROW */}
                        <div className="relative z-10 grid grid-cols-[80px_1fr_1fr_1.2fr] items-center px-5 py-4 text-xs transition-colors duration-200 hover:bg-white/[0.03] sm:grid-cols-[100px_140px_1fr_1.2fr] sm:px-8 sm:text-sm">
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

                        {/* PAPER STRIPS */}
                        {!shouldReduceMotion && (
                          <div className="pointer-events-none absolute inset-0 z-20">
                            {Array.from({ length: 5 }).map(
                              (_, stripIndex) => {
                                const top = `${stripIndex * 20}%`
                                const bottom = `${(4 - stripIndex) * 20
                                  }%`

                                return (
                                  <motion.div
                                    key={stripIndex}
                                    initial={{
                                      x: fromLeft ? '-110%' : '110%',
                                    }}
                                    whileInView={{
                                      x: '0%',
                                    }}
                                    viewport={{
                                      once: true,
                                      amount: 0.35,
                                    }}
                                    transition={{
                                      delay:
                                        index * 0.1 +
                                        stripIndex * 0.07,
                                      duration: 0.55,
                                      ease: [0.22, 1, 0.36, 1],
                                    }}
                                    style={{
                                      top,
                                      bottom,
                                    }}
                                    className="absolute left-0 right-0 bg-[#0B0F18]"
                                  >
                                    {/* Paper edge */}
                                    <span
                                      className={`absolute left-0 right-0 top-0 h-px ${stripIndex === 0
                                        ? 'bg-[#00E5FF]/40'
                                        : 'bg-white/[0.05]'
                                        }`}
                                    />

                                    {/* Technical paper mark */}
                                    <span
                                      className={`absolute top-1/2 h-px w-8 -translate-y-1/2 ${fromLeft
                                        ? 'right-5 bg-[#FF6B00]/50'
                                        : 'left-5 bg-[#00E5FF]/50'
                                        }`}
                                    />
                                  </motion.div>
                                )
                              }
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* ========================================================= */}
      {/* GENERAL GUIDELINES BUTTON */}
      {/* ========================================================= */}

      <div className="flex items-center justify-between">
        <span></span>

        <button
          onClick={() => setGuidelinesOpen(true)}
          className="group relative mb-8 flex w-[30vw] items-center justify-center overflow-hidden border border-[#FF6B00]/60 bg-[#FF6B00] px-5 py-3.5 text-[#050816] transition-all duration-300 hover:border-[#00E5FF] hover:bg-[#00E5FF]"
        >
          <span className="flex flex-col text-[10px] font-black uppercase tracking-[0.18em]">
            <span className="text-sm">GENERAL GUIDELINES</span>
            <span>Click To Read More</span>
          </span>
        </button>

        <span></span>
      </div>

      {/* ========================================================= */}
      {/* FILTER BUTTONS & EVENT CARDS */}
      {/* ========================================================= */}

      <section className="mx-auto max-w-[1240px] px-5 pb-28 md:px-8 md:pb-40">
        <div className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[#FF6B00]">
              2.3 / Registry
            </p>

            <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
              Featured Challenges
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={14} className="mr-1 text-slate-500" />

            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`border px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] transition-all ${selectedCategory === cat.value
                  ? 'border-[#00E5FF] bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30 hover:text-white'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================= */}
        {/* LOADING / EMPTY / EVENTS */}
        {/* ======================================================= */}

        {status === 'loading' && events.length === 0 ? (
          <CyberLoader
            variant="inline"
            text="INITIALIZING FESTIVAL EVENT GRID..."
          />
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

              const cardInitial = shouldReduceMotion
                ? {
                  opacity: 1,
                  x: 0,
                }
                : {
                  opacity: 0,
                  x: isReversed ? 120 : -120,
                }

              return (
                <motion.article
                  key={event.$id}
                  initial={cardInitial}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.9,
                    delay: 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`group relative ${isReversed
                    ? 'md:ml-auto md:max-w-[1080px]'
                    : 'md:mr-auto md:max-w-[1080px]'
                    }`}
                >
                  <div className="relative border border-white/10 bg-[#080A0F] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white/20">
                    {/* Bookmark Notch */}
                    <div
                      className={`absolute top-0 h-10 w-10 bg-[#050816] ${isReversed ? 'right-0' : 'left-0'
                        }`}
                      style={{
                        clipPath:
                          'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)',
                      }}
                    />

                    <div
                      className={`absolute top-0 h-10 w-10 bg-[#FF6B00] opacity-80 ${isReversed ? 'right-0' : 'left-0'
                        }`}
                      style={{
                        clipPath:
                          'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)',
                      }}
                    />

                    <div className="grid md:grid-cols-[280px_1fr]">
                      {/* ================================================= */}
                      {/* VISUAL BLOCK */}
                      {/* ================================================= */}

                      <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden border-b border-white/10 bg-[#050816] md:border-b-0 md:border-r">
                        {/* Event Number */}
                        <div className="absolute left-6 top-6 z-30">
                          <span className="font-mono text-[10px] text-[#FF6B00]">
                            EVENT / {eventNumber}
                          </span>
                        </div>

                        {/* CENTERED EVENT IMAGE */}
                        <img
                          src={event.bannerUrl || fallbackBanner}
                          alt={event.title}
                          onError={(e) => {
                            if (e.currentTarget.src !== fallbackBanner) {
                              e.currentTarget.src = fallbackBanner
                            }
                          }}
                          className="absolute left-1/2 top-1/2 z-10 h-50 w-50 -translate-x-1/2 -translate-y-1/2 object-contain transition-all duration-700 group-hover:scale-105"
                        />

                        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-[#00E5FF]/15 via-transparent to-[#FF6B00]/15" />

                        <div className="absolute inset-0 z-30 p-6">
                          <div className="absolute bottom-6 left-6">
                            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-500">
                              YANTROTSAV 2026
                            </span>

                            <div className="mt-2 h-px w-20 bg-[#00E5FF]" />
                          </div>
                        </div>

                        <span className="absolute bottom-0 right-0 z-40 h-8 w-8 border-b border-r border-[#FF6B00]/60" />
                      </div>

                      {/* ================================================= */}
                      {/* INFORMATION BLOCK */}
                      {/* ================================================= */}

                      <div className="relative p-6 md:p-8 lg:p-10">
                        <div className="mb-7 flex flex-wrap items-center gap-3">
                          <span className="border border-[#00E5FF]/30 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-[#00E5FF]">
                            {event.category}
                          </span>

                          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-slate-400">
                            {(event.eventType || event.format) === 'solo'
                              ? 'INDIVIDUAL EVENT'
                              : `TEAM (${event.minTeamSize || 1}-${event.maxTeamSize || 4
                              } MEMBERS)`}
                          </span>

                          {(() => {
                            const seats = getEventSeatsSummary(event)
                            return (
                              <span
                                className={`border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.18em] ${isEventFullyBooked(event)
                                  ? 'border-[#FF6B00]/50 text-[#FF6B00]'
                                  : 'border-white/15 text-slate-300'
                                  }`}
                              >
                                {seats.display} {seats.unit}
                              </span>
                            )
                          })()}

                          {enrolledEventIds.has(event.$id) ? (
                            <span className="flex items-center gap-1 border border-emerald-500/60 bg-emerald-950/40 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                              <CheckCircle2 size={10} />
                              ENROLLED ✓
                            </span>
                          ) : (
                            <span className="border border-red-500/50 bg-red-950/40 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-red-400">
                              REGISTRATION CLOSED
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

                        {/* DATE / TIME / VENUE / SEATS */}
                        <div className="mt-9 grid border-y border-white/[0.08] py-5 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="border-b border-white/[0.07] pb-4 sm:border-b-0 sm:border-r sm:pb-0">
                            <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600">
                              Date
                            </span>

                            <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
                              {(() => {
                                const rawTiming =
                                  event.eventTiming || event.eventDate

                                if (!rawTiming) {
                                  return '18-19 OCT 2026'
                                }

                                const parsed = new Date(rawTiming)

                                if (!isNaN(parsed.getTime())) {
                                  return parsed.toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                }

                                if (rawTiming.includes('•')) {
                                  return (
                                    rawTiming.split('•')[0]?.trim() ||
                                    '18-19 OCT 2026'
                                  )
                                }

                                return rawTiming
                              })()}
                            </span>
                          </div>

                          <div className="border-b border-white/[0.07] py-4 sm:border-b-0 sm:border-r sm:px-5 sm:py-0">
                            <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600">
                              Time
                            </span>

                            <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
                              {(() => {
                                const rawTiming =
                                  event.eventTiming || event.eventDate

                                if (!rawTiming) {
                                  return 'Schedule on Arena'
                                }

                                const parsed = new Date(rawTiming)

                                if (!isNaN(parsed.getTime())) {
                                  return parsed.toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                }

                                if (rawTiming.includes('•')) {
                                  return (
                                    rawTiming.split('•')[1]?.trim() ||
                                    'Schedule on Arena'
                                  )
                                }

                                return 'Schedule on Arena'
                              })()}
                            </span>
                          </div>

                          <div className="border-b border-white/[0.07] py-4 sm:border-b-0 sm:border-r sm:px-5 sm:py-0 lg:border-b-0">
                            <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600">
                              Venue
                            </span>

                            <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
                              {event.venue}
                            </span>
                          </div>

                          <div className="pt-4 sm:px-5 sm:pt-0">
                            {(() => {
                              const seats = getEventSeatsSummary(event)
                              const booked = isEventFullyBooked(event)
                              const remaining = seats.remaining
                              return (
                                <>
                                  <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600">
                                    {seats.label}
                                  </span>
                                  <span
                                    className={`mt-2 block text-[11px] font-semibold uppercase tracking-[0.08em] ${booked ? 'text-[#FF6B00]' : 'text-[#00E5FF]'
                                      }`}
                                  >
                                    {seats.display}
                                  </span>
                                  <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.16em] text-slate-500">
                                    {seats.total
                                      ? booked
                                        ? 'Completely booked'
                                        : `${remaining} ${seats.remainingUnit} left`
                                      : 'Open seating'}
                                  </span>
                                </>
                              )
                            })()}
                          </div>
                        </div>

                        {/* FOOTER ACTION */}
                        {(() => {
                          return (
                            <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                <span
                                  className={`h-1.5 w-1.5 ${enrolledEventIds.has(event.$id)
                                    ? 'bg-emerald-400'
                                    : 'bg-red-400'
                                    }`}
                                />

                                <span
                                  className={`font-mono text-[9px] uppercase tracking-[0.2em] ${enrolledEventIds.has(event.$id)
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                    }`}
                                >
                                  {enrolledEventIds.has(event.$id)
                                    ? 'Registered'
                                    : 'Registration Closed'}
                                </span>
                              </div>

                              <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDetailsEvent(event)
                                    setDetailsOpen(true)
                                  }}
                                  className="flex cursor-pointer items-center justify-center gap-2 border border-[#FF6B00]/70 bg-[#FF6B00]/10 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#FF6B00] transition-all hover:bg-[#FF6B00] hover:text-black"
                                >
                                  <span>More Details</span>
                                </button>

                                {enrolledEventIds.has(event.$id) ? (
                                  <Link
                                    to="/dashboard"
                                    className="flex cursor-pointer items-center justify-center gap-2 border border-emerald-500/60 bg-emerald-500/10 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all hover:bg-emerald-500 hover:text-black"
                                  >
                                    <CheckCircle2 size={13} />
                                    <span>Already Enrolled ✓</span>
                                  </Link>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="flex cursor-not-allowed items-center justify-center gap-2 border border-red-500/50 bg-red-950/40 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-red-400 opacity-90 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                                  >
                                    <ShieldAlert size={13} />
                                    <span>Registration Closed</span>
                                  </button>
                                )}
                              </div>
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
                    className={`absolute -bottom-3 h-7 w-9 bg-[#FF6B00] ${isReversed ? 'right-8' : 'left-8'
                      }`}
                    style={{
                      clipPath:
                        'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)',
                    }}
                  />
                </motion.article>
              )
            })}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* GENERAL GUIDELINES MODAL */}
      {/* ========================================================= */}

      {guidelinesOpen && (
        <GeneralGuidelines
          onClose={() => setGuidelinesOpen(false)}
        />
      )}

      {/* ========================================================= */}
      {/* DETAILS MODAL */}
      {/* ========================================================= */}

      <EventDetailsModal
        event={detailsEvent}
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false)
          setDetailsEvent(null)
        }}
      />
      <section className="relative mx-auto max-w-[1400px] overflow-hidden px-4 py-16 sm:px-5 md:px-8 md:py-24">
        {/* BACKGROUND DETAIL */}
        <div className="pointer-events-none absolute left-0 top-24 h-32 w-px bg-gradient-to-b from-[#00E5FF]/60 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-24 h-32 w-px bg-gradient-to-b from-[#FF6B00]/60 to-transparent" />

        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-10 md:mb-12"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#FF6B00]">
              2.4 / Results
            </span>

            <span className="h-px w-10 bg-[#FF6B00]/50" />

            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-slate-700">
              Final Standings
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-[-0.02em] text-white sm:text-3xl md:text-4xl">
                Event Results
              </h2>

              <p className="mt-3 max-w-xl text-[13px] leading-6 text-slate-500">
                Celebrating the teams and individuals who stood at the top
                of every challenge.
              </p>
            </div>

            <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-slate-700 sm:block">
              YTS / 2026
            </span>
          </div>
        </motion.div>

        {/* RESULT LIST */}
        <div className="space-y-5">
          {results.map((result, index) => (
            <motion.article
              key={result.eventName}
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.98,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.12,
              }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden border border-white/10 bg-[#080A0F] transition-all duration-500 hover:border-white/20"
            >
              {/* TECHNICAL ACCENTS */}
              <div className="absolute left-0 top-0 h-px w-24 bg-[#00E5FF] transition-all duration-500 group-hover:w-40" />
              <div className="absolute right-0 top-0 h-px w-16 bg-[#FF6B00] transition-all duration-500 group-hover:w-28" />

              <span className="absolute left-0 top-0 h-5 w-px bg-[#00E5FF]" />
              <span className="absolute right-0 top-0 h-5 w-px bg-[#FF6B00]" />

              <span className="absolute bottom-0 left-0 h-4 w-px bg-[#00E5FF]/40" />
              <span className="absolute bottom-0 right-0 h-4 w-px bg-[#FF6B00]/40" />

              <div className="grid md:grid-cols-[180px_1fr]">
                {/* =====================================================
          LEFT BOX — LOGO ONLY
      ====================================================== */}
                <div className="relative flex min-h-[180px] items-center justify-center border-b border-white/10 bg-[#050816] p-6 md:min-h-[240px] md:border-b-0 md:border-r">
                  {/* EVENT NUMBER */}
                  <span className="absolute left-4 top-4 font-mono text-[12px] tracking-[0.2em] text-slate-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* LOGO FRAME */}
                  <motion.div
                    whileHover={{
                      rotateY: 8,
                      rotateX: -5,
                      scale: 1.05,
                    }}
                    transition={{ duration: 0.35 }}
                    className="relative flex h-28 w-28 items-center justify-center [transform-style:preserve-3d] sm:h-32 sm:w-32"
                  >
                    {/* CORNER BRACKETS */}
                    <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-[#00E5FF]" />
                    <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-[#00E5FF]/50" />

                    <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-[#FF6B00]/50" />
                    <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[#FF6B00]" />

                    {getEventLogo(result.eventLogo) ? (
                      <img
                        src={getEventLogo(result.eventLogo)}
                        alt={`${result.eventName} logo`}
                        className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-slate-700">
                        No Logo
                      </span>
                    )}
                  </motion.div>

                  {/* SMALL TECH LABEL */}
                  <span className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-700">
                    Event Identity
                  </span>
                </div>

                {/* =====================================================
          RIGHT BOX — ALL EVENT INFORMATION
      ====================================================== */}
                <div className="relative p-5 sm:p-6 md:p-7">
                  {/* EVENT HEADER */}
                  <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-slate-600">
                        Event Name
                      </p>

                      <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-white transition-colors duration-300 group-hover:text-[#00E5FF] md:text-2xl">
                        {result.eventName}
                      </h3>
                    </div>

                    {/* EVENT TYPE */}
                    <div className="flex items-center gap-2 sm:pt-1">
                      <span
                        className={`h-1.5 w-1.5 ${result.eventType === 'TEAM'
                          ? 'bg-[#7C3AED]'
                          : 'bg-[#00E5FF]'
                          }`}
                      />

                      <span
                        className={`font-mono text-[12px] font-bold uppercase tracking-[0.18em] ${result.eventType === 'TEAM'
                          ? 'text-[#A78BFA]'
                          : 'text-[#00E5FF]'
                          }`}
                      >
                        {result.eventType}
                      </span>
                    </div>
                  </div>

                  {/* WINNERS HEADER */}
                  <div className="mt-6 flex items-center gap-3">
                    <span className="h-1.5 w-1.5 bg-[#FFB000]" />

                    <span className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#FFB000]">
                      Winners
                    </span>

                    <span className="h-px flex-1 bg-white/10" />

                    <span className="hidden font-mono text-[10px] uppercase tracking-[0.15em] text-slate-700 sm:block">
                      Top 03
                    </span>
                  </div>

                  {/* WINNERS */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3">
                    {result.winners.map((winner, winnerIndex) => (
                      <motion.div
                        key={`${result.eventName}-${winner.position}`}
                        initial={{
                          opacity: 0,
                          x: winnerIndex === 0 ? -15 : winnerIndex === 2 ? 15 : 0,
                        }}
                        whileInView={{
                          opacity: 1,
                          x: 0,
                        }}
                        viewport={{
                          once: true,
                          amount: 0.2,
                        }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1 + winnerIndex * 0.08,
                        }}
                        className={`relative py-2 ${winnerIndex > 0
                          ? 'mt-5 border-t border-white/10 pt-6 md:mt-0 md:border-l md:border-t-0 md:pl-5'
                          : 'md:pr-5'
                          }`}
                      >
                        {/* POSITION */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 ${winnerIndex === 0
                              ? 'bg-[#FFB000]'
                              : winnerIndex === 1
                                ? 'bg-slate-400'
                                : 'bg-[#FF6B00]'
                              }`}
                          />


                          <div className="flex items-center gap-2">
                            <winner.icon
                              size={18}
                              color={getPositionColor(winner.position)}
                            />

                            <span
                              className="font-mono text-[9px] font-bold uppercase tracking-[0.16em]"
                              style={{
                                color: getPositionColor(winner.position),
                              }}
                            >
                              {winner.position}
                            </span>
                          </div>
                        </div>
                          {/* WINNER / TEAM NAME */}
                          <h4 className="mt-4 text-lg font-black uppercase tracking-wide custom-text">
                            {winner.name}
                          </h4>

                          {/* SOLO LABEL */}
                          {result.eventType === 'SOLO' && (
                            <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.15em] custom-text">
                              Individual Winner
                            </p>
                          )}

                          {/* TEAM MEMBERS */}
                          {result.eventType === 'TEAM' && winner.members && (
                            <div className="mt-4 border-l border-white/10 pl-3">
                              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] custom-text">
                                Team Members
                              </p>

                              <div className="space-y-1.5">
                                {winner.members.map((member, memberIndex) => (
                                  <motion.div
                                    key={`${winner.name}-${member}`}
                                    initial={{
                                      opacity: 0,
                                      x: -5,
                                    }}
                                    whileInView={{
                                      opacity: 1,
                                      x: 0,
                                    }}
                                    viewport={{
                                      once: true,
                                    }}
                                    transition={{
                                      duration: 0.3,
                                      delay:
                                        index * 0.1 +
                                        winnerIndex * 0.08 +
                                        memberIndex * 0.04,
                                    }}
                                    className="flex items-start gap-2 custom-text"
                                  >
                                    <span className="mt-0.5 font-mono text-[10px] custom-text">
                                      {String(memberIndex + 1).padStart(2, '0')}
                                    </span>

                                    <span className="text-[16px] uppercase leading-4 custom-text transition-colors duration-300 hover:custom-text">
                                      {member}
                                    </span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* BOTTOM TECHNICAL LABEL */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 flex items-center justify-between border-t border-white/5 pt-4"
        >
          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-slate-700">
            YANTROTSAV / Official Results
          </span>

          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-slate-700">
            2026
          </span>
        </motion.div>
      </section>
    </main>
  )
}

export default Events