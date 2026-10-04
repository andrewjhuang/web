import { useEffect, useRef, useState } from 'react'
import { LISTINGS, POSTS, RECENT_SEARCHES, type Listing } from './data'
import { ClubPage, Discover, Home, PostDetail, Profile, type Social } from './components/Feed'
import { Inbox, ThreadView, type Msg, type Thread } from './components/Inbox'
import { AllCategories, ListingDetail, MarketHome, MyMarket, Results, SearchScreen, type MyStats } from './components/Market'
import { Sell } from './components/Sell'
import { FizzMark, Icon } from './components/ui'

type Tab = 'home' | 'discover' | 'market' | 'messages' | 'profile'
type Screen =
  | { k: 'root' }
  | { k: 'allcats' }
  | { k: 'category'; name: string }
  | { k: 'searching'; q: string }
  | { k: 'results'; q: string }
  | { k: 'listing'; id: string }
  | { k: 'mymarket' }
  | { k: 'sell' }
  | { k: 'post'; id: string }
  | { k: 'club'; id: string }
  | { k: 'thread'; id: string }

const embed = new URLSearchParams(window.location.search).has('embed')
const ROOT: Screen = { k: 'root' }
const FRESH_STACKS = (): Record<Tab, Screen[]> => ({ home: [ROOT], discover: [ROOT], market: [ROOT], messages: [ROOT], profile: [ROOT] })

const INITIAL_THREADS: Thread[] = [
  {
    id: 't-scooter',
    listingId: 'scooter',
    seller: 'comet',
    unread: true,
    messages: [
      { from: 'me', kind: 'text', text: 'Is this still available?' },
      { from: 'them', kind: 'text', text: 'Yep! Just dropped it to $200 too.' },
    ],
  },
]

/** What's from the team's Figma vs. what this prototype adds, for the side panel. */
const FROM_FIGMA: { title: string; go: [Tab, Screen[]] }[] = [
  { title: 'Categories grid and Recent Listings', go: ['market', [ROOT]] },
  { title: 'All Categories', go: ['market', [ROOT, { k: 'allcats' }]] },
  { title: 'Search with recent searches', go: ['market', [ROOT, { k: 'searching', q: '' }]] },
  { title: 'Results with Filter and Sort', go: ['market', [ROOT, { k: 'results', q: 'mason jar' }]] },
  { title: 'Listing detail: Overview + Message Seller', go: ['market', [ROOT, { k: 'listing', id: 'ebike' }]] },
]

const ADDED: { title: string; body: string; go: [Tab, Screen[]] }[] = [
  { title: 'Filters and sort that work', body: 'Filter by expands into Womens/Mens, condition, size and a price cap. Sort re-orders live.', go: ['market', [ROOT, { k: 'category', name: 'Clothing' }]] },
  { title: 'Make an offer', body: 'Quick amounts and a note, sent as a card the seller can accept or counter.', go: ['market', [ROOT, { k: 'listing', id: 'ebike' }]] },
  { title: 'Offers and meetups in chat', body: 'Accept a counter-offer, then pick a time from the meetup card.', go: ['messages', [ROOT, { k: 'thread', id: 't-scooter' }]] },
  { title: 'Trust and safety on every listing', body: 'Verified-student badge, rating, sales and reply time, plus a public meetup spot.', go: ['market', [ROOT, { k: 'listing', id: 'leggings' }]] },
  { title: 'Save with price-drop alerts', body: 'Tap ♡ on any listing. Saved items that drop in price show up on the Marketplace home.', go: ['market', [ROOT, { k: 'mymarket' }]] },
  { title: 'Helpful empty states', body: '“No results found” now offers “Notify me when listed” and “Sell one”.', go: ['market', [ROOT, { k: 'category', name: 'Hats' }]] },
  { title: 'Live search suggestions', body: 'Matching listings appear as you type, above your recent searches.', go: ['market', [ROOT, { k: 'searching', q: 'lulu' }]] },
  { title: 'Sell in three steps', body: 'Upload a photo, get a suggested category and a price range from similar listings, preview, post.', go: ['market', [ROOT, { k: 'sell' }]] },
  { title: 'My Marketplace', body: 'Your listings with live views and saves, “Mark as sold”, and everything you saved.', go: ['market', [ROOT, { k: 'mymarket' }]] },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('market')
  const [stacks, setStacks] = useState<Record<Tab, Screen[]>>(FRESH_STACKS)
  const [listings, setListings] = useState<Listing[]>(LISTINGS)
  const [mine, setMine] = useState<string[]>([])
  const [stats, setStats] = useState<MyStats>({})
  const [saved, setSaved] = useState<string[]>(['scooter'])
  const [alerts, setAlerts] = useState<string[]>([])
  const [recents, setRecents] = useState(RECENT_SEARCHES)
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS)
  const [votes, setVotes] = useState<Record<string, 1 | -1 | 0>>({})
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [following, setFollowing] = useState<string[]>(['arbor'])
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
      setStats((s) => {
        const next = { ...s }
        for (const id of mine) if (!next[id]?.sold && Math.random() < 0.6) next[id] = { ...next[id], views: (next[id]?.views ?? 0) + 1 }
        return next
      })
    }, 1500)
    return () => clearInterval(t)
  }, [mine])

  /* ---------- navigation ---------- */
  const stack = stacks[tab]
  const screen = stack[stack.length - 1]
  const push = (s: Screen, t: Tab = tab) => {
    setStacks((st) => ({ ...st, [t]: [...st[t], s] }))
    setTab(t)
  }
  const replace = (s: Screen) => setStacks((st) => ({ ...st, [tab]: [...st[tab].slice(0, -1), s] }))
  const back = () => setStacks((st) => ({ ...st, [tab]: st[tab].length > 1 ? st[tab].slice(0, -1) : st[tab] }))
  const go = ([t, s]: [Tab, Screen[]]) => {
    setStacks((st) => ({ ...st, [t]: s }))
    setTab(t)
    if (t === 'messages') setThreads((ts) => ts.map((x) => ({ ...x, unread: false })))
  }

  /* ---------- marketplace actions ---------- */
  const toggleSave = (id: string) => {
    if (!saved.includes(id)) setToast("Saved. We'll tell you if the price drops.")
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }
  const toggleAlert = (key: string) => setAlerts((a) => (a.includes(key) ? a.filter((x) => x !== key) : [...a, key]))

  const updateThread = (id: string, fn: (t: Thread) => Thread) => setThreads((ts) => ts.map((t) => (t.id === id ? fn(t) : t)))
  const pushMsg = (id: string, ...msgs: Msg[]) => updateThread(id, (t) => ({ ...t, messages: [...t.messages, ...msgs] }))

  const threadFor = (l: Listing) => {
    const existing = threads.find((t) => t.listingId === l.id)
    if (existing) return existing.id
    const id = `t-${l.id}`
    setThreads((ts) => [{ id, listingId: l.id, seller: l.seller, messages: [] }, ...ts])
    return id
  }

  const openChat = (l: Listing) => go(['messages', [ROOT, { k: 'thread', id: threadFor(l) }]])

  const sendOffer = (l: Listing, amount: number, note: string) => {
    const id = threadFor(l)
    pushMsg(id, { from: 'me', kind: 'offer', amount, status: 'pending' }, ...(note.trim() ? [{ from: 'me' as const, kind: 'text' as const, text: note.trim() }] : []))
    go(['messages', [ROOT, { k: 'thread', id }]])
    setToast('Offer sent')
    // Simulated seller: accepts offers at 85%+ of asking, counters lower ones.
    later(() => {
      setThreads((ts) =>
        ts.map((t) => {
          if (t.id !== id) return t
          const msgs = [...t.messages]
          const idx = msgs.map((m) => m.kind === 'offer' && m.from === 'me' && m.status === 'pending').lastIndexOf(true)
          if (idx === -1) return t
          const offer = msgs[idx] as Extract<Msg, { kind: 'offer' }>
          if (amount >= l.price * 0.85) {
            msgs[idx] = { ...offer, status: 'accepted' }
            msgs.push({ from: 'them', kind: 'text', text: `Deal at $${amount}! 🙌` }, { from: 'them', kind: 'meetup', spot: l.meetup })
          } else {
            msgs[idx] = { ...offer, status: 'countered' }
            msgs.push({ from: 'them', kind: 'text', text: 'Could we meet in the middle?' }, { from: 'them', kind: 'offer', amount: Math.round((amount + l.price) / 2), status: 'pending' })
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
      msgs.push(accept ? { from: 'them', kind: 'meetup', spot: l.meetup } : { from: 'them', kind: 'text', text: 'No worries, let me know if you change your mind!' })
      return { ...th, messages: msgs }
    })
  }

  const sendText = (threadId: string, text: string) => {
    pushMsg(threadId, { from: 'me', kind: 'text', text })
    const reply = /available/i.test(text)
      ? 'Yes, still available!'
      : /hold/i.test(text)
        ? 'Sure, I can hold it until tomorrow evening.'
        : /somewhere else|meet/i.test(text)
          ? 'Tresidder or Green Library both work for me.'
          : 'Sounds good 👍'
    later(() => pushMsg(threadId, { from: 'them', kind: 'text', text: reply }), 1200)
  }

  const pickTime = (threadId: string, index: number, time: string) => {
    updateThread(threadId, (t) => {
      const msgs = [...t.messages]
      msgs[index] = { ...(msgs[index] as Extract<Msg, { kind: 'meetup' }>), time }
      return { ...t, messages: msgs }
    })
    setToast(`Meetup set for ${time}`)
  }

  const post = (l: Listing) => {
    setListings((ls) => [l, ...ls])
    setMine((m) => [l.id, ...m])
    setStats((s) => ({ ...s, [l.id]: { views: 0 } }))
    go(['market', [ROOT, { k: 'mymarket' }]])
    setToast('Listed! 🎉')
  }

  const social: Social = {
    votes,
    setVote: (id, v) => setVotes((x) => ({ ...x, [id]: v })),
    bookmarks,
    toggleBookmark: (id) => setBookmarks((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id])),
    following,
    toggleFollow: (c) => setFollowing((f) => (f.includes(c) ? f.filter((x) => x !== c) : [...f, c])),
    onOpenPost: (id) => push({ k: 'post', id }),
    onOpenClub: (id) => push({ k: 'club', id }),
  }

  const marketNav = {
    back: stack.length > 1 ? back : undefined,
    onSearch: () => push({ k: 'searching', q: screen.k === 'results' ? screen.q : '' }),
    onMine: () => push({ k: 'mymarket' }),
  }
  const openListing = (id: string) => push({ k: 'listing', id })
  const startSell = () => push({ k: 'sell' }, 'market')

  /* ---------- render current screen ---------- */
  const render = () => {
    switch (screen.k) {
      case 'allcats':
        return <AllCategories nav={marketNav} onCategory={(name) => push({ k: 'category', name })} />
      case 'category':
        return (
          <Results
            key={screen.name}
            title={screen.name}
            base={listings.filter((l) => l.categories.includes(screen.name))}
            saved={saved}
            nav={marketNav}
            alerts={alerts}
            onToggleAlert={toggleAlert}
            onOpen={openListing}
            onSave={toggleSave}
            onSell={startSell}
          />
        )
      case 'searching':
        return <SearchScreen listings={listings} recents={recents} setRecents={setRecents} initial={screen.q} onSubmit={(q) => replace({ k: 'results', q })} onCancel={back} />
      case 'results': {
        const words = screen.q.toLowerCase().split(/\s+/).filter(Boolean)
        const base = listings.filter((l) => {
          const hay = `${l.title} ${l.categories.join(' ')} ${l.description}`.toLowerCase()
          // Match any word, so "mason jar" also surfaces other tableware like the mockup.
          return words.some((w) => hay.includes(w.replace(/s$/, '')))
        })
        const related = base.length ? listings.filter((l) => !base.includes(l) && l.categories.some((c) => base[0].categories.includes(c))) : []
        return (
          <Results
            key={screen.q}
            title={screen.q}
            query={screen.q}
            base={[...base, ...related]}
            saved={saved}
            nav={marketNav}
            alerts={alerts}
            onToggleAlert={toggleAlert}
            onOpen={openListing}
            onSave={toggleSave}
            onSell={startSell}
          />
        )
      }
      case 'listing': {
        const l = listings.find((x) => x.id === screen.id)!
        return (
          <ListingDetail
            key={l.id}
            l={l}
            saved={saved.includes(l.id)}
            isMine={mine.includes(l.id)}
            sold={!!stats[l.id]?.sold}
            back={back}
            onSave={() => toggleSave(l.id)}
            onMessage={() => openChat(l)}
            onOffer={(a, n) => sendOffer(l, a, n)}
            onMarkSold={() => {
              setStats((s) => ({ ...s, [l.id]: { ...s[l.id], sold: true } }))
              setToast('Marked as sold. Nice!')
            }}
          />
        )
      }
      case 'mymarket':
        return <MyMarket listings={listings} mine={mine} stats={stats} saved={saved} back={back} onOpen={openListing} onSave={toggleSave} onSell={startSell} />
      case 'sell':
        return <Sell onPost={post} onCancel={back} />
      case 'post':
        return <PostDetail key={screen.id} p={POSTS.find((p) => p.id === screen.id)!} s={social} back={back} />
      case 'club':
        return <ClubPage clubId={screen.id} s={social} back={back} />
      case 'thread': {
        const t = threads.find((x) => x.id === screen.id)!
        return (
          <ThreadView
            thread={t}
            listing={listings.find((l) => l.id === t.listingId)!}
            back={back}
            onSend={(text) => sendText(t.id, text)}
            onRespond={(i, a) => respond(t.id, i, a)}
            onPickTime={(i, time) => pickTime(t.id, i, time)}
            onOpenListing={() => push({ k: 'listing', id: t.listingId })}
          />
        )
      }
      default:
        if (tab === 'home') return <Home s={social} />
        if (tab === 'discover') return <Discover s={social} listings={listings} onOpenListing={openListing} onMarket={() => go(['market', [ROOT]])} />
        if (tab === 'messages')
          return (
            <Inbox
              threads={threads}
              listings={listings}
              onOpen={(id) => {
                updateThread(id, (t) => ({ ...t, unread: false }))
                push({ k: 'thread', id })
              }}
            />
          )
        if (tab === 'profile') return <Profile savedCount={saved.length} sellingCount={mine.length} bookmarks={bookmarks.length} onMyMarket={() => go(['market', [ROOT, { k: 'mymarket' }]])} />
        return <MarketHome listings={listings} saved={saved} nav={marketNav} onCategory={(name) => push({ k: 'category', name })} onAllCategories={() => push({ k: 'allcats' })} onOpen={openListing} onSave={toggleSave} onSell={startSell} />
    }
  }

  const unread = threads.some((t) => t.unread)
  const TABS: [Tab, Parameters<typeof Icon>[0]['name'], string][] = [
    ['home', 'home', 'Home'],
    ['discover', 'discover', 'Discover'],
    ['market', 'cart', 'Marketplace'],
    ['messages', 'send', 'Messages'],
    ['profile', 'user', 'Profile'],
  ]

  return (
    <div className={`page ${embed ? 'embed' : ''}`}>
      <aside className="side">
        <div className="brand">
          <div className="logo">
            <FizzMark size={40} />
          </div>
          <div>
            <h1>Fizz Marketplace</h1>
            <p>Research-led redesign</p>
          </div>
        </div>
        <p className="intro">
          A research-led redesign of Fizz's campus marketplace, from task analysis and usability testing to a high-fidelity
          interface. Built from our Figma screens, with the marketplace extended into a full buy-and-sell flow.
        </p>

        <section className="changes">
          <h2>From our Figma</h2>
          <div className="chips">
            {FROM_FIGMA.map((c) => (
              <button key={c.title} className="chip" onClick={() => go(c.go)}>
                {c.title}
              </button>
            ))}
          </div>
          <h2>Added in this prototype</h2>
          <ol>
            {ADDED.map((c) => (
              <li key={c.title}>
                <button onClick={() => go(c.go)}>
                  <strong>{c.title}</strong>
                  <span>{c.body}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
        <div className="other">
          <span>Rest of Fizz:</span>
          <button onClick={() => go(['home', [ROOT]])}>Home feed</button>
          <button onClick={() => go(['home', [ROOT, { k: 'post', id: 'curis' }]])}>Burst the bubble</button>
          <button onClick={() => go(['discover', [ROOT]])}>Discover</button>
        </div>
      </aside>

      <div className="phone" aria-label="Fizz app prototype">
        <div className="statusbar">
          <span>9:41</span>
          <span className="notch" />
          <span>100%</span>
        </div>
        <div className="viewport" key={`${tab}-${stack.length}-${screen.k}`}>
          {render()}
          {toast && (
            <div className="toast" role="status">
              {toast}
            </div>
          )}
        </div>
        <nav className="tabbar">
          {TABS.map(([t, icon, label]) => (
            <button
              key={t}
              className={tab === t ? 'on' : ''}
              onClick={() => (tab === t ? setStacks((st) => ({ ...st, [t]: [ROOT] })) : setTab(t))}
              aria-label={label}
              aria-current={tab === t ? 'page' : undefined}
            >
              <Icon name={icon} size={24} />
              <span>{label}</span>
              {t === 'messages' && unread && <i className="tab-badge" />}
            </button>
          ))}
        </nav>
      </div>

      {!embed && (
        <footer className="credits">
          Concept redesign by Pierre, Candace & Andrew (marketplace by Andrew). Not affiliated with Fizz; seller details, offers and messages are simulated.
        </footer>
      )}
    </div>
  )
}
