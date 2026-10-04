import { ZONE_COLOR, type Permit, type Zone } from '../data'

export function ZoneChip({ z, dim }: { z: Zone | Permit; dim?: boolean }) {
  return (
    <span className={`permit ${dim ? 'dim' : ''}`} style={{ background: ZONE_COLOR[z] }}>
      {z === 'V' ? 'P' : z}
    </span>
  )
}

export function GoButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      className="go"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <path d="M3 11.5 21 3l-8.5 18-2.2-7.3z" fill="currentColor" />
      </svg>
    </button>
  )
}

export function Star({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button className={`star ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on} aria-label={on ? 'Remove from favorites' : 'Add to favorites'}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <path
          d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
          fill={on ? '#f2c230' : 'none'}
          stroke={on ? '#f2c230' : 'currentColor'}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export function Icon({ name }: { name: 'home' | 'compass' | 'user' | 'search' }) {
  const paths = {
    home: 'M4 11 12 4l8 7v9h-5v-6H9v6H4z',
    compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.5 5.5-2 5-5 2 2-5z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm5 12 4 4',
  }
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
