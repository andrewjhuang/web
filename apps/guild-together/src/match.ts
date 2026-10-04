import type { Person, Profile } from './data'

export type Match = {
  person: Person
  score: number
  sharedCourses: string[]
  sharedSlots: string[]
  sharedInterests: string[]
  sameRole: boolean
}

const intersect = (a: string[], b: string[]) => a.filter((x) => b.includes(x))

/**
 * Study-buddy score (0–100). Shared courses matter most, then whether you can
 * actually meet, then the small things you'd bond over.
 */
export function scoreMatch(me: Profile, person: Person): Match {
  const sharedCourses = intersect(me.courses, person.courses)
  const sharedSlots = intersect(me.availability, person.availability)
  const sharedInterests = intersect(me.interests, person.interests)
  const sameRole = me.role === person.role

  const courseScore = Math.min(1, sharedCourses.length / Math.max(1, Math.min(me.courses.length, 2)))
  const timeScore = Math.min(1, sharedSlots.length / 3)
  const interestScore = Math.min(1, sharedInterests.length / 2)

  const score = Math.round(100 * (0.5 * courseScore + 0.3 * timeScore + 0.15 * interestScore + 0.05 * (sameRole ? 1 : 0)))

  return { person, score, sharedCourses, sharedSlots, sharedInterests, sameRole }
}

/** Only people who share at least one course are study buddies. */
export function rankMatches(me: Profile, people: Person[]): Match[] {
  return people
    .map((p) => scoreMatch(me, p))
    .filter((m) => m.sharedCourses.length > 0)
    .sort((a, b) => b.score - a.score || a.person.name.localeCompare(b.person.name))
}
