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
