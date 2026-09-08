import { motion } from "framer-motion";
import logo from "../assets/images/logo.png";
const images = import.meta.glob("../assets/images/*", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

// ============================================================
// MOBILE DETECTOR
// Checked once at module load so animation variants are stable.
// ============================================================

const isMobile =
  typeof window !== "undefined" ? window.innerWidth < 768 : false;

// ============================================================
// ANIMATION PRESETS
// Mobile: simple opacity + y (no GPU-heavy 3D / blur filters).
// Desktop: full cinematic 3D depth reveal.
// ============================================================

const revealFromLeft = isMobile
  ? {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 },
    }
  : {
      hidden: {
        opacity: 0,
        x: -120,
        y: 50,
        rotateY: 18,
        rotateZ: -2,
        scale: 0.9,
        filter: "blur(10px)",
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        rotateY: 0,
        rotateZ: -1,
        scale: 1,
        filter: "blur(0px)",
      },
    };

const revealFromRight = isMobile
  ? {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 },
    }
  : {
      hidden: {
        opacity: 0,
        x: 120,
        y: 50,
        rotateY: -18,
        rotateZ: 2,
        scale: 0.9,
        filter: "blur(10px)",
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        rotateY: 0,
        rotateZ: 1,
        scale: 1,
        filter: "blur(0px)",
      },
    };

const revealFromDepth = isMobile
  ? {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 },
    }
  : {
      hidden: {
        opacity: 0,
        y: 80,
        rotateX: 20,
        scale: 0.82,
        filter: "blur(12px)",
      },
      visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        filter: "blur(0px)",
      },
    };

// ============================================================
// MESSAGE CARDS
// Replace image: '' with your actual image filename.
// Example:
// image: 'message1.png'
// ============================================================

const messageCards = [
  {
    title: "Hon'ble Vice-Chancellor's Message",
    text: "It gives me immense pleasure to extend my best wishes on the occasion of Yantrotsav at Central University of Jammu. This event celebrates technology, innovation, creativity, and the talent of our young minds. I hope Yantrotsav inspires students to explore, innovate, and transform ideas into meaningful solutions. I congratulate the organizers and wish the event great success.",
    text1: "Prof. Dr. Sanjeev Jain",
    text2: "HON'BLE VICE CHANCELLOR",
    image: "vc.jpg",
  },
  {
    title: "Message from the HOD",
    text: "It gives me immense pleasure to extend my warm wishes on the occasion of Yantrotsav at Central University of Jammu. This event provides a wonderful platform for our students to showcase their creativity, technical skills, and innovative ideas. I hope Yantrotsav inspires our students to learn, explore, and contribute to the ever-evolving world of technology. I congratulate the organizing team and wish the event great success.",
    text1: "Dr. Dinesh Kumar",
    text2: "HEAD OF DEPARTMENT (CSE)",
    image: "DRDINESHCSE.jpeg",
  },
];

// ============================================================
// FEATURE CARDS
// Replace image: '' with your actual image filename.
// ============================================================

const featureCards = [
  {
    title: "Dr. Jasvinder Pal Singh",
    text: "Assistant Professor",
    image: "JPsir.jpeg",
    accent: "cyan",
  },
  {
    title: "Dr. Harnain Kour",
    text: "Assistant Professor",
    image: "Harnain_Kour.jpeg",
    accent: "violet",
  },
  {
    title: "Dr. Gourav Kumar",
    text: "Assistant Professor",
    image: "Gourav_Kumar.jpg",
    accent: "orange",
  },
];

// ============================================================
// HOME
// ============================================================

function Home() {
  return (
    <>
      {/* ======================================================
          01 / ABOUT THE EVENT - FULL HERO SECTION
          ====================================================== */}
      <section className="relative w-full overflow-hidden py-24 md:py-36 border-y border-white/10 bg-[#050816]">
        {/* Ambient Cyberpunk Glows */}
        <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[#00E5FF]/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-[#FF6B00]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-[1400px] px-5 md:px-8">
          {/* Section Tag */}
          {/* <div className="mb-6 flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.25em] text-[#FF6B00] font-bold">
              01
            </span>
            <span className="h-px w-10 bg-[#FF6B00]" />
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              About The Event / Fest Overview
            </span>
          </div> */}

          {/* Two-Column Hero Showcase */}
          <div className="grid items-center gap-12 mb-6 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Heading, Tagline, Story & Stats (7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="lg:relative lg:top-8 lg:col-span-7"
            >
              <h2 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                YANTROTSAV <span className="text-[#00E5FF]">2026</span>
              </h2>

              <div className="mt-4 flex items-center gap-3 sm:mt-6">
                <span className="h-2 w-2 rounded-full bg-[#FF6B00]" />
                <p className="text-base sm:text-lg font-medium tracking-[0.2em] uppercase text-slate-300">
                  <i>Where Tech Meets Innovation</i>
                </p>
              </div>

              <p className="mt-7 text-base leading-relaxed text-slate-400 sm:text-lg">
                <strong className="text-white font-semibold">
                  YANTROTSAV 2026
                </strong>{" "}
                is the premier university-level technology fest organised by the
                Department of Computer Science &amp; Engineering, Central
                University of Jammu, held in grand celebration of Engineers'
                Day.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
                Bringing together brightest minds, developers, creators, and
                innovators from across the region to compete, collaborate, and
                push the boundaries of technical prowess, algorithmic thinking,
                robotics, and creative problem-solving.
              </p>

              {/* Highlights Pill Badges */}
              <div className="mt-8 flex flex-wrap gap-2.5">
                <span className="border border-[#00E5FF]/40 bg-[#00E5FF]/5 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#00E5FF]">
                  // Coding &amp; Hackathons
                </span>
                <span className="border border-[#FF6B00]/40 bg-[#FF6B00]/5 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#FF6B00]">
                  // Esports &amp; Gaming
                </span>
                <span className="border border-white/20 bg-white/5 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  // Quizzes &amp; Debates
                </span>
              </div>

              {/* Metrics Counter Bar */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div className="border-l border-white/10 pl-4">
                  <span className="block font-mono text-lg font-black text-[#00E5FF] sm:text-xl">
                    Department of CSE
                  </span>
                </div>

                <div className="border-l border-white/10 pl-4">
                  <span className="block font-mono text-lg font-black text-[#FF6B00] sm:text-xl">
                    CU Jammu
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive Cyber Emblem (5 cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center lg:col-span-5"
            >
              <div className="relative w-full max-w-md border border-white/10 bg-[#080A0F]/80 p-8 shadow-2xl backdrop-blur-md">
                {/* Sci-Fi Decorative Corner Brackets */}
                <span className="absolute -left-2 -top-2 h-6 w-6 border-l-2 border-t-2 border-[#00E5FF]" />
                <span className="absolute -right-2 -top-2 h-6 w-6 border-r-2 border-t-2 border-[#FF6B00]" />
                <span className="absolute -bottom-2 -left-2 h-6 w-6 border-b-2 border-l-2 border-[#FF6B00]" />
                <span className="absolute -bottom-2 -right-2 h-6 w-6 border-b-2 border-r-2 border-[#00E5FF]" />

                {/* Emblem Halo Glow */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/15 via-transparent to-[#FF6B00]/15" />

                <div className="relative z-10 flex flex-col items-center text-center">
                  <img
                    src={logo}
                    alt="Yantrotsav Official Fest Logo"
                    className="h-56 w-56 object-contain drop-shadow-[0_0_35px_rgba(0,229,255,0.4)] sm:h-64 sm:w-64"
                  />

                  <div className="mt-6 border-t border-white/10 pt-4 w-full">
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-white">
                      Central University of Jammu
                    </span>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Dept. of Computer Science &amp; Engineering
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <div className="min-h-screen mt-10 overflow-hidden bg-[#050816] text-white">
        {/* ======================================================
          MESSAGE CARDS
      ====================================================== */}

        <section className="mx-auto max-w-[1400px] px-5 py-8 md:px-8 md:py-12">
          <motion.div
            initial={{
              opacity: 0,
              y: 50,
              scale: 0.95,
              filter: "blur(8px)",
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative mx-auto mb-16 w-fit border-b border-white/10 pb-7 text-center md:mb-20"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#FF6B00]">
              02 / Words From Visionaries
            </span>

            <h2 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-6xl">
              Words From Visionaries
            </h2>

            <span className="absolute bottom-[-1px] left-0 h-px w-20 bg-[#00E5FF]" />
          </motion.div>

          {/* No negative spacing — cards do NOT overlap */}
          <div className="space-y-20 md:space-y-[-10]">
            {messageCards.map((card, index) => {
              const animation = index === 0 ? revealFromLeft : revealFromRight;

              return (
                <motion.article
                  key={card.title}
                  variants={animation}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: isMobile ? 0.4 : 0.95,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    perspective: isMobile ? "none" : 1200,
                  }}
                  className={`relative w-full max-w-5xl ${
                    index === 0 ? "md:ml-[2%]" : "md:ml-auto md:mr-[2%]"
                  }`}
                >
                  {/* ==================================================
                    3D DEPTH SHADOW
                ================================================== */}

                  <div className="absolute inset-2 translate-x-6 translate-y-6 bg-black/75 blur-[2px]" />

                  {/* Top-left triangular shadow */}
                  <span
                    className={`absolute -left-3 -top-3 z-0 h-0 w-0 border-b-[30px] border-r-[30px] border-b-transparent ${
                      index === 0
                        ? "border-r-[#00E5FF]/50"
                        : "border-r-[#FF6B00]/50"
                    }`}
                  />

                  {/* Top-right triangular shadow */}
                  <span
                    className={`absolute -right-3 -top-3 z-0 h-0 w-0 border-b-[30px] border-l-[30px] border-b-transparent ${
                      index === 0
                        ? "border-l-[#FF6B00]/50"
                        : "border-l-[#00E5FF]/50"
                    }`}
                  />

                  {/* Bottom-left triangular shadow */}
                  <span
                    className={`absolute -bottom-3 -left-3 z-0 h-0 w-0 border-t-[30px] border-r-[30px] border-t-transparent ${
                      index === 0
                        ? "border-r-[#FF6B00]/35"
                        : "border-r-[#00E5FF]/35"
                    }`}
                  />

                  {/* Bottom-right triangular shadow */}
                  <span
                    className={`absolute -bottom-3 -right-3 z-0 h-0 w-0 border-t-[30px] border-l-[30px] border-t-transparent ${
                      index === 0
                        ? "border-l-[#00E5FF]/35"
                        : "border-l-[#FF6B00]/35"
                    }`}
                  />

                  {/* ==================================================
                    CARD
                ================================================== */}

                  <div
                    className="
                    group
                    relative
                    z-10
                    grid
                    overflow-hidden
                    bg-[#080A0F]
                    shadow-[0_18px_45px_rgba(0,0,0,0.4)]
                    transition-all
                    duration-500
                    hover:-translate-y-3
                    hover:shadow-[0_35px_80px_rgba(0,0,0,0.6)]
                    md:grid-cols-[0.72fr_1.28fr]
                  "
                  >
                    {/* Outer border */}
                    <div className="pointer-events-none absolute inset-0 z-40 border border-white/20" />

                    {/* Inner border */}
                    <div className="pointer-events-none absolute inset-[4px] z-40 border border-white/5" />

                    {/* Top accent */}
                    <span className="absolute left-0 top-0 z-50 h-px w-36 bg-[#00E5FF]" />

                    {/* Bottom accent */}
                    <span className="absolute bottom-0 right-0 z-50 h-px w-36 bg-[#FF6B00]" />

                    {/* Top-left corner */}
                    <span className="absolute left-0 top-0 z-50 h-10 w-10 border-l-2 border-t-2 border-[#00E5FF]" />

                    {/* Top-right corner */}
                    <span className="absolute right-0 top-0 z-50 h-7 w-7 border-r border-t border-white/30" />

                    {/* Bottom-left corner */}
                    <span className="absolute bottom-0 left-0 z-50 h-7 w-7 border-b border-l border-white/30" />

                    {/* Bottom-right corner */}
                    <span className="absolute bottom-0 right-0 z-50 h-10 w-10 border-b-2 border-r-2 border-[#FF6B00]" />

                    {/* Surface lighting */}
                    <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-br from-white/[0.045] via-transparent to-[#00E5FF]/[0.025]" />

                    {/* ==================================================
                      IMAGE AREA — SMALLER + CENTERED
                  ================================================== */}

                    <div className="relative flex flex-col min-h-[240px] items-center justify-center overflow-hidden bg-[#080A0F] p-6 md:min-h-[300px]">
                      {card.image ? (
                        <img
                          src={images[`../assets/images/${card.image}`]}
                          alt={card.title}
                          className="relative z-10 w-64 h-64 rounded-full object-center transition-transform duration-1000 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="relative z-10 flex h-full min-h-[210px] w-full items-center justify-center border border-white/5">
                          <div className="text-center">
                            <p>Image</p>
                          </div>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="mt-3 max-w-2xl font-bold text-lg leading-8 md:text-base md:leading-8">
                          {card.text2}
                        </p>
                      </div>

                      {/* Image glow */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#00E5FF]/10 via-transparent to-[#FF6B00]/10" />

                      {/* Image bottom fade */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816]/60 via-transparent to-transparent" />
                    </div>

                    {/* ==================================================
                      LARGE MESSAGE AREA
                  ================================================== */}

                    <div className="relative z-30 flex flex-col justify-center p-2 md:p-4 lg:p-6">
                      {/* Title */}
                      <h2 className="max-w-2xl text-2xl font-black uppercase tracking-tight md:text-2xl lg:text-3xl">
                        {card.title}
                      </h2>

                      {/* Divider */}
                      <div className="mt-6 flex items-center gap-3">
                        <span className="h-px w-12 bg-[#00E5FF] transition-all duration-500 group-hover:w-24" />

                        <span className="h-1 w-1 bg-[#FF6B00]" />
                      </div>

                      {/* Message */}
                      <p className="mt-7 max-w-2xl text-sm leading-8 text-slate-400 md:text-base md:leading-8">
                        {card.text}
                      </p>

                      {/* Technical bottom information */}
                      <div className="mt-10 flex items-center gap-4">
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
              );
            })}
          </div>
        </section>

        {/* ======================================================
          01 / ABOUT THE EVENT (LEGACY CARD - COMMENTED OUT)
          ======================================================
          <motion.div
            initial={{
              opacity: 0,
              x: -120,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative mx-4 w-auto max-w-6xl overflow-hidden bg-[#080A0F] md:mx-auto"
          >
            <div className="pointer-events-none absolute inset-0 z-20 border border-white/20" />
            <div className="pointer-events-none absolute inset-[4px] z-20 border border-white/5" />
            <span className="absolute left-0 top-0 z-30 h-px w-32 bg-[#00E5FF]" />
            <span className="absolute bottom-0 right-0 z-30 h-px w-32 bg-[#FF6B00]" />
            <span className="absolute left-0 top-0 z-30 h-9 w-9 border-l-2 border-t-2 border-[#00E5FF]" />
            <span className="absolute bottom-0 right-0 z-30 h-9 w-9 border-b-2 border-r-2 border-[#FF6B00]" />

            <div className="grid min-h-[320px] md:grid-cols-[1.35fr_0.65fr]">
              <div className="flex flex-col justify-center p-4 md:mx-auto md:p-12 lg:p-14">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#FF6B00]">
                  01 / About The Event
                </span>

                <h2 className="mt-4 text-3xl font-black uppercase tracking-tight text-white md:text-4xl lg:text-5xl">
                  Yantrotsav
                </h2>

                <h4 className="text-sm text-slate-300 md:text-base">
                  <i>Where Tech Meets Innovation</i>
                </h4>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                  YANTROTSAV 2026 is a university-level technology fest organised by the
                  Department of Computer Science & Engineering, Central University of
                  Jammu, as part of the celebration of Engineers' Day. The fest brings
                  together students for technical, creative, analytical and competitive
                  activities.
                </p>

                <div className="mt-8 flex items-center gap-3">
                  <span className="h-px w-12 bg-[#00E5FF] transition-all duration-500 group-hover:w-24" />

                  <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-700">
                    Yantrotsav / 2026
                  </span>
                </div>
              </div>

              <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden bg-[#050816] p-4">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-80 w-80 object-contain"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#00E5FF]/10 via-transparent to-[#FF6B00]/10" />
              </div>
            </div>
          </motion.div>
          ====================================================== */}

        {/* ======================================================
          Watcher HEADING
      ====================================================== */}

        <section className="mx-auto mt-6 flex items-center justify-center max-w-[1400px] px-5 pb-4 md:px-8 md:pb-10">
          <motion.div
            initial={{
              opacity: 0,
              y: 50,
              scale: 0.95,
              filter: "blur(8px)",
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative border-b border-white/10 pb-7"
          >
            <span className="font-mono  text-[9px] uppercase tracking-[0.25em] text-[#FF6B00]">
              03 / The Watcher
            </span>

            <h2 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-6xl">
              Our Convenors
            </h2>

            <span className="absolute bottom-[-1px] left-0 h-px w-20 bg-[#00E5FF]" />
          </motion.div>
        </section>

        {/* ======================================================
          Watcher CARDS
      ====================================================== */}

        <section className="mx-auto max-w-[1400px]  px-5 pb-15 md:px-8 md:pb-10">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((card, index) => {
              const animation =
                index === 0
                  ? revealFromLeft
                  : index === 1
                    ? revealFromDepth
                    : revealFromRight;

              const accent =
                card.accent === "cyan"
                  ? "#00E5FF"
                  : card.accent === "orange"
                    ? "#FF6B00"
                    : "#7C3AED";

              return (
                <motion.article
                  key={card.title}
                  variants={animation}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: isMobile ? 0.4 : 0.85,
                    delay: index * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    perspective: isMobile ? "none" : 1200,
                  }}
                  className="group relative"
                >
                  {/* Deep shadow */}
                  <div className="absolute inset-2 translate-x-4 translate-y-4 bg-black/70 blur-[1px]" />

                  {/* Top-left triangular shadow */}
                  <span
                    style={{
                      borderRightColor: `${accent}66`,
                    }}
                    className="absolute -left-2 -top-2 z-0 h-0 w-0 border-b-[22px] border-r-[22px] border-b-transparent"
                  />

                  {/* Bottom-right triangular shadow */}
                  <span
                    style={{
                      borderLeftColor: `${accent}44`,
                    }}
                    className="absolute -bottom-2 -right-2 z-0 h-0 w-0 border-t-[22px] border-l-[22px] border-t-transparent"
                  />

                  {/* Watcher card */}
                  <div className="relative z-10 overflow-hidden bg-[#080A0F] shadow-[0_15px_35px_rgba(0,0,0,0.35)] transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.55)]">
                    {/* Outer frame */}
                    <div className="pointer-events-none absolute inset-0 z-40 border border-white/20" />

                    {/* Inner frame */}
                    <div className="pointer-events-none absolute inset-[4px] z-40 border border-white/5" />

                    {/* Accent line */}
                    <span
                      style={{
                        backgroundColor: accent,
                      }}
                      className="absolute left-0 top-0 z-50 h-px w-28"
                    />

                    {/* Corner brackets */}
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

                    {/* Surface lighting */}
                    <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.01]" />

                    {/* Feature image */}
                    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#080A0F] p-5">
                      {card.image ? (
                        <img
                          src={images[`../assets/images/${card.image}`]}
                          alt={card.title}
                          className="relative z-10 h-full w-full object-contain object-center transition-transform duration-1000 ease-out group-hover:scale-105"
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

                      {/* Accent overlay */}
                      <div
                        style={{
                          background: `linear-gradient(135deg, ${accent}18, transparent 50%, ${accent}12)`,
                        }}
                        className="pointer-events-none absolute inset-0"
                      />

                      {/* Bottom fade */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816]/80 via-transparent to-transparent" />

                      <span className="absolute bottom-4 left-5 z-10 font-mono text-[8px] uppercase tracking-[0.2em] text-white/40">
                        YT / 0{index + 1}
                      </span>
                    </div>

                    {/* Watcher content */}
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

                      {/* Bottom technical line */}
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
              );
            })}
          </div>
        </section>
      </div>
      )
    </>
  );
}

export default Home;
