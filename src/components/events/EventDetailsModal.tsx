import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { EventDocument } from '../../types/database.types'
import { eventDetails } from './eventDetails'
import { getEventSeatsSummary, isEventFullyBooked } from '../../utils/eventCapacity'

type EventDetailsModalProps = {
  event: EventDocument | null
  isOpen: boolean
  onClose: () => void
}

function EventDetailsModal({
  event,
  isOpen,
  onClose,
}: EventDetailsModalProps) {
  if (!isOpen || !event) return null

  const normalizedTitle = (event.title || '').toLowerCase()
  const details =
    eventDetails[event.$id] ||
    (normalizedTitle.includes('clash') ? eventDetails['6a9e4d60000cbccdb36f'] : undefined) ||
    (normalizedTitle.includes('stack') ? eventDetails['6a9e49bc001a4ecd3542'] : undefined) ||
    (normalizedTitle.includes('detective') ? eventDetails['6a9e4a74000b89971a9f'] : undefined) ||
    (normalizedTitle.includes('pitch') || normalizedTitle.includes('founder') ? eventDetails['6a9e4b2d0000cc64ad18'] : undefined) ||
    (normalizedTitle.includes('finger') || normalizedTitle.includes('fastest') ? eventDetails['6a9e4c730027321e366d'] : undefined) ||
    (normalizedTitle.includes('survivor') ? eventDetails['6a9e4bd800213b95bda6'] : undefined) ||
    (normalizedTitle.includes('robotraverse') || normalizedTitle.includes('traverse') || normalizedTitle.includes('robo') ? eventDetails['6aa40aeb001617df3f25'] : undefined) ||
    (normalizedTitle.includes('idea') || normalizedTitle.includes('wall') ? eventDetails['6a9dabac000299f6032d'] : undefined)

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden border border-white/20 bg-[#080A0F] text-white shadow-[0_25px_80px_rgba(0,0,0,0.7)]"
      >
        <div className="max-h-[85vh] overflow-y-auto p-6 pr-4 sm:p-8 sm:pr-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center border border-white/20 bg-white/5 text-white transition-all hover:border-[#FF6B00] hover:bg-[#FF6B00] hover:text-black"
            aria-label="Close event details"
          >
            <X size={18} />
          </button>

          <div className="mb-8 pr-12">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[#FF6B00]">
              Event Details
            </p>

            <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
              {event.title}
            </h2>
            {(() => {
              const seats = getEventSeatsSummary(event)
              return (
                <p className={`mt-3 font-mono text-[10px] uppercase tracking-[0.18em] ${
                  isEventFullyBooked(event) ? 'text-[#FF6B00]' : 'text-[#00E5FF]'
                }`}>
                  {seats.label}: {seats.display} {seats.unit}
                </p>
              )
            })()}
          </div>

          {details ? (
            <div className="space-y-8">
              <section>
                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#00E5FF]">
                  About the Event
                </h3>

                <p className="text-sm leading-7 text-white/70">
                  {details.about}
                </p>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#00E5FF]">
                  Instructions
                </h3>

                <ul className="space-y-3">
                  {details.instructions.map((instruction, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-sm leading-6 text-white/70"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#FF6B00]" />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : (
            <p className="text-sm text-white/50">
              Event details will be available soon.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default EventDetailsModal