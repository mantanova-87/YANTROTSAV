import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
} from 'lucide-react'
import poster from '../assets/images/poster.png'

type EventItem = {
  number: string
  name: string
  category: string
  date: string
  time: string
  venue: string
  about: string
  mode: string
}

const events: EventItem[] = [
  {
    number: '01',
    name: 'NEXUS',
    category: 'TECHNICAL',
    date: '18 OCT 2026',
    time: '10:00 AM — 12:00 PM',
    venue: 'MAIN AUDITORIUM',
    about:
      'A high-pressure technology challenge where teams connect ideas, logic, and rapid problem solving to engineer a working solution.',
    mode: 'TEAM EVENT',
  },
  {
    number: '02',
    name: 'ROBOFORGE',
    category: 'TECHNICAL',
    date: '18 OCT 2026',
    time: '12:30 PM — 03:00 PM',
    venue: 'ROBOTICS ARENA',
    about:
      'Design, control, and compete. Build a machine capable of navigating obstacles and outperforming the competition.',
    mode: 'TEAM EVENT',
  },
  {
    number: '03',
    name: 'CODE//BREAK',
    category: 'TECHNICAL',
    date: '18 OCT 2026',
    time: '03:30 PM — 05:30 PM',
    venue: 'COMPUTING LAB',
    about:
      'A fast-paced coding battle focused on algorithms, debugging, logical thinking, and solving problems under pressure.',
    mode: 'INDIVIDUAL EVENT',
  },
  {
    number: '04',
    name: 'CIRCUIT RUSH',
    category: 'TECHNICAL',
    date: '19 OCT 2026',
    time: '10:00 AM — 12:00 PM',
    venue: 'ELECTRONICS LAB',
    about:
      'Decode circuits, identify faults, and race against the clock in a practical electronics challenge built for curious minds.',
    mode: 'TEAM EVENT',
  },
  {
    number: '05',
    name: 'IDEA//X',
    category: 'INNOVATION',
    date: '19 OCT 2026',
    time: '12:30 PM — 02:30 PM',
    venue: 'INNOVATION HALL',
    about:
      'Turn an ambitious idea into a convincing concept. Think beyond conventional solutions and present your vision.',
    mode: 'TEAM EVENT',
  },
  {
    number: '06',
    name: 'CYBER TRACE',
    category: 'NON-TECHNICAL',
    date: '19 OCT 2026',
    time: '03:00 PM — 04:30 PM',
    venue: 'CENTRAL QUAD',
    about:
      'Follow the clues, crack the trail, and uncover the final sequence in a technology-inspired campus challenge.',
    mode: 'OPEN EVENT',
  },
  {
    number: '07',
    name: 'THE FINAL PULSE',
    category: 'SPECIAL',
    date: '19 OCT 2026',
    time: '05:00 PM — 07:00 PM',
    venue: 'MAIN STAGE',
    about:
      'The closing challenge of Yantrotsav 2026. Expect surprises, rapid decisions, and one final test of creativity.',
    mode: 'OPEN EVENT',
  },
]

const schedule = events.map((event) => ({
  day: event.date.replace(' OCT 2026', ''),
  time: event.time.split(' — ')[0],
  event: event.name,
  venue: event.venue,
}))

function Events() {
  const shouldReduceMotion = useReducedMotion()

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
      {/* HERO */}
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
              / 07 Events / 02 Days / 01 Fest
            </p>
          </motion.div>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="max-w-2xl text-sm leading-7 text-slate-400 md:text-base"
          >
            Seven challenges. Seven different ways to think, build, compete,
            and create. Explore the Yantrotsav 2026 event catalogue and find
            the challenge that fits your edge.
          </motion.p>
        </div>
      </section>

      {/* SCHEDULE */}
      <section className="mx-auto max-w-[1240px] px-5 pb-24 md:px-8 md:pb-32">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative"
        >
          {/* top technical marker */}
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[#FF6B00]">
                01 / Schedule
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

          {/* ribbon table */}
          <div className="relative border border-white/10 bg-[#080A0F]">
            <div className="pointer-events-none absolute -left-px -top-px h-7 w-7 border-l-2 border-t-2 border-[#00E5FF]" />
            <div className="pointer-events-none absolute -right-px -top-px h-7 w-7 border-r-2 border-t-2 border-[#FF6B00]" />
            <div className="pointer-events-none absolute -bottom-px -left-px h-7 w-7 border-b-2 border-l-2 border-[#FF6B00]" />
            <div className="pointer-events-none absolute -bottom-px -right-px h-7 w-7 border-b-2 border-r-2 border-[#00E5FF]" />

            <div className="hidden grid-cols-[100px_180px_1fr_240px] border-b border-white/10 bg-white/[0.025] px-6 py-4 md:grid">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                Day
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                Time
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                Event
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                Venue
              </span>
            </div>

            {schedule.map((item, index) => (
              <motion.div
                key={item.event}
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        x: index % 2 === 0 ? -25 : 25,
                      }
                }
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.06,
                }}
                className="group relative grid gap-3 border-b border-white/[0.07] px-5 py-5 last:border-b-0 md:grid-cols-[100px_180px_1fr_240px] md:items-center md:px-6 md:py-4"
              >
                <span className="font-mono text-[10px] text-[#FF6B00]">
                  DAY {item.day}
                </span>

                <span className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                  <Clock3 size={12} />
                  {item.time}
                </span>

                <span className="text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors group-hover:text-[#00E5FF]">
                  {item.event}
                </span>

                <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-slate-600">
                  <MapPin size={12} />
                  {item.venue}
                </span>

                <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-[#00E5FF] transition-all duration-500 group-hover:w-full" />
              </motion.div>
            ))}

            {/* ribbon tails */}
            <div className="absolute -bottom-[12px] left-5 h-3 w-7 bg-[#FF6B00] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
            <div className="absolute -bottom-[12px] right-5 h-3 w-7 bg-[#00E5FF] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
          </div>
        </motion.div>
      </section>

      {/* EVENTS */}
      <section className="mx-auto max-w-[1240px] px-5 pb-28 md:px-8 md:pb-40">
        <div className="mb-12 flex items-end justify-between border-b border-white/10 pb-5">
          <div>
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[#00E5FF]">
              02 / Event Archive
            </p>
            <h2 className="text-2xl font-bold uppercase tracking-[-0.03em] md:text-3xl">
              Choose your challenge
            </h2>
          </div>

          <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600 sm:block">
            07 Entries
          </span>
        </div>

        <div className="space-y-14 md:space-y-20">
          {events.map((event, index) => {
            const isReversed = index % 2 !== 0

            return (
              <motion.article
                key={event.number}
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 70,
                      }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.8,
                  delay: 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative ${isReversed ? 'md:ml-auto md:max-w-[1080px]' : 'md:mr-auto md:max-w-[1080px]'}`}
              >
                <div className="relative border border-white/10 bg-[#080A0F] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white/20">
                  {/* bookmark notch */}
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
                      clipPath:
                        'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)',
                    }}
                  />

                  <div className="grid md:grid-cols-[280px_1fr]">
                    {/* visual block */}
                    <div className="relative min-h-[240px] overflow-hidden border-b border-white/10 bg-[#050816] md:border-b-0 md:border-r">
                      <img
                        src={poster}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.16] grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-[0.28]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/10 via-transparent to-[#FF6B00]/10" />

                      <div className="absolute inset-0 p-6">
                        <div className="flex items-start justify-between">
                          <span className="font-mono text-[10px] text-[#FF6B00]">
                            EVENT / {event.number}
                          </span>

                          <Sparkles
                            size={15}
                            strokeWidth={1.5}
                            className="text-slate-600 transition-colors duration-300 group-hover:text-[#00E5FF]"
                          />
                        </div>

                        <div className="absolute bottom-6 left-6">
                          <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-600">
                            YANTROTSAV
                          </span>

                          <div className="mt-2 h-px w-20 bg-[#00E5FF]" />
                        </div>
                      </div>

                      {/* technical corner */}
                      <span className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-[#FF6B00]/60" />
                    </div>

                    {/* information */}
                    <div className="relative p-6 md:p-8 lg:p-10">
                      <div className="mb-7 flex flex-wrap items-center gap-3">
                        <span className="border border-[#00E5FF]/30 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-[#00E5FF]">
                          {event.category}
                        </span>

                        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600">
                          {event.mode}
                        </span>
                      </div>

                      <div className="max-w-3xl">
                        <h3 className="text-4xl font-black uppercase tracking-[-0.05em] transition-colors duration-300 group-hover:text-[#00E5FF] md:text-5xl">
                          {event.name}
                          <span className="text-[#FF6B00]">.</span>
                        </h3>

                        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
                          {event.about}
                        </p>
                      </div>

                      <div className="mt-9 grid border-y border-white/[0.08] py-5 sm:grid-cols-3">
                        <div className="border-b border-white/[0.07] pb-4 sm:border-b-0 sm:border-r sm:pb-0">
                          <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600">
                            Date
                          </span>
                          <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
                            {event.date}
                          </span>
                        </div>

                        <div className="border-b border-white/[0.07] py-4 sm:border-b-0 sm:border-r sm:px-5 sm:py-0">
                          <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600">
                            Time
                          </span>
                          <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
                            {event.time}
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

                      <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span className="h-1.5 w-1.5 animate-pulse bg-[#FF6B00]" />
                          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                            Registration Opens Soon
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled
                          className="flex cursor-not-allowed items-center justify-center gap-3 border border-white/10 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500"
                        >
                          Registration Opens Soon
                          {isReversed ? (
                            <ArrowUpRight size={14} />
                          ) : (
                            <ArrowDownRight size={14} />
                          )}
                        </button>
                      </div>

                      <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-[#00E5FF] transition-all duration-700 group-hover:w-full" />
                      <span className="pointer-events-none absolute right-0 top-0 h-px w-0 bg-[#FF6B00] transition-all duration-700 group-hover:w-1/2" />
                    </div>
                  </div>
                </div>

                {/* bookmark tail */}
                <div
                  className={`absolute -bottom-3 h-7 w-9 bg-[#FF6B00] ${
                    isReversed ? 'right-8' : 'left-8'
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
      </section>

      {/* CLOSING STRIP */}
      <section className="border-y border-white/10 bg-[#080A0F]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#FF6B00]">
              YANTROTSAV / 2026
            </span>

            <p className="mt-2 text-sm text-slate-500">
              Seven events. One festival. Your move.
            </p>
          </div>

          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-700">
            Registration Opens Soon
          </span>
        </div>
      </section>
    </main>
  )
}

export default Events
