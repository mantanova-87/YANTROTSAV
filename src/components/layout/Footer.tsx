import { ArrowUpRight } from 'lucide-react'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6';
import { BiLogoGmail } from 'react-icons/bi';
import { Link } from 'react-router-dom'
import logo from "../../assets/images/logo.png";
const footerLinks = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: 'Our Team', path: '/OurTeam' },
  { name: 'Contact', path: '/contact' },
]

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/yantrotsav_2026',
    icon: (
      <FaInstagram />
    ),
  },
  {
    name: 'WhatsApp',
    href: 'https://chat.whatsapp.com/D9qI7lPQgBGHQg2v07Cdxb',
    icon: (
      <FaWhatsapp />
    ),
  },


]

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050816] text-white">
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
          <div className="relative pr-8">
            {/* Decorative vertical line */}
            <span className="absolute left-0 top-0 h-20 w-px bg-gradient-to-b from-[#00E5FF] to-transparent" />

            <div className="pl-5">
              <img
                src={logo}
                alt="Logo"
                className="h-32 w-32 object-contain"
              />
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black tracking-[0.16em] text-white md:text-3xl">
                  YANTROTSAV 2026
                </span>

                <span className="h-2 w-2 bg-[#FF6B00]" />
              </div>

              <div className="mt-3 flex items-center gap-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#00E5FF]">
                  <i>Were Tech Meets Innovation</i>
                </span>

                <span className="h-px w-8 bg-white/15" />

                <span className="font-mono text-[9px] text-slate-600">
                  2026
                </span>
              </div>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-500">
                Technology | Engineering | Creativity
                <br />
              </p>
            </div>
          </div>

          {/* EXPLORE */}
          <div className="mt-12 md:mt-0">
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
          </div>

          {/* CONNECT */}
          <div className="mt-12 md:mt-0">
            <p className="mb-6 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF6B00]">
              02 / Connect
            </p>

            <div className="flex flex-col flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="flex items-center gap-2 border border-white/10 bg-[#080A0F] px-3 py-2 text-slate-500 transition-all duration-200 hover:-translate-y-1 hover:border-[#FF6B00]/50 hover:text-white"
                >
                  {social.icon}

                  <span className="text-[9px] uppercase tracking-[0.12em]">
                    {social.name}
                  </span>
                </a>
              ))}

              <a
                href="mailto:yantrotsav2026@gmail.com"
                aria-label="Email"
                className="flex items-center gap-2 border border-white/10 bg-[#080A0F] px-3 py-2 text-slate-500 transition-all duration-200 hover:-translate-y-1 hover:border-[#00E5FF]/50 hover:text-white"
              >
                <BiLogoGmail />

                <span className="text-[9px] uppercase tracking-[0.12em]">
                  Email
                </span>
              </a>
            </div>


          </div>
        </div>

        {/* =======================================================
            BOTTOM BAR
        ======================================================= */}

        <div className="relative flex flex-col items-center justify-center gap-4 py-5 text-[12px]  tracking-[0.15em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          
          <div className='flex flex-col items-center justify-center'>
            <p>An initiative by Department of Computer Science and Engineering</p>
            <p>under aegis of Central University of Jammu</p>
          </div>
          <div className="flex items-center gap-3">
            <span className='text-white'>Developed by Mantavya & Priyanshu</span>
          
            <span className="h-1 w-1 bg-[#FF6B00]" />

            <span>© 2026 YANTROTSAV</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer