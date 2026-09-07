import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import logo from '../assets/images/logo.png'
import introAudio from '../assets/images/intro.mp3'

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

// Pacing: "LADIES AND GENTLEMEN," -> Dramatic Pause -> "YOU ARE STILL NOT READY FOR THIS"
const getWordTiming = (index: number) => {
  if (index === 0) return 0.25 // LADIES
  if (index === 1) return 0.75 // AND
  if (index === 2) return 1.25 // GENTLEMEN,

  // Dramatic suspense pause of ~1.2s after "GENTLEMEN,"
  // Slightly slower, punchy entrance for the second phrase
  return 2.5 + (index - 3) * 0.45
}

type HomeIntroProps = {
  onComplete: () => void
}

function HomeIntro({ onComplete }: HomeIntroProps) {
  const shouldReduceMotion = useReducedMotion()

  const [showLogo, setShowLogo] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fallbackTimerRef = useRef<number | null>(null)
  const hasCompletedRef = useRef(false)

  const handleFinish = useCallback(() => {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true

    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      } catch {
        // ignore
      }
    }

    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }

    try {
      sessionStorage.setItem('yantrotsav-intro-shown', 'true')
    } catch {
      // ignore
    }

    onComplete()
  }, [onComplete])

  useEffect(() => {
    if (shouldReduceMotion) {
      handleFinish()
      return
    }

    const audio = new Audio(introAudio)
    audio.preload = 'auto'
    audio.volume = 0.75
    audioRef.current = audio

    const handleAudioEnded = () => {
      handleFinish()
    }

    audio.addEventListener('ended', handleAudioEnded)

    const playAudio = async () => {
      try {
        await audio.play()
      } catch (error) {
        console.warn('YANTROTSAV intro audio autoplay was blocked:', error)
        // Autoplay blocked on mobile: transition after full intro sequence
        fallbackTimerRef.current = window.setTimeout(() => {
          handleFinish()
        }, 7600)
      }
    }

    playAudio()

    const logoTimer = window.setTimeout(() => {
      setShowLogo(true)
    }, 5900)

    return () => {
      audio.removeEventListener('ended', handleAudioEnded)
      audio.pause()
      audio.currentTime = 0

      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }

      window.clearTimeout(logoTimer)
      audioRef.current = null
    }
  }, [shouldReduceMotion, handleFinish])

  return (
    <motion.div
      key="yantrotsav-intro-screen"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.02,
      }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050816]"
    >
      {/* Skip Intro Button */}
      <button
        type="button"
        onClick={handleFinish}
        className="absolute right-4 top-4 z-50 flex items-center gap-2 border border-[#00E5FF]/40 bg-[#050816]/80 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#00E5FF] backdrop-blur-sm transition-all hover:border-[#00E5FF] hover:bg-[#00E5FF] hover:text-black sm:right-8 sm:top-8 sm:px-4 sm:py-2 sm:text-xs"
      >
        <span>SKIP INTRO</span>
        <span className="text-[#FF6B00]">››</span>
      </button>

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
                y: 28,
                scale: 0.92,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                delay: getWordTiming(index),
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-[clamp(1.75rem,5vw,4.5rem)] font-black uppercase leading-none tracking-[-0.05em] text-red-600"
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
                y: 25,
                scale: 0.85,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-8 md:mt-12"
            >
              <div className="relative">
                {/* Logo frame */}
                <span className="absolute -left-3 -top-3 h-4 w-4 border-l-2 border-t-2 border-[#00E5FF]" />
                <span className="absolute -right-3 -top-3 h-4 w-4 border-r-2 border-t-2 border-[#FF6B00]" />
                <span className="absolute -bottom-3 -left-3 h-4 w-4 border-b-2 border-l-2 border-[#FF6B00]" />
                <span className="absolute -bottom-3 -right-3 h-4 w-4 border-b-2 border-r-2 border-[#00E5FF]" />

                <img
                  src={logo}
                  alt="Yantrotsav 2026"
                  className="h-28 w-28 object-contain md:h-40 md:w-40"
                />
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.25,
                  duration: 0.45,
                }}
                className="mt-4 font-mono text-[9px] uppercase tracking-[0.35em] text-slate-500"
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
          duration: 7.4,
          ease: 'linear',
        }}
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-[#FF6B00]"
      />
    </motion.div>
  )
}

export default HomeIntro
