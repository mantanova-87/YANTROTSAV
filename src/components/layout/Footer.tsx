import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: 'Organizers', path: '/organizers' },
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
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
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

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050816]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">

        {/* Main footer */}
        <div className="grid border-b border-white/10 py-14 md:grid-cols-[1.5fr_1fr_1fr] md:py-16">

          {/* Brand */}
          <div className="pr-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black tracking-[0.16em] text-white md:text-3xl">
                YANTROTSAV
              </span>

              <span className="h-2 w-2 bg-[#FF6B00]" />
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
              Technology. Engineering. Creativity.
              <br />
              Ideas built for tomorrow.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <span className="font-mono text-[9px] text-slate-700">
                YT / 2026
              </span>

              <span className="h-px w-10 bg-white/10" />

              <span className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
                Tech Fest
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-10 md:mt-0">
            <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF6B00]">
              01 / Explore
            </p>

            <div className="flex flex-col items-start">
              {footerLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group flex items-center gap-3 py-2 text-sm text-slate-500 transition-colors duration-300 hover:text-white"
                >
                  <span className="font-mono text-[9px] text-slate-700 transition-colors group-hover:text-[#FF6B00]">
                    0{index + 1}
                  </span>

                  <span className="uppercase tracking-[0.12em]">
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div className="mt-10 md:mt-0">
            <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF6B00]">
              02 / Connect
            </p>

            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="flex items-center gap-2 border border-white/10 px-3 py-2 text-slate-500 transition-all duration-300 hover:border-[#FF6B00]/40 hover:text-white"
                >
                  {social.icon}

                  <span className="text-[9px] uppercase tracking-[0.12em]">
                    {social.name}
                  </span>
                </a>
              ))}

              <a
                href="mailto:"
                aria-label="Email"
                className="flex items-center gap-2 border border-white/10 px-3 py-2 text-slate-500 transition-all duration-300 hover:border-cyan-400/40 hover:text-white"
              >
                <Mail size={16} />

                <span className="text-[9px] uppercase tracking-[0.12em]">
                  Email
                </span>
              </a>
            </div>

            <div className="mt-6 border-l border-[#FF6B00]/40 pl-4">
              <p className="text-[9px] uppercase tracking-[0.15em] text-slate-600">
                Registration status
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Opens soon
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 py-5 text-[9px] uppercase tracking-[0.15em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 YANTROTSAV
          </p>

          <div className="flex items-center gap-3">
            <span>Built for builders</span>

            <span className="h-1 w-1 bg-[#FF6B00]" />

            <span>Tech Fest / 2026</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer