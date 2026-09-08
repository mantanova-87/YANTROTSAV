import { motion, useReducedMotion } from 'framer-motion'
import logo from '../assets/images/logo.png'
const images = import.meta.glob(
  '../assets/images/*',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>

// ============================================================
// ANIMATION PRESETS
// ============================================================

const leftReveal = {
  hidden: {
    opacity: 0,
    x: -120,
    y: 45,
    rotate: -2,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: -1,
    scale: 1,
  },
}

const rightReveal = {
  hidden: {
    opacity: 0,
    x: 120,
    y: 45,
    rotate: 2,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 1,
    scale: 1,
  },
}

const depthReveal = {
  hidden: {
    opacity: 0,
    y: 100,
    scale: 0.88,
    rotateX: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
  },
}

// ============================================================
// MESSAGE CARDS
// ============================================================

const messageCards = [
  {
    title: "Hon'ble Vice-Chancellor's Message",
    text: 'It gives me immense pleasure to extend my best wishes on the occasion of Yantrotsav at Central University of Jammu. This event celebrates technology, innovation, creativity, and the talent of our young minds. I hope Yantrotsav inspires students to explore, innovate, and transform ideas into meaningful solutions. I congratulate the organizers and wish the event great success.',
    text1: 'Prof. Dr. Sanjeev Jain',
    text2: "Hon'ble Vice Chancellor",
    image: 'vc.jpg',
  },
  {
    title: 'Message from the HOD',
    text: 'It gives me immense pleasure to extend my warm wishes on the occasion of Yantrotsav at Central University of Jammu. This event provides a wonderful platform for our students to showcase their creativity, technical skills, and innovative ideas. I hope Yantrotsav inspires our students to learn, explore, and contribute to the ever-evolving world of technology. I congratulate the organizing team and wish the event great success.',
    text1: 'Dr. Dinesh Kumar',
    text2: 'Head of Department(CSE)',
    image: 'DRDINESHCSE.jpeg',
  },
]

// ============================================================
// FEATURE CARDS
// ============================================================

const featureCards = [
  {
    title: 'Dr. Jasvinder Pal Singh',
    text: 'Assistant Professor',
    image: 'JPsir.jpeg',
    accent: 'cyan',
  },
  {
    title: 'Dr. Harnain Kour',
    text: 'Assistant Professor',
    image: 'Harnain_Kour.jpeg',
    accent: 'violet',
  },
  {
    title: 'Dr. Gourav Kumar',
    text: 'Assistant Professor',
    image: 'Gourav_Kumar.jpg',
    accent: 'orange',
  },
]

// ============================================================
// HOME
// ============================================================

function Home() {
  const shouldReduceMotion = useReducedMotion()

  const revealTransition = {
    duration: shouldReduceMotion ? 0 : 0.85,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white">


      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative mt-8 w-full px-3 pt-[88px] sm:px-5 md:px-8 md:pt-[100px]">

        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1, x: 0 }
              : { opacity: 0, x: -80 }
          }
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
            amount: 0.15,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="group relative mx-auto w-full max-w-6xl overflow-hidden bg-[#080A0F]"
        >

          {/* Technical frame */}

          <div className="pointer-events-none absolute inset-0 z-40 border border-white/20" />

          <div className="pointer-events-none absolute inset-[4px] z-40 border border-white/5" />

          <span className="pointer-events-none absolute left-0 top-0 z-50 h-px w-32 bg-[#00E5FF]" />

          <span className="pointer-events-none absolute bottom-0 right-0 z-50 h-px w-32 bg-[#FF6B00]" />

          <span className="pointer-events-none absolute left-0 top-0 z-50 h-10 w-10 border-l-2 border-t-2 border-[#00E5FF]" />

          <span className="pointer-events-none absolute right-0 top-0 z-50 h-7 w-7 border-r border-t border-white/30" />

          <span className="pointer-events-none absolute bottom-0 left-0 z-50 h-7 w-7 border-b border-l border-white/30" />

          <span className="pointer-events-none absolute bottom-0 right-0 z-50 h-10 w-10 border-b-2 border-r-2 border-[#FF6B00]" />

          {/* ==================================================
              HERO CONTENT
          ================================================== */}

          <div className="grid min-h-[400px] md:min-h-[420px] md:grid-cols-[1.35fr_0.65fr]">

            {/* ==================================================
                TEXT
            ================================================== */}

            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -45 }
              }
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.75,
                delay: shouldReduceMotion ? 0 : 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-10 flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-14"
            >

              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#FF6B00]">
                01 / About The Event
              </span>

              <h2 className="mt-4 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:text-4xl lg:text-5xl">
                Yantrotsav
              </h2>

              <h4 className="text-sm text-slate-300 md:text-base">
                <i>Where Tech Meets Innovation</i>
              </h4>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                YANTROTSAV 2026 is a university-level technology fest
                organised by the Department of Computer Science & Engineering,
                Central University of Jammu, as part of the celebration of
                Engineers&apos; Day. The fest brings together students for
                technical, creative, analytical and competitive activities.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <span className="h-px w-12 bg-[#00E5FF] transition-all duration-500 group-hover:w-24" />

                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-700">
                  Yantrotsav / 2026
                </span>
              </div>
            </motion.div>

            {/* ==================================================
                HERO LOGO
                Fast rotation → deceleration → settle
                SIZE NEVER CHANGES DURING ROTATION
            ================================================== */}

            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: 60 }
              }
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.85,
                delay: shouldReduceMotion ? 0 : 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex min-h-[250px] items-center justify-center overflow-hidden bg-[#050816] p-6 sm:min-h-[280px] md:min-h-[420px] md:p-6"
            >

              {/* Rotating technical ring */}

              {!shouldReduceMotion && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.6,
                    rotate: -720,
                  }}
                  whileInView={{
                    opacity: [0, 0.55, 0.25, 0],
                    scale: [0.6, 1, 1.08, 1.15],
                    rotate: [-720, 0, 540, 900],
                  }}
                  viewport={{
                    once: true,
                    amount: 0.35,
                  }}
                  transition={{
                    duration: 3.2,
                    times: [0, 0.4, 0.78, 1],
                    ease: 'easeOut',
                  }}
                  className="pointer-events-none absolute h-[210px] w-[210px] border border-[#00E5FF]/25 sm:h-[240px] sm:w-[240px] md:h-[290px] md:w-[290px]"
                >
                  <span className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-[#00E5FF]" />

                  <span className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-[#FF6B00]" />

                  <span className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-[#FF6B00]" />

                  <span className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-[#00E5FF]" />
                </motion.div>
              )}

              {/* Secondary ring */}

              {!shouldReduceMotion && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.55,
                    rotate: 600,
                  }}
                  whileInView={{
                    opacity: [0, 0.35, 0.15, 0],
                    scale: [0.55, 0.95, 1.05, 1.12],
                    rotate: [600, 0, -500, -800],
                  }}
                  viewport={{
                    once: true,
                    amount: 0.35,
                  }}
                  transition={{
                    duration: 3.2,
                    ease: 'easeOut',
                  }}
                  className="pointer-events-none absolute h-[170px] w-[170px] border border-[#FF6B00]/20 sm:h-[200px] sm:w-[200px] md:h-[240px] md:w-[240px]"
                />
              )}

              {/* Logo frame */}

              <div className="relative">

                <span className="pointer-events-none absolute -left-5 -top-5 z-30 h-9 w-9 border-l-2 border-t-2 border-[#00E5FF] sm:-left-6 sm:-top-6 sm:h-11 sm:w-11" />

                <span className="pointer-events-none absolute -right-5 -top-5 z-30 h-9 w-9 border-r-2 border-t-2 border-[#FF6B00] sm:-right-6 sm:-top-6 sm:h-11 sm:w-11" />

                <span className="pointer-events-none absolute -bottom-5 -left-5 z-30 h-9 w-9 border-b-2 border-l-2 border-[#FF6B00] sm:-bottom-6 sm:-left-6 sm:h-11 sm:w-11" />

                <span className="pointer-events-none absolute -bottom-5 -right-5 z-30 h-9 w-9 border-b-2 border-r-2 border-[#00E5FF] sm:-bottom-6 sm:-right-6 sm:h-11 sm:w-11" />

                {/* ==================================================
                    LOGO
                    Fixed scale — only rotation changes
                ================================================== */}

                <motion.img
                  src={logo}
                  alt="YANTROTSAV logo"
                  initial={
                    shouldReduceMotion
                      ? {
                        opacity: 1,
                        rotate: 0,
                      }
                      : {
                        opacity: 0,
                        rotate: -1440,
                      }
                  }
                  whileInView={
                    shouldReduceMotion
                      ? {
                        opacity: 1,
                        rotate: 0,
                      }
                      : {
                        opacity: 1,
                        rotate: [-1440, 1080, -360, 45, 0],
                      }
                  }
                  viewport={{
                    once: true,
                    amount: 0.35,
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 3.2,
                    times: [0, 0.4, 0.72, 0.9, 1],
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative z-20 block h-auto w-[170px] object-contain sm:w-[200px] md:w-[235px] lg:w-[260px]"
                />
              </div>



              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#00E5FF]/10 via-transparent to-[#FF6B00]/10" />
            </motion.div>
          </div>
        </motion.div>
      </section>
      {/* ======================================================
          MESSAGE HEADING
      ====================================================== */}
      <section className="mx-auto mt-6 flex max-w-[1400px] items-center justify-center px-5  md:px-8 md:pb-10">
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 70, scale: 0.92 }
          }
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative border-b border-white/10 pb-7 text-center"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#FF6B00]">
            02 / The Message
          </span>

          <h2 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-6xl">
            Words From The Visionaries
            <span className="visionary-dot ml-2 inline-block h-2 w-2 align-middle md:h-3 md:w-3" />
          </h2>

          <span className="absolute bottom-[-1px] left-1/2 h-px w-20 -translate-x-1/2 bg-[#00E5FF]" />
        </motion.div>
      </section>

      {/* ======================================================
          MESSAGE CARDS
      ====================================================== */}

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-5 md:px-8 md:py-20">
        <div className="space-y-20 md:space-y-[30px]">

          {messageCards.map((card, index) => {

            const animation =
              index === 0 ? leftReveal : rightReveal

            return (
              <motion.article
                key={card.title}
                variants={animation}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.12,
                }}
                transition={{
                  ...revealTransition,
                  delay: shouldReduceMotion ? 0 : index * 0.18,
                }}
                style={{
                  perspective: shouldReduceMotion ? 'none' : 1200,
                }}
                className={`relative w-full max-w-5xl ${index === 0
                  ? 'md:ml-[2%]'
                  : 'md:ml-auto md:mr-[2%]'
                  }`}
              >

                <div className="absolute inset-2 translate-x-5 translate-y-5 bg-black/75 blur-[2px]" />

                <span
                  className={`absolute -left-3 -top-3 z-0 h-0 w-0 border-b-[30px] border-r-[30px] border-b-transparent ${index === 0
                    ? 'border-r-[#00E5FF]/50'
                    : 'border-r-[#FF6B00]/50'
                    }`}
                />

                <span
                  className={`absolute -right-3 -top-3 z-0 h-0 w-0 border-b-[30px] border-l-[30px] border-b-transparent ${index === 0
                    ? 'border-l-[#FF6B00]/50'
                    : 'border-l-[#00E5FF]/50'
                    }`}
                />

                <span
                  className={`absolute -bottom-3 -left-3 z-0 h-0 w-0 border-t-[30px] border-r-[30px] border-t-transparent ${index === 0
                    ? 'border-r-[#FF6B00]/35'
                    : 'border-r-[#00E5FF]/35'
                    }`}
                />

                <span
                  className={`absolute -bottom-3 -right-3 z-0 h-0 w-0 border-t-[30px] border-l-[30px] border-t-transparent ${index === 0
                    ? 'border-l-[#00E5FF]/35'
                    : 'border-l-[#FF6B00]/35'
                    }`}
                />

                <div className="group relative z-10 grid overflow-hidden bg-[#080A0F] shadow-[0_18px_45px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_35px_80px_rgba(0,0,0,0.6)] md:grid-cols-[0.72fr_1.28fr]">

                  <div className="pointer-events-none absolute inset-0 z-40 border border-white/20" />

                  <div className="pointer-events-none absolute inset-[4px] z-40 border border-white/5" />

                  <span className="pointer-events-none absolute left-0 top-0 z-50 h-px w-36 bg-[#00E5FF]" />

                  <span className="pointer-events-none absolute bottom-0 right-0 z-50 h-px w-36 bg-[#FF6B00]" />

                  <span className="pointer-events-none absolute left-0 top-0 z-50 h-10 w-10 border-l-2 border-t-2 border-[#00E5FF]" />

                  <span className="pointer-events-none absolute right-0 top-0 z-50 h-7 w-7 border-r border-t border-white/30" />

                  <span className="pointer-events-none absolute bottom-0 left-0 z-50 h-7 w-7 border-b border-l border-white/30" />

                  <span className="pointer-events-none absolute bottom-0 right-0 z-50 h-10 w-10 border-b-2 border-r-2 border-[#FF6B00]" />

                  <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-br from-white/[0.045] via-transparent to-[#00E5FF]/[0.025]" />

                  {/* Image */}

                  <div className="relative flex min-h-[250px] flex-col items-center justify-center overflow-hidden bg-[#080A0F] p-6 sm:min-h-[280px] md:min-h-[300px]">

                    {card.image ? (
                      <motion.img
                        src={images[`../assets/images/${card.image}`]}
                        alt={card.title}
                        initial={{
                          opacity: 0,
                          scale: 0.75,
                          y: 40,
                        }}
                        whileInView={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                        }}
                        viewport={{
                          once: true,
                          amount: 0.25,
                        }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.8,
                          delay: shouldReduceMotion
                            ? 0
                            : index * 0.12 + 0.15,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative z-10 h-52 w-52 rounded-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 sm:h-56 sm:w-56 md:h-64 md:w-64"
                      />
                    ) : (
                      <div className="relative z-10 flex min-h-[210px] w-full items-center justify-center border border-white/5">
                        <p>Image</p>
                      </div>
                    )}

                    <div className="relative z-10 text-center">
                      <p className="mt-4 text-base font-bold leading-7 sm:text-lg md:text-base">
                        {card.text1}
                      </p>

                      <p className="mt-1 text-base font-bold leading-7 sm:text-lg md:text-base">
                        {card.text2}
                      </p>
                    </div>

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#00E5FF]/10 via-transparent to-[#FF6B00]/10" />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816]/60 via-transparent to-transparent" />
                  </div>

                  {/* Text */}

                  <div className="relative z-30 flex flex-col justify-center p-6 sm:p-7 md:p-8">

                    <span className="mb-4 font-mono text-[9px] uppercase tracking-[0.25em] text-[#FF6B00]">
                      0{index + 1} / Message
                    </span>

                    <h2 className="max-w-2xl text-2xl font-black uppercase tracking-tight md:text-2xl lg:text-3xl">
                      {card.title}
                    </h2>

                    <div className="mt-5 flex items-center gap-3">
                      <span className="h-px w-12 bg-[#00E5FF] transition-all duration-500 group-hover:w-24" />

                      <span className="h-1 w-1 bg-[#FF6B00]" />
                    </div>

                    <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 md:text-base md:leading-8">
                      {card.text}
                    </p>

                    <div className="mt-8 flex items-center gap-4">
                      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-700">
                        Yantrotsav
                      </span>

                      <span className="h-px w-12 bg-white/10" />

                      <span className="font-mono text-[8px] text-slate-700">
                        2026
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      {/* ======================================================
          WATCHER HEADING
      ====================================================== */}

      <section className="mx-auto mt-6 flex max-w-[1400px] items-center justify-center px-5 pb-8 md:px-8 md:pb-10">

        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 70, scale: 0.92 }
          }
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative border-b border-white/10 pb-7 text-center"
        >

          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#FF6B00]">
            03 / The Watcher
          </span>

          <h2 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-6xl">
            Our Convenors
          </h2>

          <span className="absolute bottom-[-1px] left-1/2 h-px w-20 -translate-x-1/2 bg-[#00E5FF]" />
        </motion.div>
      </section>

      {/* ======================================================
          WATCHER CARDS
      ====================================================== */}

      <section className="mx-auto max-w-[1400px] px-5 pb-16 md:px-8 md:pb-10">

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {featureCards.map((card, index) => {

            const animation =
              index === 0
                ? leftReveal
                : index === 1
                  ? depthReveal
                  : rightReveal

            const accent =
              card.accent === 'cyan'
                ? '#00E5FF'
                : card.accent === 'orange'
                  ? '#FF6B00'
                  : '#7C3AED'

            return (
              <motion.article
                key={card.title}
                variants={animation}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.12,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.85,
                  delay: shouldReduceMotion ? 0 : index * 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  perspective: shouldReduceMotion ? 'none' : 1200,
                }}
                className="group relative"
              >

                <div className="absolute inset-2 translate-x-4 translate-y-4 bg-black/70 blur-[1px]" />

                <span
                  style={{
                    borderRightColor: `${accent}66`,
                  }}
                  className="absolute -left-2 -top-2 z-0 h-0 w-0 border-b-[22px] border-r-[22px] border-b-transparent"
                />

                <span
                  style={{
                    borderLeftColor: `${accent}44`,
                  }}
                  className="absolute -bottom-2 -right-2 z-0 h-0 w-0 border-t-[22px] border-l-[22px] border-t-transparent"
                />

                <div className="relative z-10 overflow-hidden bg-[#080A0F] shadow-[0_15px_35px_rgba(0,0,0,0.35)] transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.55)]">

                  <div className="pointer-events-none absolute inset-0 z-40 border border-white/20" />

                  <div className="pointer-events-none absolute inset-[4px] z-40 border border-white/5" />

                  <span
                    style={{
                      backgroundColor: accent,
                    }}
                    className="absolute left-0 top-0 z-50 h-px w-28"
                  />

                  <span
                    style={{
                      borderColor: accent,
                    }}
                    className="absolute left-0 top-0 z-50 h-8 w-8 border-l-2 border-t-2"
                  />

                  <span
                    style={{
                      borderColor: accent,
                    }}
                    className="absolute bottom-0 right-0 z-50 h-8 w-8 border-b-2 border-r-2"
                  />

                  <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.01]" />

                  {/* Image */}

                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#080A0F] p-5">

                    {card.image ? (
                      <motion.img
                        src={images[`../assets/images/${card.image}`]}
                        alt={card.title}
                        initial={{
                          opacity: 0,
                          scale: 0.82,
                          y: 45,
                        }}
                        whileInView={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                        }}
                        viewport={{
                          once: true,
                          amount: 0.2,
                        }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.8,
                          delay: shouldReduceMotion
                            ? 0
                            : index * 0.15 + 0.1,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative z-10 h-55 w-55 rounded-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center border border-white/5">
                        <div className="text-center">

                          <span
                            style={{
                              color: accent,
                            }}
                            className="font-mono text-[9px] uppercase tracking-[0.2em]"
                          >
                            Feature 0{index + 1}
                          </span>

                          <p className="mt-2 text-[8px] uppercase tracking-[0.15em] text-slate-700">
                            Add image filename
                          </p>
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        background: `linear-gradient(135deg, ${accent}18, transparent 50%, ${accent}12)`,
                      }}
                      className="pointer-events-none absolute inset-0"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816]/80 via-transparent to-transparent" />

                    
                  </div>

                  {/* Content */}

                  <div className="relative z-20 p-6 md:p-7">

                    <div className="flex items-center justify-between">

                      <span
                        style={{
                          color: accent,
                        }}
                        className="font-mono text-[9px]"
                      >
                        0{index + 1}
                      </span>

                      <span
                        style={{
                          color: accent,
                        }}
                        className="text-xs opacity-40 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                      >
                        ↗
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-black uppercase tracking-tight">
                      {card.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {card.text}
                    </p>

                    <div className="mt-6 flex items-center gap-2">

                      <span
                        style={{
                          backgroundColor: accent,
                        }}
                        className="h-px w-8 transition-all duration-500 group-hover:w-16"
                      />

                      <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-slate-700">
                        Dept. of Computer Science and Engineering
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Home