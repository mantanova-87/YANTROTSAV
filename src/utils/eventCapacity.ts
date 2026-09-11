import type { EventDocument } from '../types/database.types'

export function isTeamEvent(event: Pick<EventDocument, 'eventType' | 'format' | 'minTeamSize'>): boolean {
  return (event.eventType || event.format) === 'team' || (event.minTeamSize || 1) > 1
}

/** Max teams (team events) or max solo seats. 0 means no cap. */
export function getEventSlotLimit(event: Pick<EventDocument, 'maxTeamsAllowed' | 'maxTeams'>): number {
  const max = Number(event.maxTeamsAllowed ?? event.maxTeams ?? 0)
  return Number.isFinite(max) && max > 0 ? max : 0
}

export function isEventFullyBooked(
  event: Pick<EventDocument, 'maxTeamsAllowed' | 'maxTeams' | 'currentRegistrations'>,
): boolean {
  const max = getEventSlotLimit(event)
  if (!max) return false
  return Number(event.currentRegistrations || 0) >= max
}

export function isEventDeadlinePassed(
  event: Pick<EventDocument, 'registrationDeadline'>,
): boolean {
  return Boolean(
    event.registrationDeadline && new Date(event.registrationDeadline).getTime() < Date.now(),
  )
}

export function getEventSeatsSummary(
  event: Pick<EventDocument, 'eventType' | 'format' | 'minTeamSize' | 'maxTeamsAllowed' | 'maxTeams' | 'currentRegistrations'>,
): {
  enrolled: number
  total: number
  remaining: number | null
  unit: string
  remainingUnit: string
  label: string
  display: string
} {
  const enrolled = Number(event.currentRegistrations || 0)
  const total = getEventSlotLimit(event)
  const team = isTeamEvent(event)
  const remaining = total ? Math.max(0, total - enrolled) : null
  const unit = team ? 'teams' : 'students'
  const remainingUnit = remaining === 1 ? (team ? 'team' : 'student') : unit
  const label = team ? 'Teams enrolled' : 'Students enrolled'
  return {
    enrolled,
    total,
    remaining,
    unit,
    remainingUnit,
    label,
    display: total ? `${enrolled} / ${total}` : `${enrolled}`,
  }
}
