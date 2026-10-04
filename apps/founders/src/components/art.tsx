import { useId } from 'react'
import type { LocationId } from '../data'

/** 8-point star, as on the star curtain behind Pacifica at the 1939 Exposition. */
export function starPath(cx: number, cy: number, r: number) {
  const pts: string[] = []
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : r * 0.45
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

/** The Founders cypress, redrawn as a wind-shaped Monterey cypress. */
export function Cypress({ color = 'currentColor', size = 40 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <path
        d="M6 20c2-9 14-13 24-11 6-5 18-4 24 2 6 1 9 6 6 10-3 4-10 4-15 3-4 3-11 4-17 2-6 2-15 2-19-1-2-1-3-3-3-5z"
        fill={color}
      />
      <path d="M30 24c1 9-1 18-6 26-2 3-1 6 3 6h10c3 0 4-3 2-6-4-7-5-15-4-24z" fill={color} />
      <path d="M33 30c4-2 8-2 11 0" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/** Oval crest, in the style of a 1930s souvenir-menu trademark. */
export function Crest({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 100" width={size * 0.8} height={size} aria-hidden className="crest">
      <ellipse cx="40" cy="54" rx="34" ry="42" fill="var(--pacific)" stroke="var(--ink)" strokeWidth="2.5" />
      <ellipse cx="40" cy="54" rx="29" ry="37" fill="none" stroke="var(--paper)" strokeWidth="1.2" />
      <g transform="translate(16 30)">
        <svg viewBox="0 0 64 64" width="48" height="48">
          <path d="M6 20c2-9 14-13 24-11 6-5 18-4 24 2 6 1 9 6 6 10-3 4-10 4-15 3-4 3-11 4-17 2-6 2-15 2-19-1-2-1-3-3-3-5z" fill="var(--paper)" />
          <path d="M30 24c1 9-1 18-6 26-2 3-1 6 3 6h10c3 0 4-3 2-6-4-7-5-15-4-24z" fill="var(--paper)" />
        </svg>
      </g>
      <path d="M22 84q18 8 36 0" stroke="var(--marigold)" strokeWidth="2.5" fill="none" />
      <rect x="28" y="2" width="24" height="12" rx="2" fill="var(--ink)" />
      <path d={starPath(40, 8, 4.5)} fill="var(--marigold)" />
    </svg>
  )
}

export function StarPattern({ id, bg = 'var(--pacific)', fg = 'var(--paper)', size = 26 }: { id: string; bg?: string; fg?: string; size?: number }) {
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
      <rect width={size} height={size} fill={bg} />
      <path d={starPath(size / 2, size / 2, size * 0.32)} fill={fg} opacity="0.9" />
      <path d={starPath(0, 0, size * 0.14)} fill={fg} opacity="0.55" />
      <path d={starPath(size, 0, size * 0.14)} fill={fg} opacity="0.55" />
      <path d={starPath(0, size, size * 0.14)} fill={fg} opacity="0.55" />
      <path d={starPath(size, size, size * 0.14)} fill={fg} opacity="0.55" />
    </pattern>
  )
}

/** A strip of star curtain, for section dividers. */
export function StarBand({ height = 26 }: { height?: number }) {
  const id = `sb-${useId().replace(/[^a-z0-9]/gi, '')}`
  return (
    <svg className="star-band" width="100%" height={height} aria-hidden>
      <defs>
        <StarPattern id={id} size={height} />
      </defs>
      <rect width="100%" height={height} fill={`url(#${id})`} />
    </svg>
  )
}

/**
 * Hero poster: stepped amber towers around a star curtain, with the Founders
 * cypress standing in for the Pacifica statue, reflected in a pool at dusk.
 */
export function HeroPoster() {
  const uid = useId().replace(/[^a-z0-9]/gi, '')
  const towers = (side: 1 | -1) => {
    const cols = [
      [70, 210, 90],
      [150, 170, 70],
      [215, 120, 60],
      [270, 230, 50],
    ]
    return cols.map(([x, top, w], i) => {
      const X = side === 1 ? x : 1200 - x - w
      return (
        <g key={`${side}-${i}`}>
          <rect x={X} y={top} width={w} height={560 - top} fill={`url(#tower-${uid})`} />
          <rect x={side === 1 ? X + w - 10 : X} y={top} width="10" height={560 - top} fill="#000" opacity="0.12" />
        </g>
      )
    })
  }
  return (
    <svg className="hero-poster" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Art deco poster: the Founders cypress in front of a star curtain at dusk">
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f7fa6" />
          <stop offset="0.55" stopColor="#8fbfd3" />
          <stop offset="1" stopColor="#f2c98a" />
        </linearGradient>
        <linearGradient id={`tower-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d28e" />
          <stop offset="1" stopColor="#e39a3e" />
        </linearGradient>
        <linearGradient id={`pool-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a5f7f" />
          <stop offset="1" stopColor="#173a4f" />
        </linearGradient>
        <StarPattern id={`stars-${uid}`} size={30} bg="#24597d" fg="#e9f2f2" />
        <filter id={`grain-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.18 0" />
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </defs>
      <g filter={`url(#grain-${uid})`}>
        <rect width="1200" height="560" fill={`url(#sky-${uid})`} />
        {/* Distant coastal hills */}
        <path d="M0 470 Q200 410 380 450 T760 440 T1200 460 V560 H0Z" fill="#6f9a86" opacity="0.6" />
        {towers(1)}
        {towers(-1)}
        {/* Central star curtain flanked by tall pylons */}
        <rect x="430" y="90" width="80" height="470" fill={`url(#tower-${uid})`} />
        <rect x="690" y="90" width="80" height="470" fill={`url(#tower-${uid})`} />
        <rect x="500" y="60" width="200" height="500" fill={`url(#stars-${uid})`} />
        <rect x="500" y="60" width="200" height="500" fill="none" stroke="#c9842f" strokeWidth="6" />
        {/* The cypress */}
        <g transform="translate(470 210) scale(4.1)" fill="#1f4a3a">
          <path d="M6 20c2-9 14-13 24-11 6-5 18-4 24 2 6 1 9 6 6 10-3 4-10 4-15 3-4 3-11 4-17 2-6 2-15 2-19-1-2-1-3-3-3-5z" />
          <path d="M30 24c1 9-1 18-6 26-2 3-1 6 3 6h10c3 0 4-3 2-6-4-7-5-15-4-24z" />
        </g>
        {/* Terrace, hedges and small trees */}
        <rect x="0" y="540" width="1200" height="24" fill="#e9c98e" />
        <rect x="380" y="520" width="440" height="22" fill="#d9a85e" />
        {[120, 340, 860, 1080].map((x) => (
          <g key={x}>
            <rect x={x - 3} y="470" width="6" height="70" fill="#3b2a1a" />
            <ellipse cx={x} cy="462" rx="34" ry="44" fill="#2f5b3f" />
          </g>
        ))}
        <rect x="0" y="530" width="1200" height="14" fill="#2f5b3f" opacity="0.85" />
        {/* Reflecting pool */}
        <rect y="564" width="1200" height="196" fill={`url(#pool-${uid})`} />
        <g opacity="0.35" transform="translate(0 1128) scale(1 -1)">
          <rect x="500" y="60" width="200" height="500" fill={`url(#stars-${uid})`} />
          <rect x="430" y="90" width="80" height="470" fill={`url(#tower-${uid})`} />
          <rect x="690" y="90" width="80" height="470" fill={`url(#tower-${uid})`} />
        </g>
        {[600, 630, 660, 700].map((y, i) => (
          <rect key={y} x={180 + i * 40} y={y} width={840 - i * 80} height="2" fill="#e9f2f2" opacity={0.25 - i * 0.04} />
        ))}
      </g>
    </svg>
  )
}

/** Stylized San Mateo County map with the four cafes. */
const PINS: Record<LocationId, [number, number, 'l' | 'r']> = {
  pacifica: [118, 190, 'l'],
  hmb: [132, 362, 'l'],
  menlo: [318, 316, 'r'],
  stanford: [336, 404, 'r'],
}

export function CoastMap({ active, onPick, names }: { active?: LocationId; onPick?: (id: LocationId) => void; names: Record<LocationId, string> }) {
  const uid = useId().replace(/[^a-z0-9]/gi, '')
  return (
    <svg className="coast-map" viewBox="0 0 440 520" role="img" aria-label="Map of the four Founders Farmstand cafes on the Peninsula">
      <defs>
        <pattern id={`waves-${uid}`} width="24" height="12" patternUnits="userSpaceOnUse">
          <rect width="24" height="12" fill="var(--pacific)" />
          <path d="M0 8q6-6 12 0t12 0" stroke="var(--sky)" strokeWidth="1.4" fill="none" opacity="0.7" />
        </pattern>
      </defs>
      <rect width="440" height="520" fill={`url(#waves-${uid})`} />
      {/* Land: the Peninsula between the Pacific and the Bay */}
      <path
        d="M140 0 L300 0 Q320 60 300 110 Q330 170 320 230 Q350 300 380 340 Q420 380 440 400 L440 520 L150 520 Q120 470 140 420 Q110 380 120 330 Q100 290 112 250 Q90 210 105 170 Q95 120 120 80 Q125 40 140 0Z"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      {/* The Bay */}
      <path d="M300 110 Q330 170 320 230 Q350 300 380 340 Q420 380 440 400 L440 60 Q360 70 300 110Z" fill={`url(#waves-${uid})`} stroke="var(--ink)" strokeWidth="2" />
      {/* Hills */}
      <path d="M150 300 Q190 250 230 300 Q260 260 290 310" stroke="var(--cypress)" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M140 420 Q180 380 220 420 Q250 390 280 430" stroke="var(--cypress)" strokeWidth="2" fill="none" opacity="0.6" />
      <text x="40" y="270" className="map-water" transform="rotate(-80 40 270)">
        PACIFIC OCEAN
      </text>
      <text x="390" y="200" className="map-water" transform="rotate(70 390 200)">
        S.F. BAY
      </text>
      <text x="215" y="30" className="map-place">
        SAN FRANCISCO ↑
      </text>
      {(Object.keys(PINS) as LocationId[]).map((id) => {
        const [x, y, side] = PINS[id]
        const on = active === id
        return (
          <g key={id} className={`pin ${on ? 'on' : ''}`} onClick={() => onPick?.(id)} role={onPick ? 'button' : undefined} tabIndex={onPick ? 0 : undefined} onKeyDown={(e) => e.key === 'Enter' && onPick?.(id)}>
            <path d={starPath(x, y, on ? 13 : 10)} fill={on ? 'var(--marigold)' : 'var(--redwood)'} stroke="var(--ink)" strokeWidth="1.5" />
            <text x={side === 'l' ? x + 18 : x - 18} y={y + 5} textAnchor={side === 'l' ? 'start' : 'end'} className="map-label">
              {names[id]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
