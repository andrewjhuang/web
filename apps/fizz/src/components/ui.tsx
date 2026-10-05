import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { SELLERS, TAG_COLOR, type Seller, type Tag } from '../data'

/** Fizz bubbles drifting up behind a screen. */
export function Bubbles({ count = 12, seed = 1 }: { count?: number; seed?: number }) {
  const bubbles = useMemo(() => {
    let s = seed * 9301
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280
    return Array.from({ length: count }, () => ({
      left: `${r() * 100}%`,
      size: 5 + r() * 22,
      dur: 9 + r() * 10,
      delay: -r() * 19,
      sway: 6 + r() * 16,
    }))
  }, [count, seed])
  return (
    <div className="bubbles" aria-hidden>
      {bubbles.map((b, i) => (
        <span
          key={i}
          style={{ left: b.left, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, '--sway': `${b.sway}px` } as CSSProperties}
        />
      ))}
    </div>
  )
}

/** A small burst of bubbles (save, upvote, comment). Re-keys to replay. */
export function Burst({ k, big }: { k: number; big?: boolean }) {
  if (!k) return null
  return (
    <span className={`burst ${big ? 'big' : ''}`} key={k} aria-hidden>
      {Array.from({ length: big ? 12 : 7 }, (_, i) => (
        <i key={i} style={{ '--a': `${(i / (big ? 12 : 7)) * 360}deg` } as CSSProperties} />
      ))}
    </span>
  )
}

/** The fizz mark: a cluster of bubbles that gently bob. */
/**
 * The Fizz bee.
 *
 * Shipped as an alpha mask rather than a coloured image so CSS paints it with
 * `currentColor` - it inherits white on the dark surfaces and the brand red
 * wherever that reads better, and the mask is a third the weight of an RGBA
 * copy of the same artwork.
 */
export function FizzMark({ size = 30 }: { size?: number }) {
  return <span className="fizz-mark" style={{ width: size, height: size }} aria-hidden />
}

export function SaveButton({ on, onToggle, label, className = '' }: { on: boolean; onToggle: () => void; label: string; className?: string }) {
  const [k, setK] = useState(0)
  return (
    <button
      className={`save ${on ? 'on' : ''} ${className}`}
      aria-pressed={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        if (!on) setK((x) => x + 1)
        onToggle()
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <Burst k={k} />
    </button>
  )
}

export const sellerOf = (key: string): Seller | 'you' => (key === 'you' ? 'you' : SELLERS[key])

export function SellerAvatar({ seller, size = 36 }: { seller: Seller | 'you'; size?: number }) {
  const s = seller === 'you' ? { handle: 'you', color: '#d63a3a' } : seller
  return (
    <span className="avatar" style={{ width: size, height: size, background: s.color, fontSize: size * 0.4 }} aria-hidden>
      {s.handle
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()}
    </span>
  )
}

export function Verified({ size = 14 }: { size?: number }) {
  return (
    <svg className="verified" viewBox="0 0 24 24" width={size} height={size} aria-label="Verified">
      <path d="M12 2l2.4 2.2 3.2-.4.9 3.1 2.8 1.6-1.2 3 1.2 3-2.8 1.6-.9 3.1-3.2-.4L12 22l-2.4-2.2-3.2.4-.9-3.1L2.7 15.5l1.2-3-1.2-3 2.8-1.6.9-3.1 3.2.4z" fill="currentColor" />
      <path d="m8 12 3 3 5-6" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TagPill({ tag }: { tag: Tag }) {
  return (
    <span className="tag" style={{ background: TAG_COLOR[tag] }}>
      {tag}
    </span>
  )
}

type IconName =
  | 'home'
  | 'discover'
  | 'cart'
  | 'send'
  | 'user'
  | 'search'
  | 'back'
  | 'more'
  | 'filter'
  | 'sort'
  | 'bookmark'
  | 'repost'
  | 'share'
  | 'comment'
  | 'up'
  | 'down'
  | 'x'
  | 'plus'
  | 'pin'
  | 'shield'
  | 'bell'
  | 'camera'
  | 'arrowUp'

const PATHS: Record<IconName, string> = {
  home: 'M4 11 12 4l8 7v9h-5.5v-5.5h-5V20H4z',
  discover: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm5 12 4 4M11 7.5l1.2 2.3 2.3 1.2-2.3 1.2L11 14.5l-1.2-2.3-2.3-1.2 2.3-1.2z',
  cart: 'M3 5h2.5l2 10h10l2-7H7M9 19.5a1 1 0 1 0 0 .1M17 19.5a1 1 0 1 0 0 .1',
  send: 'M21 3 3 10.5l7 2.5 2.5 7zM10 13l11-10',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8.5a7 7 0 0 1 14 0',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm5 12 4 4',
  back: 'M15 4 7 12l8 8',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  filter: 'M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4',
  sort: 'M8 20V5M4 9l4-4 4 4M16 4v15M12 15l4 4 4-4',
  bookmark: 'M6 3h12v18l-6-4.5L6 21z',
  repost: 'M4 12V9a3 3 0 0 1 3-3h12l-3-3M20 12v3a3 3 0 0 1-3 3H5l3 3',
  share: 'M12 15V3M7 8l5-5 5 5M5 13v7h14v-7',
  comment: 'M4 4h16v13H8l-4 4zM8 9h8M8 12.5h5',
  up: 'M5 15l7-7 7 7',
  down: 'M5 9l7 7 7-7',
  x: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  pin: 'M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zm0-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
}

export function Icon({ name, size = 22, stroke = 1.9 }: { name: IconName; size?: number; stroke?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d={PATHS[name]} fill="none" stroke="currentColor" strokeWidth={name === 'more' ? 3.2 : stroke} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function Sheet({ title, icon, onClose, children }: { title: string; icon?: IconName; onClose: () => void; children: ReactNode }) {
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <h3 className="sheet-title">
          {icon && <Icon name={icon} size={22} />} {title}
        </h3>
        {children}
      </div>
    </div>
  )
}
