import { useEffect, useState } from 'react'
import {
  canPark,
  capacity,
  distanceMi,
  driveMin,
  enforced,
  LOTS,
  PERMITS,
  spaceLabel,
  ZONE_NAME,
  type Lot,
  type Permit,
} from '../data'
import { freeIn, status, STATUS_COLOR, type Spaces } from '../sensors'
import { GoButton, Icon, Star, ZoneChip } from './bits'

/** Time and permit context shared by every screen. */
export type Ctx = { permit: Permit; hour: number; weekend: boolean; usable: Record<string, number[]> }

const lotZones = (lot: Lot) => [...new Set(lot.zones.map((b) => b.zone))]

/** Shown when commuter and visitor rules are off (weekday evenings, weekends). */
export function OpenParkingNote({ ctx }: { ctx: Ctx }) {
  const commuterOff = ctx.weekend || ctx.hour >= 16 || ctx.hour < 6
  if (!commuterOff) return null
  return (
    <p className="open-note">
      {ctx.weekend ? 'Weekend: ' : 'After 4 PM: '}'A', 'C' and visitor spaces are open to everyone. Residential spaces stay enforced 24/7.
    </p>
  )
}

/* ---------------- List ---------------- */

export function ListView({
  spaces,
  ctx,
  favorites,
  onOpen,
  onGo,
}: {
  spaces: Spaces
  ctx: Ctx
  favorites: string[]
  onOpen: (id: string) => void
  onGo: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [mineOnly, setMineOnly] = useState(true)
  const [sort, setSort] = useState<'near' | 'open'>('near')

  const free = (l: Lot) => freeIn(spaces[l.id], ctx.usable[l.id])
  const q = query.trim().toLowerCase()
  const lots = LOTS.filter((l) => (!mineOnly || ctx.usable[l.id].length > 0) && (!q || `${l.name} ${l.address}`.toLowerCase().includes(q))).sort(
    (a, b) =>
      Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)) || (sort === 'near' ? distanceMi(a) - distanceMi(b) : free(b) - free(a)),
  )

  return (
    <div className="screen list-screen">
      <SearchBar value={query} onChange={setQuery} />
      <div className="filters">
        <button className={`pill ${mineOnly ? 'on' : ''}`} onClick={() => setMineOnly(!mineOnly)} aria-pressed={mineOnly}>
          <ZoneChip z={ctx.permit} /> can park
        </button>
        <button className={`pill ${sort === 'near' ? 'on' : ''}`} onClick={() => setSort('near')} aria-pressed={sort === 'near'}>
          Nearest
        </button>
        <button className={`pill ${sort === 'open' ? 'on' : ''}`} onClick={() => setSort('open')} aria-pressed={sort === 'open'}>
          Most open
        </button>
      </div>
      <OpenParkingNote ctx={ctx} />
      <div className="cards">
        {lots.length === 0 && (
          <p className="empty">{q ? `No lots match “${query}”.` : `No ${ctx.permit} lots in this prototype yet. Try another permit in Profile.`}</p>
        )}
        {lots.map((l) => {
          const idx = ctx.usable[l.id]
          const f = free(l)
          const st = idx.length ? status(f, idx.length) : 'full'
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
                {lotZones(l).map((z) => (
                  <ZoneChip key={z} z={z} dim={!l.zones.some((b) => b.zone === z && canPark(ctx.permit, l, b, ctx.hour, ctx.weekend))} />
                ))}
              </div>
              <div className="card-bottom">
                <span className="remaining">
                  <i style={{ background: idx.length ? STATUS_COLOR[st] : '#b9bcc6' }} />
                  {idx.length === 0 ? 'Not valid for your permit' : f === 0 ? 'Full' : `${f} remaining for you`}
                </span>
                {f > 0 && <GoButton onClick={() => onGo(l.id)} label={`Navigate to ${l.name}`} />}
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
  ctx,
  fav,
  onFav,
  onGo,
  onClose,
}: {
  lot: Lot
  spaces: boolean[]
  ctx: Ctx
  fav: boolean
  onFav: () => void
  onGo: () => void
  onClose: () => void
}) {
  const idx = ctx.usable[lot.id]
  const free = freeIn(spaces, idx)
  const cap = capacity(lot)
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
      <div className="sheet-stats">
        <div>
          {idx.length ? (
            <strong style={{ color: STATUS_COLOR[status(free, idx.length)] }}>{free} remaining for you</strong>
          ) : (
            <strong className="not-valid">Not valid for your {ctx.permit} permit</strong>
          )}
          <span>
            {cap - spaces.filter((o) => !o).length} of {cap} spaces taken
          </span>
        </div>
        {free > 0 && <GoButton onClick={onGo} label={`Navigate to ${lot.name}`} />}
      </div>
      <ZoneBreakdown lot={lot} spaces={spaces} ctx={ctx} />
      {capacity(lot) <= 80 && <SensorGrid lot={lot} spaces={spaces} usable={idx} />}
    </div>
  )
}

function ZoneBreakdown({ lot, spaces, ctx }: { lot: Lot; spaces: boolean[]; ctx: Ctx }) {
  let start = 0
  return (
    <div className="zones">
      <div className="grid-caption">Live sensors{lot.garage ? ' · whole garage' : ''}</div>
      {lot.zones.map((b) => {
        const range = Array.from({ length: b.count }, (_, k) => start + k)
        start += b.count
        const f = freeIn(spaces, range)
        const ok = canPark(ctx.permit, lot, b, ctx.hour, ctx.weekend)
        const enf = enforced(lot, b.zone, ctx.hour, ctx.weekend)
        return (
          <div key={b.zone} className={`zone-row ${ok ? '' : 'no'}`}>
            <ZoneChip z={b.zone} dim={!ok} />
            <span className="zone-name">
              {ZONE_NAME[b.zone]}
              {b.shared && <em> · shared with A/C</em>}
            </span>
            <div className="bar">
              <div style={{ width: `${(1 - f / b.count) * 100}%` }} />
            </div>
            <span className="zone-free">
              {f}/{b.count}
            </span>
            <span className={`zone-rule ${ok ? 'yes' : ''}`}>{!enf ? 'Open now' : ok ? 'Yours' : 'Not valid'}</span>
          </div>
        )
      })}
    </div>
  )
}

export function SensorGrid({ lot, spaces, usable, highlight }: { lot: Lot; spaces: boolean[]; usable: number[]; highlight?: number | null }) {
  return (
    <div>
      <div className="grid-caption">Each space · entrance on the left</div>
      <div className="spaces">
        {spaces.map((occ, i) => (
          <span
            key={i}
            className={`space ${occ ? 'occ' : 'free'} ${usable.includes(i) ? '' : 'other'} ${highlight === i ? 'target' : ''}`}
            title={`${spaceLabel(lot, i)} · ${occ ? 'taken' : 'open'}`}
          >
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
  ctx,
  spot,
  notice,
  alternative,
  onReroute,
  onParked,
  onCancel,
}: {
  lot: Lot
  spaces: boolean[]
  ctx: Ctx
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
            <h3 className="alert-title">No {ctx.permit} spaces left at {lot.name}</h3>
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
            <p className="muted small">Closest open space for your permit</p>
            <h3 className="spot">
              Space {spaceLabel(lot, spot)} <span className="live">● live</span>
            </h3>
            {notice && <p className="notice">{notice}</p>}
            {capacity(lot) <= 80 ? (
              <SensorGrid lot={lot} spaces={spaces} usable={ctx.usable[lot.id]} highlight={spot} />
            ) : (
              <ZoneBreakdown lot={lot} spaces={spaces} ctx={ctx} />
            )}
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

const GROUPS: { title: string; permits: Permit[] }[] = [
  { title: 'Commuter', permits: ['A', 'C', 'MC'] },
  { title: 'Resident', permits: ['EA', 'ES', 'EVF', 'SJ', 'SO', 'WE'] },
  { title: 'Visitor', permits: ['V'] },
]

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
  const info = PERMITS[permit]
  return (
    <div className="screen profile">
      <h2>Profile</h2>
      {parked && <ParkedCard parked={parked} onEnd={onEndParking} />}

      <section className="permit-card">
        <div className="permit-card-head">
          <ZoneChip z={permit} />
          <strong>{info.name}</strong>
          {info.monthly && (
            <span className="price">
              {info.daily}/day · {info.monthly}/mo
            </span>
          )}
        </div>
        <dl>
          <dt>Who</dt>
          <dd>{info.who}</dd>
          <dt>Valid in</dt>
          <dd>{info.validIn}</dd>
        </dl>
        {info.note && <p className="muted small">{info.note}</p>}
      </section>

      {GROUPS.map((g) => (
        <section key={g.title}>
          <h4>{g.title}</h4>
          <div className="permit-grid">
            {g.permits.map((p) => (
              <button key={p} className={`permit-btn ${permit === p ? 'on' : ''}`} onClick={() => setPermit(p)} aria-pressed={permit === p}>
                <ZoneChip z={p} />
                <span>{PERMITS[p].short}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

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
      <p className="source">
        Permit rules and 2026 prices from{' '}
        <a href="https://transportation.stanford.edu/parking-stanford/purchase-parking/frequently-asked-questions-faqs-parking-permits" target="_blank" rel="noreferrer">
          Stanford Transportation
        </a>
        .
      </p>
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
