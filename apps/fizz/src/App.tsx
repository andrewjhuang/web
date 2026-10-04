import { useEffect, useRef, useState } from 'react'
import { LISTINGS, type Listing } from './data'
import { Feed, Profile } from './components/Feed'
import { Inbox, ThreadView, type Msg, type Thread } from './components/Inbox'
import { ListingDetail, Market, type MarketView, type MyStats } from './components/Market'
import { Sell } from './components/Sell'
import { Bubbles, Icon } from './components/ui'

type Tab = 'feed' | 'market' | 'sell' | 'inbox' | 'me'

const embed = new URLSearchParams(window.location.search).has('embed')

const INITIAL_THREADS: Thread[] = [
  {
    id: 't-fridge',
    listingId: 'minifridge',
    seller: 'comet',
    unread: true,
    messages: [
      { from: 'me', kind: 'text', text: 'Is this still available?' },
      { from: 'them', kind: 'text', text: 'Yep! Just dropped the price to $50 too.' },
    ],
  },
]

/** The marketplace redesign, as a guided list in the side panel. */
const CHANGES: { title: string; body: string; go: string }[] = [
  {
    title: 'Browse by category, filter what matters',
    body: 'Category chips, sort by deal, and filters for price, condition, pickup spot and verified sellers.',
    go: 'browse',
  },
  {
    title: 'Trust signals on every listing',
    body: '.edu-verified badge, rating, sales count and typical reply time, so an anonymous seller still feels safe.',
    go: 'listing',
  },
  { title: 'Safe public meetup spots', body: 'Sellers pick a public campus spot instead of sharing a dorm room. Pay on pickup.', go: 'listing' },
  { title: 'Structured offers, not DM haggling', body: 'Quick offer amounts and a note. The seller gets a card to accept or counter.', go: 'listing' },
  { title: 'Offers and meetups live in the chat', body: 'Accepted offers turn into a meetup card with time options.', go: 'thread' },
  { title: 'Sell in three steps with a price guide', body: 'Auto-suggested category and a price range from similar listings.', go: 'sell' },
  { title: 'Saved items with price-drop alerts', body: 'Save with ♡ and get told when the price falls.', go: 'saved' },
  { title: 'A dashboard for your listings', body: 'Views, saves and a one-tap “Mark sold”.', go: 'mine' },
  { title: 'Marketplace in the feed', body: 'A “Fresh on Marketplace” strip connects the feed to buying and selling.', go: 'feed' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('market')
  const [marketView, setMarketView] = useState<MarketView>('browse')
  const [listings, setListings] = useState<Listing[]>(LISTINGS)
  const [mine, setMine] = useState<string[]>([])
  const [myStats, setMyStats] = useState<MyStats>({})
  const [saved, setSaved] = useState<string[]>(['minifridge', 'patagonia'])
  const [openListing, setOpenListing] = useState<string | null>(null)
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS)
  const [openThread, setOpenThread] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  // Your active listings slowly collect views.
  useEffect(() => {
    if (!mine.length) return
    const t = setInterval(() => {
      setMyStats((s) => {
        const next = { ...s }
        for (const id of mine) if (!next[id]?.sold && Math.random() < 0.6) next[id] = { ...next[id], views: (next[id]?.views ?? 0) + 1 }
        return next
      })
    }, 1500)
    return () => clearInterval(t)
  }, [mine])

  const toggleSave = (id: string) => {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
    if (!saved.includes(id)) setToast("Saved. We'll tell you if the price drops.")
  }

  const updateThread = (id: string, fn: (t: Thread) => Thread) => setThreads((ts) => ts.map((t) => (t.id === id ? fn(t) : t)))
  const push = (id: string, ...msgs: Msg[]) => updateThread(id, (t) => ({ ...t, messages: [...t.messages, ...msgs] }))

  const threadFor = (l: Listing) => {
    const existing = threads.find((t) => t.listingId === l.id)
    if (existing) return existing.id
    const id = `t-${l.id}`
    setThreads((ts) => [{ id, listingId: l.id, seller: l.seller, messages: [] }, ...ts])
    return id
  }

  const openChat = (l: Listing) => {
    const id = threadFor(l)
    setOpenListing(null)
    setOpenThread(id)
    setTab('inbox')
  }

  const sendOffer = (l: Listing, amount: number, note: string) => {
    const id = threadFor(l)
    push(
      id,
      { from: 'me', kind: 'offer', amount, status: 'pending' },
      ...(note.trim() ? [{ from: 'me' as const, kind: 'text' as const, text: note.trim() }] : []),
    )
    setOpenListing(null)
    setOpenThread(id)
    setTab('inbox')
    setToast('Offer sent')
    // Simulated seller: accepts reasonable offers, counters low ones.
    later(() => {
      setThreads((ts) =>
        ts.map((t) => {
          if (t.id !== id) return t
          const msgs = [...t.messages]
          const idx = msgs.map((m) => m.kind === 'offer' && m.from === 'me' && m.status === 'pending').lastIndexOf(true)
          if (idx === -1) return t
          const offer = msgs[idx] as Extract<Msg, { kind: 'offer' }>
          if (l.price === 0 || amount >= l.price * 0.85) {
            msgs[idx] = { ...offer, status: 'accepted' }
            msgs.push(
              { from: 'them', kind: 'text', text: l.price === 0 ? "It's yours! 🙌" : `Deal at $${amount}! 🙌` },
              { from: 'them', kind: 'meetup', spot: l.meetup },
            )
          } else {
            const counter = Math.round((amount + l.price) / 2)
            msgs[idx] = { ...offer, status: 'countered' }
            msgs.push({ from: 'them', kind: 'text', text: 'Could we meet in the middle?' }, { from: 'them', kind: 'offer', amount: counter, status: 'pending' })
          }
          return { ...t, messages: msgs }
        }),
      )
    }, 1600)
  }

  const respond = (threadId: string, index: number, accept: boolean) => {
    const t = threads.find((x) => x.id === threadId)!
    const l = listings.find((x) => x.id === t.listingId)!
    updateThread(threadId, (th) => {
      const msgs = [...th.messages]
      const m = msgs[index] as Extract<Msg, { kind: 'offer' }>
      msgs[index] = { ...m, status: accept ? 'accepted' : 'declined' }
      msgs.push(
        accept ? { from: 'them', kind: 'meetup', spot: l.meetup } : { from: 'them', kind: 'text', text: 'No worries, let me know if you change your mind!' },
      )
      return { ...th, messages: msgs }
    })
  }

  const sendText = (threadId: string, text: string) => {
    push(threadId, { from: 'me', kind: 'text', text })
    const reply = /available/i.test(text)
      ? 'Yes, still available!'
      : /hold/i.test(text)
        ? 'Sure, I can hold it until tomorrow evening.'
        : /somewhere else|meet/i.test(text)
          ? 'Tresidder or Green Library both work for me.'
          : 'Sounds good 👍'
    later(() => push(threadId, { from: 'them', kind: 'text', text: reply }), 1200)
  }

  const pickTime = (threadId: string, index: number, time: string) => {
    updateThread(threadId, (t) => {
      const msgs = [...t.messages]
      const m = msgs[index] as Extract<Msg, { kind: 'meetup' }>
      msgs[index] = { ...m, time }
      return { ...t, messages: msgs }
    })
    setToast(`Meetup set for ${time}`)
  }

  const post = (l: Listing) => {
    setListings((ls) => [l, ...ls])
    setMine((m) => [l.id, ...m])
    setMyStats((s) => ({ ...s, [l.id]: { views: 0 } }))
    setTab('market')
    setMarketView('mine')
    setToast('Listed! 🎉')
  }

  const go = (target: string) => {
    setOpenListing(null)
    setOpenThread(null)
    if (target === 'feed') setTab('feed')
    else if (target === 'sell') setTab('sell')
    else if (target === 'thread') {
      setTab('inbox')
      setOpenThread(threads[0]?.id ?? null)
    } else if (target === 'listing') {
      setTab('market')
      setOpenListing('airpods')
    } else {
      setTab('market')
      setMarketView(target as MarketView)
    }
  }

  const listing = openListing ? listings.find((l) => l.id === openListing) : null
  const thread = openThread ? threads.find((t) => t.id === openThread) : null
  const unread = threads.some((t) => t.unread)

  const openThreadView = (id: string) => {
    setOpenThread(id)
    updateThread(id, (t) => ({ ...t, unread: false }))
  }

  return (
    <div className={`page ${embed ? 'embed' : ''}`}>
      <aside className="side">
        <div className="brand">
          <div className="logo">
            <Bubbles count={7} seed={2} />
            <span>fizz</span>
          </div>
          <div>
            <h1>Fizz Marketplace</h1>
            <p>Research-led redesign</p>
          </div>
        </div>
        <p className="intro">
          A research-led redesign of Fizz's campus marketplace, from task analysis and usability testing to a high-fidelity interface. Tap around the phone, or
          jump to a design change below.
        </p>

        <div className="changes">
          <h2>Marketplace design changes</h2>
          <ol>
            {CHANGES.map((c) => (
              <li key={c.title}>
                <button onClick={() => go(c.go)}>
                  <strong>{c.title}</strong>
                  <span>{c.body}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="other">
          <span>Also in this prototype:</span>
          <button onClick={() => go('feed')}>Feed</button>
          <button onClick={() => (setOpenListing(null), setOpenThread(null), setTab('inbox'))}>Messages</button>
          <button onClick={() => (setOpenListing(null), setOpenThread(null), setTab('me'))}>Profile</button>
        </div>
      </aside>

      <div className="phone" aria-label="Fizz app prototype">
        <div className="statusbar">
          <span>9:41</span>
          <span className="notch" />
          <span>100%</span>
        </div>
        <div className="viewport">
          {tab === 'feed' && <Feed listings={listings} onOpenListing={setOpenListing} onMarket={() => go('browse')} />}
          {tab === 'market' && (
            <Market
              listings={listings}
              saved={saved}
              toggleSave={toggleSave}
              view={marketView}
              setView={setMarketView}
              mine={mine}
              myStats={myStats}
              onMarkSold={(id) => (setMyStats((s) => ({ ...s, [id]: { ...s[id], sold: true } })), setToast('Marked as sold. Nice!'))}
              onOpen={setOpenListing}
              onSell={() => setTab('sell')}
            />
          )}
          {tab === 'sell' && <Sell onPost={post} onCancel={() => setTab('market')} />}
          {tab === 'inbox' && <Inbox threads={threads} listings={listings} onOpen={openThreadView} />}
          {tab === 'me' && <Profile savedCount={saved.length} listingCount={mine.length} onOpenSaved={() => go('saved')} />}

          {thread && (
            <ThreadView
              thread={thread}
              listing={listings.find((l) => l.id === thread.listingId)!}
              onBack={() => setOpenThread(null)}
              onSend={(text) => sendText(thread.id, text)}
              onRespond={(i, a) => respond(thread.id, i, a)}
              onPickTime={(i, t) => pickTime(thread.id, i, t)}
              onOpenListing={() => setOpenListing(thread.listingId)}
            />
          )}

          {listing && (
            <ListingDetail
              key={listing.id}
              l={listing}
              saved={saved.includes(listing.id)}
              isMine={mine.includes(listing.id)}
              onSave={() => toggleSave(listing.id)}
              onBack={() => setOpenListing(null)}
              onMessage={() => openChat(listing)}
              onOffer={(a, n) => sendOffer(listing, a, n)}
            />
          )}

          {toast && (
            <div className="toast" role="status">
              {toast}
            </div>
          )}
        </div>

        <nav className="tabbar">
          {(
            [
              ['feed', 'home', 'Feed'],
              ['market', 'shop', 'Market'],
              ['sell', 'plus', 'Sell'],
              ['inbox', 'chat', 'Inbox'],
              ['me', 'user', 'Me'],
            ] as const
          ).map(([t, icon, label]) => (
            <button
              key={t}
              className={`${tab === t ? 'on' : ''} ${t === 'sell' ? 'sell-tab' : ''}`}
              onClick={() => {
                setOpenListing(null)
                setOpenThread(null)
                setTab(t)
              }}
              aria-label={label}
              aria-current={tab === t ? 'page' : undefined}
            >
              <span className="tab-icon">
                <Icon name={icon} size={t === 'sell' ? 24 : 22} />
              </span>
              {t !== 'sell' && <span>{label}</span>}
              {t === 'inbox' && unread && <i className="tab-badge" />}
            </button>
          ))}
        </nav>
      </div>

      {!embed && (
        <footer className="credits">
          Concept redesign by Pierre, Candace & Andrew (marketplace by Andrew). Not affiliated with Fizz; listings and people are made up.
        </footer>
      )}
    </div>
  )
}
