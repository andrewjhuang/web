/**
 * Permit rules, prices and enforcement hours follow Stanford Transportation's
 * permit FAQ and enforcement pages (rates effective Sept 1, 2026). Lot
 * capacities and the map are approximate; occupancy is simulated.
 */

export type Zone = 'A' | 'C' | 'P' | 'MC' | 'EA' | 'ES' | 'EVF' | 'SJ' | 'SO' | 'WE'
export type Permit = 'A' | 'C' | 'MC' | 'EA' | 'ES' | 'EVF' | 'SJ' | 'SO' | 'WE' | 'V'

export const RESIDENTIAL: Zone[] = ['EA', 'ES', 'EVF', 'SJ', 'SO', 'WE']
export const isResidential = (z: Zone) => RESIDENTIAL.includes(z)

export const ZONE_COLOR: Record<Zone | 'V', string> = {
  A: '#4a7bf7',
  C: '#f5a13b',
  P: '#8a6fe0',
  V: '#8a6fe0',
  MC: '#6b7280',
  EA: '#e23f9c',
  ES: '#26b5b5',
  EVF: '#1f8f8f',
  SJ: '#c0569e',
  SO: '#d9668a',
  WE: '#b84fd1',
}

export const ZONE_NAME: Record<Zone, string> = {
  A: 'A',
  C: 'C',
  P: 'Visitor',
  MC: 'Motorcycle',
  EA: 'EA',
  ES: 'ES',
  EVF: 'EVF',
  SJ: 'SJ',
  SO: 'SO',
  WE: 'WE',
}

type PermitInfo = {
  name: string
  short: string
  group: 'Commuter' | 'Resident' | 'Visitor'
  who: string
  validIn: string
  daily?: string
  monthly?: string
  note?: string
}

const resident = (area: string, short: string, validIn: string): PermitInfo => ({
  name: area,
  short,
  group: 'Resident',
  who: 'Students living on campus in this area (not first-years)',
  validIn,
  daily: '$8.25',
  monthly: '$49',
  note: 'Residential spaces are enforced 24/7.',
})

export const PERMITS: Record<Permit, PermitInfo> = {
  A: {
    name: 'Commuter A',
    short: 'A',
    group: 'Commuter',
    who: 'Faculty, staff, sponsored affiliates, commuting students',
    validIn: "'A', 'C' and shared residential spaces",
    daily: '$22.25',
    monthly: '$156',
    note: 'Closest to buildings, generally more available.',
  },
  C: {
    name: 'Commuter C',
    short: 'C',
    group: 'Commuter',
    who: 'Faculty, staff, sponsored affiliates, commuting students (hospital staff hired before 1/1/2023)',
    validIn: "'C' and shared residential spaces",
    daily: '$8.25',
    monthly: '$46',
    note: 'Cheaper, farther out, and fills by mid-morning.',
  },
  MC: {
    name: 'Motorcycle',
    short: 'Moto',
    group: 'Commuter',
    who: 'Anyone with a motorcycle, scooter or moped',
    validIn: "'MC' spaces only (A and C permits also cover 'MC')",
    daily: '$3.75',
    monthly: '$18',
  },
  EA: resident('East campus', 'East', "'EA' spaces"),
  ES: resident('Escondido Village', 'EV', "'ES' spaces"),
  EVF: resident('Escondido Village (EVF)', 'EV-F', "'EVF' and 'ES' spaces"),
  SJ: resident('SJ area', 'SJ', "'SJ' spaces"),
  SO: resident('South campus', 'South', "'SO' spaces"),
  WE: resident('West campus', 'West', "'WE' spaces"),
  V: {
    name: 'Visitor',
    short: 'Visitor',
    group: 'Visitor',
    who: 'Anyone',
    validIn: "Visitor 'P' spaces, paid by the hour in ParkMobile",
    note: 'Visitor spaces are enforced weekdays 8 AM–4 PM.',
  },
}

export type ZoneBlock = { zone: Zone; count: number; /** Commuter A/C permits also valid here. */ shared?: boolean }

export type Lot = {
  id: string
  name: string
  address: string
  zones: ZoneBlock[]
  /** Map position (SVG units) and footprint. */
  x: number
  y: number
  w: number
  h: number
  /** How busy this lot gets relative to campus-wide demand. */
  demand: number
  garage?: boolean
  /** Commuter enforcement ends at this hour (the Oval runs to 6 PM). */
  commuterEnd?: number
}

export const LOTS: Lot[] = [
  { id: 'oval', name: 'Oval', address: 'Palm Dr at the Oval', zones: [{ zone: 'A', count: 26 }], x: 216, y: 168, w: 34, h: 18, demand: 1.1, commuterEnd: 18 },
  { id: 'galvez', name: 'Galvez Lot', address: 'Galvez St', zones: [{ zone: 'C', count: 90 }, { zone: 'P', count: 40 }], x: 262, y: 74, w: 72, h: 30, demand: 0.95 },
  { id: 'roble', name: 'Roble Field Garage', address: '320 Panama St', zones: [{ zone: 'A', count: 110 }, { zone: 'C', count: 130 }, { zone: 'P', count: 80 }, { zone: 'MC', count: 12 }], x: 92, y: 376, w: 56, h: 46, demand: 0.98, garage: true },
  { id: 'tresidder', name: 'Tresidder Lot (L-39)', address: '459 Lagunita Dr', zones: [{ zone: 'P', count: 50 }, { zone: 'A', count: 30 }, { zone: 'C', count: 20 }], x: 176, y: 424, w: 56, h: 28, demand: 1.0 },
  { id: 'wilbur-garage', name: 'Wilbur Field Garage', address: '560 Wilbur Dr', zones: [{ zone: 'A', count: 130 }, { zone: 'C', count: 120 }, { zone: 'P', count: 60 }, { zone: 'MC', count: 10 }], x: 300, y: 368, w: 58, h: 46, demand: 0.9, garage: true },
  { id: 'wilbur', name: 'Wilbur Lot', address: '658 Escondido Rd', zones: [{ zone: 'EA', count: 44 }], x: 300, y: 232, w: 48, h: 24, demand: 0.95 },
  { id: 'branner', name: 'Branner Lot', address: '659 Escondido Rd', zones: [{ zone: 'EA', count: 21 }], x: 292, y: 294, w: 44, h: 22, demand: 1.08 },
  { id: 'cowell', name: 'Cowell Cluster Lot 1', address: '625 Mayfield Ave', zones: [{ zone: 'EA', count: 48 }], x: 298, y: 466, w: 44, h: 26, demand: 0.9 },
  { id: 'evgr', name: 'EVGR-A Lot', address: 'Escondido Village', zones: [{ zone: 'ES', count: 34, shared: true }, { zone: 'EVF', count: 14 }], x: 252, y: 546, w: 62, h: 28, demand: 0.95 },
  { id: 'govco', name: "Governor's Corner Lot", address: 'Santa Teresa St', zones: [{ zone: 'WE', count: 50 }], x: 30, y: 232, w: 34, h: 26, demand: 0.9 },
]

export const capacity = (lot: Lot) => lot.zones.reduce((n, z) => n + z.count, 0)

/** Which zone block a space index falls in. */
export function blockOf(lot: Lot, i: number): ZoneBlock & { start: number } {
  let start = 0
  for (const b of lot.zones) {
    if (i < start + b.count) return { ...b, start }
    start += b.count
  }
  throw new Error(`space ${i} out of range for ${lot.id}`)
}

export function spaceLabel(lot: Lot, i: number) {
  const b = blockOf(lot, i)
  return `${b.zone}-${i - b.start + 1}`
}

/** Is this zone's permit rule in force right now? */
export function enforced(lot: Pick<Lot, 'commuterEnd'>, zone: Zone, hour: number, weekend: boolean) {
  if (isResidential(zone)) return true
  if (weekend) return false
  if (zone === 'P') return hour >= 8 && hour < 16
  return hour >= 6 && hour < (lot.commuterEnd ?? 16)
}

/** Can someone holding `permit` park in this block right now? */
export function canPark(permit: Permit, lot: Lot, block: ZoneBlock, hour: number, weekend: boolean) {
  const z = block.zone
  if (!enforced(lot, z, hour, weekend)) return true
  switch (permit) {
    // A and C also cover 'MC' spaces, but this app guides a car, so motorcycle spaces are left out.
    case 'A':
      return z === 'A' || z === 'C' || !!block.shared
    case 'C':
      return z === 'C' || !!block.shared
    case 'MC':
      return z === 'MC'
    case 'V':
      return z === 'P'
    case 'EVF':
      return z === 'EVF' || z === 'ES'
    default:
      return z === permit
  }
}

/** Indices of spaces `permit` may use right now. */
export function usableIndices(permit: Permit, lot: Lot, hour: number, weekend: boolean) {
  const out: number[] = []
  let start = 0
  for (const b of lot.zones) {
    if (canPark(permit, lot, b, hour, weekend)) for (let i = 0; i < b.count; i++) out.push(start + i)
    start += b.count
  }
  return out
}

/** Where "you" are: the Main Quad. */
export const ME = { x: 196, y: 318 }

export function distanceMi(lot: Lot) {
  const dx = lot.x + lot.w / 2 - ME.x
  const dy = lot.y + lot.h / 2 - ME.y
  return Math.max(0.1, Math.round(Math.hypot(dx, dy) * 0.0042 * 10) / 10)
}

/** Rough drive time on campus roads at ~12 mph. */
export const driveMin = (lot: Lot) => Math.max(1, Math.round(distanceMi(lot) * 5))

const rise = (h: number, at: number, k = 2) => 1 / (1 + Math.exp(-(h - at) * k))
const fall = (h: number, at: number, k = 1.2) => 1 / (1 + Math.exp((h - at) * k))

/** Target occupancy (0–1) for a zone at a given time. */
export function targetOccupancy(lot: Lot, zone: Zone, hour: number, weekend: boolean) {
  let t: number
  if (isResidential(zone)) {
    // Residents' cars sit overnight; some leave during the day.
    t = weekend ? 0.72 : 0.86 - 0.28 * rise(hour, 9) * fall(hour, 17)
  } else if (weekend) {
    t = zone === 'P' ? 0.1 + 0.35 * rise(hour, 10) * fall(hour, 17) : 0.08 + 0.12 * rise(hour, 10) * fall(hour, 18)
  } else if (zone === 'C') {
    t = 0.1 + 0.89 * rise(hour, 8.2, 2.4) * fall(hour, 16.3) // full by mid-morning
  } else if (zone === 'MC') {
    t = 0.08 + 0.6 * rise(hour, 8.5) * fall(hour, 16.5)
  } else if (zone === 'P') {
    t = 0.06 + 0.8 * rise(hour, 9.5) * fall(hour, 16.8)
  } else {
    t = 0.08 + 0.8 * rise(hour, 9, 1.5) * fall(hour, 17.5, 1)
  }
  return Math.min(1, Math.max(0.02, t * lot.demand))
}

export const formatHour = (h: number) => {
  const hr = Math.floor(h)
  const min = Math.round((h - hr) * 60)
  const ampm = hr >= 12 ? 'PM' : 'AM'
  return `${((hr + 11) % 12) + 1}:${String(min).padStart(2, '0')} ${ampm}`
}
