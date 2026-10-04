import { useState } from 'react'
import { go, useStore } from '../App'
import { ALL_ITEMS, EVENTS, itemById, LOCATIONS, locById, money, PARTNERS, type LocationId } from '../data'
import { CoastMap, HeroPoster, Logomark, StarBand } from './art'
import { MenuBoard, Postcard, SectionTitle, Star } from './menu'

const NAMES = Object.fromEntries(LOCATIONS.map((l) => [l.id, l.name])) as Record<LocationId, string>

/* ---------------- Home ---------------- */

export function HomePage() {
  const { openItem, setLocation } = useStore()
  const features = ALL_ITEMS.filter((i) => i.feature)
  return (
    <>
      <section className="hero">
        <HeroPoster />
        <div className="hero-card">
          <p className="spaced">Souvenir Menu · Spring 2026</p>
          <h1>
            From the farm
            <br />
            to the coast
          </h1>
          <p className="hero-sub">Seasonal toasts, bowls and farm coffee from Stanford’s O’Donohue Farm, now at four cafes from campus to the Pacific.</p>
          <div className="hero-actions">
            <a className="btn" href="#/order">
              Order for pickup
            </a>
            <a className="btn ghost" href="#/menu">
              See the menu
            </a>
          </div>
        </div>
        <p className="poster-caption">THE FARMSTAND AT DUSK</p>
      </section>

      <section className="values">
        {['Fresh', 'Local', 'Sustainable', 'Organic', 'Community'].map((v) => (
          <span key={v}>
            <Star size={12} /> {v}
          </span>
        ))}
      </section>

      <section className="wrap">
        <SectionTitle kicker="Favorites from the farm">This week’s plates</SectionTitle>
        <div className="feature-grid">
          {features.map((i) => (
            <button key={i.id} className="feature" onClick={() => openItem(i.id)}>
              <Postcard src={i.photo!} />
              <span className="f-name">{i.name}</span>
              <span className="f-meta">
                {i.vendors.split(',')[0]} · <span className="mono">{money(i.price)}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="center">
          <a className="btn ghost" href="#/menu">
            The full souvenir menu ›
          </a>
        </p>
      </section>

      <section className="story-band">
        <div className="wrap split">
          <Postcard src="/photos/greenhouse.jpg" caption="Strawberry rows, O’Donohue Farm" className="tilt-l" />
          <div>
            <p className="kicker">Where did our berry toast come from?</p>
            <h2>Picked this morning, about forty steps away.</h2>
            <p>
              Our berries ripen in the hoop houses beside the Stanford cafe. Ricotta comes from Deer Hollow Farm in Cupertino and the sourdough from Manresa Bread. On the
              coast, the crab comes off the boats at Pillar Point and the artichokes from Pescadero.
            </p>
            <a className="btn" href="#/farm">
              Meet our growers
            </a>
          </div>
        </div>
      </section>

      <section className="wrap">
        <SectionTitle kicker="Four cafes">Greetings from the Peninsula</SectionTitle>
        <div className="loc-grid">
          {LOCATIONS.map((l) => (
            <a key={l.id} className={`loc-card ${l.coastal ? 'coastal' : ''}`} href="#/locations" onClick={() => setLocation(l.id)}>
              <Postcard src={l.photo} />
              <span className="loc-name">{l.name}</span>
              <span className="loc-tag">
                {l.tagline}
                {l.coastal && <em> · New</em>}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="events-band">
        <div className="wrap">
          <SectionTitle kicker="Come eat and learn">On the calendar</SectionTitle>
          <div className="event-row">
            {EVENTS.slice(0, 3).map((e) => (
              <a key={e.id} className="ticket" href="#/events">
                <span className="t-kind">{e.kind}</span>
                <span className="t-title">{e.title}</span>
                <span className="t-when">{e.when}</span>
                <span className="t-where">{NAMES[e.where]}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

/* ---------------- Menu ---------------- */

export function MenuPage() {
  const { location, setLocation } = useStore()
  return (
    <section className="wrap page">
      <div className="menu-head">
        <p className="spaced">Founders Farmstand</p>
        <h1 className="display">Souvenir Menu</h1>
        <LocationPicker value={location} onChange={setLocation} label="Showing the menu at" />
      </div>
      <div className="menu-paper">
        <MenuBoard />
      </div>
      <p className="center">
        <a className="btn" href="#/order">
          Order for pickup ›
        </a>
      </p>
    </section>
  )
}

export function LocationPicker({ value, onChange, label }: { value: LocationId; onChange: (l: LocationId) => void; label: string }) {
  return (
    <div className="loc-picker">
      <span>{label}</span>
      <div className="seg">
        {LOCATIONS.map((l) => (
          <button key={l.id} className={value === l.id ? 'on' : ''} onClick={() => onChange(l.id)}>
            {l.name}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Order ---------------- */

export function OrderPage() {
  const { location, setLocation, count, subtotal } = useStore()
  const loc = locById(location)
  return (
    <section className="wrap page">
      <SectionTitle kicker="Order online">Pickup in about 15 minutes</SectionTitle>
      <div className="order-locs">
        {LOCATIONS.map((l) => (
          <button key={l.id} className={`order-loc ${location === l.id ? 'on' : ''}`} onClick={() => setLocation(l.id)}>
            <span className="ol-name">{l.name}</span>
            <span className="ol-addr">{l.address[1]}</span>
            <span className="ol-hours mono">{l.hours[0][1]}</span>
          </button>
        ))}
      </div>
      <p className="order-note">
        <Star /> Ordering from <b>{loc.name}</b>. {loc.coastal ? 'Coast specials like crab toast and chowder are available here.' : 'Coast specials are only at Half Moon Bay and Pacifica.'}
      </p>
      <div className="menu-paper">
        <MenuBoard ordering />
      </div>
      {count > 0 && (
        <p className="center">
          <a className="btn" href="#/checkout">
            Review order · {count} item{count === 1 ? '' : 's'} · {money(subtotal)}
          </a>
        </p>
      )}
    </section>
  )
}

const TIMES = ['As soon as possible (~15 min)', 'In 30 minutes', 'In 1 hour', 'At lunch (12:00)']

export function CheckoutPage() {
  const { lines, setQty, update, subtotal, location, setLocation, placeOrder, openItem } = useStore()
  const [pickup, setPickup] = useState(TIMES[0])
  const [name, setName] = useState('')
  const tax = subtotal * 0.0925
  const loc = locById(location)

  return (
    <section className="wrap page narrow">
      <SectionTitle kicker="My order">{loc.name}</SectionTitle>
      <LocationPicker value={location} onChange={setLocation} label="Pick up at" />
      {lines.length === 0 ? (
        <div className="empty">
          <Logomark size={88} />
          <p>Your order is empty.</p>
          <a className="btn" href="#/order">
            Start an order
          </a>
        </div>
      ) : (
        <>
          <ul className="lines">
            {lines.map((l) => {
              const i = itemById(l.id)
              return (
                <li key={l.key}>
                  {i.photo ? <img src={i.photo} alt="" className="line-img" /> : <span className="line-img plate"><Star size={22} /></span>}
                  <div className="line-body">
                    <button className="line-name" onClick={() => openItem(i.id)}>
                      {i.name}
                    </button>
                    {i.options && (
                      <select value={l.option} onChange={(e) => update(l.key, { option: e.target.value })} aria-label={`${i.name} option`}>
                        {i.options.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    )}
                    <input className="field small" value={l.note ?? ''} placeholder="Substitutions or notes" onChange={(e) => update(l.key, { note: e.target.value })} aria-label="Notes" />
                  </div>
                  <div className="qty">
                    <button onClick={() => setQty(l.key, l.qty - 1)} aria-label="One less">
                      −
                    </button>
                    <span>{l.qty}</span>
                    <button onClick={() => setQty(l.key, l.qty + 1)} aria-label="One more">
                      +
                    </button>
                  </div>
                  <span className="mono line-price">{money(i.price * l.qty)}</span>
                </li>
              )
            })}
          </ul>
          <div className="checkout-grid">
            <div>
              <label className="lbl">Pickup time</label>
              <div className="opts">
                {TIMES.map((t) => (
                  <button key={t} className={pickup === t ? 'on' : ''} onClick={() => setPickup(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <label className="lbl" htmlFor="name">
                Name for the order
              </label>
              <input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" />
            </div>
            <div className="totals">
              <p>
                Subtotal <span className="mono">{money(subtotal)}</span>
              </p>
              <p>
                Tax <span className="mono">{money(tax)}</span>
              </p>
              <p className="total">
                Total <span className="mono">{money(subtotal + tax)}</span>
              </p>
              <button className="btn wide" disabled={!name.trim()} onClick={() => placeOrder({ pickup, name: name.trim() })}>
                Place order
              </button>
              <p className="fine">Pay at pickup. Bring your own cup for 25¢ off.</p>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export function ConfirmedPage() {
  const { order, location } = useStore()
  const loc = locById(location)
  if (!order) {
    go('order')
    return null
  }
  return (
    <section className="wrap page narrow">
      <div className="receipt">
        <StarBand height={18} />
        <p className="spaced">Souvenir receipt</p>
        <h1 className="display">Thank you, {order.name}!</h1>
        <p className="order-no">
          Order <span className="mono">No. {order.number}</span>
        </p>
        <p>
          Pick up at <b>{loc.name}</b>, {loc.address[1]}
        </p>
        <p>{order.pickup}</p>
        <p className="mono total">{money(order.total)}</p>
        <StarBand height={18} />
      </div>
      <p className="center">
        <a className="btn ghost" href="#/events">
          While you wait: what’s on at the farm ›
        </a>
      </p>
    </section>
  )
}

/* ---------------- Locations ---------------- */

export function LocationsPage() {
  const { location, setLocation } = useStore()
  const loc = locById(location)
  return (
    <section className="wrap page">
      <SectionTitle kicker="Visit us">From the farm to the coast</SectionTitle>
      <div className="locations">
        <CoastMap active={location} onPick={setLocation} names={NAMES} />
        <div className="loc-detail">
          <div className="seg wrap-seg">
            {LOCATIONS.map((l) => (
              <button key={l.id} className={location === l.id ? 'on' : ''} onClick={() => setLocation(l.id)}>
                {l.name}
              </button>
            ))}
          </div>
          <Postcard src={loc.photo} caption={loc.postcard} />
          <h3>
            {loc.name}
            {loc.coastal && <span className="new">New</span>}
          </h3>
          <p className="loc-tag">{loc.tagline}</p>
          <p>{loc.note}</p>
          <div className="loc-facts">
            <div>
              <h4>Where</h4>
              {loc.address.map((a) => (
                <p key={a}>{a}</p>
              ))}
            </div>
            <div>
              <h4>Open</h4>
              {loc.hours.map(([d, h]) => (
                <p key={d}>
                  {d} <span className="mono">{h}</span>
                </p>
              ))}
            </div>
          </div>
          <div className="hero-actions">
            <a className="btn" href="#/order">
              Order from {loc.name}
            </a>
            <a className="btn ghost" href="#/menu">
              Menu
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- The Farm ---------------- */

export function FarmPage() {
  return (
    <section className="page">
      <div className="wrap">
        <SectionTitle kicker="Two ingredients at a time">Where our food comes from</SectionTitle>
        <p className="lede">
          Every dish names its growers. Here are the farms, bakers and boats behind the menu, from Stanford’s O’Donohue Farm to the harbor at Princeton-by-the-Sea.
        </p>
      </div>
      <div className="wrap partners">
        {PARTNERS.map((p, i) => (
          <article key={p.name} className="partner">
            {p.photo ? <Postcard src={p.photo} className={i % 2 ? 'tilt-r' : 'tilt-l'} /> : <div className="partner-mark"><Logomark size={90} light /></div>}
            <div>
              <p className="kicker">{p.place}</p>
              <h3>{p.name}</h3>
              <p>{p.grows}</p>
              <p className="uses">
                On the menu:{' '}
                {ALL_ITEMS.filter((it) => it.vendors.includes(p.match))
                  .slice(0, 4)
                  .map((it) => it.name)
                  .join(', ')}
              </p>
            </div>
          </article>
        ))}
      </div>
      <div className="story-band">
        <div className="wrap split">
          <div>
            <p className="kicker">Two ingredients</p>
            <h2>Farm-grown tomatoes, locally sourced mozzarella.</h2>
            <p>
              Our caprese starts with tomatoes picked on the O’Donohue Farm and mozzarella from Deer Hollow Farm in Cupertino, finished with basil from our backyard and a crack
              of black pepper.
            </p>
            <a className="btn" href="#/order">
              Order the caprese
            </a>
          </div>
          <div className="duo">
            <Postcard src="/photos/tomatoes.jpg" caption="Farm-grown tomatoes" className="tilt-l" />
            <Postcard src="/photos/caprese.jpg" caption="Locally sourced mozzarella" className="tilt-r" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Events ---------------- */

export function EventsPage() {
  const [rsvp, setRsvp] = useState<string[]>([])
  const { toast } = useStore()
  const [where, setWhere] = useState<LocationId | 'all'>('all')
  const list = EVENTS.filter((e) => where === 'all' || e.where === where)
  return (
    <section className="wrap page">
      <SectionTitle kicker="Come eat and learn">Farm tours, workshops & suppers</SectionTitle>
      <div className="seg center-seg">
        <button className={where === 'all' ? 'on' : ''} onClick={() => setWhere('all')}>
          All
        </button>
        {LOCATIONS.map((l) => (
          <button key={l.id} className={where === l.id ? 'on' : ''} onClick={() => setWhere(l.id)}>
            {l.name}
          </button>
        ))}
      </div>
      <div className="event-list">
        {list.map((e) => {
          const going = rsvp.includes(e.id)
          return (
            <article key={e.id} className="ticket big">
              <span className="t-kind">{e.kind}</span>
              <span className="t-title">{e.title}</span>
              <span className="t-when">{e.when}</span>
              <span className="t-where">{NAMES[e.where]}</span>
              <p>{e.body}</p>
              <button
                className={`btn ${going ? 'ghost' : ''}`}
                onClick={() => {
                  setRsvp((r) => (going ? r.filter((x) => x !== e.id) : [...r, e.id]))
                  if (!going) toast(`You’re on the list for ${e.title}`)
                }}
              >
                {going ? '✓ You’re going' : `Save a spot · ${e.spots - (going ? 1 : 0)} left`}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

/* ---------------- Our story ---------------- */

export function AboutPage() {
  return (
    <section className="page">
      <div className="wrap split about-top">
        <div>
          <p className="kicker">Our story</p>
          <h1 className="display">Made for students, grown by students.</h1>
          <p>
            Founders Farmstand is more than a farm-to-table cafe. It’s a commitment to our climate, nourishment and community. It began at the heart of the O’Donohue Family
            Stanford Educational Farm, where students grow much of what we serve, and it has followed the produce down the Peninsula and over the hills to the coast.
          </p>
          <p>Every dish reflects a dedication to local, fresh ingredients, ethical sourcing and the belief that good food can restore both body and mind.</p>
        </div>
        <Postcard src="/photos/friends.jpg" caption="Lunch on the porch" className="tilt-r" />
      </div>
      <StarBand />
      <div className="wrap pillars">
        {[
          ['Our mission', 'To engage the community through sustainable farm-to-table food and drink, while teaching environmental learning along the way.'],
          ['Our philosophy', 'Support local farmers, promote sustainable agriculture, waste as little as we can, and cook food that celebrates the season.'],
          ['What we offer', 'Farm-fresh meals, an organic market to take home, and events that bring people together around food: tours, workshops and suppers.'],
        ].map(([t, b]) => (
          <div key={t} className="pillar">
            <Star size={22} />
            <h3>{t}</h3>
            <p>{b}</p>
          </div>
        ))}
      </div>
      <div className="wrap split">
        <Postcard src="/photos/storefront.jpg" caption="The Stanford cafe" className="tilt-l" />
        <div>
          <p className="kicker">Why the old postcards?</p>
          <h2>A little 1939 on the Peninsula.</h2>
          <p>
            Our look borrows from the Golden Gate International Exposition on Treasure Island: amber towers, star-studded curtains and souvenir menus. It was a moment when the
            Bay Area celebrated the Pacific, and we’re doing it again with what grows here.
          </p>
          <a className="btn ghost" href="#/locations">
            Find a cafe
          </a>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Catering & contact ---------------- */

export function CateringPage() {
  const { toast } = useStore()
  const [sent, setSent] = useState(false)
  return (
    <section className="wrap page narrow">
      <SectionTitle kicker="Catering & contact">Feed the whole lab</SectionTitle>
      <p className="lede center">Boxed lunches, toast spreads and coffee service for 10 to 200, delivered across campus and the Peninsula. Questions about anything else? Write to us here too.</p>
      <div className="cater-cards">
        {[
          ['Farm Box Lunch', '$18 / person', 'A grain bowl or sandwich, seasonal salad and a hand pie.'],
          ['Toast Bar', '$14 / person', 'Berry, avocado and tomato toasts on Manresa sourdough.'],
          ['Coffee Service', '$6 / person', 'Drip, cold brew and house chai with oat and whole milk.'],
        ].map(([t, p, b]) => (
          <div key={t} className="cater">
            <h3>{t}</h3>
            <p className="mono">{p}</p>
            <p>{b}</p>
          </div>
        ))}
      </div>
      {sent ? (
        <div className="empty">
          <Logomark size={80} />
          <p>Thanks! We’ll write back within a day.</p>
        </div>
      ) : (
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
            toast('Message sent')
          }}
        >
          <label>
            Name
            <input className="field" required />
          </label>
          <label>
            Email
            <input className="field" type="email" required />
          </label>
          <label>
            Date & headcount
            <input className="field" placeholder="e.g. May 2, about 40 people" />
          </label>
          <label>
            Cafe
            <select className="field">
              {LOCATIONS.map((l) => (
                <option key={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
          <label className="full">
            Message
            <textarea className="field" rows={4} />
          </label>
          <button className="btn" type="submit">
            Send
          </button>
        </form>
      )}
    </section>
  )
}

