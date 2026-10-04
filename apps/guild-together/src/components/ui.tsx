import { useId, type ReactNode } from 'react'
import { BLOCKS, DAYS, slot, type Slot } from '../data'

export function Avatar({ name, color, size = 72 }: { name: string; color: string; size?: number }) {
  return (
    <div className="avatar" style={{ background: color, width: size, height: size, fontSize: size * 0.42 }} aria-hidden>
      {name.trim().charAt(0).toUpperCase() || '?'}
    </div>
  )
}

export function Chip({
  children,
  selected,
  onClick,
  color,
}: {
  children: ReactNode
  selected?: boolean
  onClick?: () => void
  color?: string
}) {
  if (!onClick) {
    return (
      <span className="chip static" style={color ? { background: color } : undefined}>
        {children}
      </span>
    )
  }
  return (
    <button type="button" className={`chip ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={onClick}>
      {selected && <span className="check">✓</span>}
      {children}
    </button>
  )
}

/**
 * Weekly availability grid. With `onToggle` it's editable; with `other` it
 * shows two schedules and highlights the overlap.
 */
export function WeekGrid({
  mine,
  other,
  otherName,
  onToggle,
}: {
  mine: Slot[]
  other?: Slot[]
  otherName?: string
  onToggle?: (s: Slot) => void
}) {
  return (
    <div className="weekgrid">
      <div className="weekgrid-table" role="grid">
        <div />
        {DAYS.map((d) => (
          <div key={d} className="weekgrid-day">
            {d}
          </div>
        ))}
        {BLOCKS.map((b, bi) => (
          <Row key={b} label={b}>
            {DAYS.map((d, di) => {
              const s = slot(di, bi)
              const a = mine.includes(s)
              const o = other?.includes(s) ?? false
              const cls = other ? (a && o ? 'both' : o ? 'theirs' : a ? 'mine' : '') : a ? 'mine' : ''
              const label = `${d} ${b}`
              return onToggle ? (
                <button
                  key={s}
                  type="button"
                  className={`cell ${cls}`}
                  aria-pressed={a}
                  aria-label={label}
                  onClick={() => onToggle(s)}
                />
              ) : (
                <div key={s} className={`cell ${cls}`} aria-label={label} title={cls === 'both' ? `${label}: you're both free` : label} />
              )
            })}
          </Row>
        ))}
      </div>
      {other && (
        <div className="legend">
          <span>
            <i className="cell mine" /> You
          </span>
          <span>
            <i className="cell theirs" /> {otherName}
          </span>
          <span>
            <i className="cell both" /> Both free
          </span>
        </div>
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <div className="weekgrid-block">{label}</div>
      {children}
    </>
  )
}

export function Ribbon({ color = 'var(--blush)' }: { color?: string }) {
  // Decorative stripe ribbon, a nod to Guild's striped-fabric illustrations.
  const id = `stripes-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg className="ribbon" viewBox="0 0 160 600" preserveAspectRatio="none" aria-hidden>
      <defs>
        <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
          <rect width="10" height="10" fill={color} />
          <line x1="0" y1="0" x2="0" y2="10" stroke="var(--charcoal)" strokeWidth="1.2" />
        </pattern>
      </defs>
      <path
        d="M20 -10 C 140 80, 150 160, 70 240 S -10 380, 60 460 S 150 560, 110 620 L 40 620 C 80 560, 10 500, 0 460 S 70 330, 20 260 S -60 90, -20 -10 Z"
        fill={`url(#${id})`}
      />
    </svg>
  )
}
