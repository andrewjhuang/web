import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { SELLERS, type Seller } from '../data'

/** Soda-style bubbles drifting up behind a gradient header. */
export function Bubbles({ count = 14, seed = 1 }: { count?: number; seed?: number }) {
  const bubbles = useMemo(() => {
    let s = seed * 9301
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280
    return Array.from({ length: count }, () => ({
      left: `${r() * 100}%`,
      size: 6 + r() * 26,
      dur: 6 + r() * 8,
      delay: -r() * 14,
      sway: 6 + r() * 14,
    }))
  }, [count, seed])
  return (
    <div className="bubbles" aria-hidden>
      {bubbles.map((b, i) => (
        <span
          key={i}
          style={
            {
              left: b.left,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              '--sway': `${b.sway}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

/** A small burst of bubbles, e.g. when saving or upvoting. Re-keys to replay. */
export function Burst({ k }: { k: number }) {
  if (!k) return null
  return (
    <span className="burst" key={k} aria-hidden>
      {Array.from({ length: 7 }, (_, i) => (
        <i key={i} style={{ '--a': `${(i / 7) * 360}deg` } as CSSProperties} />
      ))}
    </span>
  )
}

export function Heart({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  const [k, setK] = useState(0)
  return (
    <button
      className={`heart ${on ? 'on' : ''}`}
      aria-pressed={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        if (!on) setK((x) => x + 1)
        onToggle()
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        <path
          d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
          fill={on ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <Burst k={k} />
    </button>
  )
}

export function SellerAvatar({ seller, size = 36 }: { seller: Seller | 'you'; size?: number }) {
  const s = seller === 'you' ? { handle: 'you', color: '#4f3bff' } : seller
  return (
    <span className="avatar" style={{ width: size, height: size, background: s.color, fontSize: size * 0.42 }} aria-hidden>
      {s.handle
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()}
    </span>
  )
}

export const sellerOf = (key: string): Seller | 'you' => (key === 'you' ? 'you' : SELLERS[key])

export const isVerified = (key: string) => key !== 'you' && SELLERS[key].verified

export function Verified() {
  return (
    <span className="verified" title="Verified with a stanford.edu email">
      <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden>
        <path
          d="M12 2l2.4 2.2 3.2-.4.9 3.1 2.8 1.6-1.2 3 1.2 3-2.8 1.6-.9 3.1-3.2-.4L12 22l-2.4-2.2-3.2.4-.9-3.1L2.7 15.5l1.2-3-1.2-3 2.8-1.6.9-3.1 3.2.4z"
          fill="currentColor"
        />
        <path d="m8 12 3 3 5-6" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      .edu
    </span>
  )
}

type IconName =
  | 'home'
  | 'shop'
  | 'plus'
  | 'chat'
  | 'user'
  | 'search'
  | 'back'
  | 'filter'
  | 'share'
  | 'pin'
  | 'up'
  | 'down'
  | 'comment'
  | 'bell'
  | 'shield'
  | 'send'
  | 'x'

const PATHS: Record<IconName, string> = {
  home: 'M4 11 12 4l8 7v9h-5v-6H9v6H4z',
  shop: 'M4 8h16l-1.5 11h-13zM8 8V6a4 4 0 0 1 8 0v2',
  plus: 'M12 5v14M5 12h14',
  chat: 'M5 5h14v10H9l-4 4z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm5 12 4 4',
  back: 'M15 5l-7 7 7 7',
  filter: 'M4 6h16M7 12h10M10 18h4',
  share: 'M12 4v11M7 9l5-5 5 5M5 14v5h14v-5',
  pin: 'M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zm0-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  up: 'M12 5l7 8h-4v6H9v-6H5z',
  down: 'M12 19l-7-8h4V5h6v6h4z',
  comment: 'M4 5h16v11H8l-4 4z',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z',
  send: 'M4 12 20 4l-6 16-3-7z',
  x: 'M6 6l12 12M18 6 6 18',
}

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d={PATHS[name]} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
