import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { FaInstagram, FaWhatsapp, FaLinkedin } from "react-icons/fa6";
import { BiLogoGmail } from "react-icons/bi";
import mantavya from "../assets/images/mantavya.jpeg";
import mehak from "../assets/images/mehak.png";
import priyanshu from "../assets/images/priyanshu.jpeg";
import abhinav from "../assets/images/abhinav.png";
import Harsh from "../assets/images/Harsh.jpeg";
const images = import.meta.glob(
  '../assets/images/*',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>
const teamMembers = [
  {
    name: "ABHINAV KUMAR",
    designation: "",
    email: "25BECCS04.cse@cujammu.ac.in",
    instagram: "https://www.instagram.com/the_abhinav__singh",
    linkedin: "https://www.linkedin.com/in/abhinav-kumar-4a9336382",
    whatsapp: "https://wa.me/+919693291146",
    image: abhinav,
  },
  {
    name: "HARSH SAXENA",
    designation: "",
    email: "25BECCS76.cse@cujammu.ac.in",
    instagram: "https://www.instagram.com/its_saxena_harsh",
    linkedin: "https://www.linkedin.com/in/harshsaxena1409",
    whatsapp: "https://wa.me/919045898320",
    image: Harsh,
  },
  {
    name: "MANTVAYA KUMAR",
    designation: "",
    email: "25BECCS43.cse@cujammu.ac.in",
    instagram: "https://www.instagram.com/mantanova_87?stkn=ZzAycDlvMDM3NW5l",
    linkedin: "https://www.linkedin.com/in/mantavyakumar7487",
    whatsapp: "https://wa.me/918862962250",
    image: mantavya,
  },
  {
    name: "PRIYANSHU GUPTA",
    designation: "",
    email: "priyanshuguptawebdev@gmail.com",
    instagram: "https://www.instagram.com/priyanshu_perhaps/",
    linkedin: "https://www.linkedin.com/in/techyyp/",
    whatsapp: "https://wa.me/919341803923",
    image: priyanshu,
  },
  {
    name: "MEHAK SHARMA",
    designation: "",
    email: "25BECCS46.cse@cujammu.ac.in",
    instagram: "https://www.instagram.com/9613mehak",
    linkedin: "https://www.linkedin.com/in/mehak-sharma-cyber",
    whatsapp: "", //https://wa.me/919906814723
    image: mehak,
  }, 
];
const clubMembers = [
  {
    title: "KUMAR SACHIN",
    text: "GDG on Campus Lead",
    image: 'sachin.jpg',
    accent:"cyan"
  },
  {
    title: "SUKHVINDER SINGH DHIMAN",
    text: "Cyber-CUJ Lead",
    image: 'sukhvinder.jpeg',
    accent:"orange"
  },


];


const stripCount = 5;

function TeamMemberCard({
  member,
  index,
}: {
  member: (typeof teamMembers)[number];
  index: number;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={
        reducedMotion ? { opacity: 1 } : { opacity: 0, y: 35, scale: 0.97 }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reducedMotion ? 0 : 0.7,
        delay: reducedMotion ? 0 : index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative mx-auto w-full max-w-[360px] ${index % 2 === 1 ? "lg:translate-y-12" : ""
        }`}
    >
      {/* Card frame */}
      <div className="relative overflow-hidden bg-[#080A0F]">
        {/* Cyan corner */}
        <span className="pointer-events-none absolute left-0 top-0 z-50 h-7 w-7 border-l-2 border-t-2 border-[#00E5FF]" />

        {/* Orange corner */}
        <span className="pointer-events-none absolute right-0 top-0 z-50 h-7 w-7 border-r-2 border-t-2 border-[#FF6B00]" />

        <span className="pointer-events-none absolute bottom-0 left-0 z-50 h-7 w-7 border-b-2 border-l-2 border-[#00E5FF]" />

        <span className="pointer-events-none absolute bottom-0 right-0 z-50 h-7 w-7 border-b-2 border-r-2 border-[#FF6B00]" />

        {/* Actual visible content */}
        <div className="relative z-10">
          {/* Image */}
          <div className="relative flex h-[250px] items-center justify-center overflow-hidden bg-[#0B0E15]">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="absolute left-4 top-4 font-mono text-[8px] uppercase tracking-[0.2em] text-slate-600">
              ID / 0{index + 1}
            </div>

            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="relative z-10 h-full w-full max-h-full max-w-full object-contain p-5 transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="relative z-10 flex h-28 w-28 items-center justify-center border border-white/10">
                <span className="font-mono text-4xl font-bold text-slate-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 h-px w-full bg-white/10" />
          </div>

          {/* Details */}
          <div className="relative p-5">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#00E5FF]">
                Team Member
              </span>

              <span className="font-mono text-[8px] text-slate-600">
                0{index + 1} / 06
              </span>
            </div>

            <h2 className="text-center text-2xl font-black uppercase tracking-tight text-white">
              {member.name}
            </h2>

            <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FF6B00]">
              {member.designation}
            </p>

            {/* Social links */}
            <div className="mt-4 flex justify-center gap-2">
              <a
                href={member.instagram}
                aria-label={`${member.name} Instagram`}
                className="flex h-8 w-8 items-center justify-center border border-white/10 text-[9px] font-bold text-slate-500 transition-all duration-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
              >
                <FaInstagram />
              </a>

              <a
                href={member.linkedin}
                aria-label={`${member.name} LinkedIn`}
                className="flex h-8 w-8 items-center justify-center border border-white/10 text-[9px] font-bold text-slate-500 transition-all duration-300 hover:border-[#00E5FF] hover:text-[#00E5FF]"
              >
                <FaLinkedin />
              </a>

              <a
                href={member.whatsapp}
                aria-label={`${member.name} WhatsApp`}
                className="flex h-8 w-8 items-center justify-center border border-white/10 text-slate-500 transition-all duration-300 hover:border-[#00E5FF] hover:text-[#00E5FF]"
              >
                <FaWhatsapp />
              </a>

              <a
                href={`mailto:${member.email}`}
                aria-label={`Email ${member.name}`}
                className="flex h-8 w-8 items-center justify-center border border-white/10 text-slate-500 transition-all duration-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
              >
                <BiLogoGmail />
              </a>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
              <span className="h-1.5 w-1.5 bg-[#FF6B00]" />

              <span className="truncate font-mono text-[8px] uppercase tracking-[0.1em] text-slate-600">
                {member.email}
              </span>
            </div>
          </div>
        </div>

        {/* PAPER STRIPS — overlay only */}
        {!reducedMotion &&
          Array.from({ length: stripCount }).map((_, strip) => {
            const fromLeft = strip % 2 === 0;

            return (
              <motion.div
                key={strip}
                initial={{
                  x: fromLeft ? "-110%" : "110%",
                  rotateZ: fromLeft ? -3 : 3,
                  opacity: 1,
                }}
                whileInView={{
                  x: 0,
                  rotateZ: 0,
                  opacity: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.7,
                  delay: strip * 0.13,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="pointer-events-none absolute left-0 right-0 z-30 bg-[#0B0E15]"
                style={{
                  top: `${strip * 20}%`,
                  height: "20.5%",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  className={`absolute top-1/2 h-px w-10 ${fromLeft ? "left-4 bg-[#00E5FF]" : "right-4 bg-[#FF6B00]"
                    }`}
                />
              </motion.div>
            );
          })}

        {/* Hover edge */}
        <div className="pointer-events-none absolute inset-0 z-40 border border-white/10 transition-colors duration-500 group-hover:border-white/20" />
      </div>
    </motion.article>
  );
}

export default function OurTeam() {
  useEffect(() => {
    document.title = "YANTROTSAV | Team";
  }, []);
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <main className="min-h-screen bg-[#050816] text-[#F8FAFC]">
      {/* Header */}
      <section className="mx-auto max-w-[1400px] px-5 pb-12 pt-28 md:px-8 md:pb-16 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative border-b border-white/10 pb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#00E5FF]" />

            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF6B00]">
              3.1 / Team
            </span>

            <span className="h-px w-8 bg-[#FF6B00]" />
          </div>

          <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
            Meet The Team
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-slate-500 md:text-sm">
            The people behind Yantrotsav 2026 — building, organizing and shaping
            the experience.
          </p>
        </motion.div>
      </section>

      {/* Team Grid */}
      <section className="mx-auto max-w-[1200px] px-5 pb-24 md:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-24">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={member.name} member={member} index={index} />
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-5 pb-12 pt-28 md:px-8 md:pb-16 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative border-b border-white/10 pb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#00E5FF]" />

            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF6B00]">
              3.2 / Clubs of Department
            </span>

            <span className="h-px w-8 bg-[#FF6B00]" />
          </div>

          <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
            CLUB REPRESENTATIVES
          </h1>
        </motion.div>
      </section>
      <section className="mx-auto max-w-[900px] px-5 pb-16 md:px-8 md:pb-10">
      
                <div className="grid gap-20 ml-4 mr-4 md:grid-cols-2 lg:grid-cols-2">
      
                  {clubMembers.map((card, index) => {
      
                    
      
                    const accent =
                      card.accent === 'cyan'
                        ? '#00E5FF'
                        : card.accent === 'orange'
                          ? '#FF6B00'
                          : '#7C3AED'
      
                    return (
                      <motion.article
                        key={card.title}
                        
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
                                className="relative z-10 h-64 w-64  object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
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
                              className="pointer-events-none absolute "
                            />
      
                            <div className="pointer-events-none absolute  bg-gradient-to-t from-[#050816]/80 via-transparent to-transparent" />
      
      
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
      
    </main>
  );
}
