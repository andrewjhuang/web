import { useState } from 'react'
import { ago, CATEGORIES, MEETUPS, price, type Category, type Condition, type Listing } from '../data'
import { Bubbles, Heart, Icon, isVerified, SellerAvatar, sellerOf, Sheet, Verified } from './ui'

export type MarketView = 'browse' | 'saved' | 'mine'
export type MyStats = Record<string, { views: number; sold?: boolean }>

type Filters = { maxPrice: number; conditions: Condition[]; meetups: string[]; verifiedOnly: boolean }
const NO_FILTERS: Filters = { maxPrice: 2000, conditions: [], meetups: [], verifiedOnly: false }

const offPct = (l: Listing) => (l.retail && l.price > 0 ? Math.round((1 - l.price / l.retail) * 100) : null)

export function Market({
  listings,
  saved,
  toggleSave,
  view,
  setView,
  mine,
  myStats,
  onMarkSold,
  onOpen,
  onSell,
}: {
  listings: Listing[]
  saved: string[]
  toggleSave: (id: string) => void
  view: MarketView
  setView: (v: MarketView) => void
  mine: string[]
  myStats: MyStats
  onMarkSold: (id: string) => void
  onOpen: (id: string) => void
  onSell: () => void
}) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<Category | null>(null)
  const [sort, setSort] = useState<'new' | 'low' | 'deal'>('new')
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const activeFilters = (filters.maxPrice < NO_FILTERS.maxPrice ? 1 : 0) + filters.conditions.length + filters.meetups.length + (filters.verifiedOnly ? 1 : 0)

  const query = q.trim().toLowerCase()
  const browse = listings
    .filter((l) => !mine.includes(l.id))
    .filter((l) => !cat || l.category === cat)
    .filter((l) => {
      if (!query) return true
      // Match course codes typed with or without a space ("cs 106b" finds "cs106b").
      const hay = [l.title, l.description, l.category, ...(l.tags ?? [])].join(' ').toLowerCase()
      return hay.includes(query) || hay.includes(query.replace(/\s+/g, ''))
    })
    .filter((l) => l.price <= filters.maxPrice)
    .filter((l) => !filters.conditions.length || filters.conditions.includes(l.condition))
    .filter((l) => !filters.meetups.length || filters.meetups.includes(l.meetup))
    .filter((l) => !filters.verifiedOnly || isVerified(l.seller))
    .sort((a, b) => (sort === 'new' ? a.postedMin - b.postedMin : sort === 'low' ? a.price - b.price : (offPct(b) ?? -1) - (offPct(a) ?? -1)))

  const savedListings = listings.filter((l) => saved.includes(l.id))
  const drops = savedListings.filter((l) => l.dropFrom)
  const myListings = listings.filter((l) => mine.includes(l.id))

  return (
    <div className="screen split market">
      <div className="scroll">
        <header className="hero">
          <Bubbles count={16} seed={3} />
          <div className="hero-top">
            <h1>Marketplace</h1>
            <button className="sell-btn" onClick={onSell}>
              <Icon name="plus" size={16} /> Sell
            </button>
          </div>
          <label className="search">
            <Icon name="search" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search textbooks, course codes, furniture…" aria-label="Search marketplace" />
            {q && (
              <button className="icon-btn" onClick={() => setQ('')} aria-label="Clear search">
                <Icon name="x" size={16} />
              </button>
            )}
          </label>
          <div className="seg" role="tablist">
            {(
              [
                ['browse', 'Browse'],
                ['saved', `Saved${saved.length ? ` · ${saved.length}` : ''}`],
                ['mine', `My listings${mine.length ? ` · ${mine.length}` : ''}`],
              ] as const
            ).map(([v, label]) => (
              <button key={v} role="tab" aria-selected={view === v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>
                {label}
              </button>
            ))}
          </div>
        </header>

        {view === 'browse' && (
          <>
            <div className="cats" role="list">
              <button className={`cat ${!cat ? 'on' : ''}`} onClick={() => setCat(null)}>
                <span>✨</span>All
              </button>
              {CATEGORIES.map((c) => (
                <button key={c.name} className={`cat ${cat === c.name ? 'on' : ''}`} onClick={() => setCat(cat === c.name ? null : c.name)}>
                  <span>{c.emoji}</span>
                  {c.name}
                </button>
              ))}
            </div>
            <div className="toolbar">
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort">
                <option value="new">Newest</option>
                <option value="low">Price: low to high</option>
                <option value="deal">Biggest deal</option>
              </select>
              <button className={`filter-btn ${activeFilters ? 'on' : ''}`} onClick={() => setFilterOpen(true)}>
                <Icon name="filter" size={16} /> Filters{activeFilters ? ` · ${activeFilters}` : ''}
              </button>
            </div>
            {browse.length === 0 ? (
              <div className="empty">
                <p>Nothing matches yet.</p>
                <button className="link" onClick={() => (setQ(''), setCat(null), setFilters(NO_FILTERS))}>
                  Clear search and filters
                </button>
              </div>
            ) : (
              <div className="grid">
                {browse.map((l) => (
                  <Card key={l.id} l={l} saved={saved.includes(l.id)} onSave={() => toggleSave(l.id)} onOpen={() => onOpen(l.id)} />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'saved' && (
          <>
            {drops.length > 0 && (
              <div className="drop-banner">
                💸{' '}
                <b>
                  {drops.length} price drop{drops.length > 1 ? 's' : ''}
                </b>{' '}
                on items you saved
              </div>
            )}
            {savedListings.length === 0 ? (
              <div className="empty">
                <p>Tap ♡ on anything to save it. We'll tell you if the price drops.</p>
              </div>
            ) : (
              <div className="grid">
                {savedListings.map((l) => (
                  <Card key={l.id} l={l} saved onSave={() => toggleSave(l.id)} onOpen={() => onOpen(l.id)} />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'mine' && (
          <div className="mine">
            {myListings.length === 0 ? (
              <div className="empty">
                <p>You haven't listed anything yet.</p>
                <button className="primary small" onClick={onSell}>
                  List an item
                </button>
              </div>
            ) : (
              myListings.map((l) => {
                const st = myStats[l.id] ?? { views: 0 }
                return (
                  <div key={l.id} className={`mine-row ${st.sold ? 'sold' : ''}`}>
                    <div className="thumb" style={{ background: l.bg }} onClick={() => onOpen(l.id)}>
                      {l.emoji}
                    </div>
                    <div className="mine-info">
                      <strong>{l.title}</strong>
                      <span>
                        {price(l.price)} · {st.sold ? 'Sold' : 'Active'}
                      </span>
                      <span className="muted">
                        👀 {st.views} view{st.views === 1 ? '' : 's'} · ♡ {l.saves} save{l.saves === 1 ? '' : 's'}
                      </span>
                    </div>
                    {!st.sold && (
                      <button className="ghost small" onClick={() => onMarkSold(l.id)}>
                        Mark sold
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {filterOpen && <FilterSheet value={filters} onChange={setFilters} onClose={() => setFilterOpen(false)} count={browse.length} />}
    </div>
  )
}

function Card({ l, saved, onSave, onOpen }: { l: Listing; saved: boolean; onSave: () => void; onOpen: () => void }) {
  const off = offPct(l)
  return (
    <article className="card" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
      <div className="tile" style={{ background: l.bg }}>
        <span className="tile-emoji">{l.emoji}</span>
        {l.dropFrom && <span className="badge drop">Price drop</span>}
        {!l.dropFrom && l.postedMin < 30 && <span className="badge new">New</span>}
        <Heart on={saved} onToggle={onSave} label={saved ? `Unsave ${l.title}` : `Save ${l.title}`} />
      </div>
      <div className="card-body">
        <div className="price-row">
          <strong className={l.price === 0 ? 'free' : ''}>{price(l.price)}</strong>
          {l.dropFrom && <s>{price(l.dropFrom)}</s>}
          {!l.dropFrom && off !== null && off >= 40 && <span className="off">-{off}%</span>}
        </div>
        <p className="title">{l.title}</p>
        <p className="meta">
          <Icon name="pin" size={12} /> {l.meetup} · {ago(l.postedMin)}
        </p>
      </div>
    </article>
  )
}

function FilterSheet({ value, onChange, onClose, count }: { value: Filters; onChange: (f: Filters) => void; onClose: () => void; count: number }) {
  const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x])
  return (
    <Sheet title="Filters" onClose={onClose}>
      <div className="field">
        <label>
          Max price <b>{value.maxPrice >= 2000 ? 'Any' : `$${value.maxPrice}`}</b>
        </label>
        <input type="range" min={0} max={2000} step={10} value={value.maxPrice} onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })} />
      </div>
      <div className="field">
        <label>Condition</label>
        <div className="chips">
          {(['New', 'Like new', 'Good', 'Fair'] as Condition[]).map((c) => (
            <button
              key={c}
              className={`chip ${value.conditions.includes(c) ? 'on' : ''}`}
              onClick={() => onChange({ ...value, conditions: toggle(value.conditions, c) })}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Pickup spot</label>
        <div className="chips">
          {MEETUPS.map((m) => (
            <button
              key={m}
              className={`chip ${value.meetups.includes(m) ? 'on' : ''}`}
              onClick={() => onChange({ ...value, meetups: toggle(value.meetups, m) })}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <label className="switch-row">
        <span>
          <Verified /> Verified students only
        </span>
        <input type="checkbox" checked={value.verifiedOnly} onChange={(e) => onChange({ ...value, verifiedOnly: e.target.checked })} />
      </label>
      <div className="sheet-actions">
        <button className="link" onClick={() => onChange(NO_FILTERS)}>
          Reset
        </button>
        <button className="primary" onClick={onClose}>
          Show {count} item{count === 1 ? '' : 's'}
        </button>
      </div>
    </Sheet>
  )
}

/* ---------------- Listing detail ---------------- */

export function ListingDetail({
  l,
  saved,
  isMine,
  onSave,
  onBack,
  onMessage,
  onOffer,
}: {
  l: Listing
  saved: boolean
  isMine: boolean
  onSave: () => void
  onBack: () => void
  onMessage: () => void
  onOffer: (amount: number, note: string) => void
}) {
  const [photo, setPhoto] = useState(0)
  const [offerOpen, setOfferOpen] = useState(false)
  const [reported, setReported] = useState(false)
  const s = sellerOf(l.seller)
  const off = offPct(l)
  const photos = [0, -12, 10]

  return (
    <div className="screen split detail">
      <div className="scroll">
        <div className="gallery" style={{ background: l.bg }}>
          <Bubbles count={8} seed={l.id.length} />
          <span className="gallery-emoji" key={photo} style={{ transform: `rotate(${photos[photo]}deg)` }}>
            {l.emoji}
          </span>
          <button className="round back" onClick={onBack} aria-label="Back">
            <Icon name="back" size={20} />
          </button>
          <div className="gallery-actions">
            <button className="round" aria-label="Share" onClick={() => navigator.clipboard?.writeText(`fizz.social/m/${l.id}`).catch(() => {})}>
              <Icon name="share" size={18} />
            </button>
            {!isMine && <Heart on={saved} onToggle={onSave} label={saved ? 'Unsave' : 'Save'} />}
          </div>
          <div className="dots">
            {photos.map((_, i) => (
              <button key={i} className={i === photo ? 'on' : ''} onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`} />
            ))}
          </div>
        </div>

        <div className="detail-body">
          <div className="price-row big">
            <strong className={l.price === 0 ? 'free' : ''}>{price(l.price)}</strong>
            {l.category === 'Sublets' && <span className="muted">/ month</span>}
            {l.dropFrom && <s>{price(l.dropFrom)}</s>}
            {off !== null && <span className="off">{off}% below retail</span>}
          </div>
          <h2>{l.title}</h2>
          <div className="chips">
            <span className="chip static">{l.condition}</span>
            <span className="chip static">{l.category}</span>
            <span className="chip static">Posted {ago(l.postedMin)} ago</span>
            <span className="chip static">♡ {l.saves + (saved ? 1 : 0)}</span>
          </div>

          <div className="seller">
            <SellerAvatar seller={s} size={44} />
            <div>
              <strong>
                {s === 'you' ? 'You' : s.handle} {s !== 'you' && s.verified && <Verified />}
              </strong>
              {s !== 'you' && (
                <span className="muted">
                  ★ {s.rating.toFixed(1)} · {s.sales} sales · replies {s.replies}
                </span>
              )}
            </div>
          </div>

          <p className="desc">{l.description}</p>

          <div className="safe">
            <Icon name="shield" size={20} />
            <div>
              <strong>Meet at {l.meetup}</strong>
              <span>Public campus spots only. Never share your dorm room. Pay on pickup.</span>
            </div>
          </div>

          {!isMine && (
            <button className="link report" onClick={() => setReported(true)} disabled={reported}>
              {reported ? 'Thanks, our team will review this listing' : 'Report listing'}
            </button>
          )}
        </div>
      </div>

      {!isMine && (
        <div className="action-bar">
          <button className="ghost" onClick={onMessage}>
            <Icon name="chat" size={18} /> Message
          </button>
          <button className="primary" onClick={() => (l.price === 0 ? onOffer(0, "I'd love to grab this!") : setOfferOpen(true))}>
            {l.price === 0 ? 'Request it' : 'Make offer'}
          </button>
        </div>
      )}

      {offerOpen && <OfferSheet l={l} onClose={() => setOfferOpen(false)} onSend={(a, n) => (setOfferOpen(false), onOffer(a, n))} />}
    </div>
  )
}

function OfferSheet({ l, onClose, onSend }: { l: Listing; onClose: () => void; onSend: (amount: number, note: string) => void }) {
  const quick = [1, 0.9, 0.8].map((k) => Math.round(l.price * k))
  const [amount, setAmount] = useState(quick[1])
  const [note, setNote] = useState(`Hi! Could you do $${quick[1]}? I can meet at ${l.meetup}.`)
  return (
    <Sheet title="Make an offer" onClose={onClose}>
      <p className="muted small">Asking {price(l.price)}. Offers go straight to the seller as a card they can accept or counter.</p>
      <div className="quick">
        {quick.map((q, i) => (
          <button
            key={q}
            className={`chip ${amount === q ? 'on' : ''}`}
            onClick={() => {
              setAmount(q)
              setNote(i === 0 ? `I'll take it at $${q}! I can meet at ${l.meetup}.` : `Hi! Could you do $${q}? I can meet at ${l.meetup}.`)
            }}
          >
            ${q}
            {i > 0 && <small> −{i * 10}%</small>}
          </button>
        ))}
      </div>
      <div className="field">
        <label htmlFor="amt">Your offer</label>
        <div className="amount">
          <span>$</span>
          <input id="amt" type="number" min={1} value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="note">Note</label>
        <textarea id="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <button className="primary full" disabled={amount <= 0} onClick={() => onSend(amount, note)}>
        Send ${amount} offer
      </button>
    </Sheet>
  )
}
