import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import logo from '../assets/images/logo.png'

type HomeIntroProps = {
  onComplete: () => void
}

const words = ['LADIES', 'AND', 'GENTLEMEN,', 'ARE', 'YOU', 'READY']

function HomeIntro({ onComplete }: HomeIntroProps) {
  const shouldReduceMotion = useReducedMotion()

  const [showText, setShowText] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [skipIntro, setSkipIntro] = useState(false)

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('yantrotsav-intro-shown')

    // Intro already completed in this browser session.
    if (alreadyShown) {
      setSkipIntro(true)
      onComplete()
      return
    }

    /*
      TIMELINE

      0.0s  → logo starts spinning
      3.2s  → logo stops
      3.3s  → text starts
      6.4s  → intro starts fading
      7.2s  → homepage appears
    */

    const textTimer = window.setTimeout(() => {
      setShowText(true)
    }, shouldReduceMotion ? 200 : 3300)

    const exitTimer = window.setTimeout(() => {
      setExiting(true)
    }, shouldReduceMotion ? 1200 : 6400)

    const completeTimer = window.setTimeout(() => {
      sessionStorage.setItem('yantrotsav-intro-shown', 'true')
      onComplete()
    }, shouldReduceMotion ? 1800 : 7200)

    return () => {
      window.clearTimeout(textTimer)
      window.clearTimeout(exitTimer)
      window.clearTimeout(completeTimer)
    }
  }, [shouldReduceMotion, onComplete])

  // Don't render the intro after it has already been completed.
  if (skipIntro) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      {!exiting && (
        <motion.main
          key="yantrotsav-intro"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            filter: 'blur(10px)',
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-[100] overflow-hidden bg-[#050816] text-white"
        >
          {/* BACKGROUND GRID */}

          <div className="pointer-events-none absolute inset-0 opacity-35">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                backgroundSize: '44px 44px',
              }}
            />
          </div>

          {/* TECHNICAL CORNERS */}

          <div className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l border-t border-[#00E5FF]/50" />

          <div className="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r border-t border-[#FF6B00]/50" />

          <div className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-b border-l border-[#FF6B00]/50" />

          <div className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b border-r border-[#00E5FF]/50" />

          {/* SIDE ACCENT LINES */}

          <div className="pointer-events-none absolute left-0 top-[30%] h-32 w-px bg-[#00E5FF]/40" />

          <div className="pointer-events-none absolute right-0 top-[65%] h-40 w-px bg-[#FF6B00]/40" />

          {/* MAIN CONTENT */}

          <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-5 py-16">
            {/* LOGO */}

            <div className="relative flex h-[230px] w-full items-center justify-center sm:h-[280px] md:h-[320px]">
              {/* Rotating outer ring */}

              {!shouldReduceMotion && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                    rotate: -900,
                  }}
                  animate={{
                    opacity: [0, 0.7, 0.45, 0],
                    scale: [0.5, 1.05, 1.2, 1.3],
                    rotate: [-900, 0, 720, 1080],
                  }}
                  transition={{
                    duration: 3.2,
                    times: [0, 0.42, 0.78, 1],
                    ease: 'easeOut',
                  }}
                  className="pointer-events-none absolute h-[210px] w-[210px] border border-[#00E5FF]/25 sm:h-[260px] sm:w-[260px] md:h-[300px] md:w-[300px]"
                >
                  <span className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-[#00E5FF]" />

                  <span className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-[#FF6B00]" />

                  <span className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-[#FF6B00]" />

                  <span className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-[#00E5FF]" />
                </motion.div>
              )}

              {/* Secondary rotating ring */}

              {!shouldReduceMotion && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.6,
                    rotate: 700,
                  }}
                  animate={{
                    opacity: [0, 0.35, 0.15, 0],
                    scale: [0.6, 1.08, 1.2, 1.3],
                    rotate: [700, 0, -500, -800],
                  }}
                  transition={{
                    duration: 3.2,
                    ease: 'easeOut',
                  }}
                  className="pointer-events-none absolute h-[175px] w-[175px] border border-[#FF6B00]/20 sm:h-[220px] sm:w-[220px] md:h-[255px] md:w-[255px]"
                />
              )}

              {/* Logo frame */}

              <div className="relative">
                <span className="pointer-events-none absolute -left-5 -top-5 h-9 w-9 border-l-2 border-t-2 border-[#00E5FF] sm:-left-6 sm:-top-6 sm:h-11 sm:w-11" />

                <span className="pointer-events-none absolute -right-5 -top-5 h-9 w-9 border-r-2 border-t-2 border-[#FF6B00] sm:-right-6 sm:-top-6 sm:h-11 sm:w-11" />

                <span className="pointer-events-none absolute -bottom-5 -left-5 h-9 w-9 border-b-2 border-l-2 border-[#FF6B00] sm:-bottom-6 sm:-left-6 sm:h-11 sm:w-11" />

                <span className="pointer-events-none absolute -bottom-5 -right-5 h-9 w-9 border-b-2 border-r-2 border-[#00E5FF] sm:-right-6 sm:-bottom-6 sm:h-11 sm:w-11" />

                {/* LOGO */}

                <motion.img
                  src={logo}
                  alt="YANTROTSAV"
                  initial={
                    shouldReduceMotion
                      ? {
                          opacity: 1,
                          scale: 1,
                          rotate: 0,
                          filter: 'blur(0px)',
                        }
                      : {
                          opacity: 0,
                          scale: 0.2,
                          rotate: -1800,
                          filter: 'blur(20px)',
                        }
                  }
                  animate={
                    shouldReduceMotion
                      ? {
                          opacity: 1,
                          scale: 1,
                          rotate: 0,
                          filter: 'blur(0px)',
                        }
                      : {
                          opacity: 1,
                          scale: [0.2, 1.12, 0.97, 1.05, 1],
                          rotate: [-1800, 1260, -540, 90, 0],
                          filter: [
                            'blur(20px)',
                            'blur(7px)',
                            'blur(3px)',
                            'blur(1px)',
                            'blur(0px)',
                          ],
                        }
                  }
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 3.2,
                          times: [0, 0.4, 0.72, 0.9, 1],
                          ease: [0.16, 1, 0.3, 1],
                        }
                  }
                  className="
                    relative
                    z-10
                    block
                    h-auto
                    w-[190px]
                    object-contain
                    sm:w-[240px]
                    md:w-[280px]
                    lg:w-[320px]
                  "
                />
              </div>
            </div>

            {/* LOGO STATUS */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: shouldReduceMotion ? 0 : 2.8,
                duration: 0.6,
              }}
              className="mt-2 flex items-center gap-3"
            >
              <span className="h-px w-8 bg-[#00E5FF]" />

              <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-slate-600 sm:text-[9px]">
                YT / SYSTEM ONLINE
              </span>

              <span className="h-px w-8 bg-[#FF6B00]" />
            </motion.div>

            {/* TEXT */}

            <AnimatePresence>
              {showText && (
                <motion.section
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative z-10 mt-12 w-full max-w-[900px] text-center sm:mt-14"
                >
                  {/* LABEL */}

                  <div className="mb-5 flex items-center justify-center gap-3">
                    <span className="h-px w-8 bg-[#00E5FF] sm:w-12" />

                    <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-slate-600 sm:text-[9px]">
                      SYSTEM / READY
                    </span>

                    <span className="h-px w-8 bg-[#FF6B00] sm:w-12" />
                  </div>

                  {/* MAIN MESSAGE */}

                  <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 px-3 sm:gap-x-4 md:gap-x-5">
                    {words.map((word, index) => (
                      <motion.span
                        key={word}
                        initial={
                          shouldReduceMotion
                            ? {
                                opacity: 1,
                                y: 0,
                                filter: 'blur(0px)',
                              }
                            : {
                                opacity: 0,
                                y: 22,
                                filter: 'blur(7px)',
                              }
                        }
                        animate={{
                          opacity: 1,
                          y: 0,
                          filter: 'blur(0px)',
                        }}
                        transition={{
                          delay: shouldReduceMotion ? 0 : index * 0.12,
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={`
                          text-xl
                          font-black
                          uppercase
                          tracking-[0.06em]
                          sm:text-2xl
                          md:text-3xl
                          lg:text-4xl
                          ${
                            word === 'READY'
                              ? 'text-[#FF6B00]'
                              : 'text-white'
                          }
                        `}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* BOTTOM STATUS */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: shouldReduceMotion ? 0 : 3.5,
                duration: 0.7,
              }}
              className="absolute bottom-7 left-1/2 flex w-[calc(100%-40px)] max-w-[1200px] -translate-x-1/2 items-center justify-between font-mono text-[7px] uppercase tracking-[0.18em] text-slate-700 sm:text-[8px]"
            >
              <span>YANTROTSAV // 2026</span>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse bg-[#FF6B00]" />

                <span>INITIALIZATION</span>
              </div>
            </motion.div>

            {/* PROGRESS */}

            {!shouldReduceMotion && (
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 6.4,
                  ease: 'linear',
                }}
                className="fixed bottom-0 left-0 z-[110] h-[2px] bg-[#FF6B00]"
              />
            )}
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  )
}

export default HomeIntro