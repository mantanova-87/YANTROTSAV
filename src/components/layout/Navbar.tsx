import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: 'Organizers', path: '/organizers' },
  { name: 'Contact', path: '/contact' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between border-b border-white/10 bg-[#050816]/90 px-5 py-4 backdrop-blur-md md:px-8">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="group flex items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-[0.18em] text-white transition-colors duration-300 group-hover:text-cyan-400 md:text-xl">
              YANTROTSAV
            </span>

            <span className="h-1.5 w-1.5 bg-[#FF6B00]" />
          </div>

          <span className="hidden border-l border-white/15 pl-4 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 sm:block">
            Tech Fest / 2026
          </span>
        </Link>

        {/* Desktop navigation */}
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
                      : 'text-slate-600 group-hover:text-cyan-400'
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

                <span
                  className={`absolute -bottom-[17px] left-0 h-px bg-[#FF6B00] transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            )
          })}
        </div>

        {/* Desktop status */}
        <div className="hidden items-center gap-3 lg:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF6B00]" />

          <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Registration Opens Soon
          </span>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          className="border border-white/10 p-2 text-slate-300 transition-colors duration-300 hover:border-cyan-400/40 hover:text-cyan-400 md:hidden"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile navigation */}
      <div
        className={`border-b border-white/10 bg-[#050816]/95 backdrop-blur-md transition-all duration-300 md:hidden ${
          isOpen
            ? 'max-h-96 opacity-100'
            : 'pointer-events-none max-h-0 overflow-hidden opacity-0'
        }`}
      >
        <div className="px-5 py-5">
          <div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-4">
            <span className="h-1.5 w-1.5 bg-[#FF6B00]" />

            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
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
                  className={`flex items-center justify-between border-b border-white/5 py-4 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-500 hover:text-cyan-400'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-mono text-[10px] ${
                        isActive ? 'text-[#FF6B00]' : 'text-slate-700'
                      }`}
                    >
                      0{index + 1}
                    </span>

                    <span className="text-sm font-semibold uppercase tracking-[0.15em]">
                      {item.name}
                    </span>
                  </div>

                  <span
                    className={`text-xs ${
                      isActive ? 'text-[#FF6B00]' : 'text-slate-700'
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
      </div>
    </header>
  )
}

export default Navbar

