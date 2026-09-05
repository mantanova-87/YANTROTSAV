import { motion } from 'framer-motion'
import { Mail, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: 'Our Team', path: '/OurTeam' },
  { name: 'Contact', path: '/contact' },
]

const socialLinks = [
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.5"
          cy="6.5"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M5.2 3.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.4 9h3.6v11.5H3.4V9Zm5.8 0h3.5v1.6h.1c.5-.9 1.7-2 3.5-2 3.7 0 4.4 2.4 4.4 5.6v6.3h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.2V9Z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: '#',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.14.68-3.8-1.33-3.8-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.51-.29-5.15-1.25-5.15-5.58 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.69.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.34-2.64 5.29-5.16 5.57.4.35.76 1.04.76 2.1v3.11c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" />
      </svg>
    ),
  },
]

const footerReveal = {
  hidden: {
    opacity: 0,
    y: 60,
    rotateX: 12,
    scale: 0.96,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
}

function Footer() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.12,
      }}
      variants={footerReveal}
      transition={{
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative overflow-hidden border-t border-white/10 bg-[#050816] text-white"
    >
      {/* =========================================================
          TECHNICAL TOP FRAME
      ========================================================= */}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30">
        {/* Main accent lines */}
        <span className="absolute left-0 top-0 h-px w-40 bg-[#00E5FF]" />
        <span className="absolute right-0 top-0 h-px w-40 bg-[#FF6B00]" />

        {/* Corner brackets */}
        <span className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-[#00E5FF]" />
        <span className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-[#FF6B00]" />

        {/* Small technical markers */}
        <span className="absolute left-3 top-3 h-1.5 w-1.5 bg-[#00E5FF]" />
        <span className="absolute right-3 top-3 h-1.5 w-1.5 bg-[#FF6B00]" />

        {/* Center marker */}
        <span className="absolute left-1/2 top-0 h-1 w-16 -translate-x-1/2 bg-white/10" />
      </div>

      {/* Background technical lines */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-[8%] top-0 h-full w-px bg-white/[0.025]" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/[0.025]" />
        <div className="absolute right-[8%] top-0 h-full w-px bg-white/[0.025]" />

        <div className="absolute bottom-[32%] left-0 h-px w-full bg-white/[0.025]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-8">

        {/* =======================================================
            MAIN FOOTER
        ======================================================= */}

        <div className="grid border-b border-white/10 py-16 md:grid-cols-[1.5fr_1fr_1fr] md:py-20">

          {/* BRAND */}
          <motion.div
            variants={footerReveal}
            transition={{
              duration: 0.8,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative pr-8"
          >
            {/* Decorative vertical line */}
            <span className="absolute left-0 top-0 h-20 w-px bg-gradient-to-b from-[#00E5FF] to-transparent" />

            <div className="pl-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black tracking-[0.16em] text-white md:text-3xl">
                  YANTROTSAV
                </span>

                <span className="h-2 w-2 bg-[#FF6B00]" />
              </div>

              <div className="mt-3 flex items-center gap-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#00E5FF]">
                  Tech Fest
                </span>

                <span className="h-px w-8 bg-white/15" />

                <span className="font-mono text-[9px] text-slate-600">
                  2026
                </span>
              </div>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-500">
                Technology. Engineering. Creativity.
                <br />
                Ideas built for tomorrow.
              </p>

              {/* Technical identity block */}
              <div className="mt-8 flex max-w-sm items-center border border-white/10 bg-[#080A0F]">
                <div className="flex h-12 w-12 items-center justify-center border-r border-white/10">
                  <span className="font-mono text-[10px] text-[#00E5FF]">
                    YT
                  </span>
                </div>

                <div className="px-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-slate-700">
                    System Status
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping bg-[#FF6B00] opacity-50" />
                      <span className="relative h-1.5 w-1.5 bg-[#FF6B00]" />
                    </span>

                    <span className="text-[9px] uppercase tracking-[0.15em] text-slate-500">
                      Registration Opens Soon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* EXPLORE */}
          <motion.div
            variants={footerReveal}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-12 md:mt-0"
          >
            <p className="mb-6 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF6B00]">
              01 / Explore
            </p>

            <div className="flex flex-col items-start">
              {footerLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group relative flex w-full max-w-[220px] items-center justify-between border-b border-white/5 py-3 text-slate-500 transition-all duration-300 hover:pl-2 hover:text-white"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[9px] text-slate-700 transition-colors group-hover:text-[#FF6B00]">
                      0{index + 1}
                    </span>

                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                      {link.name}
                    </span>
                  </div>

                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
                  />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* CONNECT */}
          <motion.div
            variants={footerReveal}
            transition={{
              duration: 0.8,
              delay: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-12 md:mt-0"
          >
            <p className="mb-6 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF6B00]">
              02 / Connect
            </p>

            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  whileHover={{
                    y: -4,
                    scale: 1.03,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="flex items-center gap-2 border border-white/10 bg-[#080A0F] px-3 py-2 text-slate-500 transition-colors duration-300 hover:border-[#FF6B00]/50 hover:text-white"
                >
                  {social.icon}

                  <span className="text-[9px] uppercase tracking-[0.12em]">
                    {social.name}
                  </span>
                </motion.a>
              ))}

              <motion.a
                href="mailto:"
                aria-label="Email"
                whileHover={{
                  y: -4,
                  scale: 1.03,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="flex items-center gap-2 border border-white/10 bg-[#080A0F] px-3 py-2 text-slate-500 transition-colors duration-300 hover:border-[#00E5FF]/50 hover:text-white"
              >
                <Mail size={16} />

                <span className="text-[9px] uppercase tracking-[0.12em]">
                  Email
                </span>
              </motion.a>
            </div>

            {/* Status panel */}
            <div className="relative mt-7 border border-white/10 bg-[#080A0F] p-4">
              {/* Accent corner */}
              <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-[#00E5FF]" />

              <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[#FF6B00]" />

              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-slate-700">
                Event Status
              </p>

              <div className="mt-2 flex items-center gap-3">
                <span className="h-1.5 w-1.5 bg-[#FF6B00]" />

                <p className="text-xs uppercase tracking-[0.1em] text-slate-400">
                  Registration Opens Soon
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* =======================================================
            BOTTOM BAR
        ======================================================= */}

        <motion.div
          variants={footerReveal}
          transition={{
            duration: 0.8,
            delay: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative flex flex-col gap-4 py-5 text-[9px] uppercase tracking-[0.15em] text-slate-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>© 2026 YANTROTSAV</p>

          <div className="flex items-center gap-3">
            <span>Built for builders</span>

            <span className="h-1 w-1 bg-[#FF6B00]" />

            <span>Tech Fest / 2026</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}

export default Footer