import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { itemById, LOCATIONS, locById, money, type LocationId } from './data'
import { Crest, StarBand } from './components/art'
import { AboutPage, CateringPage, CheckoutPage, ConfirmedPage, EventsPage, FarmPage, HomePage, LocationsPage, MenuPage, OrderPage } from './components/pages'
import { ItemSheet } from './components/menu'

/* ---------------- Routing (hash-based so it works on any static host) ---------------- */

export type Route = 'home' | 'menu' | 'order' | 'locations' | 'farm' | 'events' | 'about' | 'catering' | 'checkout' | 'confirmed'
const ROUTES: Route[] = ['home', 'menu', 'order', 'locations', 'farm', 'events', 'about', 'catering', 'checkout', 'confirmed']

const parse = (): Route => {
  const r = window.location.hash.replace(/^#\/?/, '').split('?')[0] as Route
  return ROUTES.includes(r) ? r : 'home'
}

export const go = (r: Route) => {
  window.location.hash = r === 'home' ? '/' : `/${r}`
}

/* ---------------- Cart ---------------- */

export type Line = { key: string; id: string; qty: number; option?: string; note?: string }

type Store = {
  location: LocationId
  setLocation: (l: LocationId) => void
  lines: Line[]
  add: (id: string, option?: string, note?: string) => void
  setQty: (key: string, qty: number) => void
  update: (key: string, patch: Partial<Line>) => void
  clear: () => void
  count: number
  subtotal: number
  openItem: (id: string) => void
  toast: (msg: string) => void
  order: { number: number; pickup: string; name: string; total: number } | null
  placeOrder: (o: { pickup: string; name: string }) => void
}

const Ctx = createContext<Store>(null!)
export const useStore = () => useContext(Ctx)

const NAV: [Route, string][] = [
  ['menu', 'Menu'],
  ['order', 'Order Online'],
  ['locations', 'Locations'],
  ['farm', 'The Farm'],
  ['events', 'Events'],
  ['about', 'Our Story'],
  ['catering', 'Catering'],
]

export default function App() {
  const [route, setRoute] = useState<Route>(parse)
  const [menuOpen, setMenuOpen] = useState(false)
  const [location, setLocation] = useState<LocationId>('stanford')
  const [lines, setLines] = useState<Line[]>([])
  const [itemId, setItemId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [order, setOrder] = useState<Store['order']>(null)

  useEffect(() => {
    const on = () => {
      setRoute(parse())
      setMenuOpen(false)
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 2400)
    return () => clearTimeout(t)
  }, [toastMsg])

  const store = useMemo<Store>(() => {
    const subtotal = lines.reduce((s, l) => s + itemById(l.id).price * l.qty, 0)
    return {
      location,
      setLocation,
      lines,
      add: (id, option, note) => {
        setLines((ls) => {
          const same = ls.find((l) => l.id === id && l.option === option && (l.note ?? '') === (note ?? ''))
          if (same) return ls.map((l) => (l === same ? { ...l, qty: l.qty + 1 } : l))
          return [...ls, { key: `${id}-${Date.now()}`, id, qty: 1, option, note }]
        })
        setToastMsg(`Added ${itemById(id).name}`)
      },
      setQty: (key, qty) => setLines((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l)))),
      update: (key, patch) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l))),
      clear: () => setLines([]),
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      openItem: setItemId,
      toast: setToastMsg,
      order,
      placeOrder: ({ pickup, name }) => {
        setOrder({ number: 100 + Math.floor(Math.random() * 900), pickup, name, total: subtotal * 1.0925 })
        setLines([])
        go('confirmed')
      },
    }
  }, [location, lines, order])

  const page: Record<Route, ReactNode> = {
    home: <HomePage />,
    menu: <MenuPage />,
    order: <OrderPage />,
    locations: <LocationsPage />,
    farm: <FarmPage />,
    events: <EventsPage />,
    about: <AboutPage />,
    catering: <CateringPage />,
    checkout: <CheckoutPage />,
    confirmed: <ConfirmedPage />,
  }

  const loc = locById(location)

  return (
    <Ctx.Provider value={store}>
      <div className="site">
        <div className="border-stripes" aria-hidden />
        <div className="topline">
          <span className="hide-sm">Fresh · Local · Sustainable</span>
          <span className="hide-sm">Four cafes from the farm to the coast</span>
          <a href="#/order">Order ahead for pickup ›</a>
        </div>
        <header className="header">
          <a className="brand" href="#/" aria-label="Founders Farmstand home">
            <Crest size={58} />
            <span className="brand-text">
              <span className="wordmark">Founders</span>
              <span className="sub">Farmstand · Farm to Table</span>
            </span>
          </a>
          <nav className={`nav ${menuOpen ? 'open' : ''}`} aria-label="Main">
            {NAV.map(([r, label]) => (
              <a key={r} href={`#/${r}`} className={route === r || (r === 'order' && route === 'checkout') ? 'on' : ''}>
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <a className="bag" href="#/checkout" aria-label={`Your order, ${store.count} items`}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                <path d="M5 8h14l-1.2 12H6.2zM9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
              {store.count > 0 && <b>{store.count}</b>}
            </a>
            <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Menu">
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        <main key={route} className="main">
          {page[route]}
        </main>

        <footer className="footer">
          <StarBand height={22} />
          <div className="footer-inner">
            <div className="f-brand">
              <Crest size={70} />
              <p className="f-title">Founders Farmstand</p>
              <p>Made for students, grown by students. A farm-to-table cafe of Stanford’s O’Donohue Family Educational Farm.</p>
            </div>
            <div>
              <h4>Visit</h4>
              {LOCATIONS.map((l) => (
                <a key={l.id} href="#/locations" onClick={() => setLocation(l.id)} className="f-loc">
                  <b>{l.name}</b>
                  <span>{l.address[1]}</span>
                </a>
              ))}
            </div>
            <div>
              <h4>Hours · {loc.name}</h4>
              {loc.hours.map(([d, h]) => (
                <p key={d}>
                  {d} <span className="mono">{h}</span>
                </p>
              ))}
              <h4 className="mt">Explore</h4>
              <div className="f-links">
                {NAV.map(([r, label]) => (
                  <a key={r} href={`#/${r}`}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4>The Farm Letter</h4>
              <p>Harvest notes, new dishes and event invites, once a month.</p>
              <form
                className="news"
                onSubmit={(e) => {
                  e.preventDefault()
                  setToastMsg('You’re on the list. See you at the farm!')
                  ;(e.currentTarget as HTMLFormElement).reset()
                }}
              >
                <input type="email" required placeholder="you@stanford.edu" aria-label="Email" />
                <button type="submit">Join</button>
              </form>
              <div className="social">
                <a href="#/about">Instagram</a>
                <a href="#/about">Facebook</a>
                <a href="#/events">Events</a>
              </div>
            </div>
          </div>
          <p className="credits">
            A concept website by Andrew · Founders Farmstand is a student design concept, not a real business. Coastal addresses are fictional.
          </p>
        </footer>

        {itemId && <ItemSheet id={itemId} onClose={() => setItemId(null)} />}
        {toastMsg && (
          <div className="toast" role="status">
            {toastMsg}
          </div>
        )}
        {store.count > 0 && route !== 'checkout' && (
          <a className="cart-pill" href="#/checkout">
            View order · {store.count} · {money(store.subtotal)}
          </a>
        )}
      </div>
    </Ctx.Provider>
  )
}
