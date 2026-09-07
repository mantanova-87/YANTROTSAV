import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import logo from '../assets/images/logo.png'
import introAudio from '../assets/images/intro.mp3'

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

type HomeIntroProps = {
  onComplete: () => void
}

function HomeIntro({ onComplete }: HomeIntroProps) {
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

  /*
   * --------------------------------------------------
   * AUDIO
   * --------------------------------------------------
   *
   * The audio controls the actual completion of the intro.
   *
   * This means:
   *
   * Text animation
   *       ↓
   * Logo animation
   *       ↓
   * Audio continues
   *       ↓
   * Audio finishes
   *       ↓
   * Intro exits
   *       ↓
   * Home page
   *
   * Browser autoplay restrictions may still prevent
   * sound until the user has interacted with the page.
   */

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

      /*
       * Start visual exit after audio has completely finished.
       */
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

    /*
     * Attempt automatic playback.
     */
    const playAudio = async () => {
      try {
        await audio.play()

        /*
         * Audio is playing successfully.
         * No fallback timer is needed because the
         * 'ended' event will control completion.
         */
      } catch (error) {
        /*
         * Browser autoplay policy may block audio.
         *
         * We don't want the visitor to get stuck on
         * the intro forever, so use a visual fallback.
         */
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

  /*
   * --------------------------------------------------
   * VISUAL INTRO TIMELINE
   * --------------------------------------------------
   *
   * These timers only control visual elements.
   * They do NOT control when the page exits.
   */

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

    /*
     * Show logo only after all words are fully revealed.
     * With 10 words × 0.45s stagger, last word starts at 4.05s.
     * Adding 0.6s duration → all words visible at ~4.65s.
     * Logo fires at 4800ms for a clean sequential reveal.
     */
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
          {/* Technical frame */}

          <span className="absolute left-5 top-5 h-8 w-8 border-l border-t border-[#FF6B00]/70" />

          <span className="absolute right-5 top-5 h-8 w-8 border-r border-t border-[#00E5FF]/70" />

          <span className="absolute bottom-5 left-5 h-8 w-8 border-b border-l border-[#00E5FF]/70" />

          <span className="absolute bottom-5 right-5 h-8 w-8 border-b border-r border-[#FF6B00]/70" />

          {/* Side lines */}

          <span className="absolute left-0 top-1/2 h-px w-[18%] bg-[#FF6B00]/70" />

          <span className="absolute right-0 top-1/2 h-px w-[18%] bg-[#00E5FF]/70" />

          {/* Main content */}

          <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 text-center">
            {/* Word-by-word text */}

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
                    /*
                     * Stagger timed to match the voice track (5.63s).
                     * 10 words × 0.45s = last word starts at 4.05s.
                     * All words visible by ~4.5s, just before audio ends.
                     */
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

            {/* Logo */}

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
                    {/* Logo frame */}

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

          {/* Progress line */}

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              /*
               * This is only a visual progress indicator.
               * The audio still controls actual completion.
               */
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

export default HomeIntro
