import { motion } from 'framer-motion'
import poster from '../assets/images/poster.png'
const messageCards = [
  {
    image: 'https://placehold.co/900x600/080A0F/00E5FF?text=Image+01',
    title: 'Message Title One',
    text: 'Add your message or introduction here.',
    className: 'md:ml-[4%]',
  },
  {
    image: 'https://placehold.co/900x600/080A0F/FF6B00?text=Image+02',
    title: 'Message Title Two',
    text: 'Add your message or introduction here.',
    className: 'md:ml-auto md:mr-[4%]',
  },
]

const featureCards = [
  {
    image: 'https://placehold.co/900x600/080A0F/00E5FF?text=Feature+01',
    title: 'Feature One',
    text: 'Add feature information here.',
  },
  {
    image: 'https://placehold.co/900x600/080A0F/FF6B00?text=Feature+02',
    title: 'Feature Two',
    text: 'Add feature information here.',
  },
  {
    image: 'https://placehold.co/900x600/080A0F/7C3AED?text=Feature+03',
    title: 'Feature Three',
    text: 'Add feature information here.',
  },
]

function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* HERO POSTER */}
      <section className="relative w-full pt-[72px]">
        <div className="relative overflow-hidden mx-8 my-8 rounded-xl">
          <img
            src={poster}
            alt="YANTROTSAV event poster"
            className="h-auto w-full object-cover "
          />

          {/* Subtle overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050816]/50" />
        </div>
      </section>

      {/* MESSAGE CARDS */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <div className="space-y-8 md:space-y-[-80px]">
          {messageCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{
                opacity: 0,
                y: 50,
                x: index === 0 ? -30 : 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                x: 0,
              }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                ease: 'easeOut',
              }}
              className={`relative w-full max-w-3xl ${card.className}`}
            >
              <div className="group grid overflow-hidden border border-white/10 bg-[#080A0F] md:grid-cols-2">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={card.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col justify-center p-7 md:p-10">
                  <span className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF6B00]">
                    0{index + 1} / Message
                  </span>

                  <h2 className="text-2xl font-bold uppercase tracking-tight md:text-3xl">
                    {card.title}
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-slate-500">
                    {card.text}
                  </p>

                  <div className="mt-7 h-px w-12 bg-[#FF6B00] transition-all duration-500 group-hover:w-24" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* FEATURE HEADING */}
      <section className="mx-auto max-w-[1400px] px-5 pb-12 md:px-8 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="border-b border-white/10 pb-6"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF6B00]">
            03 / Discover
          </span>

          <h2 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-6xl">
            Explore
          </h2>
        </motion.div>
      </section>

      {/* FEATURE CARDS */}
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-8 md:pb-32">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
              className="group overflow-hidden border border-white/10 bg-[#080A0F]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={card.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#FF6B00]">
                    0{index + 1}
                  </span>

                  <span className="text-xs text-slate-700 transition-colors duration-300 group-hover:text-cyan-400">
                    ↗
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold uppercase tracking-tight">
                  {card.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {card.text}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
