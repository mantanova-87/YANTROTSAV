import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

const galleryImages = import.meta.glob(
  '../assets/yantrotsav/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>

const images = Object.values(galleryImages)

const AUTO_PLAY_TIME = 5000

export default function YantrotsavGallery() {
  const shouldReduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const totalImages = images.length

  const orderedImages = useMemo(() => {
    if (totalImages === 0) return []

    return Array.from(
      { length: Math.min(totalImages, 7) },
      (_, index) => images[(activeIndex + index) % totalImages],
    )
  }, [activeIndex, totalImages])

  const nextImage = () => {
    if (totalImages === 0) return

    setActiveIndex((current) => (current + 1) % totalImages)
  }

  const previousImage = () => {
    if (totalImages === 0) return

    setActiveIndex(
      (current) => (current - 1 + totalImages) % totalImages,
    )
  }

  const selectImage = (index: number) => {
    if (totalImages === 0) return

    setActiveIndex((activeIndex + index) % totalImages)
  }

  useEffect(() => {
    if (
      totalImages <= 1 ||
      isPaused ||
      shouldReduceMotion
    ) {
      return
    }

    const timer = window.setInterval(nextImage, AUTO_PLAY_TIME)

    return () => window.clearInterval(timer)
  }, [totalImages, isPaused, shouldReduceMotion])

  useEffect(() => {
    document.title = 'YANTROTSAV | Yantrotsav Gallery'
  }, [])

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-[#F8FAFC]">
      {/* HEADER */}
      <section className="mx-auto max-w-[1400px] px-5 pb-10 pt-28 sm:pb-14 md:px-8 md:pt-36">
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
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
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-[#00E5FF]" />

            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500">
              Visual Archive / 2026
            </span>
          </div>

          <h1 className="max-w-5xl text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-7xl">
            YANTROTSAV
            <span className="text-[#00E5FF]"> AT A GLANCE</span>
          </h1>

          <div className="mt-5 flex items-center gap-3">
            <span className="h-1.5 w-1.5 bg-[#FF6B00]" />

            <p className="max-w-2xl font-mono text-[9px] uppercase leading-5 tracking-[0.16em] text-slate-500 sm:text-[10px]">
              Moments. People. Technology. Energy.
            </p>
          </div>
        </motion.div>
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-5 md:px-8 md:pb-28">
        {images.length === 0 ? (
          <div className="border border-white/10 p-10 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
              No gallery images found
            </p>

            <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.15em] text-slate-700">
              Add images to src/assets/gallery
            </p>
          </div>
        ) : (
          <>
            {/* MAIN GALLERY FRAME */}
            <motion.div
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Technical outer lines */}
              <span className="pointer-events-none absolute left-0 top-0 z-30 h-px w-32 bg-[#00E5FF]" />
              <span className="pointer-events-none absolute right-0 top-0 z-30 h-px w-24 bg-[#FF6B00]" />
              <span className="pointer-events-none absolute bottom-0 left-0 z-30 h-px w-24 bg-[#FF6B00]" />
              <span className="pointer-events-none absolute bottom-0 right-0 z-30 h-px w-32 bg-[#00E5FF]" />

              <div className="grid gap-2 md:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
                {/* =========================
                    MAIN IMAGE
                ========================= */}
                <div className="relative aspect-[16/10] overflow-hidden border border-white/10 bg-[#080A0F] md:aspect-[16/10]">
                  <AnimatePresence mode="sync">
                    <motion.img
                      key={orderedImages[0]}
                      src={orderedImages[0]}
                      alt={`YANTROTSAV gallery image ${activeIndex + 1}`}
                      initial={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : {
                              opacity: 0,
                              scale: 1.08,
                              x: 40,
                              filter: 'blur(8px)',
                            }
                      }
                      animate={{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                        filter: 'blur(0px)',
                      }}
                      exit={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : {
                              opacity: 0,
                              scale: 0.96,
                              x: -50,
                              filter: 'blur(5px)',
                            }
                      }
                      transition={{
                        duration: 0.75,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </AnimatePresence>

                  {/* Cinematic overlays */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050816]/50 via-transparent to-transparent" />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816]/70 via-transparent to-transparent" />

                  {/* Scan strip */}
                  <motion.div
                    key={`scan-${activeIndex}`}
                    initial={{ y: '-100%' }}
                    animate={{ y: '200%' }}
                    transition={{
                      duration: 1.1,
                      ease: 'easeInOut',
                    }}
                    className="pointer-events-none absolute left-0 right-0 z-10 h-[15%] bg-gradient-to-b from-transparent via-[#00E5FF]/10 to-transparent"
                  />

                  {/* Main image label */}
                  <div className="absolute bottom-4 left-4 z-20 sm:bottom-6 sm:left-6">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#00E5FF]">
                        {String(activeIndex + 1).padStart(2, '0')}
                      </span>

                      <span className="h-px w-8 bg-white/30" />

                      <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/60">
                        Main Frame
                      </span>
                    </div>
                  </div>

                  {/* Fullscreen-style button */}
                  <button
                    type="button"
                    onClick={() => setIsPaused((current) => !current)}
                    aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
                    className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center border border-white/20 bg-[#050816]/60 text-white/70 backdrop-blur-sm transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF] sm:right-5 sm:top-5"
                  >
                    <Maximize2 size={15} />
                  </button>

                  {/* Corner brackets */}
                  <span className="pointer-events-none absolute left-3 top-3 z-20 h-8 w-8 border-l border-t border-[#00E5FF]/80" />
                  <span className="pointer-events-none absolute right-3 top-3 z-20 h-8 w-8 border-r border-t border-[#FF6B00]/80" />
                  <span className="pointer-events-none absolute bottom-3 left-3 z-20 h-8 w-8 border-b border-l border-[#FF6B00]/60" />
                  <span className="pointer-events-none absolute bottom-3 right-3 z-20 h-8 w-8 border-b border-r border-[#00E5FF]/60" />
                </div>

                {/* =========================
                    SIX PREVIEW FRAMES
                ========================= */}
                <div className="grid grid-cols-3 gap-1.5 md:grid-cols-3 md:grid-rows-2">
                  {orderedImages.slice(1, 7).map((image, index) => {
                    const actualIndex =
                      (activeIndex + index + 1) % totalImages

                    return (
                      <motion.button
                        type="button"
                        key={`${image}-${actualIndex}`}
                        onClick={() => selectImage(index + 1)}
                        initial={{
                          opacity: 0,
                          scale: 0.94,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          duration: 0.45,
                          delay: index * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileHover={
                          shouldReduceMotion
                            ? undefined
                            : {
                                scale: 1.025,
                              }
                        }
                        className="group relative min-h-[95px] overflow-hidden border border-white/10 bg-[#080A0F] text-left sm:min-h-[120px] md:min-h-0"
                      >
                        <img
                          src={image}
                          alt={`YANTROTSAV gallery preview ${actualIndex + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover opacity-60 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                        />

                        <div className="absolute inset-0 bg-[#050816]/30 transition-colors duration-300 group-hover:bg-transparent" />

                        {/* Preview number */}
                        <span className="absolute bottom-2 left-2 z-10 font-mono text-[7px] font-bold tracking-[0.16em] text-white/60">
                          {String(actualIndex + 1).padStart(2, '0')}
                        </span>

                        {/* Preview accent */}
                        <span className="absolute left-0 top-0 h-px w-8 bg-[#00E5FF]/60 transition-all duration-300 group-hover:w-full" />

                        <span className="absolute bottom-0 right-0 h-px w-8 bg-[#FF6B00]/50 transition-all duration-300 group-hover:w-full" />
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* CONTROLS */}
              <div className="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={previousImage}
                    aria-label="Previous image"
                    className="flex h-11 w-11 items-center justify-center border border-white/10 text-slate-400 transition-all hover:border-[#00E5FF]/60 hover:text-[#00E5FF]"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next image"
                    className="flex h-11 w-11 items-center justify-center border border-white/10 text-slate-400 transition-all hover:border-[#FF6B00]/60 hover:text-[#FF6B00]"
                  >
                    <ChevronRight size={17} />
                  </button>

                  <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600">
                    {isPaused ? 'Slideshow Paused' : 'Auto Sequence Active'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-white/10" />

                  <span className="font-mono text-[9px] font-bold tracking-[0.18em] text-slate-500">
                    {String(activeIndex + 1).padStart(2, '0')}
                    <span className="mx-2 text-slate-700">/</span>
                    {String(totalImages).padStart(2, '0')}
                  </span>

                  <span className="h-px w-10 bg-white/10" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </section>
    </main>
  )
}