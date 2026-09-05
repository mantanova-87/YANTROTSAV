import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import poster from '../assets/images/poster.png'

const words = ['LADIES', 'AND', 'GENTLEMEN,', 'ARE', 'YOU', 'READY?']

function HomeIntro() {
  const [visible, setVisible] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const hasShown = sessionStorage.getItem('yantrotsav-intro-shown')

    if (hasShown) {
      return
    }

    setVisible(true)

    const logoTimer = window.setTimeout(() => {
      setShowLogo(true)
    }, 1900)

    const exitTimer = window.setTimeout(() => {
      sessionStorage.setItem('yantrotsav-intro-shown', 'true')
      setVisible(false)
    }, 3800)

    return () => {
      window.clearTimeout(logoTimer)
      window.clearTimeout(exitTimer)
    }
  }, [])

  if (!visible) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{
          opacity: 0,
          scale: 1.03,
          filter: 'blur(8px)',
        }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050816]"
      >
        {/* Technical frame */}
        <span className="absolute left-5 top-5 h-8 w-8 border-l border-t border-[#FF6B00]/70" />
        <span className="absolute right-5 top-5 h-8 w-8 border-r border-t border-[#00E5FF]/70" />
        <span className="absolute bottom-5 left-5 h-8 w-8 border-b border-l border-[#00E5FF]/70" />
        <span className="absolute bottom-5 right-5 h-8 w-8 border-b border-r border-[#FF6B00]/70" />

        {/* Horizontal technical lines */}
        <span className="absolute left-0 top-1/2 h-px w-[18%] bg-[#FF6B00]/70" />
        <span className="absolute right-0 top-1/2 h-px w-[18%] bg-[#00E5FF]/70" />

        {/* Main content */}
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 text-center">
          {/* Words */}
          <div className="flex max-w-4xl flex-wrap justify-center gap-x-3 gap-y-2 md:gap-x-5">
            {words.map((word, index) => (
              <motion.span
                key={word}
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : {
                        opacity: 0,
                        y: 25,
                        filter: 'blur(8px)',
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                }}
                transition={{
                  delay: shouldReduceMotion ? 0 : index * 0.22,
                  duration: 0.45,
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
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : {
                        opacity: 0,
                        y: 35,
                        scale: 0.75,
                        filter: 'blur(14px)',
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                }}
                transition={{
                  duration: 0.85,
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
                    src={poster}
                    alt="Yantrotsav 2026"
                    className="h-32 w-32 object-contain md:h-44 md:w-44"
                  />
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-slate-500"
                >
                  YANTROTSAV / 2026
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom progress line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 3.8,
            ease: 'linear',
          }}
          className="absolute bottom-0 left-0 h-px w-full origin-left bg-[#FF6B00]"
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default HomeIntro
