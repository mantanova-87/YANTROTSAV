import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CyberLoaderProps {
  variant?: 'fullscreen' | 'inline' | 'overlay'
  text?: string
  subtext?: string
  size?: 'sm' | 'md' | 'lg'
}

const TELEMETRY_MESSAGES = [
  'INITIALIZING SYSTEM PROTOCOLS...',
  'CALIBRATING QUANTUM SENSORS...',
  'DECRYPTING FESTIVAL TELEMETRY...',
  'SYNCING YANTROTSAV GRID 2026...',
  'ESTABLISHING SECURE BUFFER...',
]

export const CyberLoader: React.FC<CyberLoaderProps> = ({
  variant = 'inline',
  text,
  subtext,
  size = 'md',
}) => {
  const [telemetryIndex, setTelemetryIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryIndex((prev) => (prev + 1) % TELEMETRY_MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  const displayText = text || TELEMETRY_MESSAGES[telemetryIndex]

  const sizeDimensions = {
    sm: { box: 'w-12 h-12', core: 'w-4 h-4', font: 'text-[9px]' },
    md: { box: 'w-24 h-24', core: 'w-8 h-8', font: 'text-xs' },
    lg: { box: 'w-36 h-36', core: 'w-12 h-12', font: 'text-sm' },
  }[size]

  const loaderVisual = (
    <div className="flex flex-col items-center justify-center gap-5">
      {/* HUD Reactor Core */}
      <div className={`relative ${sizeDimensions.box} flex items-center justify-center`}>
        {/* Outer Rotating Hex Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-[#00E5FF]/40"
        />

        {/* Counter-rotating Brackets */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-1 rounded-full border-2 border-transparent border-t-[#FF6B00] border-b-[#00E5FF]"
        />

        {/* Corner Cyber Brackets */}
        <span className="absolute -left-1 -top-1 h-3 w-3 border-l-2 border-t-2 border-[#00E5FF]" />
        <span className="absolute -right-1 -top-1 h-3 w-3 border-r-2 border-t-2 border-[#FF6B00]" />
        <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-[#FF6B00]" />
        <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-[#00E5FF]" />

        {/* Pulsing Core */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.7, 1, 0.7],
            boxShadow: [
              '0 0 10px rgba(0, 229, 255, 0.3)',
              '0 0 25px rgba(255, 107, 0, 0.6)',
              '0 0 10px rgba(0, 229, 255, 0.3)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`${sizeDimensions.core} bg-gradient-to-tr from-[#00E5FF] to-[#FF6B00]`}
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
        />

        {/* Scanline Crosshair */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
          <div className="h-full w-[1px] bg-cyan-400" />
          <div className="absolute h-[1px] w-full bg-cyan-400" />
        </div>
      </div>

      {/* Futuristic Telemetry readout */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-ping bg-[#00E5FF]" />
          <AnimatePresence mode="wait">
            <motion.p
              key={displayText}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={`font-mono ${sizeDimensions.font} font-bold uppercase tracking-[0.25em] text-[#00E5FF]`}
            >
              {displayText}
            </motion.p>
          </AnimatePresence>
        </div>

        {subtext ? (
          <p className="mt-1 font-mono text-[10px] tracking-wider text-slate-400">{subtext}</p>
        ) : (
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="h-0.5 w-8 bg-[#00E5FF]/40" />
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-500">
              CORE STATUS // ONLINE
            </span>
            <span className="h-0.5 w-8 bg-[#FF6B00]/40" />
          </div>
        )}
      </div>
    </div>
  )

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816] px-4 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-black" />
        <div className="relative z-10">{loaderVisual}</div>
      </div>
    )
  }

  if (variant === 'overlay') {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#050816]/85 backdrop-blur-sm p-4 text-white">
        <div className="relative z-10">{loaderVisual}</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[220px] w-full items-center justify-center py-10 text-white">
      {loaderVisual}
    </div>
  )
}

export default CyberLoader
