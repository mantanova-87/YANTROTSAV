import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import logo from '../assets/images/logo.png'
// import introAudio from '../assets/images/intro.mp3'

/*
======================================================================
LEGACY INTRO (COMMENTED OUT AS REQUESTED)
======================================================================
const isMobile =
  typeof window !== 'undefined' ? window.innerWidth < 768 : false

const words = [
  'LADIES',
  'AND',
  'GENTLEMEN,',
  'YOU',
  'ARE',
  'STILL',
  'NOT',
  'READY',
  'FOR',
  'THIS',
]

function LegacyHomeIntro({ onComplete }: HomeIntroProps) {
  const shouldReduceMotion = useReducedMotion()

  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return !sessionStorage.getItem('yantrotsav-intro-shown')
  })

  const [showLogo, setShowLogo] = useState(false)
  const [exiting, setExiting] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fallbackTimerRef = useRef<number | null>(null)
  const exitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!showIntro || shouldReduceMotion) {
      return
    }

    const audio = new Audio(introAudio)

    audio.preload = 'auto'
    audio.volume = 0.75

    audioRef.current = audio

    let hasCompleted = false

    const completeIntro = () => {
      if (hasCompleted) {
        return
      }

      hasCompleted = true

      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }

      setExiting(true)

      exitTimerRef.current = window.setTimeout(() => {
        sessionStorage.setItem('yantrotsav-intro-shown', 'true')
        setShowIntro(false)
        onComplete()
      }, 800)
    }

    const handleAudioEnded = () => {
      completeIntro()
    }

    audio.addEventListener('ended', handleAudioEnded)

    const playAudio = async () => {
      try {
        await audio.play()
      } catch (error) {
        console.warn(
          'YANTROTSAV intro audio autoplay was blocked:',
          error,
        )

        fallbackTimerRef.current = window.setTimeout(() => {
          completeIntro()
        }, 6200)
      }
    }

    playAudio()

    return () => {
      audio.removeEventListener('ended', handleAudioEnded)

      audio.pause()
      audio.currentTime = 0

      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }

      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current)
        exitTimerRef.current = null
      }

      audioRef.current = null
    }
  }, [showIntro, shouldReduceMotion, onComplete])

  useEffect(() => {
    if (!showIntro) {
      onComplete()
      return
    }

    if (shouldReduceMotion) {
      sessionStorage.setItem('yantrotsav-intro-shown', 'true')

      const timer = window.setTimeout(() => {
        onComplete()
      }, 500)

      return () => window.clearTimeout(timer)
    }

    const logoTimer = window.setTimeout(() => {
      setShowLogo(true)
    }, 4800)

    return () => {
      window.clearTimeout(logoTimer)
    }
  }, [showIntro, shouldReduceMotion, onComplete])

  if (!showIntro) {
    return null
  }

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            filter: 'blur(8px)',
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050816]"
        >
          <span className="absolute left-5 top-5 h-8 w-8 border-l border-t border-[#FF6B00]/70" />
          <span className="absolute right-5 top-5 h-8 w-8 border-r border-t border-[#00E5FF]/70" />
          <span className="absolute bottom-5 left-5 h-8 w-8 border-b border-l border-[#00E5FF]/70" />
          <span className="absolute bottom-5 right-5 h-8 w-8 border-b border-r border-[#FF6B00]/70" />
          <span className="absolute left-0 top-1/2 h-px w-[18%] bg-[#FF6B00]/70" />
          <span className="absolute right-0 top-1/2 h-px w-[18%] bg-[#00E5FF]/70" />

          <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 text-center">
            <div className="flex max-w-4xl flex-wrap justify-center gap-x-3 gap-y-2 md:gap-x-5">
              {words.map((word, index) => (
                <motion.span
                  key={word}
                  initial={{
                    opacity: 0,
                    y: isMobile ? 15 : 25,
                    filter: isMobile ? 'none' : 'blur(8px)',
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                  }}
                  transition={{
                    delay: index * 0.45,
                    duration: isMobile ? 0.4 : 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-[clamp(1.8rem,5vw,4.5rem)] font-black uppercase leading-none tracking-[-0.05em] text-red-600"
                >
                  {word}
                </motion.span>
              ))}
            </div>

            <AnimatePresence>
              {showLogo && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: isMobile ? 20 : 35,
                    scale: isMobile ? 0.9 : 0.75,
                    filter: isMobile ? 'none' : 'blur(14px)',
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                  }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-12"
                >
                  <div className="relative">
                    <span className="absolute -left-4 -top-4 h-5 w-5 border-l-2 border-t-2 border-[#00E5FF]" />
                    <span className="absolute -right-4 -top-4 h-5 w-5 border-r-2 border-t-2 border-[#FF6B00]" />
                    <span className="absolute -bottom-4 -left-4 h-5 w-5 border-b-2 border-l-2 border-[#FF6B00]" />
                    <span className="absolute -bottom-4 -right-4 h-5 w-5 border-b-2 border-r-2 border-[#00E5FF]" />

                    <img
                      src={logo}
                      alt="Yantrotsav 2026"
                      className="h-32 w-32 object-contain md:h-44 md:w-44"
                    />
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 0.35,
                      duration: 0.5,
                    }}
                    className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-slate-500"
                  >
                    YANTROTSAV / 2026
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 5.8,
              ease: 'linear',
            }}
            className="absolute bottom-0 left-0 h-px w-full origin-left bg-[#FF6B00]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
======================================================================
*/

type HomeIntroProps = {
  onComplete: () => void
}

/**
 * Fast modern intro: ~0.8s total duration.
 * Displays YANTROTSAV 2026 logo, name, and tagline 'Where Tech Meets Innovation'.
 */
function HomeIntro({ onComplete }: HomeIntroProps) {
  const shouldReduceMotion = useReducedMotion()

  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }
    return !sessionStorage.getItem('yantrotsav-intro-shown')
  })

  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (!showIntro) {
      onComplete()
      return
    }

    if (shouldReduceMotion) {
      sessionStorage.setItem('yantrotsav-intro-shown', 'true')
      onComplete()
      return
    }

    // Display for 650ms, then trigger smooth 200ms exit (total ~0.85s)
    const displayTimer = window.setTimeout(() => {
      setExiting(true)
      const exitTimer = window.setTimeout(() => {
        sessionStorage.setItem('yantrotsav-intro-shown', 'true')
        setShowIntro(false)
        onComplete()
      }, 200)
      return () => window.clearTimeout(exitTimer)
    }, 650)

    return () => {
      window.clearTimeout(displayTimer)
    }
  }, [showIntro, shouldReduceMotion, onComplete])

  if (!showIntro) {
    return null
  }

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(6px)',
          }}
          transition={{
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050816]"
        >
          {/* Cyberpunk ambient glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.08)_0%,transparent_70%)]" />

          {/* Sci-Fi Corner Brackets */}
          <span className="absolute left-6 top-6 h-6 w-6 border-l-2 border-t-2 border-[#00E5FF]" />
          <span className="absolute right-6 top-6 h-6 w-6 border-r-2 border-t-2 border-[#FF6B00]" />
          <span className="absolute bottom-6 left-6 h-6 w-6 border-b-2 border-l-2 border-[#FF6B00]" />
          <span className="absolute bottom-6 right-6 h-6 w-6 border-b-2 border-r-2 border-[#00E5FF]" />

          {/* Horizontal Accent Lines */}
          <span className="absolute left-0 top-1/2 h-px w-20 bg-gradient-to-r from-transparent to-[#00E5FF]/60" />
          <span className="absolute right-0 top-1/2 h-px w-20 bg-gradient-to-l from-transparent to-[#FF6B00]/60" />

          {/* Central Fest Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 flex flex-col items-center px-6 text-center"
          >
            {/* Logo with technical cyberpunk frame */}
            <div className="relative mb-5">
              <span className="absolute -left-3 -top-3 h-4 w-4 border-l-2 border-t-2 border-[#00E5FF]" />
              <span className="absolute -right-3 -top-3 h-4 w-4 border-r-2 border-t-2 border-[#FF6B00]" />
              <span className="absolute -bottom-3 -left-3 h-4 w-4 border-b-2 border-l-2 border-[#FF6B00]" />
              <span className="absolute -bottom-3 -right-3 h-4 w-4 border-b-2 border-r-2 border-[#00E5FF]" />

              <img
                src={logo}
                alt="Yantrotsav 2026 Logo"
                className="h-24 w-24 object-contain sm:h-28 sm:w-28 drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]"
              />
            </div>

            {/* Fest Title */}
            <div className="flex items-center gap-2">
              <h1 className="font-black tracking-[0.16em] text-white text-2xl sm:text-4xl md:text-5xl">
                YANTROTSAV <span className="text-[#00E5FF]">2026</span>
              </h1>
              <span className="h-2 w-2 rounded-full bg-[#FF6B00] animate-pulse" />
            </div>

            {/* Tagline from Navbar */}
            <p className="mt-3 text-xs sm:text-sm font-medium tracking-[0.25em] uppercase text-slate-300">
              <i>Where Tech Meets Innovation</i>
            </p>

            {/* Sub-label */}
            <span className="mt-4 font-mono text-[9px] uppercase tracking-[0.3em] text-slate-500">
              Central University of Jammu
            </span>
          </motion.div>

          {/* Quick loading progress indicator bar (~0.65s) */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.65,
              ease: 'easeInOut',
            }}
            className="absolute bottom-0 left-0 h-1 w-full origin-left bg-gradient-to-r from-[#00E5FF] via-white to-[#FF6B00]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default HomeIntro

