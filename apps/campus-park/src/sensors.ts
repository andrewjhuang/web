import { useEffect, useRef, useState } from 'react'
import { LOTS, spaceLabel, targetOccupancy } from './data'

/** Occupancy per space, per lot: true = a car is over the sensor. */
export type Spaces = Record<string, boolean[]>

export type SensorEvent = { id: number; lotId: string; label: string; occupied: boolean }

function seed(hour: number): Spaces {
  const out: Spaces = {}
  for (const lot of LOTS) {
    const t = targetOccupancy(lot, hour)
    out[lot.id] = Array.from({ length: lot.capacity }, () => Math.random() < t)
  }
  return out
}

/**
 * Simulates the parking-space sensor network. Every tick, a few spaces in each
 * lot flip, drifting occupancy toward the demand for the current hour.
 */
export function useSensors(hour: number, running: boolean, held: { lotId: string; index: number } | null) {
  const [spaces, setSpaces] = useState<Spaces>(() => seed(hour))
  const [events, setEvents] = useState<SensorEvent[]>([])
  const hourRef = useRef(hour)
  hourRef.current = hour
  const nextId = useRef(0)
  const heldRef = useRef(held)
  heldRef.current = held

  const spacesRef = useRef(spaces)
  spacesRef.current = spaces

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      const fresh: SensorEvent[] = []
      const next: Spaces = {}
      for (const lot of LOTS) {
        const arr = spacesRef.current[lot.id].slice()
        const target = targetOccupancy(lot, hourRef.current)
        const current = arr.filter(Boolean).length / arr.length
        // Bigger gaps between current and target mean more cars arriving or leaving.
        const flips = Math.max(1, Math.round(Math.abs(target - current) * lot.capacity * 0.25))
        for (let k = 0; k < flips; k++) {
          if (Math.random() > 0.55 && Math.abs(target - current) < 0.04) continue
          const wantOccupied = target > current ? Math.random() < 0.85 : Math.random() < 0.15
          const candidates = arr.map((o, i) => (o !== wantOccupied ? i : -1)).filter((i) => i >= 0)
          if (!candidates.length) continue
          const i = candidates[Math.floor(Math.random() * candidates.length)]
          if (heldRef.current?.lotId === lot.id && heldRef.current.index === i) continue
          arr[i] = wantOccupied
          if (fresh.length < 4) fresh.push({ id: nextId.current++, lotId: lot.id, label: spaceLabel(lot, i), occupied: wantOccupied })
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

  /** Force a lot to fill up (used to demo rerouting). */
  const fill = (lotId: string) => {
    const next = { ...spacesRef.current, [lotId]: spacesRef.current[lotId].map(() => true) }
    spacesRef.current = next
    setSpaces(next)
  }

  return { spaces, events, fill }
}

export const freeCount = (spaces: boolean[]) => spaces.filter((o) => !o).length

export function status(free: number, capacity: number): 'open' | 'limited' | 'full' {
  if (free === 0) return 'full'
  if (free / capacity < 0.15 || free <= 3) return 'limited'
  return 'open'
}

export const STATUS_COLOR = { open: '#4cc05f', limited: '#f2c230', full: '#e5534b' }
