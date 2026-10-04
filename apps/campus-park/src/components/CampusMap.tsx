import { useMemo } from 'react'
import { LOTS, ME, type Lot } from '../data'
import { freeIn, status, STATUS_COLOR, type Spaces } from '../sensors'

export const MAP_W = 390
export const MAP_H = 620

// Deterministic pseudo-random so buildings don't move between renders.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

/** East–west streets the route can follow (y), and Lasuen St running south from the Oval (x = 196). */
const EW = [132, 250, 372, 520]

const STREETS: { d: string; name?: string; lx?: number; ly?: number; rot?: number }[] = [
  { d: 'M70 0 L196 152', name: 'Palm Dr', lx: 118, ly: 66, rot: 50 },
  { d: 'M196 152 L196 600', name: 'Lasuen St', lx: 202, ly: 486, rot: 90 },
  { d: 'M0 132 C 120 118, 280 118, 390 140', name: 'Campus Dr', lx: 30, ly: 125 },
  { d: 'M20 250 L380 250' },
  { d: 'M10 372 L380 372', name: 'Serra St', lx: 250, ly: 366 },
  { d: 'M120 520 L390 520', name: 'Campus Dr', lx: 330, ly: 514 },
  { d: 'M72 132 L72 470', name: 'Santa Teresa St', lx: 78, ly: 300, rot: 90 },
  { d: 'M350 140 L350 520', name: 'Escondido Rd', lx: 356, ly: 430, rot: 90 },
  { d: 'M240 60 L340 60 L370 0', name: 'Galvez St', lx: 262, ly: 54 },
  { d: 'M280 520 L280 620' },
]

const LAKE = 'M14 600 C 6 530, 50 478, 112 486 S 160 560, 118 604 S 30 630, 14 600 Z'
const STADIUM = { cx: 326, cy: 178, rx: 30, ry: 22 }

function blocked(x: number, y: number, w: number, h: number) {
  const pad = 6
  const hits = (ax: number, ay: number, aw: number, ah: number) => x < ax + aw + pad && x + w > ax - pad && y < ay + ah + pad && y + h > ay - pad
  return (
    LOTS.some((l) => hits(l.x, l.y - 20, l.w, l.h + 20)) ||
    hits(0, 470, 170, 150) || // lake
    hits(160, 150, 72, 200) || // oval + quad
    hits(STADIUM.cx - STADIUM.rx, STADIUM.cy - STADIUM.ry, STADIUM.rx * 2, STADIUM.ry * 2)
  )
}

function buildings() {
  const r = rng(7)
  const out: { x: number; y: number; w: number; h: number }[] = []
  for (let i = 0; i < 400 && out.length < 80; i++) {
    const w = 10 + r() * 22
    const h = 8 + r() * 18
    const x = 6 + r() * (MAP_W - 12 - w)
    const y = 6 + r() * (MAP_H - 12 - h)
    if (blocked(x, y, w, h)) continue
    // Keep buildings off the street grid.
    if (EW.some((ry) => y < ry + 8 && y + h > ry - 8) || [72, 196, 350].some((rx) => x < rx + 8 && x + w > rx - 8)) continue
    if (out.some((b) => x < b.x + b.w + 4 && x + w > b.x - 4 && y < b.y + b.h + 4 && y + h > b.y - 4)) continue
    out.push({ x, y, w, h })
  }
  return out
}

export function CampusMap({
  spaces,
  usable,
  selected,
  onSelect,
  route,
}: {
  spaces: Spaces
  /** Per lot, the space indices the current permit may use right now. */
  usable: Record<string, number[]>
  selected: string | null
  onSelect: (id: string) => void
  route?: Lot | null
}) {
  const blds = useMemo(buildings, [])
  // With a sheet open, slide the map up so the focused lot sits in the visible top half.
  const focus = LOTS.find((l) => l.id === selected)
  const shift = focus ? Math.min(420, Math.max(0, focus.y - 140)) : 0

  return (
    <svg className="map" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Stanford campus map of parking lots">
      <rect width={MAP_W} height={MAP_H} fill="#f4f2df" />
      <g className="pan" style={{ transform: `translateY(${-shift}px)` }}>
        {/* Green spaces */}
        <rect x="90" y="196" width="64" height="40" rx="6" fill="#cfe8b0" />
        <rect x="248" y="428" width="86" height="40" rx="6" fill="#cfe8b0" />
        <ellipse cx="196" cy="196" rx="28" ry="38" fill="#bfe09c" />
        <ellipse {...STADIUM} fill="#cfe8b0" stroke="#b9d79a" strokeWidth="3" />
        <path d={LAKE} fill="#bcb6f2" />

        {STREETS.map((s) => (
          <g key={s.d}>
            <path d={s.d} stroke="#e4e0c8" strokeWidth="11" fill="none" />
            <path d={s.d} stroke="#fff" strokeWidth="8" fill="none" />
          </g>
        ))}
        {blds.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill="#d8d8d4" />
        ))}

        {/* Main Quad */}
        <rect x="168" y="284" width="56" height="54" rx="3" fill="#cfcac0" />
        <rect x="180" y="296" width="32" height="30" fill="#f4f2df" />

        {STREETS.filter((s) => s.name).map((s) => (
          <text key={s.d} x={s.lx} y={s.ly} className="street-label" transform={s.rot ? `rotate(${s.rot} ${s.lx} ${s.ly})` : undefined}>
            {s.name}
          </text>
        ))}
        <text x="196" y="352" textAnchor="middle" className="map-label">Main Quad</text>
        <text x="196" y="200" textAnchor="middle" className="map-label">The Oval</text>
        <text x={STADIUM.cx} y={STADIUM.cy + 3} textAnchor="middle" className="map-label">Stadium</text>
        <text x="66" y="560" className="map-label">Lake Lagunita</text>
        <text x="300" y="604" textAnchor="middle" className="map-label">Escondido Village</text>

        {route && <Route lot={route} />}

        {LOTS.map((lot) => {
          const idx = usable[lot.id]
          const free = freeIn(spaces[lot.id], idx)
          const st = idx.length ? status(free, idx.length) : 'full'
          const isSel = selected === lot.id
          return (
            <g
              key={lot.id}
              className={`lot ${isSel ? 'selected' : ''} ${idx.length ? '' : 'disallowed'}`}
              onClick={() => onSelect(lot.id)}
              role="button"
              tabIndex={0}
              aria-label={`${lot.name}: ${idx.length ? `${free} open for you` : 'not valid for your permit'}`}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(lot.id)}
            >
              <rect x={lot.x} y={lot.y} width={lot.w} height={lot.h} rx="4" fill={idx.length ? STATUS_COLOR[st] : '#eceef2'} className="lot-shape" />
              {lot.garage && <path d={`M${lot.x + 6} ${lot.y + lot.h - 6} L${lot.x + lot.w - 6} ${lot.y + 6}`} stroke="#fff" strokeOpacity=".5" strokeWidth="2" />}
              <g transform={`translate(${lot.x + lot.w / 2} ${lot.y - 9})`} className="lot-pin">
                <rect x="-15" y="-10" width="30" height="18" rx="9" fill="#fff" stroke={idx.length ? STATUS_COLOR[st] : '#b9bcc6'} strokeWidth="2" />
                <text textAnchor="middle" y="3.5" className="lot-count">
                  {idx.length ? free : '–'}
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
  // Down Lasuen St to the nearest east–west street, across, then into the lot.
  const roadY = EW.reduce((best, y) => (Math.abs(y - ty) < Math.abs(best - ty) ? y : best))
  const d = `M${ME.x} ${ME.y} L196 ${roadY} L${tx} ${roadY} L${tx} ${ty}`
  return (
    <g>
      <path d={d} stroke="#2f9e45" strokeWidth="9" fill="none" strokeLinejoin="round" strokeLinecap="round" opacity=".25" />
      <path d={d} stroke="#2f9e45" strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round" className="route" />
    </g>
  )
}
