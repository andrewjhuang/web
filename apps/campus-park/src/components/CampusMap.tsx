import { useMemo } from 'react'
import { LOTS, ME, type Lot, type Permit } from '../data'
import { freeCount, status, STATUS_COLOR, type Spaces } from '../sensors'

export const MAP_W = 390
export const MAP_H = 620

// Deterministic pseudo-random so buildings don't move between renders.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const ROADS = [
  'M0 140 L390 128', // Campus Dr (north)
  'M0 540 L390 560', // Campus Dr (south)
  'M196 0 L196 620', // Palm Dr → Lasuen
  'M36 0 L48 620', // Santa Teresa
  'M362 0 L356 620', // Arguello / Escondido
  'M0 400 L390 410', // Escondido Rd
  'M48 250 L362 262', // Serra
]

const LAKE = 'M18 590 C 10 520, 60 470, 120 480 S 150 560, 110 600 S 30 620, 18 590 Z'

const overlaps = (x: number, y: number, w: number, h: number) =>
  LOTS.some((l) => x < l.x + l.w + 6 && x + w > l.x - 6 && y < l.y + l.h + 6 && y + h > l.y - 6) ||
  (x < 170 && y > 460) || // lake
  (Math.abs(x + w / 2 - 196) < 34 && y > 150 && y < 360) // quad + oval
function buildings() {
  const r = rng(42)
  const out: { x: number; y: number; w: number; h: number }[] = []
  for (let i = 0; i < 260 && out.length < 70; i++) {
    const w = 10 + r() * 22
    const h = 8 + r() * 18
    const x = 8 + r() * (MAP_W - 16 - w)
    const y = 8 + r() * (MAP_H - 16 - h)
    if (overlaps(x, y, w, h)) continue
    if (out.some((b) => x < b.x + b.w + 4 && x + w > b.x - 4 && y < b.y + b.h + 4 && y + h > b.y - 4)) continue
    out.push({ x, y, w, h })
  }
  return out
}

export function CampusMap({
  spaces,
  permit,
  selected,
  onSelect,
  route,
}: {
  spaces: Spaces
  permit: Permit
  selected: string | null
  onSelect: (id: string) => void
  route?: Lot | null
}) {
  const blds = useMemo(buildings, [])
  // With a sheet open, slide the map up so the focused lot sits in the visible top half.
  const focus = LOTS.find((l) => l.id === selected)
  const shift = focus ? Math.min(260, Math.max(0, focus.y - 170)) : 0

  return (
    <svg className="map" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Campus map of parking lots">
      <rect width={MAP_W} height={MAP_H} fill="#f4f2df" />
      <g className="pan" style={{ transform: `translateY(${-shift}px)` }}>
      {/* Fields */}
      <rect x="250" y="440" width="90" height="44" rx="6" fill="#cfe8b0" />
      <rect x="70" y="200" width="70" height="40" rx="6" fill="#cfe8b0" />
      <ellipse cx="196" cy="200" rx="30" ry="40" fill="#bfe09c" />
      <path d={LAKE} fill="#bcb6f2" />
      <text x="62" y="560" className="map-label">Lake Lagunita</text>
      {ROADS.map((d) => (
        <g key={d}>
          <path d={d} stroke="#e4e0c8" strokeWidth="11" fill="none" />
          <path d={d} stroke="#fff" strokeWidth="8" fill="none" />
        </g>
      ))}
      {blds.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill="#d8d8d4" />
      ))}
      {/* Main Quad */}
      <rect x="168" y="282" width="56" height="54" rx="3" fill="#cfcac0" />
      <rect x="180" y="294" width="32" height="30" fill="#f4f2df" />
      <text x="196" y="354" textAnchor="middle" className="map-label">Main Quad</text>
      <text x="196" y="204" textAnchor="middle" className="map-label">The Oval</text>

      {route && <Route lot={route} />}

      {LOTS.map((lot) => {
        const free = freeCount(spaces[lot.id])
        const st = status(free, lot.capacity)
        const allowed = lot.permits.includes(permit)
        const isSel = selected === lot.id
        return (
          <g
            key={lot.id}
            className={`lot ${isSel ? 'selected' : ''} ${allowed ? '' : 'disallowed'}`}
            onClick={() => onSelect(lot.id)}
            role="button"
            tabIndex={0}
            aria-label={`${lot.name}: ${free} open`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(lot.id)}
          >
            <rect x={lot.x} y={lot.y} width={lot.w} height={lot.h} rx="4" fill={STATUS_COLOR[st]} className="lot-shape" />
            {lot.garage && <path d={`M${lot.x + 6} ${lot.y + lot.h - 6} L${lot.x + lot.w - 6} ${lot.y + 6}`} stroke="#fff" strokeOpacity=".5" strokeWidth="2" />}
            <g transform={`translate(${lot.x + lot.w / 2} ${lot.y - 9})`} className="lot-pin">
              <rect x="-15" y="-10" width="30" height="18" rx="9" fill="#fff" stroke={STATUS_COLOR[st]} strokeWidth="2" />
              <text textAnchor="middle" y="3.5" className="lot-count">
                {free}
              </text>
            </g>
          </g>
        )
      })}

      {/* You are here */}
      <circle cx={ME.x} cy={ME.y} r="16" fill="#4a7bf7" opacity=".18" className="pulse" />
      <circle cx={ME.x} cy={ME.y} r="7" fill="#4a7bf7" stroke="#fff" strokeWidth="3" />
      </g>
    </svg>
  )
}

function Route({ lot }: { lot: Lot }) {
  const tx = lot.x + lot.w / 2
  const ty = lot.y + lot.h / 2
  // Follow Palm Dr, then the nearest east–west road, then into the lot.
  const roadY = Math.abs(ty - 262) < Math.abs(ty - 410) ? (ty < 200 ? 134 : 258) : 405
  const d = `M${ME.x} ${ME.y} L196 ${roadY} L${tx} ${roadY} L${tx} ${ty}`
  return (
    <g>
      <path d={d} stroke="#2f9e45" strokeWidth="9" fill="none" strokeLinejoin="round" strokeLinecap="round" opacity=".25" />
      <path d={d} stroke="#2f9e45" strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round" className="route" />
    </g>
  )
}
