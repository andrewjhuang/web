export type Permit = 'A' | 'C' | 'EA' | 'ES' | 'V'

export const PERMITS: Record<Permit, { label: string; color: string }> = {
  A: { label: 'A · Faculty', color: '#4a7bf7' },
  C: { label: 'C · Staff & commuter', color: '#f5a13b' },
  EA: { label: 'EA · Undergrad resident', color: '#e23f9c' },
  ES: { label: 'ES · Grad resident', color: '#3fc4c4' },
  V: { label: 'V · Visitor', color: '#9b6bdb' },
}

export type Lot = {
  id: string
  name: string
  address: string
  permits: Permit[]
  capacity: number
  /** Map position (SVG units) and footprint. */
  x: number
  y: number
  w: number
  h: number
  /** How busy this lot gets relative to campus-wide demand. */
  demand: number
  /** Hour at which demand peaks here. */
  peak: number
  garage?: boolean
}

export const LOTS: Lot[] = [
  { id: 'branner', name: 'Branner Lot', address: '659 Escondido Rd, Stanford', permits: ['EA'], capacity: 21, x: 236, y: 196, w: 44, h: 22, demand: 1.08, peak: 12 },
  { id: 'wilbur', name: 'Wilbur Lot', address: '658 Escondido Rd, Stanford', permits: ['C', 'EA', 'ES'], capacity: 60, x: 300, y: 282, w: 50, h: 30, demand: 0.6, peak: 11 },
  { id: 'wilbur-garage', name: 'Wilbur Field Garage', address: '615 Arguello Way, Stanford', permits: ['C', 'EA', 'ES'], capacity: 320, x: 292, y: 372, w: 58, h: 46, demand: 0.78, peak: 10, garage: true },
  { id: 'evgr', name: 'EVGR-A Lot', address: '738 Campus Dr, Stanford', permits: ['ES'], capacity: 40, x: 288, y: 500, w: 52, h: 26, demand: 0.92, peak: 20 },
  { id: 'cowell', name: 'Cowell Cluster Lot 1', address: '625 Mayfield Ave, Stanford', permits: ['C', 'EA'], capacity: 48, x: 78, y: 170, w: 48, h: 26, demand: 0.85, peak: 13 },
  { id: 'roble', name: 'Roble Field Garage', address: '351 Santa Teresa St, Stanford', permits: ['A', 'C', 'EA'], capacity: 280, x: 56, y: 318, w: 56, h: 46, demand: 0.95, peak: 10, garage: true },
  { id: 'tresidder', name: 'Tresidder Lot', address: '459 Lagunita Dr, Stanford', permits: ['A', 'C'], capacity: 54, x: 148, y: 438, w: 50, h: 26, demand: 1.0, peak: 12 },
  { id: 'galvez', name: 'Galvez Visitor Lot', address: '395 Galvez St, Stanford', permits: ['V'], capacity: 70, x: 214, y: 70, w: 70, h: 28, demand: 0.7, peak: 14 },
]

/** Where "you" are: the Main Quad. */
export const ME = { x: 196, y: 318 }

export function distanceMi(lot: Lot) {
  const dx = lot.x + lot.w / 2 - ME.x
  const dy = lot.y + lot.h / 2 - ME.y
  return Math.max(0.1, Math.round(Math.hypot(dx, dy) * 0.0042 * 10) / 10)
}

/** Rough drive time on campus roads at ~12 mph. */
export const driveMin = (lot: Lot) => Math.max(1, Math.round(distanceMi(lot) * 5))

/** Target occupancy (0–1) for a lot at a given hour, from a simple daily demand curve. */
export function targetOccupancy(lot: Lot, hour: number) {
  const day = Math.exp(-((hour - lot.peak) ** 2) / 10)
  const base = hour < 6 || hour > 22 ? 0.12 : 0.22
  return Math.min(1, Math.max(0.03, (base + 0.78 * day) * lot.demand))
}

export const formatHour = (h: number) => {
  const hr = Math.floor(h)
  const min = Math.round((h - hr) * 60)
  const ampm = hr >= 12 ? 'PM' : 'AM'
  return `${((hr + 11) % 12) + 1}:${String(min).padStart(2, '0')} ${ampm}`
}

/** Space labels like "A7": rows of 10 for surface lots, levels for garages. */
export function spaceLabel(lot: Lot, i: number) {
  if (lot.garage) return `L${Math.floor(i / 80) + 1}-${(i % 80) + 1}`
  return `${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 1}`
}
