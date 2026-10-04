import { useState } from 'react'
import { ago, NOTIFICATIONS, POSTS, type Listing, type Post } from '../data'
import { Bubbles, Burst, Icon } from './ui'

/** The anonymous campus feed, with a marketplace strip so the two features connect. */
export function Feed({ listings, onOpenListing, onMarket }: { listings: Listing[]; onOpenListing: (id: string) => void; onMarket: () => void }) {
  const [sort, setSort] = useState<'top' | 'new'>('top')
  const posts = [...POSTS].sort((a, b) => (sort === 'top' ? b.votes - a.votes : a.min - b.min))
  const fresh = [...listings].sort((a, b) => a.postedMin - b.postedMin).slice(0, 6)

  return (
    <div className="screen feed">
      <header className="hero">
        <Bubbles count={18} seed={11} />
        <div className="hero-top">
          <h1 className="wordmark">fizz</h1>
          <span className="campus">Stanford</span>
        </div>
        <div className="seg">
          <button className={sort === 'top' ? 'on' : ''} onClick={() => setSort('top')}>
            🔥 Top
          </button>
          <button className={sort === 'new' ? 'on' : ''} onClick={() => setSort('new')}>
            ✨ New
          </button>
        </div>
      </header>

      <section className="strip">
        <div className="strip-head">
          <strong>Fresh on Marketplace</strong>
          <button className="link" onClick={onMarket}>
            See all
          </button>
        </div>
        <div className="strip-row">
          {fresh.map((l) => (
            <button key={l.id} className="strip-item" onClick={() => onOpenListing(l.id)}>
              <span className="thumb" style={{ background: l.bg }}>
                {l.emoji}
              </span>
              <span>{l.price === 0 ? 'Free' : `$${l.price}`}</span>
            </button>
          ))}
        </div>
      </section>

      {posts.map((p) => (
        <PostCard key={p.id} p={p} />
      ))}
    </div>
  )
}

function PostCard({ p }: { p: Post }) {
  const [vote, setVote] = useState<0 | 1 | -1>(0)
  const [burst, setBurst] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const total = p.poll ? p.poll.votes.reduce((a, b) => a + b, 0) + (picked !== null ? 1 : 0) : 0

  return (
    <article className="post">
      {p.tag && <span className="post-tag">{p.tag}</span>}
      <p>{p.text}</p>
      {p.poll && (
        <div className="poll">
          {p.poll.options.map((o, i) => {
            const v = p.poll!.votes[i] + (picked === i ? 1 : 0)
            const pct = Math.round((v / total) * 100)
            return (
              <button key={o} className={`poll-opt ${picked === i ? 'on' : ''}`} disabled={picked !== null} onClick={() => setPicked(i)}>
                {picked !== null && <span className="poll-fill" style={{ width: `${pct}%` }} />}
                <span className="poll-label">{o}</span>
                {picked !== null && <span className="poll-pct">{pct}%</span>}
              </button>
            )
          })}
        </div>
      )}
      <div className="post-foot">
        <span className="muted">{ago(p.min)}</span>
        <span className="muted">
          <Icon name="comment" size={15} /> {p.comments}
        </span>
        <div className="votes">
          <button
            className={`vote up ${vote === 1 ? 'on' : ''}`}
            aria-label="Upvote"
            aria-pressed={vote === 1}
            onClick={() => {
              if (vote !== 1) setBurst((b) => b + 1)
              setVote(vote === 1 ? 0 : 1)
            }}
          >
            <Icon name="up" size={16} />
            <Burst k={burst} />
          </button>
          <strong>{p.votes + vote}</strong>
          <button
            className={`vote down ${vote === -1 ? 'on' : ''}`}
            aria-label="Downvote"
            aria-pressed={vote === -1}
            onClick={() => setVote(vote === -1 ? 0 : -1)}
          >
            <Icon name="down" size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

export function Profile({ savedCount, listingCount, onOpenSaved }: { savedCount: number; listingCount: number; onOpenSaved: () => void }) {
  const [alerts, setAlerts] = useState({ drops: true, matches: true, offers: true })
  return (
    <div className="screen profile">
      <header className="hero profile-hero">
        <Bubbles count={14} seed={5} />
        <span className="me-bubble">🫧</span>
        <h1>Anonymous</h1>
        <p>Stanford · verified with your .edu email</p>
        <div className="stats">
          <div>
            <strong>1,284</strong>
            <span>fizzes</span>
          </div>
          <div>
            <strong>{listingCount}</strong>
            <span>listings</span>
          </div>
          <button onClick={onOpenSaved}>
            <strong>{savedCount}</strong>
            <span>saved</span>
          </button>
        </div>
      </header>

      <section className="panel">
        <h4>
          <Icon name="bell" size={16} /> Notifications
        </h4>
        {NOTIFICATIONS.map((n) => (
          <div key={n.text} className="notif">
            <span>{n.icon}</span>
            <p>{n.text}</p>
            <em>{ago(n.min)}</em>
          </div>
        ))}
      </section>

      <section className="panel">
        <h4>Marketplace alerts</h4>
        {(
          [
            ['drops', 'Price drops on saved items'],
            ['matches', 'New listings matching my searches'],
            ['offers', 'Offers and replies'],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="switch-row">
            <span>{label}</span>
            <input type="checkbox" checked={alerts[k]} onChange={(e) => setAlerts({ ...alerts, [k]: e.target.checked })} />
          </label>
        ))}
      </section>
    </div>
  )
}
