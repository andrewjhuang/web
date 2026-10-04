import { useEffect, useState } from 'react'
import { distanceMi, driveMin, LOTS, PERMITS, spaceLabel, type Lot, type Permit } from '../data'
import { freeCount, status, STATUS_COLOR, type Spaces } from '../sensors'
import { GoButton, Icon, PermitChip, Star } from './bits'

/* ---------------- List ---------------- */

export function ListView({
  spaces,
  permit,
  favorites,
  onOpen,
  onGo,
}: {
  spaces: Spaces
  permit: Permit
  favorites: string[]
  onOpen: (id: string) => void
  onGo: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [mineOnly, setMineOnly] = useState(true)
  const [sort, setSort] = useState<'near' | 'open'>('near')

  const q = query.trim().toLowerCase()
  const lots = LOTS.filter((l) => (!mineOnly || l.permits.includes(permit)) && (!q || `${l.name} ${l.address}`.toLowerCase().includes(q))).sort(
    (a, b) =>
      Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)) ||
      (sort === 'near' ? distanceMi(a) - distanceMi(b) : freeCount(spaces[b.id]) - freeCount(spaces[a.id])),
  )

  return (
    <div className="screen list-screen">
      <SearchBar value={query} onChange={setQuery} />
      <div className="filters">
        <button className={`pill ${mineOnly ? 'on' : ''}`} onClick={() => setMineOnly(!mineOnly)} aria-pressed={mineOnly}>
          <PermitChip p={permit} /> lots only
        </button>
        <button className={`pill ${sort === 'near' ? 'on' : ''}`} onClick={() => setSort('near')} aria-pressed={sort === 'near'}>
          Nearest
        </button>
        <button className={`pill ${sort === 'open' ? 'on' : ''}`} onClick={() => setSort('open')} aria-pressed={sort === 'open'}>
          Most open
        </button>
      </div>
      <div className="cards">
        {lots.length === 0 && <p className="empty">No lots match “{query}”.</p>}
        {lots.map((l) => {
          const free = freeCount(spaces[l.id])
          const st = status(free, l.capacity)
          return (
            <div key={l.id} className="card" role="button" tabIndex={0} onClick={() => onOpen(l.id)} onKeyDown={(e) => e.key === 'Enter' && onOpen(l.id)}>
              <div className="card-top">
                <span className="card-name">
                  {favorites.includes(l.id) && <span className="fav-dot">★</span>}
                  {l.name}
                </span>
                <span className="card-dist">{distanceMi(l)} mi</span>
              </div>
              <div className="chips">
                {l.permits.map((p) => (
                  <PermitChip key={p} p={p} dim={p !== permit} />
                ))}
              </div>
              <div className="card-bottom">
                <span className="remaining">
                  <i style={{ background: STATUS_COLOR[st] }} />
                  {free === 0 ? 'Full' : `${free} remaining`}
                </span>
                {free > 0 && l.permits.includes(permit) && <GoButton onClick={() => onGo(l.id)} label={`Navigate to ${l.name}`} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SearchBar({ value, onChange, placeholder = 'Where to park?' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="search">
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-label={placeholder} />
      <Icon name="search" />
    </label>
  )
}

/* ---------------- Lot detail sheet ---------------- */

export function LotSheet({
  lot,
  spaces,
  permit,
  fav,
  onFav,
  onGo,
  onClose,
}: {
  lot: Lot
  spaces: boolean[]
  permit: Permit
  fav: boolean
  onFav: () => void
  onGo: () => void
  onClose: () => void
}) {
  const free = freeCount(spaces)
  const allowed = lot.permits.includes(permit)
  return (
    <div className="sheet">
      <button className="grabber" onClick={onClose} aria-label="Close" />
      <div className="sheet-head">
        <Star on={fav} onClick={onFav} />
        <div className="sheet-title">
          <h3>{lot.name}</h3>
          <p>{lot.address}</p>
        </div>
        <span className="card-dist">{distanceMi(lot)} mi</span>
      </div>
      <div className="chips">
        {lot.permits.map((p) => (
          <PermitChip key={p} p={p} dim={p !== permit} />
        ))}
      </div>
      <div className="sheet-stats">
        <div>
          <strong style={{ color: STATUS_COLOR[status(free, lot.capacity)] }}>{free} remaining</strong>
          <span>{lot.capacity - free} unavailable</span>
        </div>
        {allowed && free > 0 && <GoButton onClick={onGo} label={`Navigate to ${lot.name}`} />}
      </div>
      {!allowed && <p className="warn">Your {permit} permit isn't valid here.</p>}
      <SensorGrid lot={lot} spaces={spaces} />
    </div>
  )
}

export function SensorGrid({ lot, spaces, highlight }: { lot: Lot; spaces: boolean[]; highlight?: number | null }) {
  if (lot.garage) {
    const levels = Math.ceil(lot.capacity / 80)
    return (
      <div className="levels">
        <div className="grid-caption">Live sensors · by level</div>
        {Array.from({ length: levels }, (_, lv) => {
          const slice = spaces.slice(lv * 80, lv * 80 + 80)
          const f = freeCount(slice)
          return (
            <div key={lv} className="level">
              <span>Level {lv + 1}</span>
              <div className="bar">
                <div style={{ width: `${(1 - f / slice.length) * 100}%` }} />
              </div>
              <span className="level-free">{f} open</span>
            </div>
          )
        })}
      </div>
    )
  }
  return (
    <div>
      <div className="grid-caption">Live sensors · entrance on the left</div>
      <div className="spaces">
        {spaces.map((occ, i) => (
          <span key={i} className={`space ${occ ? 'occ' : 'free'} ${highlight === i ? 'target' : ''}`} title={`${spaceLabel(lot, i)} · ${occ ? 'taken' : 'open'}`}>
            {highlight === i ? '★' : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Navigation ---------------- */

export function NavPanel({
  lot,
  spaces,
  spot,
  notice,
  alternative,
  onReroute,
  onParked,
  onCancel,
}: {
  lot: Lot
  spaces: boolean[]
  spot: number | null
  notice: string | null
  alternative: { lot: Lot; free: number } | null
  onReroute: () => void
  onParked: () => void
  onCancel: () => void
}) {
  const full = spot === null
  return (
    <>
      <div className={`nav-banner ${full ? 'alert' : ''}`}>
        <div className="nav-eta">
          <strong>{driveMin(lot)} min</strong> · {distanceMi(lot)} mi
        </div>
        <div className="nav-to">to {lot.name}</div>
      </div>
      <div className="sheet nav-sheet">
        {full ? (
          <>
            <h3 className="alert-title">{lot.name} just filled up</h3>
            <p className="muted">Sensors caught it before you got there.</p>
            {alternative ? (
              <button className="primary" onClick={onReroute}>
                Reroute to {alternative.lot.name} · {alternative.free} open
              </button>
            ) : (
              <p className="warn">No lots for your permit have space right now.</p>
            )}
          </>
        ) : (
          <>
            <p className="muted small">Closest open space</p>
            <h3 className="spot">
              Space {spaceLabel(lot, spot)} <span className="live">● live</span>
            </h3>
            {notice && <p className="notice">{notice}</p>}
            <SensorGrid lot={lot} spaces={spaces} highlight={spot} />
            <button className="primary" onClick={onParked}>
              I've parked
            </button>
          </>
        )}
        <button className="text-btn" onClick={onCancel}>
          End navigation
        </button>
      </div>
    </>
  )
}

/* ---------------- Profile ---------------- */

export type Parked = { lotId: string; label: string; since: number }

export function ProfileView({
  permit,
  setPermit,
  favorites,
  parked,
  onEndParking,
  onOpen,
}: {
  permit: Permit
  setPermit: (p: Permit) => void
  favorites: string[]
  parked: Parked | null
  onEndParking: () => void
  onOpen: (id: string) => void
}) {
  return (
    <div className="screen profile">
      <h2>Profile</h2>
      {parked && <ParkedCard parked={parked} onEnd={onEndParking} />}
      <section>
        <h4>My permit</h4>
        <div className="permit-list">
          {(Object.keys(PERMITS) as Permit[]).map((p) => (
            <button key={p} className={`permit-row ${permit === p ? 'on' : ''}`} onClick={() => setPermit(p)} aria-pressed={permit === p}>
              <PermitChip p={p} />
              <span>{PERMITS[p].label.split(' · ')[1]}</span>
              {permit === p && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h4>Favorite lots</h4>
        {favorites.length === 0 ? (
          <p className="muted small">Tap the star on a lot to save it here.</p>
        ) : (
          favorites.map((id) => {
            const l = LOTS.find((x) => x.id === id)!
            return (
              <button key={id} className="fav-row" onClick={() => onOpen(id)}>
                ★ {l.name}
              </button>
            )
          })
        )}
      </section>
    </div>
  )
}

function ParkedCard({ parked, onEnd }: { parked: Parked; onEnd: () => void }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const lot = LOTS.find((l) => l.id === parked.lotId)!
  const s = Math.floor((now - parked.since) / 1000)
  return (
    <div className="parked">
      <p className="muted small">Your car</p>
      <h3>
        {lot.name} · {parked.label}
      </h3>
      <p className="timer">
        Parked {Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}
      </p>
      <button className="text-btn" onClick={onEnd}>
        I've left the space
      </button>
    </div>
  )
}
