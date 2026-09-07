import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import logo from '../assets/images/logo.png'
import introAudio from '../assets/images/intro.mp3'

// Two-line phrase for the typewriter
const LINE_1 = 'LADIES AND GENTLEMEN,'
const LINE_2 = 'YOU ARE STILL NOT READY FOR THIS'

// Typewriter speed
const CHARS_PER_SEC_LINE1 = 14   // fast first phrase
const CHARS_PER_SEC_LINE2 = 10   // slightly slower / punchier
const PAUSE_AFTER_LINE1_MS = 1100 // dramatic gap between phrases

type HomeIntroProps = {
  onComplete: () => void
}

function HomeIntro({ onComplete }: HomeIntroProps) {
  const shouldReduceMotion = useReducedMotion()

  const [displayedLine1, setDisplayedLine1] = useState('')
  const [displayedLine2, setDisplayedLine2] = useState('')
  const [showLine2, setShowLine2]           = useState(false)
  const [showLogo, setShowLogo]             = useState(false)
  const [cursorPhase, setCursorPhase]       = useState<'line1' | 'pause' | 'line2' | 'done'>('line1')

  const audioRef           = useRef<HTMLAudioElement | null>(null)
  const fallbackTimerRef   = useRef<number | null>(null)
  const hasCompletedRef    = useRef(false)
  const typingCancelledRef = useRef(false)

  const handleFinish = useCallback(() => {
    if (hasCompletedRef.current) return
    hasCompletedRef.current    = true
    typingCancelledRef.current = true

    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      } catch { /* ignore */ }
    }

    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }

    try { sessionStorage.setItem('yantrotsav-intro-shown', 'true') } catch { /* ignore */ }

    onComplete()
  }, [onComplete])

  // ── Typewriter engine ──────────────────────────────────────────────────────
  useEffect(() => {
    if (shouldReduceMotion) { handleFinish(); return }

    typingCancelledRef.current = false
    let timer = 0

    const typeString = (
      str: string,
      charsPerSec: number,
      setter: React.Dispatch<React.SetStateAction<string>>,
    ): Promise<void> =>
      new Promise((resolve) => {
        let i = 0
        const ms = 1000 / charsPerSec
        const tick = () => {
          if (typingCancelledRef.current) { resolve(); return }
          i++
          setter(str.slice(0, i))
          if (i < str.length) {
            timer = window.setTimeout(tick, ms)
          } else {
            resolve()
          }
        }
        timer = window.setTimeout(tick, ms)
      })

    const run = async () => {
      // Phase 1 — type LINE_1 fast
      setCursorPhase('line1')
      await typeString(LINE_1, CHARS_PER_SEC_LINE1, setDisplayedLine1)
      if (typingCancelledRef.current) return

      // Phase 2 — dramatic pause (cursor blinks on line 1)
      setCursorPhase('pause')
      await new Promise<void>((r) => { timer = window.setTimeout(r, PAUSE_AFTER_LINE1_MS) })
      if (typingCancelledRef.current) return

      // Phase 3 — show line 2 container, type it slightly slower
      setShowLine2(true)
      setCursorPhase('line2')
      await typeString(LINE_2, CHARS_PER_SEC_LINE2, setDisplayedLine2)
      if (typingCancelledRef.current) return

      // Phase 4 — done
      setCursorPhase('done')
    }

    run()

    return () => {
      typingCancelledRef.current = true
      window.clearTimeout(timer)
    }
  }, [shouldReduceMotion, handleFinish])

  // ── Audio + logo + fallback ────────────────────────────────────────────────
  useEffect(() => {
    if (shouldReduceMotion) return

    const audio = new Audio(introAudio)
    audio.preload = 'auto'
    audio.volume  = 0.75
    audioRef.current = audio

    audio.addEventListener('ended', handleFinish)

    const playAudio = async () => {
      try {
        await audio.play()
      } catch (error) {
        console.warn('YANTROTSAV intro audio autoplay was blocked:', error)
        fallbackTimerRef.current = window.setTimeout(() => handleFinish(), 7600)
      }
    }

    playAudio()

    const logoTimer = window.setTimeout(() => setShowLogo(true), 5900)

    return () => {
      audio.removeEventListener('ended', handleFinish)
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

  const showCursor = cursorPhase !== 'done'

  return (
    <motion.div
      key="yantrotsav-intro-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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

      {/* Technical frame corners */}
      <span className="absolute left-5 top-5 h-8 w-8 border-l border-t border-[#FF6B00]/70" />
      <span className="absolute right-5 top-5 h-8 w-8 border-r border-t border-[#00E5FF]/70" />
      <span className="absolute bottom-5 left-5 h-8 w-8 border-b border-l border-[#00E5FF]/70" />
      <span className="absolute bottom-5 right-5 h-8 w-8 border-b border-r border-[#FF6B00]/70" />

      {/* Side lines */}
      <span className="absolute left-0 top-1/2 h-px w-[18%] bg-[#FF6B00]/70" />
      <span className="absolute right-0 top-1/2 h-px w-[18%] bg-[#00E5FF]/70" />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 text-center">

        {/* Typewriter text */}
        <div className="flex flex-col items-center gap-y-2 md:gap-y-4">

          {/* LINE 1 */}
          <div className="flex items-center">
            <span
              className="text-[clamp(1.6rem,5vw,4.5rem)] font-black uppercase leading-none tracking-[-0.04em] text-red-600"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {displayedLine1}
            </span>
            {/* Blinking cursor — cyan — on line 1 and during the pause */}
            {showCursor && (cursorPhase === 'line1' || cursorPhase === 'pause') && (
              <motion.span
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, times: [0, 0.5, 0.5, 1] }}
                className="ml-[0.12em] inline-block h-[0.85em] w-[0.1em] flex-shrink-0 bg-[#00E5FF] align-middle"
              />
            )}
          </div>

          {/* LINE 2 — container mounts after pause */}
          <AnimatePresence>
            {showLine2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center"
              >
                <span
                  className="text-[clamp(1.6rem,5vw,4.5rem)] font-black uppercase leading-none tracking-[-0.04em] text-red-600"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {displayedLine2}
                </span>
                {/* Blinking cursor — orange — on line 2 */}
                {showCursor && cursorPhase === 'line2' && (
                  <motion.span
                    animate={{ opacity: [1, 1, 0, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5, times: [0, 0.5, 0.5, 1] }}
                    className="ml-[0.12em] inline-block h-[0.85em] w-[0.1em] flex-shrink-0 bg-[#FF6B00] align-middle"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Logo ────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 md:mt-12"
            >
              <div className="relative">
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
                transition={{ delay: 0.25, duration: 0.45 }}
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
        transition={{ duration: 7.4, ease: 'linear' }}
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-[#FF6B00]"
      />
    </motion.div>
  )
}

export default HomeIntro
