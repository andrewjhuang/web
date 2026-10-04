import { useState } from 'react'
import { ago, CATEGORIES, money, type Audience, type Condition, type Listing } from '../data'
import { Bubbles, Burst, Icon, SaveButton, SellerAvatar, sellerOf, Sheet, Verified } from './ui'

type Nav = {
  back?: () => void
  onSearch: () => void
  onMine: () => void
}

/** Search pill header from the mockups: back chevron, search, profile. */
export function MarketHeader({ back, onSearch, onMine, query }: Nav & { query?: string }) {
  return (
    <header className="m-header">
      {back && (
        <button className="back" onClick={back} aria-label="Back">
          <Icon name="back" size={26} stroke={2.6} />
        </button>
      )}
      <button className="search-pill" onClick={onSearch}>
        <Icon name="search" size={18} />
        <span className={query ? '' : 'ph'}>{query || 'Search'}</span>
      </button>
      <button className="icon-btn" onClick={onMine} aria-label="My marketplace">
        <Icon name="user" size={24} />
      </button>
    </header>
  )
}

export function ListingCard({ l, saved, onOpen, onSave }: { l: Listing; saved: boolean; onOpen: () => void; onSave: () => void }) {
  return (
    <article className="l-card" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
      <div className="l-photo">
        <img src={l.photo} alt="" loading="lazy" />
        {l.wasPrice && <span className="l-badge">Price drop</span>}
        {!l.wasPrice && l.postedMin < 60 && <span className="l-badge new">New</span>}
        <SaveButton on={saved} onToggle={onSave} label={saved ? `Unsave ${l.title}` : `Save ${l.title}`} />
      </div>
      <div className="l-info">
        <span className="l-price">
          {money(l.price)}
          {l.wasPrice && <s>{money(l.wasPrice)}</s>}
        </span>
        <span className="l-title">{l.title}</span>
      </div>
    </article>
  )
}

function Grid({ items, saved, onOpen, onSave }: { items: Listing[]; saved: string[]; onOpen: (id: string) => void; onSave: (id: string) => void }) {
  return (
    <div className="l-grid">
      {items.map((l) => (
        <ListingCard key={l.id} l={l} saved={saved.includes(l.id)} onOpen={() => onOpen(l.id)} onSave={() => onSave(l.id)} />
      ))}
    </div>
  )
}

/* ---------------- Home ---------------- */

export function MarketHome({
  listings,
  saved,
  nav,
  onCategory,
  onAllCategories,
  onOpen,
  onSave,
  onSell,
}: {
  listings: Listing[]
  saved: string[]
  nav: Nav
  onCategory: (c: string) => void
  onAllCategories: () => void
  onOpen: (id: string) => void
  onSave: (id: string) => void
  onSell: () => void
}) {
  const recent = [...listings].sort((a, b) => a.postedMin - b.postedMin)
  const drops = listings.filter((l) => saved.includes(l.id) && l.wasPrice)
  return (
    <div className="screen">
      <Bubbles count={9} seed={4} />
      <div className="scroll">
        <MarketHeader {...nav} />
        {drops.length > 0 && (
          <button className="alert-row" onClick={nav.onMine}>
            <span>💸</span>
            <span>
              <b>Price drop</b> on {drops[0].title}
              {drops.length > 1 ? ` and ${drops.length - 1} more you saved` : ', which you saved'}
            </span>
            <Icon name="back" size={16} />
          </button>
        )}
        <div className="sec-head">
          <h2>Categories</h2>
          <button className="see-all" onClick={onAllCategories}>
            See All
          </button>
        </div>
        <CategoryGrid cats={CATEGORIES.slice(0, 8)} onCategory={onCategory} />
        <div className="divider" />
        <div className="sec-head">
          <h2>Recent Listings</h2>
        </div>
        <Grid items={recent} saved={saved} onOpen={onOpen} onSave={onSave} />
      </div>
      <button className="fab" onClick={onSell} aria-label="Sell an item">
        <Icon name="plus" size={20} stroke={2.6} /> Sell
      </button>
    </div>
  )
}

function CategoryGrid({ cats, onCategory }: { cats: typeof CATEGORIES; onCategory: (c: string) => void }) {
  return (
    <div className="cat-grid">
      {cats.map((c) => (
        <button key={c.name} className="cat" onClick={() => onCategory(c.name)}>
          <span className="cat-tile">{c.emoji}</span>
          {c.name}
        </button>
      ))}
    </div>
  )
}

export function AllCategories({ nav, onCategory }: { nav: Nav; onCategory: (c: string) => void }) {
  return (
    <div className="screen">
      <div className="scroll">
        <MarketHeader {...nav} />
        <div className="sec-head">
          <h2>All Categories</h2>
        </div>
        <CategoryGrid cats={CATEGORIES} onCategory={onCategory} />
      </div>
    </div>
  )
}

/* ---------------- Search ---------------- */

export function SearchScreen({
  listings,
  recents,
  setRecents,
  initial,
  onSubmit,
  onCancel,
}: {
  listings: Listing[]
  recents: string[]
  setRecents: (r: string[]) => void
  initial: string
  onSubmit: (q: string) => void
  onCancel: () => void
}) {
  const [q, setQ] = useState(initial)
  const t = q.trim().toLowerCase()
  const suggestions = t ? listings.filter((l) => l.title.toLowerCase().includes(t) || l.categories.some((c) => c.toLowerCase().includes(t))).slice(0, 5) : []
  const submit = (v: string) => {
    const s = v.trim()
    if (!s) return
    setRecents([s, ...recents.filter((r) => r.toLowerCase() !== s.toLowerCase())].slice(0, 8))
    onSubmit(s)
  }
  return (
    <div className="screen">
      <div className="scroll">
        <form
          className="m-header"
          onSubmit={(e) => {
            e.preventDefault()
            submit(q)
          }}
        >
          <label className="search-pill input">
            <Icon name="search" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search marketplace" />
          </label>
          <button type="button" className="cancel" onClick={onCancel}>
            Cancel
          </button>
        </form>
        {suggestions.length > 0 && (
          <div className="suggest-list">
            {suggestions.map((l) => (
              <button key={l.id} onClick={() => submit(l.title)}>
                <img src={l.photo} alt="" />
                <span>{l.title}</span>
                <em>{money(l.price)}</em>
              </button>
            ))}
          </div>
        )}
        {recents.length > 0 && (
          <div className="recents">
            <h3>Recent</h3>
            {recents.map((r) => (
              <div key={r} className="recent-row">
                <button onClick={() => submit(r)}>{r}</button>
                <button className="icon-btn" onClick={() => setRecents(recents.filter((x) => x !== r))} aria-label={`Remove ${r}`}>
                  <Icon name="x" size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- Results (category or search) ---------------- */

type Filters = { conditions: Condition[]; sizes: string[]; audience: Audience[]; maxPrice: number }
const NO_FILTERS: Filters = { conditions: [], sizes: [], audience: [], maxPrice: 500 }
type Sort = 'relevance' | 'new' | 'low' | 'high'
const SORTS: [Sort, string][] = [
  ['relevance', 'Relevance'],
  ['new', 'Newly listed'],
  ['low', 'Price: low to high'],
  ['high', 'Price: high to low'],
]

export function Results({
  title,
  query,
  base,
  saved,
  nav,
  alerts,
  onToggleAlert,
  onOpen,
  onSave,
  onSell,
}: {
  title: string
  query?: string
  base: Listing[]
  saved: string[]
  nav: Nav
  alerts: string[]
  onToggleAlert: (key: string) => void
  onOpen: (id: string) => void
  onSave: (id: string) => void
  onSell: () => void
}) {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [sort, setSort] = useState<Sort>('relevance')
  const [sheet, setSheet] = useState<'filter' | 'sort' | null>(null)
  const [k, setK] = useState(0)

  const items = base
    .filter((l) => !filters.conditions.length || filters.conditions.includes(l.condition))
    .filter((l) => !filters.sizes.length || filters.sizes.includes(l.size))
    .filter((l) => !filters.audience.length || (l.audience && filters.audience.includes(l.audience)))
    .filter((l) => filters.maxPrice >= 500 || l.price <= filters.maxPrice)
    .sort((a, b) => (sort === 'new' ? a.postedMin - b.postedMin : sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0))

  const active = filters.conditions.length + filters.sizes.length + filters.audience.length + (filters.maxPrice < 500 ? 1 : 0)
  const alertKey = query ? `q:${query}` : `c:${title}`
  const alertOn = alerts.includes(alertKey)
  const sizes = [...new Set(base.map((l) => l.size).filter((s) => s !== 'n/a'))]

  return (
    <div className="screen">
      <div className="scroll">
        <MarketHeader {...nav} query={query} />
        <div className="tools">
          <button className={`tool ${active ? 'on' : ''}`} onClick={() => setSheet('filter')}>
            <Icon name="filter" size={16} /> Filter{active ? ` · ${active}` : ''}
          </button>
          <button className={`tool ${sort !== 'relevance' ? 'on' : ''}`} onClick={() => setSheet('sort')}>
            <Icon name="sort" size={16} /> {sort === 'relevance' ? 'Sort' : SORTS.find((s) => s[0] === sort)![1]}
          </button>
        </div>
        <h2 className="results-title">{query ? `“${query}”` : title}</h2>
        {items.length ? (
          <Grid items={items} saved={saved} onOpen={onOpen} onSave={onSave} />
        ) : (
          <div className="no-results">
            <p className="nr-title">No results found</p>
            {active > 0 ? (
              <button className="outline" onClick={() => setFilters(NO_FILTERS)}>
                Clear filters
              </button>
            ) : (
              <>
                <p className="muted">Nobody's selling {query ? `“${query}”` : title.toLowerCase()} right now.</p>
                <div className="nr-actions">
                  <button
                    className={`outline ${alertOn ? 'on' : ''}`}
                    onClick={() => {
                      if (!alertOn) setK((x) => x + 1)
                      onToggleAlert(alertKey)
                    }}
                  >
                    <Icon name="bell" size={16} /> {alertOn ? "We'll notify you" : 'Notify me'}
                    <Burst k={k} />
                  </button>
                  <button className="red-btn small" onClick={onSell}>
                    Sell one
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {sheet === 'filter' && (
        <Sheet title="Filter by" icon="filter" onClose={() => setSheet(null)}>
          <FilterBody value={filters} onChange={setFilters} sizes={sizes} />
          <div className="sheet-foot">
            <button className="link" onClick={() => setFilters(NO_FILTERS)}>
              Reset
            </button>
            <button className="red-btn" onClick={() => setSheet(null)}>
              Show {items.length} result{items.length === 1 ? '' : 's'}
            </button>
          </div>
        </Sheet>
      )}
      {sheet === 'sort' && (
        <Sheet title="Sort by" icon="sort" onClose={() => setSheet(null)}>
          <div className="opt-grid">
            {SORTS.map(([v, label]) => (
              <button
                key={v}
                className={`opt ${sort === v ? 'on' : ''}`}
                onClick={() => {
                  setSort(v)
                  setSheet(null)
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  )
}

function FilterBody({ value, onChange, sizes }: { value: Filters; onChange: (f: Filters) => void; sizes: string[] }) {
  const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x])
  return (
    <>
      <div className="opt-grid">
        {(['Womens', 'Mens'] as Audience[]).map((a) => (
          <button key={a} className={`opt ${value.audience.includes(a) ? 'on' : ''}`} onClick={() => onChange({ ...value, audience: toggle(value.audience, a) })}>
            {a}
          </button>
        ))}
      </div>
      <h4 className="opt-label">Condition</h4>
      <div className="opt-grid">
        {(['New', 'Used'] as Condition[]).map((c) => (
          <button key={c} className={`opt ${value.conditions.includes(c) ? 'on' : ''}`} onClick={() => onChange({ ...value, conditions: toggle(value.conditions, c) })}>
            {c}
          </button>
        ))}
      </div>
      {sizes.length > 0 && (
        <>
          <h4 className="opt-label">Size</h4>
          <div className="opt-row">
            {sizes.map((s) => (
              <button key={s} className={`opt small ${value.sizes.includes(s) ? 'on' : ''}`} onClick={() => onChange({ ...value, sizes: toggle(value.sizes, s) })}>
                {s}
              </button>
            ))}
          </div>
        </>
      )}
      <h4 className="opt-label">
        Max price <b>{value.maxPrice >= 500 ? 'Any' : `$${value.maxPrice}`}</b>
      </h4>
      <input type="range" min={5} max={500} step={5} value={value.maxPrice} onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })} aria-label="Max price" />
    </>
  )
}

/* ---------------- Listing detail ---------------- */

export function ListingDetail({
  l,
  saved,
  isMine,
  sold,
  back,
  onSave,
  onMessage,
  onOffer,
  onMarkSold,
}: {
  l: Listing
  saved: boolean
  isMine: boolean
  sold: boolean
  back: () => void
  onSave: () => void
  onMessage: () => void
  onOffer: (amount: number, note: string) => void
  onMarkSold: () => void
}) {
  const [menu, setMenu] = useState(false)
  const [offer, setOffer] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const s = sellerOf(l.seller)

  return (
    <div className="screen detail">
      <div className="scroll">
        <header className="d-header">
          <button className="back" onClick={back} aria-label="Back">
            <Icon name="back" size={26} stroke={2.6} />
          </button>
          <div className="d-actions">
            {!isMine && <SaveButton on={saved} onToggle={onSave} label={saved ? 'Unsave' : 'Save'} className="flat" />}
            <button className="icon-btn" onClick={() => setMenu(true)} aria-label="More options">
              <Icon name="more" size={24} />
            </button>
          </div>
        </header>
        <div className="d-photo">
          <img src={l.photo} alt={l.title} />
          {sold && <span className="sold-stamp">SOLD</span>}
        </div>
        <div className="d-body">
          <div className="d-price">
            {money(l.price)}
            {l.wasPrice && (
              <span className="drop">
                <s>{money(l.wasPrice)}</s> Price drop
              </span>
            )}
          </div>
          <h1 className="d-title">{l.title}</h1>
          <p className="d-posted">Posted {ago(l.postedMin, true)}</p>

          {isMine ? (
            <button className="red-btn full" disabled={sold} onClick={onMarkSold}>
              {sold ? 'Sold' : 'Mark as sold'}
            </button>
          ) : (
            <div className="d-cta">
              <button className="red-btn" onClick={onMessage}>
                Message Seller
              </button>
              <button className="outline" onClick={() => setOffer(true)}>
                Make offer
              </button>
            </div>
          )}

          {s !== 'you' && (
            <div className="seller-row">
              <SellerAvatar seller={s} size={40} />
              <div>
                <strong>
                  {s.handle} <Verified />
                </strong>
                <span>
                  ★ {s.rating.toFixed(1)} · {s.sales} sales · replies {s.replies}
                </span>
              </div>
            </div>
          )}

          <div className="rule" />
          <h3 className="d-h">Overview</h3>
          <dl className="overview">
            <dt>Condition</dt>
            <dd>{l.condition}</dd>
            <dt>Category</dt>
            <dd>{l.categories.join(', ')}</dd>
            <dt>Size</dt>
            <dd>{l.size}</dd>
          </dl>
          <div className="rule" />
          <h3 className="d-h light">Description</h3>
          <p className="d-desc">{l.description}</p>

          <div className="meetup">
            <Icon name="shield" size={20} />
            <div>
              <strong>Meet at {l.meetup}</strong>
              <span>Public campus spots only. Never share your dorm room, and pay on pickup.</span>
            </div>
          </div>
          {notice && <p className="notice">{notice}</p>}
        </div>
      </div>

      {menu && (
        <Sheet title={l.title} onClose={() => setMenu(false)}>
          <div className="menu">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`fizz.social/marketplace/${l.id}`).catch(() => {})
                setNotice('Link copied')
                setMenu(false)
              }}
            >
              <Icon name="share" size={20} /> Share listing
            </button>
            {!isMine && (
              <button
                className="danger"
                onClick={() => {
                  setNotice('Thanks for reporting. Our team will review this listing.')
                  setMenu(false)
                }}
              >
                <Icon name="shield" size={20} /> Report listing
              </button>
            )}
          </div>
        </Sheet>
      )}
      {offer && (
        <OfferSheet
          l={l}
          onClose={() => setOffer(false)}
          onSend={(a, n) => {
            setOffer(false)
            onOffer(a, n)
          }}
        />
      )}
    </div>
  )
}

function OfferSheet({ l, onClose, onSend }: { l: Listing; onClose: () => void; onSend: (amount: number, note: string) => void }) {
  const quick = [1, 0.9, 0.8].map((k) => Math.max(1, Math.round(l.price * k)))
  const [amount, setAmount] = useState(quick[1])
  const [note, setNote] = useState(`Hi! Could you do $${quick[1]}? I can meet at ${l.meetup}.`)
  return (
    <Sheet title="Make an offer" onClose={onClose}>
      <p className="muted center">Asking {money(l.price)}. The seller gets a card they can accept or counter.</p>
      <div className="opt-grid three">
        {quick.map((q, i) => (
          <button
            key={i}
            className={`opt ${amount === q ? 'on' : ''}`}
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
      <label className="amount">
        <span>$</span>
        <input type="number" min={1} value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} aria-label="Offer amount" />
      </label>
      <textarea className="field" rows={2} value={note} onChange={(e) => setNote(e.target.value)} aria-label="Note to seller" />
      <button className="red-btn full" disabled={amount <= 0} onClick={() => onSend(amount, note)}>
        Send ${amount} offer
      </button>
    </Sheet>
  )
}

/* ---------------- My marketplace ---------------- */

export type MyStats = Record<string, { views: number; sold?: boolean }>

export function MyMarket({
  listings,
  mine,
  stats,
  saved,
  back,
  onOpen,
  onSave,
  onSell,
}: {
  listings: Listing[]
  mine: string[]
  stats: MyStats
  saved: string[]
  back: () => void
  onOpen: (id: string) => void
  onSave: (id: string) => void
  onSell: () => void
}) {
  const [tab, setTab] = useState<'selling' | 'saved'>(mine.length ? 'selling' : 'saved')
  const selling = listings.filter((l) => mine.includes(l.id))
  const savedItems = listings.filter((l) => saved.includes(l.id))
  return (
    <div className="screen">
      <div className="scroll">
        <header className="d-header">
          <button className="back" onClick={back} aria-label="Back">
            <Icon name="back" size={26} stroke={2.6} />
          </button>
          <h2 className="h-title">My Marketplace</h2>
          <span style={{ width: 34 }} />
        </header>
        <div className="tabs">
          <button className={tab === 'selling' ? 'on' : ''} onClick={() => setTab('selling')}>
            Selling{selling.length ? ` · ${selling.length}` : ''}
          </button>
          <button className={tab === 'saved' ? 'on' : ''} onClick={() => setTab('saved')}>
            Saved{savedItems.length ? ` · ${savedItems.length}` : ''}
          </button>
        </div>
        {tab === 'selling' &&
          (selling.length ? (
            <div className="mine-list">
              {selling.map((l) => {
                const st = stats[l.id] ?? { views: 0 }
                return (
                  <button key={l.id} className={`mine-row ${st.sold ? 'sold' : ''}`} onClick={() => onOpen(l.id)}>
                    <img src={l.photo} alt="" />
                    <span className="mine-info">
                      <strong>{l.title}</strong>
                      <span>
                        {money(l.price)} · {st.sold ? 'Sold' : 'Active'}
                      </span>
                      <span className="muted">
                        👀 {st.views} view{st.views === 1 ? '' : 's'} · ♡ {l.saves} save{l.saves === 1 ? '' : 's'}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="no-results">
              <p className="nr-title">You're not selling anything yet</p>
              <button className="red-btn small" onClick={onSell}>
                List an item
              </button>
            </div>
          ))}
        {tab === 'saved' &&
          (savedItems.length ? (
            <Grid items={savedItems} saved={saved} onOpen={onOpen} onSave={onSave} />
          ) : (
            <div className="no-results">
              <p className="nr-title">Nothing saved yet</p>
              <p className="muted">Tap ♡ on a listing and we'll tell you if the price drops.</p>
            </div>
          ))}
      </div>
    </div>
  )
}
