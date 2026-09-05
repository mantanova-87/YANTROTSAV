import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: 'Our Team', path: '/OurTeam' },
  { name: 'Contact', path: '/contact' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const closeMenu = () => setIsOpen(false)

  return (
    <motion.header
      initial={{
        opacity: 0,
        y: -30,
        filter: 'blur(8px)',
      }}
      animate={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <nav className="relative mx-auto max-w-[1400px] bg-[#050816]/95 px-5 py-4 backdrop-blur-md md:px-8">

        {/* Main technical border */}
        <div className="pointer-events-none absolute inset-0 border-b border-white/10" />

        {/* Cyan top accent */}
        <span className="pointer-events-none absolute left-0 top-0 h-px w-32 bg-[#00E5FF]" />

        {/* Orange top accent */}
        <span className="pointer-events-none absolute right-0 top-0 h-px w-24 bg-[#FF6B00]" />

        {/* Corner details */}
        <span className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-[#00E5FF]" />

        <span className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-[#FF6B00]" />

        {/* Bottom technical accents */}
        <span className="pointer-events-none absolute bottom-0 left-0 h-1 w-1 bg-[#00E5FF]" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-1 w-1 bg-[#FF6B00]" />

        <div className="relative z-10 flex items-center justify-between">

          {/* LOGO */}

          <Link
            to="/"
            onClick={closeMenu}
            className="group flex items-center gap-4"
          >
            <div className="flex items-center gap-2">

              <span className="text-lg font-black tracking-[0.18em] text-white transition-colors duration-300 group-hover:text-[#00E5FF] md:text-xl">
                YANTROTSAV
              </span>

              <span className="h-1.5 w-1.5 bg-[#FF6B00] transition-all duration-300 group-hover:scale-150 group-hover:bg-[#00E5FF]" />

            </div>

            <span className="hidden border-l border-white/15 pl-4 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 sm:block">
              Tech Fest / 2026
            </span>
          </Link>

          {/* DESKTOP NAV */}

          <div className="hidden items-center gap-8 md:flex">

            {navItems.map((item, index) => {

              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group relative flex items-center gap-2 py-2"
                >

                  <span
                    className={`font-mono text-[10px] transition-colors ${
                      isActive
                        ? 'text-[#FF6B00]'
                        : 'text-slate-600 group-hover:text-[#00E5FF]'
                    }`}
                  >
                    0{index + 1}
                  </span>

                  <span
                    className={`text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-white'
                    }`}
                  >
                    {item.name}
                  </span>

                  {/* Animated underline */}
                  <span
                    className={`absolute -bottom-[17px] left-0 h-px bg-[#FF6B00] transition-all duration-300 ${
                      isActive
                        ? 'w-full'
                        : 'w-0 group-hover:w-full'
                    }`}
                  />

                </Link>
              )
            })}

          </div>

          {/* STATUS */}

          <div className="hidden items-center gap-3 lg:flex">

            <span className="relative flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full animate-ping bg-[#FF6B00] opacity-50" />

              <span className="relative inline-flex h-2 w-2 bg-[#FF6B00]" />

            </span>

            <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Registration Opens Soon
            </span>

          </div>

          {/* MOBILE BUTTON */}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className="border border-white/10 p-2 text-slate-300 transition-all duration-300 hover:border-[#00E5FF]/50 hover:text-[#00E5FF] md:hidden"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </nav>

      {/* MOBILE MENU */}

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        className="overflow-hidden border-b border-white/10 bg-[#050816]/98 backdrop-blur-md md:hidden"
      >
        <div className="relative px-5 py-5">

          {/* Mobile frame */}
          <div className="pointer-events-none absolute inset-0 border-l border-r border-white/10" />

          <div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-4">

            <span className="h-1.5 w-1.5 bg-[#FF6B00]" />

            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
              Navigation / Yantrotsav 2026
            </span>

          </div>

          <div className="flex flex-col">

            {navItems.map((item, index) => {

              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className={`group flex items-center justify-between border-b border-white/5 py-4 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-500 hover:text-[#00E5FF]'
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <span
                      className={`font-mono text-[10px] ${
                        isActive
                          ? 'text-[#FF6B00]'
                          : 'text-slate-700'
                      }`}
                    >
                      0{index + 1}
                    </span>

                    <span className="text-sm font-semibold uppercase tracking-[0.15em]">
                      {item.name}
                    </span>

                  </div>

                  <span
                    className={`transition-transform duration-300 group-hover:translate-x-1 ${
                      isActive
                        ? 'text-[#FF6B00]'
                        : 'text-slate-700'
                    }`}
                  >
                    ↗
                  </span>

                </Link>
              )
            })}

          </div>

          <div className="mt-5 flex items-center gap-2">

            <span className="h-1.5 w-1.5 animate-pulse bg-[#FF6B00]" />

            <span className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
              Registration Opens Soon
            </span>

          </div>

        </div>
      </motion.div>
    </motion.header>
  )
}

export default Navbar