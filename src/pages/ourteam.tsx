import { motion, useReducedMotion } from 'framer-motion'
import { Mail, MessageCircle } from 'lucide-react'
import mantavya from '../assets/images/mantavya.png'
import mehak from '../assets/images/mehak.png'
import priyanshu from '../assets/images/priyanshu.jpeg'
import sachin from '../assets/images/sachin.jpg'
import abhinav from '../assets/images/abhinav.png'
import Harsh from '../assets/images/Harsh.jpeg'

const teamMembers = [
  {
    name: 'ABHINAV KUMAR',
    designation: '',
    course: 'B.Tech CSE CYBER',
    semester: '',
    email: 'member1@example.com',
    instagram: '#',
    linkedin: '#',
    whatsapp: '#',
    image: abhinav,
  },
  {
    name: 'HARSH SAXENA',
    designation: '',
    course: 'B.Tech CSE',
    semester: '',
    email: 'member2@example.com',
    instagram: '#',
    linkedin: '#',
    whatsapp: '#',
    image: Harsh,
  },
  {
    name: 'MANTVAYA KUMAR',
    designation: '',
    course: 'B.Tech CSE (CYBER)',
    semester: '',
    email: 'Cdt.mantavyakumar@gmail.com',
    instagram: 'https://www.instagram.com/mantanova_87?stkn=ZzAycDlvMDM3NW5l',
    linkedin: 'https://www.linkedin.com/in/mantavyakumar7487',
    whatsapp: 'https://wa.me/918862962250',
    image: mantavya,
  },
  {
    name: 'PRIYANSHU GUPTA',
    designation: '',
    course: 'B.Tech CSE',
    semester: '',
    email: 'member4@example.com',
    instagram: '#',
    linkedin: '#',
    whatsapp: '#',
    image: priyanshu,
  },
  {
    name: 'KUMAR SACHIN',
    designation: '',
    course: 'B.Tech CSE',
    semester: '',
    email: 'member5@example.com',
    instagram: '#',
    linkedin: '#',
    whatsapp: '#',
    image: sachin,
  },
  {
    name: 'MEHAK SHARMA',
    designation: '',
    course: 'B.Tech CSE',
    semester: '',
    email: 'member6@example.com',
    instagram: '#',
    linkedin: '#',
    whatsapp: '#',
    image: mehak,
  },
]

const stripCount = 5

function TeamMemberCard({
  member,
  index,
}: {
  member: (typeof teamMembers)[number]
  index: number
}) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.article
      initial={
        reducedMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 35, scale: 0.97 }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reducedMotion ? 0 : 0.7,
        delay: reducedMotion ? 0 : index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative mx-auto w-full max-w-[360px] ${
        index % 2 === 1 ? 'lg:translate-y-12' : ''
      }`}
    >
      {/* Card frame */}
      <div className="relative overflow-hidden bg-[#080A0F]">
        {/* Cyan corner */}
        <span className="pointer-events-none absolute left-0 top-0 z-50 h-7 w-7 border-l-2 border-t-2 border-[#00E5FF]" />

        {/* Orange corner */}
        <span className="pointer-events-none absolute right-0 top-0 z-50 h-7 w-7 border-r-2 border-t-2 border-[#FF6B00]" />

        <span className="pointer-events-none absolute bottom-0 left-0 z-50 h-7 w-7 border-b-2 border-l-2 border-[#00E5FF]" />

        <span className="pointer-events-none absolute bottom-0 right-0 z-50 h-7 w-7 border-b-2 border-r-2 border-[#FF6B00]" />

        {/* Actual visible content */}
        <div className="relative z-10">
          {/* Image */}
          <div className="relative flex h-[250px] items-center justify-center overflow-hidden bg-[#0B0E15]">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="absolute left-4 top-4 font-mono text-[8px] uppercase tracking-[0.2em] text-slate-600">
              ID / 0{index + 1}
            </div>

            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="relative z-10 h-full w-full object-contain object-center p-5 transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="relative z-10 flex h-28 w-28 items-center justify-center border border-white/10">
                <span className="font-mono text-4xl font-bold text-slate-700">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 h-px w-full bg-white/10" />
          </div>

          {/* Details */}
          <div className="relative p-5">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#00E5FF]">
                Team Member
              </span>

              <span className="font-mono text-[8px] text-slate-600">
                0{index + 1} / 06
              </span>
            </div>

            <h2 className="text-center text-2xl font-black uppercase tracking-tight text-white">
              {member.name}
            </h2>

            <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FF6B00]">
              {member.designation}
            </p>

            <div className="mt-5 grid grid-cols-2 border-y border-white/10">
              <div className="border-r border-white/10 py-3 text-center">
                <span className="block text-[8px] uppercase tracking-[0.15em] text-slate-600">
                  Course
                </span>
                <span className="mt-1 block text-[10px] font-medium text-slate-300">
                  {member.course}
                </span>
              </div>

              <div className="py-3 text-center">
                <span className="block text-[8px] uppercase tracking-[0.15em] text-slate-600">
                  Semester
                </span>
                <span className="mt-1 block text-[10px] font-medium text-slate-300">
                  {member.semester}
                </span>
              </div>
            </div>

            {/* Social links */}
            <div className="mt-4 flex justify-center gap-2">
              <a
                href={member.instagram}
                aria-label={`${member.name} Instagram`}
                className="flex h-8 w-8 items-center justify-center border border-white/10 text-[9px] font-bold text-slate-500 transition-all duration-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
              >
                IG
              </a>

              <a
                href={member.linkedin}
                aria-label={`${member.name} LinkedIn`}
                className="flex h-8 w-8 items-center justify-center border border-white/10 text-[9px] font-bold text-slate-500 transition-all duration-300 hover:border-[#00E5FF] hover:text-[#00E5FF]"
              >
                IN
              </a>

              <a
                href={member.whatsapp}
                aria-label={`${member.name} WhatsApp`}
                className="flex h-8 w-8 items-center justify-center border border-white/10 text-slate-500 transition-all duration-300 hover:border-[#00E5FF] hover:text-[#00E5FF]"
              >
                <MessageCircle size={13} />
              </a>

              <a
                href={`mailto:${member.email}`}
                aria-label={`Email ${member.name}`}
                className="flex h-8 w-8 items-center justify-center border border-white/10 text-slate-500 transition-all duration-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
              >
                <Mail size={13} />
              </a>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
              <span className="h-1.5 w-1.5 bg-[#FF6B00]" />

              <span className="truncate font-mono text-[8px] uppercase tracking-[0.1em] text-slate-600">
                {member.email}
              </span>
            </div>
          </div>
        </div>

        {/* PAPER STRIPS — overlay only */}
        {!reducedMotion &&
          Array.from({ length: stripCount }).map((_, strip) => {
            const fromLeft = strip % 2 === 0

            return (
              <motion.div
                key={strip}
                initial={{
                  x: fromLeft ? '-110%' : '110%',
                  rotateZ: fromLeft ? -3 : 3,
                  opacity: 1,
                }}
                whileInView={{
                  x: 0,
                  rotateZ: 0,
                  opacity: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.7,
                  delay: strip * 0.13,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="pointer-events-none absolute left-0 right-0 z-30 bg-[#0B0E15]"
                style={{
                  top: `${strip * 20}%`,
                  height: '20.5%',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span
                  className={`absolute top-1/2 h-px w-10 ${
                    fromLeft
                      ? 'left-4 bg-[#00E5FF]'
                      : 'right-4 bg-[#FF6B00]'
                  }`}
                />
              </motion.div>
            )
          })}

        {/* Hover edge */}
        <div className="pointer-events-none absolute inset-0 z-40 border border-white/10 transition-colors duration-500 group-hover:border-white/20" />
      </div>
    </motion.article>
  )
}

export default function OurTeam() {
  return (
    <main className="min-h-screen bg-[#050816] text-[#F8FAFC]">
      {/* Header */}
      <section className="mx-auto max-w-[1400px] px-5 pb-12 pt-28 md:px-8 md:pb-16 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative border-b border-white/10 pb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#00E5FF]" />

            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
              04 / Team
            </span>

            <span className="h-px w-8 bg-[#FF6B00]" />
          </div>

          <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
            Meet The Team
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-slate-500 md:text-sm">
            The people behind Yantrotsav 2026 — building, organizing and
            shaping the experience.
          </p>
        </motion.div>
      </section>

      {/* Team Grid */}
      <section className="mx-auto max-w-[1200px] px-5 pb-24 md:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-24">
          {teamMembers.map((member, index) => (
            <TeamMemberCard
              key={member.name}
              member={member}
              index={index}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
