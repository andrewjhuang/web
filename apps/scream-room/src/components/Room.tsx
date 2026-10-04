import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react'
import { ding, openMic, pop, roar, thud } from '../audio'
import { KIT, NOTE_COLORS, NOTES, THEMES, type WallTheme } from '../data'
import type { Stats } from '../App'

export const W = 960
export const H = 600

// One-point perspective: back wall rectangle and the floor trapezoid in front of it.
const BACK = { x0: 220, x1: 740, y0: 70, y1: 400 }

/** Floor coordinates (u across 0–1, t depth 0 back → 1 front) to stage pixels. */
function floor(u: number, t: number) {
  const y = BACK.y1 + (H - BACK.y1) * t
  const left = BACK.x0 * (1 - t)
  const right = BACK.x1 + (W - BACK.x1) * t
  return { x: left + (right - left) * u, y }
}

type Balloon = { id: number; x: number; y: number; color: string; face: number; delay: number }

const BALLOON_COLORS = ['#ff6b5b', '#f2b33d', '#9bd94a', '#b38cff', '#58b7ff', '#ff8fc8', '#ffb347']

function makeBalloons(seed = 0): Balloon[] {
  const spots: [number, number][] = [
    [0.78, 0.05],
    [0.86, 0.12],
    [0.7, 0.18],
    [0.92, 0.3],
    [0.62, 0.08],
    [0.82, 0.42],
    [0.1, 0.55],
    [0.18, 0.75],
  ]
  return spots.map(([u, t], i) => {
    const p = floor(u, t)
    return { id: seed * 100 + i, x: p.x, y: p.y, color: BALLOON_COLORS[(i + seed) % BALLOON_COLORS.length], face: (i + seed) % 4, delay: -i * 0.7 }
  })
}

type Overlay = null | 'scream' | 'notes' | 'kit'

export function Room({
  theme,
  setTheme,
  locked,
  setLocked,
  stats,
  bump,
  relieve,
  myNotes,
  addNote,
  setShake,
}: {
  theme: WallTheme
  setTheme: (t: WallTheme) => void
  locked: boolean
  setLocked: (l: boolean) => void
  stats: Stats
  bump: (k: keyof Stats, v?: number) => void
  relieve: (amount: number, label: string) => void
  myNotes: string[]
  addNote: (n: string) => void
  setShake: (v: number) => void
}) {
  const th = THEMES[theme]
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [balloons, setBalloons] = useState(() => makeBalloons())
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; color: string }[]>([])
  const refills = useRef(0)
  const spaceOpened = useRef(false)

  useEffect(() => {
    if (overlay) return
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        spaceOpened.current = true
        setOverlay('scream')
      }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [overlay])

  const popBalloon = (b: Balloon) => {
    pop()
    setBalloons((bs) => bs.filter((x) => x.id !== b.id))
    setBursts((bs) => [...bs, { id: b.id, x: b.x, y: b.y - 70, color: b.color }])
    setTimeout(() => setBursts((bs) => bs.filter((x) => x.id !== b.id)), 700)
    bump('pops')
    relieve(4, 'pop!')
  }

  const refill = () => {
    refills.current += 1
    setBalloons(makeBalloons(refills.current))
    ding()
  }

  const cycleTheme = () => {
    const order: WallTheme[] = ['park', 'sunset', 'original']
    setTheme(order[(order.indexOf(theme) + 1) % order.length])
    ding()
  }

  const wallNotes = useMemo(() => {
    // Scattered sticky notes on the back wall, seeded so they don't jump around.
    let s = 7
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280
    return Array.from({ length: 26 }, (_, i) => ({ x: 236 + r() * 190, y: 96 + r() * 150, c: NOTE_COLORS[i % NOTE_COLORS.length], rot: (r() - 0.5) * 18 }))
  }, [])

  return (
    <div className="scene room" style={{ '--glow': th.glow } as CSSProperties}>
      <svg className="shell" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden>
        <defs>
          <pattern id="quilt" width="40" height="18" patternUnits="userSpaceOnUse">
            <rect width="40" height="18" fill={th.wall} />
            <path d="M0 9l5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5" stroke={th.wallDark} strokeWidth="2" fill="none" />
          </pattern>
          <radialGradient id="lamp" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor={th.glow} stopOpacity="0.55" />
            <stop offset="100%" stopColor={th.glow} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="shadeL" x1="0" x2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.28" />
            <stop offset="1" stopColor="#000" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="shadeR" x1="1" x2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.28" />
            <stop offset="1" stopColor="#000" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Ceiling */}
        <polygon points={`0,0 ${W},0 ${BACK.x1},${BACK.y0} ${BACK.x0},${BACK.y0}`} fill={th.trim} />
        <rect x="380" y="22" width="200" height="14" rx="7" fill="#fff8e6" className="light-strip" />

        {theme === 'original' ? (
          <>
            {/* The tested prototype: blue moving blankets on every wall */}
            <rect x={BACK.x0} y={BACK.y0} width={BACK.x1 - BACK.x0} height={BACK.y1 - BACK.y0} fill="url(#quilt)" />
            <QuiltWall side="left" base={th.wall} stitch={th.wallDark} />
            <QuiltWall side="right" base={th.wall} stitch={th.wallDark} />
          </>
        ) : (
          <>
            <rect x={BACK.x0} y={BACK.y0} width={BACK.x1 - BACK.x0} height={BACK.y1 - BACK.y0} fill={th.wall} />
            <FeltFins x0={226} x1={452} color={th.felt} />
            <Diffuser x0={466} y0={170} cols={9} rows={8} cell={28} a={th.woodA} b={th.woodB} />
            <WaveWall side="left" base={th.wallDark} color={th.felt} />
            <WaveWall side="right" base={th.wallDark} color={th.felt} />
          </>
        )}
        <polygon points={`0,0 ${BACK.x0},${BACK.y0} ${BACK.x0},${BACK.y1} 0,${H}`} fill="url(#shadeL)" />
        <polygon points={`${W},0 ${BACK.x1},${BACK.y0} ${BACK.x1},${BACK.y1} ${W},${H}`} fill="url(#shadeR)" />
        {theme !== 'original' && <Clouds color={th.accent} trim={th.trim} />}

        {/* Checkerboard floor */}
        <Floor a={th.floorA} b={th.floorB} />
        <polygon points={`0,0 ${W},0 ${BACK.x1},${BACK.y0} ${BACK.x0},${BACK.y0}`} fill="url(#lamp)" />
        <rect x={BACK.x0} y={BACK.y0} width={BACK.x1 - BACK.x0} height="160" fill="url(#lamp)" />

      </svg>

      {/* Sticky-note wall */}
      <button
        className="spot notes-hot"
        style={{ left: 228, top: 86, width: 214, height: 180 }}
        onClick={() => setOverlay('notes')}
        aria-label="Read and write sticky notes"
      >
        {wallNotes.map((n, i) => (
          <i key={i} className="mini-note" style={{ left: n.x - 228, top: n.y - 86, background: n.c, transform: `rotate(${n.rot}deg)` }} />
        ))}
        {myNotes.map((_, i) => (
          <i key={`m${i}`} className="mini-note mine" style={{ left: 40 + i * 26, top: 150, background: '#fff' }} />
        ))}
        <span className="hot-label">Note wall · {NOTES.length + myNotes.length} notes</span>
      </button>

      {/* Neon sign: cycles wall finish */}
      <button className="spot neon" style={{ left: 470, top: 92 }} onClick={cycleTheme} aria-label="Change the room's colors">
        <span className="neon-text">I SCREAM</span>
        <span className="neon-cone">🍦</span>
        <span className="hot-label">Change the vibe</span>
      </button>
      <div className="arrow-sign" style={{ left: 300, top: 296 }} aria-hidden>
        ↓ scream here
        <br />
        (no one can hear you)
      </div>

      {/* Door with occupied lock: privacy */}
      <button
        className={`spot door ${locked ? 'locked' : ''}`}
        onClick={() => setLocked(!locked)}
        aria-pressed={locked}
        aria-label={locked ? 'Unlock the door' : 'Lock the door'}
      >
        <svg viewBox="0 0 220 600" width="220" height="600" aria-hidden>
          {/* Edges follow lines to the vanishing point (≈489,156), so the door sits flat on the side wall. */}
          <polygon points="58,112 172,124 172,444 58,546" fill="#000" opacity="0.18" />
          <polygon points="66,118 172,128 172,444 66,540" fill={th.trim} />
          <polygon points="76,134 162,141 162,439 76,523" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="2" />
          <polygon points="76,330 162,322" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" />
          <ellipse cx="153" cy="300" rx="4" ry="6" fill="#d9c08a" />
          <rect x="151" y="298" width="9" height="3" rx="1.5" fill="#d9c08a" transform="rotate(-4 151 298)" />
          {/* Sign plate drawn in the wall's perspective, with text mapped onto the same plane */}
          <polygon points="88,176 152,171.5 152,193.5 88,201" fill="#000" opacity="0.25" transform="translate(2 2)" />
          <polygon points="88,176 152,171.5 152,193.5 88,201" fill={locked ? '#c93b3b' : '#3f9a5e'} />
          <polygon points="88,176 152,171.5 152,173.5 88,178" fill="#fff" opacity="0.25" />
          <g transform="matrix(0.94 -0.066 0 0.96 88 176)">
            <text x="34" y="17" textAnchor="middle" className="door-sign" textLength={locked ? 60 : 50} lengthAdjust="spacingAndGlyphs">
              {locked ? 'OCCUPIED' : 'VACANT'}
            </text>
          </g>
        </svg>
        <span className="hot-label door-label">{locked ? '🔒 Locked & soundproof' : '🔓 Tap to lock'}</span>
      </button>

      {/* Pouf from the real StartX room */}
      <div className="pouf" aria-hidden />

      {/* Scream kit box */}
      <button className="spot kit-box" onClick={() => setOverlay('kit')} aria-label="Open the scream kit">
        <span className="box-face">
          <span className="box-label">SCREAM KIT</span>
        </span>
        <span className="earmuffs">🎧</span>
        <span className="hot-label">Scream kit</span>
      </button>

      {/* Scream zone hotspot */}
      <button
        className={`scream-zone ${theme === 'original' ? 'on-dark' : ''}`}
        onClick={() => {
          spaceOpened.current = false
          setOverlay('scream')
        }}
        aria-label="Scream here (or hold the space bar)"
      >
        {/* Floor decal: situational nudging */}
        <span className="zone-ring" />
        <span className="zone-text">SCREAM HERE</span>
        <span className="zone-tip">Click, or hold space</span>
      </button>

      {/* Balloons */}
      {balloons.map((b) => (
        <button
          key={b.id}
          className="balloon"
          style={{ left: b.x - 26, top: b.y - 118, animationDelay: `${b.delay}s` }}
          onClick={() => popBalloon(b)}
          aria-label="Pop balloon"
        >
          <BalloonArt color={b.color} face={b.face} />
        </button>
      ))}
      {bursts.map((b) => (
        <span key={b.id} className="pop-burst" style={{ left: b.x, top: b.y, color: b.color }} aria-hidden>
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} style={{ '--a': `${i * 36}deg` } as CSSProperties} />
          ))}
          <b>POP!</b>
        </span>
      ))}
      {balloons.length === 0 && (
        <button className="refill" onClick={refill}>
          🎈 Refill balloons from the kit
        </button>
      )}

      <Ball
        onKick={() => bump('kicks')}
        onWall={(hard) => {
          thud(hard)
          relieve(2, 'thunk')
        }}
      />

      <div className="theme-tag">
        Walls: {th.name}
        {theme !== 'original' && <span> · wood QRD diffuser, PET felt fins, 3D wave panels, acoustic clouds</span>}
      </div>

      {overlay === 'scream' && (
        <ScreamMode
          held={spaceOpened.current}
          locked={locked}
          onLock={() => setLocked(true)}
          setShake={setShake}
          onScream={(db, relief) => {
            bump('screams')
            if (db > stats.loudest) bump('loudest', db - stats.loudest)
            relieve(relief, 'AAAA')
          }}
          onClose={() => {
            setShake(0)
            setOverlay(null)
          }}
        />
      )}
      {overlay === 'notes' && (
        <NoteWall
          mine={myNotes}
          firstRead={!stats.notesRead}
          onRead={() => {
            bump('notesRead')
            relieve(8, 'not alone')
          }}
          onNote={(t) => {
            addNote(t)
            bump('notes')
            relieve(12, 'let it out')
          }}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === 'kit' && (
        <Modal title="The Scream Kit" onClose={() => setOverlay(null)}>
          <ul className="kit-list">
            {KIT.map((k) => (
              <li key={k.name}>
                <span className="kit-icon">{k.icon}</span>
                <span>
                  <b>{k.name}</b>
                  {k.body}
                </span>
              </li>
            ))}
          </ul>
          <button
            className="btn primary"
            onClick={() => {
              refill()
              setOverlay(null)
            }}
          >
            🎈 Refill balloons
          </button>
        </Modal>
      )}
    </div>
  )
}

/* ---------------- Acoustic treatments ---------------- */

/** Vertical recycled-PET felt baffles with a lit edge, so they read as fins. */
function FeltFins({ x0, x1, color }: { x0: number; x1: number; color: string }) {
  const fins = []
  for (let x = x0; x < x1; x += 15) {
    fins.push(
      <g key={x}>
        <rect x={x} y={BACK.y0 + 6} width="10" height={BACK.y1 - BACK.y0 - 6} rx="2" fill={color} />
        <rect x={x + 7} y={BACK.y0 + 6} width="3" height={BACK.y1 - BACK.y0 - 6} fill="#000" opacity="0.18" />
        <rect x={x} y={BACK.y0 + 6} width="2" height={BACK.y1 - BACK.y0 - 6} fill="#fff" opacity="0.22" />
      </g>,
    )
  }
  return <g>{fins}</g>
}

/**
 * Quadratic-residue diffuser: wooden blocks whose depths follow n² mod p, which
 * scatters sound evenly instead of reflecting it. Deeper wells are drawn darker.
 */
function Diffuser({ x0, y0, cols, rows, cell, a, b }: { x0: number; y0: number; cols: number; rows: number; cell: number; a: string; b: string }) {
  const P = 7
  const blocks = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const depth = ((r * r + c * c) % P) / (P - 1)
      const x = x0 + c * cell
      const y = y0 + r * cell
      blocks.push(
        <g key={`${r}-${c}`}>
          <rect x={x} y={y} width={cell - 2} height={cell - 2} fill={depth > 0.5 ? b : a} />
          <rect x={x} y={y} width={cell - 2} height={cell - 2} fill="#000" opacity={depth * 0.32} />
          {/* lit top/left edges and shadowed bottom/right fake the block's depth */}
          <rect x={x} y={y} width={cell - 2} height={2 + (1 - depth) * 3} fill="#fff" opacity="0.28" />
          <rect x={x + cell - 2 - (2 + (1 - depth) * 4)} y={y} width={2 + (1 - depth) * 4} height={cell - 2} fill="#000" opacity="0.2" />
        </g>,
      )
    }
  }
  return (
    <g>
      <rect x={x0 - 6} y={y0 - 6} width={cols * cell + 10} height={rows * cell + 10} rx="3" fill="#000" opacity="0.18" />
      {blocks}
    </g>
  )
}

/** 3D wave panels on the side walls: wavy felt ribs that follow the perspective. */
function WaveWall({ side, base, color }: { side: 'left' | 'right'; base: string; color: string }) {
  const top = (x: number) => (BACK.y0 * x) / BACK.x0
  const bottom = (x: number) => H - ((H - BACK.y1) * x) / BACK.x0
  const ribs = []
  const N = 16
  for (let i = 1; i < N; i++) {
    const f = i / N
    const pts = []
    for (let x = 0; x <= BACK.x0; x += 6) {
      const y = top(x) + f * (bottom(x) - top(x)) + Math.sin(x * 0.07 + i * 0.9) * (9 - x * 0.03)
      pts.push(`${side === 'left' ? x : W - x},${y.toFixed(1)}`)
    }
    ribs.push(<polyline key={i} points={pts.join(' ')} fill="none" stroke={color} strokeWidth={14 - f * 4} strokeLinecap="round" opacity={0.55 + (i % 2) * 0.25} />)
  }
  const poly = side === 'left' ? `0,0 ${BACK.x0},${BACK.y0} ${BACK.x0},${BACK.y1} 0,${H}` : `${W},0 ${BACK.x1},${BACK.y0} ${BACK.x1},${BACK.y1} ${W},${H}`
  const id = `clip-${side}`
  return (
    <g>
      <clipPath id={id}>
        <polygon points={poly} />
      </clipPath>
      <polygon points={poly} fill={base} />
      <g clipPath={`url(#${id})`}>{ribs}</g>
    </g>
  )
}

/**
 * Moving-blanket stitching on a side wall, drawn in perspective: each zigzag row
 * follows a line toward the vanishing point, and the zigzags shrink (in both
 * period and height) as the wall recedes, instead of a flat repeating pattern.
 */
function QuiltWall({ side, base, stitch }: { side: 'left' | 'right'; base: string; stitch: string }) {
  const top = (x: number) => (BACK.y0 * x) / BACK.x0
  const bottom = (x: number) => H - ((H - BACK.y1) * x) / BACK.x0
  // Local scale: 1 at the front edge, shrinking toward the back wall.
  const scale = (x: number) => (bottom(x) - top(x)) / H
  const rows = []
  const N = 30
  for (let i = 1; i < N; i++) {
    const f = i / N
    const pts: string[] = []
    let phase = 0
    let x = 0
    while (x <= BACK.x0) {
      const k = scale(x)
      const y = top(x) + f * (bottom(x) - top(x)) + (phase % 2 === 0 ? -1 : 1) * 4.5 * k
      pts.push(`${(side === 'left' ? x : W - x).toFixed(1)},${y.toFixed(1)}`)
      x += 9 * k // half a zigzag, foreshortened
      phase++
    }
    rows.push(<polyline key={i} points={pts.join(' ')} fill="none" stroke={stitch} strokeWidth={2 * scale(0)} strokeLinejoin="round" />)
  }
  // Vertical seams between blanket panels stay vertical but bunch up toward the back.
  const seams = [0.18, 0.4, 0.62, 0.8].map((u) => {
    const x = BACK.x0 * u
    const sx = side === 'left' ? x : W - x
    return <line key={u} x1={sx} y1={top(x)} x2={sx} y2={bottom(x)} stroke="#000" strokeOpacity="0.22" strokeWidth={3 * scale(x)} />
  })
  const poly = side === 'left' ? `0,0 ${BACK.x0},${BACK.y0} ${BACK.x0},${BACK.y1} 0,${H}` : `${W},0 ${BACK.x1},${BACK.y0} ${BACK.x1},${BACK.y1} ${W},${H}`
  const id = `quilt-clip-${side}`
  return (
    <g>
      <clipPath id={id}>
        <polygon points={poly} />
      </clipPath>
      <polygon points={poly} fill={base} />
      <g clipPath={`url(#${id})`}>
        {rows}
        {seams}
      </g>
    </g>
  )
}

/** Floating acoustic clouds hanging from the ceiling. */
function Clouds({ color, trim }: { color: string; trim: string }) {
  const clouds: [number, number, number][] = [
    [300, 46, 54],
    [660, 46, 54],
    [480, 58, 40],
  ]
  return (
    <g>
      {clouds.map(([cx, cy, rx]) => (
        <g key={cx}>
          <line x1={cx - rx * 0.6} y1={cy - 30} x2={cx - rx * 0.6} y2={cy} stroke={trim} strokeOpacity="0.5" />
          <line x1={cx + rx * 0.6} y1={cy - 30} x2={cx + rx * 0.6} y2={cy} stroke={trim} strokeOpacity="0.5" />
          <ellipse cx={cx} cy={cy + 3} rx={rx} ry={rx * 0.16} fill="#000" opacity="0.25" />
          <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.16} fill={color} />
        </g>
      ))}
    </g>
  )
}

function Floor({ a, b }: { a: string; b: string }) {
  const cols = 8
  const rows = 6
  const tiles = []
  for (let r = 0; r < rows; r++) {
    // Rows get taller toward the viewer.
    const t0 = (r / rows) ** 1.35
    const t1 = ((r + 1) / rows) ** 1.35
    for (let c = 0; c < cols; c++) {
      const p = [floor(c / cols, t0), floor((c + 1) / cols, t0), floor((c + 1) / cols, t1), floor(c / cols, t1)]
      tiles.push(<polygon key={`${r}-${c}`} points={p.map((q) => `${q.x},${q.y}`).join(' ')} fill={(r + c) % 2 ? a : b} />)
    }
  }
  return <g>{tiles}</g>
}

function BalloonArt({ color, face }: { color: string; face: number }) {
  const faces = [
    // grumpy
    <g key="f">
      <path d="M17 34l8 3M43 34l-8 3" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="22" cy="40" r="2.5" fill="#222" />
      <circle cx="38" cy="40" r="2.5" fill="#222" />
      <path d="M22 52q8-6 16 0" stroke="#222" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>,
    // x eyes
    <g key="f" stroke="#222" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 36l6 6M24 36l-6 6M36 36l6 6M42 36l-6 6" />
      <path d="M24 52h12" />
    </g>,
    // screaming
    <g key="f">
      <circle cx="22" cy="38" r="2.5" fill="#222" />
      <circle cx="38" cy="38" r="2.5" fill="#222" />
      <ellipse cx="30" cy="51" rx="6" ry="7" fill="#222" />
    </g>,
    // "throw me up"
    <text key="f" x="30" y="46" textAnchor="middle" className="balloon-text">
      throw me up
    </text>,
  ]
  return (
    <svg viewBox="0 0 60 120" width="52" height="104">
      <path d="M30 76q-5 14 3 24t-2 20" stroke="#555" strokeWidth="1.2" fill="none" />
      <ellipse cx="30" cy="40" rx="27" ry="34" fill={color} />
      <ellipse cx="21" cy="25" rx="7" ry="10" fill="#fff" opacity="0.35" />
      <path d="M26 73h8l-4 6z" fill={color} />
      {faces[face]}
    </svg>
  )
}

/* ---------------- Soccer ball with simple floor physics ---------------- */

function Ball({ onKick, onWall }: { onKick: () => void; onWall: (hard: number) => void }) {
  const st = useRef({ u: 0.2, t: 0.7, vu: 0, vt: 0, z: 0, vz: 0, spin: 0 })
  const [, force] = useState(0)
  const raf = useRef(0)

  const step = () => {
    const s = st.current
    s.u += s.vu / 60
    s.t += s.vt / 60
    s.vz -= 0.9
    s.z = Math.max(0, s.z + s.vz)
    if (s.z === 0 && s.vz < 0) s.vz = Math.abs(s.vz) > 4 ? -s.vz * 0.45 : 0
    s.spin += (s.vu * 400 + s.vt * 200) / 60
    const speed = Math.hypot(s.vu, s.vt)
    if (s.u < 0.05 || s.u > 0.95) {
      s.vu = -s.vu * 0.8
      s.u = Math.min(0.95, Math.max(0.05, s.u))
      if (speed > 0.15) onWall(Math.min(1, speed))
    }
    if (s.t < 0.04 || s.t > 0.94) {
      s.vt = -s.vt * 0.8
      s.t = Math.min(0.94, Math.max(0.04, s.t))
      if (speed > 0.15) onWall(Math.min(1, speed))
    }
    s.vu *= 0.985
    s.vt *= 0.985
    force((n) => n + 1)
    if (Math.hypot(s.vu, s.vt) > 0.01 || s.z > 0) raf.current = requestAnimationFrame(step)
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const kick = (e: RPointerEvent) => {
    const s = st.current
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const dx = rect.left + rect.width / 2 - e.clientX
    const dy = rect.top + rect.height / 2 - e.clientY
    const len = Math.hypot(dx, dy) || 1
    const power = 1.1 + Math.random() * 0.5
    s.vu = (dx / len) * power * 0.9 + (Math.random() - 0.5) * 0.3
    s.vt = (dy / len) * power * 1.2 - 0.3
    s.vz = 9
    thud(0.6)
    onKick()
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(step)
  }

  const s = st.current
  const p = floor(s.u, s.t)
  const r = 12 + 20 * s.t
  return (
    <>
      <span className="ball-shadow" style={{ left: p.x - r, top: p.y - r * 0.3, width: r * 2, height: r * 0.6, opacity: Math.max(0.15, 0.45 - s.z / 120) }} />
      <button
        className="ball"
        style={{ left: p.x - r, top: p.y - r * 2 - s.z, width: r * 2, height: r * 2 }}
        onPointerDown={kick}
        aria-label="Kick the soccer ball"
      >
        <svg viewBox="0 0 40 40" width="100%" height="100%" style={{ transform: `rotate(${s.spin}deg)` }}>
          <circle cx="20" cy="20" r="19" fill="#fbfbfb" stroke="#222" strokeWidth="1.5" />
          <path d="M20 12l7 5-3 8h-8l-3-8z" fill="#222" />
          <path d="M20 12V3M27 17l8-3M24 25l5 8M16 25l-5 8M13 17l-8-3" stroke="#222" strokeWidth="1.4" />
        </svg>
      </button>
    </>
  )
}

/* ---------------- Scream mode ---------------- */

function ScreamMode({
  held,
  locked,
  onLock,
  setShake,
  onScream,
  onClose,
}: {
  held: boolean
  locked: boolean
  onLock: () => void
  setShake: (v: number) => void
  onScream: (db: number, relief: number) => void
  onClose: () => void
}) {
  const [power, setPower] = useState(0)
  const [mic, setMic] = useState<'off' | 'on' | 'denied'>('off')
  const [result, setResult] = useState<{ db: number; relief: number } | null>(null)
  // Opened with the space bar already down: start screaming right away.
  const holding = useRef(held)
  const holdStart = useRef(performance.now())
  const micRef = useRef<Awaited<ReturnType<typeof openMic>> | null>(null)
  const session = useRef({ active: false, energy: 0, peak: 0, quiet: 0 })
  const sound = useRef<ReturnType<typeof roar> | null>(null)
  const lockedRef = useRef(locked)
  lockedRef.current = locked
  const cb = useRef({ onScream, setShake, onClose })
  cb.current = { onScream, setShake, onClose }

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let smooth = 0
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      let raw = 0
      if (micRef.current) raw = micRef.current.level()
      else if (holding.current) raw = Math.min(1, 0.3 + (now - holdStart.current) / 1600 + Math.random() * 0.08)
      smooth += (raw - smooth) * 0.25
      setPower(smooth)
      cb.current.setShake(smooth)
      if (!micRef.current) {
        if (smooth > 0.05 && !sound.current) sound.current = roar()
        sound.current?.set(smooth)
      }

      const s = session.current
      if (smooth > 0.22) {
        if (!s.active) Object.assign(s, { active: true, energy: 0, peak: 0, quiet: 0 })
        s.energy += smooth * dt
        s.peak = Math.max(s.peak, smooth)
        s.quiet = 0
      } else if (s.active) {
        s.quiet += dt
        if (s.quiet > 0.35) {
          s.active = false
          if (s.energy > 0.25) {
            const db = Math.round(62 + s.peak * 58)
            const relief = Math.round(Math.min(32, 6 + s.energy * 12) * (lockedRef.current ? 1 : 0.5))
            setResult({ db, relief })
            cb.current.onScream(db, relief)
          }
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        holding.current = true
        holdStart.current = performance.now()
      }
      if (e.code === 'Escape') cb.current.onClose()
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') holding.current = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      micRef.current?.close()
      sound.current?.stop()
      cb.current.setShake(0)
    }
  }, [])

  const enableMic = async () => {
    try {
      micRef.current = await openMic()
      sound.current?.stop()
      sound.current = null
      setMic('on')
    } catch {
      setMic('denied')
    }
  }

  const letters = 'A'.repeat(1 + Math.floor(power * 12)) + (power > 0.6 ? 'H!!' : power > 0.3 ? 'H' : '')

  return (
    <div className="scream-mode" style={{ '--p': power } as CSSProperties}>
      <button className="close" onClick={onClose} aria-label="Back to the room">
        ✕
      </button>
      <div className="outside">
        {locked ? (
          <>
            🔒 Outside the room: <b>🤫 silence</b> (soundproofed)
          </>
        ) : (
          <>
            🔓 Door’s unlocked. Someone might hear.{' '}
            <button className="link" onClick={onLock}>
              Lock it
            </button>
          </>
        )}
      </div>
      <div className="scream-text" aria-live="off" style={{ fontSize: 46 + power * 110 }}>
        {power > 0.05 ? letters : ''}
      </div>
      {power <= 0.05 && !result && <p className="scream-prompt">Nobody’s watching. Let it out.</p>}
      {result && power <= 0.05 && (
        <div className="scream-result">
          <b>{result.db} dB</b> · stress −{result.relief}
          {!locked && <em> (half relief with the door unlocked)</em>}
          <span>Again?</span>
        </div>
      )}
      <div className="meter" aria-hidden>
        <div style={{ width: `${power * 100}%` }} />
      </div>
      <div className="scream-controls">
        <button
          className="btn primary hold"
          onPointerDown={(e) => {
            // Keep the pointer even if the shaking screen moves the button away from it.
            e.currentTarget.setPointerCapture(e.pointerId)
            holding.current = true
            holdStart.current = performance.now()
          }}
          onPointerUp={() => (holding.current = false)}
          onPointerCancel={() => (holding.current = false)}
          onLostPointerCapture={() => (holding.current = false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          Hold to scream
        </button>
        {mic === 'off' && (
          <button className="btn ghost" onClick={enableMic}>
            🎙️ Use my real voice
          </button>
        )}
        {mic === 'on' && <span className="mic-on">🎙️ Listening. Your audio never leaves this page.</span>}
        {mic === 'denied' && <span className="mic-on">Mic unavailable. Hold the button or the space bar instead.</span>}
      </div>
    </div>
  )
}

/* ---------------- Sticky-note wall ---------------- */

function NoteWall({
  mine,
  firstRead,
  onRead,
  onNote,
  onClose,
}: {
  mine: string[]
  firstRead: boolean
  onRead: () => void
  onNote: (t: string) => void
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const [justStuck, setJustStuck] = useState(false)
  useEffect(() => {
    if (firstRead) onRead()
    // Run once when the wall opens.
  }, [])
  const all = [...mine.map((t) => ({ t, mine: true })), ...NOTES.map((t) => ({ t, mine: false }))]
  return (
    <Modal title="The note wall" onClose={onClose} wide>
      <p className="muted">Anonymous. Nobody knows which one is yours.</p>
      <div className="note-grid">
        {all.map((n, i) => (
          <div
            key={`${n.t}-${i}`}
            className={`note ${n.mine ? 'mine' : ''} ${n.mine && i === 0 && justStuck ? 'stuck' : ''}`}
            style={{ background: n.mine ? '#fff' : NOTE_COLORS[i % NOTE_COLORS.length], transform: `rotate(${((i * 37) % 9) - 4}deg)` }}
          >
            {n.t}
          </div>
        ))}
      </div>
      <form
        className="note-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          onNote(text.trim())
          setText('')
          setJustStuck(true)
        }}
      >
        <input
          value={text}
          maxLength={90}
          onChange={(e) => setText(e.target.value)}
          placeholder="What’s weighing on you today?"
          aria-label="Write an anonymous note"
        />
        <button className="btn primary" type="submit" disabled={!text.trim()}>
          Stick it
        </button>
      </form>
    </Modal>
  )
}

export function Modal({ title, onClose, wide, children }: { title: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="close dark" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
