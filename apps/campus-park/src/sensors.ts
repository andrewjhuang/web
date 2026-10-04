import { useEffect, useRef, useState } from 'react'
import { LOTS, spaceLabel, targetOccupancy } from './data'

/** Occupancy per space, per lot: true = a car is over the sensor. */
export type Spaces = Record<string, boolean[]>

export type SensorEvent = { id: number; lotId: string; label: string; occupied: boolean }

function seed(hour: number, weekend: boolean): Spaces {
  const out: Spaces = {}
  for (const lot of LOTS) {
    out[lot.id] = lot.zones.flatMap((b) => {
      const t = targetOccupancy(lot, b.zone, hour, weekend)
      return Array.from({ length: b.count }, () => Math.random() < t)
    })
  }
  return out
}

/**
 * Simulates the parking-space sensor network. Every tick, a few spaces in each
 * zone flip, drifting occupancy toward that zone's demand at the current time.
 */
export function useSensors(hour: number, weekend: boolean, running: boolean, held: { lotId: string; index: number } | null) {
  const [spaces, setSpaces] = useState<Spaces>(() => seed(hour, weekend))
  const [events, setEvents] = useState<SensorEvent[]>([])
  const clock = useRef({ hour, weekend })
  clock.current = { hour, weekend }
  const heldRef = useRef(held)
  heldRef.current = held
  const nextId = useRef(0)
  const spacesRef = useRef(spaces)
  spacesRef.current = spaces

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      const fresh: SensorEvent[] = []
      const next: Spaces = {}
      const { hour, weekend } = clock.current
      for (const lot of LOTS) {
        const arr = spacesRef.current[lot.id].slice()
        const isHeld = (i: number) => heldRef.current?.lotId === lot.id && heldRef.current.index === i
        let start = 0
        for (const b of lot.zones) {
          const idx = Array.from({ length: b.count }, (_, k) => start + k)
          const target = targetOccupancy(lot, b.zone, hour, weekend)
          const current = idx.filter((i) => arr[i]).length / b.count
          const gap = target - current
          // Bigger gaps between current and target mean more cars arriving or leaving.
          const flips = Math.round(Math.abs(gap) * b.count * 0.25) + (Math.random() < 0.5 ? 1 : 0)
          for (let k = 0; k < flips; k++) {
            const wantOccupied = Math.abs(gap) < 0.03 ? Math.random() < 0.5 : gap > 0 ? Math.random() < 0.85 : Math.random() < 0.15
            const candidates = idx.filter((i) => arr[i] !== wantOccupied && !isHeld(i))
            if (!candidates.length) continue
            const i = candidates[Math.floor(Math.random() * candidates.length)]
            arr[i] = wantOccupied
            if (fresh.length < 4) fresh.push({ id: nextId.current++, lotId: lot.id, label: spaceLabel(lot, i), occupied: wantOccupied })
          }
          start += b.count
        }
        if (heldRef.current?.lotId === lot.id) arr[heldRef.current.index] = true
        next[lot.id] = arr
      }
      spacesRef.current = next
      setSpaces(next)
      if (fresh.length) setEvents((e) => [...fresh, ...e].slice(0, 30))
    }, 1400)
    return () => clearInterval(t)
  }, [running])

  /** Fill the given spaces (used to demo rerouting). */
  const fill = (lotId: string, indices: number[]) => {
    const arr = spacesRef.current[lotId].slice()
    for (const i of indices) arr[i] = true
    const next = { ...spacesRef.current, [lotId]: arr }
    spacesRef.current = next
    setSpaces(next)
  }

  return { spaces, events, fill }
}

export const freeIn = (spaces: boolean[], indices: number[]) => indices.filter((i) => !spaces[i]).length

export function status(free: number, total: number): 'open' | 'limited' | 'full' {
  if (free === 0) return 'full'
  if (free / total < 0.15 || free <= 3) return 'limited'
  return 'open'
}

export const STATUS_COLOR = { open: '#4cc05f', limited: '#f2c230', full: '#e5534b' }
