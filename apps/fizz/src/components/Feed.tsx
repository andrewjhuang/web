import { useState, type CSSProperties } from 'react'
import { ago, CLUBS, COMMENTS, fmtVotes, money, POSTS, TAG_COLOR, type Listing, type Post, type Tag } from '../data'
import { Bubbles, Burst, FizzMark, Icon, TagPill, Verified } from './ui'

export type Social = {
  votes: Record<string, 1 | -1 | 0>
  setVote: (id: string, v: 1 | -1 | 0) => void
  bookmarks: string[]
  toggleBookmark: (id: string) => void
  following: string[]
  toggleFollow: (club: string) => void
  onOpenPost: (id: string) => void
  onOpenClub: (club: string) => void
}

/* ---------------- Post card ---------------- */

export function PostCard({ p, s, open = true }: { p: Post; s: Social; open?: boolean }) {
  const vote = s.votes[p.id] ?? 0
  const [burst, setBurst] = useState(0)
  const club = p.club ? CLUBS[p.club] : null
  const saved = s.bookmarks.includes(p.id)

  return (
    <article className="post">
      <div className="post-top" onClick={open ? () => s.onOpenPost(p.id) : undefined} role={open ? 'button' : undefined}>
        <div className="post-main">
          <div className="post-meta">
            {club ? (
              <button
                className="club-link"
                onClick={(e) => {
                  e.stopPropagation()
                  s.onOpenClub(club.id)
                }}
              >
                <Icon name="user" size={15} /> {club.name} {club.verified && <Verified size={12} />}
              </button>
            ) : (
              <span>“Anonymous”</span>
            )}
            <span>{ago(p.min)}</span>
          </div>
          <div className="pills">
            <TagPill tag={p.tag} />
            {p.when && <span className="when">{p.when}</span>}
          </div>
          <p className="post-text">{p.text}</p>
        </div>
        <div className="votes" onClick={(e) => e.stopPropagation()}>
          <button
            className={`v ${vote === 1 ? 'on' : ''}`}
            aria-label="Upvote"
            aria-pressed={vote === 1}
            onClick={() => {
              if (vote !== 1) setBurst((b) => b + 1)
              s.setVote(p.id, vote === 1 ? 0 : 1)
            }}
          >
            <Icon name="up" size={26} stroke={2.6} />
            <Burst k={burst} />
          </button>
          <strong>{fmtVotes(p.votes + vote)}</strong>
          <button className={`v ${vote === -1 ? 'on' : ''}`} aria-label="Downvote" aria-pressed={vote === -1} onClick={() => s.setVote(p.id, vote === -1 ? 0 : -1)}>
            <Icon name="down" size={26} stroke={2.6} />
          </button>
        </div>
      </div>
      {p.image && (
        <div className="post-img" onClick={open ? () => s.onOpenPost(p.id) : undefined}>
          <img src={p.image} alt="" loading="lazy" />
        </div>
      )}
      <div className="post-actions">
        <button className={saved ? 'on' : ''} aria-label="Bookmark" aria-pressed={saved} onClick={() => s.toggleBookmark(p.id)}>
          <Icon name="bookmark" size={21} />
        </button>
        <button aria-label="Repost">
          <Icon name="repost" size={21} />
        </button>
        <button aria-label="Share">
          <Icon name="share" size={21} />
        </button>
        <button aria-label="Send">
          <Icon name="send" size={21} />
        </button>
        <button aria-label="Comments" onClick={() => s.onOpenPost(p.id)}>
          <Icon name="comment" size={21} />
        </button>
      </div>
    </article>
  )
}

/* ---------------- Home ---------------- */

export function Home({ s }: { s: Social }) {
  const [tab, setTab] = useState<'fizzin' | 'following'>('fizzin')
  const posts = tab === 'fizzin' ? POSTS : POSTS.filter((p) => p.club && s.following.includes(p.club))
  return (
    <div className="screen glow">
      <Bubbles count={10} seed={2} />
      <div className="scroll">
        <header className="home-head">
          <button className={tab === 'fizzin' ? 'on' : ''} onClick={() => setTab('fizzin')}>
            Fizzin'
          </button>
          <FizzMark size={30} />
          <button className={tab === 'following' ? 'on' : ''} onClick={() => setTab('following')}>
            Following
          </button>
        </header>
        <div className="feed">
          {posts.length === 0 && (
            <div className="no-results">
              <p className="nr-title">You're not following any clubs yet</p>
              <p className="muted">Tap a club name on an event to follow it.</p>
            </div>
          )}
          {posts.map((p) => (
            <PostCard key={p.id} p={p} s={s} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Post detail: burst the bubble ---------------- */

export function PostDetail({ p, s, back }: { p: Post; s: Social; back: () => void }) {
  const [text, setText] = useState('')
  const [mine, setMine] = useState<string[]>([])
  const [burst, setBurst] = useState(0)
  const unlocked = mine.length > 0
  const others = COMMENTS[p.id] ?? COMMENTS.default

  return (
    <div className="screen glow">
      <div className="scroll">
        <header className="d-header">
          <button className="back" onClick={back} aria-label="Back">
            <Icon name="back" size={26} stroke={2.6} />
          </button>
        </header>
        <div className="feed">
          <PostCard p={p} s={s} open={false} />
          {unlocked ? (
            <div className="comments">
              {[...mine, ...others].map((c, i) => (
                <div key={i} className={`comment ${i < mine.length ? 'mine' : ''}`} style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="c-who">{i < mine.length ? 'You' : '“Anonymous”'}</span>
                  {c}
                </div>
              ))}
            </div>
          ) : (
            <div className="bubble-gate">
              <span className="gate-bubble">
                <Burst k={burst} big />
              </span>
              <p>Burst the bubble, comment first :)</p>
              <span className="muted small">{others.length} comments waiting</span>
            </div>
          )}
        </div>
      </div>
      <form
        className="comment-bar"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          setBurst((b) => b + 1)
          setMine((m) => [...m, text.trim()])
          setText('')
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment" aria-label="Add a comment" />
        <button type="submit" aria-label="Post comment" disabled={!text.trim()}>
          <Icon name="arrowUp" size={18} stroke={2.6} />
        </button>
      </form>
    </div>
  )
}

/* ---------------- Club page ---------------- */

export function ClubPage({ clubId, s, back }: { clubId: string; s: Social; back: () => void }) {
  const club = CLUBS[clubId]
  const following = s.following.includes(clubId)
  const posts = POSTS.filter((p) => p.club === clubId)
  return (
    <div className="screen glow">
      <div className="scroll">
        <header className="club-head">
          <button className="back" onClick={back} aria-label="Back">
            <Icon name="back" size={26} stroke={2.6} />
          </button>
          <span className="club-avatar">
            <Icon name="user" size={26} />
          </span>
          <strong>
            {club.name} {club.verified && <Verified size={16} />}
          </strong>
          <button className={`follow ${following ? 'on' : ''}`} onClick={() => s.toggleFollow(clubId)}>
            {following ? 'Following' : 'Follow'}
          </button>
        </header>
        <div className="feed">
          {posts.map((p) => (
            <PostCard key={p.id} p={p} s={s} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Discover ---------------- */

const EXPLORE: Tag[] = ['EVENT', 'DUB', 'RIP', 'SHOUTOUT', 'DM ME', 'VIDEO']

export function Discover({ s, listings, onOpenListing, onMarket }: { s: Social; listings: Listing[]; onOpenListing: (id: string) => void; onMarket: () => void }) {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState<Tag | null>(null)
  const t = q.trim().toLowerCase()
  const events = POSTS.filter((p) => p.tag === 'EVENT')
  const results = POSTS.filter((p) => (!tag || p.tag === tag) && (!t || p.text.toLowerCase().includes(t)))
  const fresh = [...listings].sort((a, b) => a.postedMin - b.postedMin).slice(0, 6)

  return (
    <div className="screen glow">
      <div className="scroll">
        <header className="m-header">
          <label className="search-pill input">
            <Icon name="search" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Stanford Fizz" aria-label="Search Fizz" />
          </label>
        </header>
        <div className="explore">
          {EXPLORE.map((x) => (
            <button key={x} className={`explore-tag ${tag === x ? 'on' : ''}`} style={{ '--c': TAG_COLOR[x] } as CSSProperties} onClick={() => setTag(tag === x ? null : x)}>
              {x}
            </button>
          ))}
        </div>

        {!t && !tag && (
          <>
            <div className="sec-head">
              <h2>What's the Move?</h2>
            </div>
            <div className="move-row">
              {events.map((p) => (
                <button key={p.id} className="move" onClick={() => s.onOpenPost(p.id)}>
                  {p.image && <img src={p.image} alt="" />}
                  <span className="when">{p.when}</span>
                  <span className="move-text">{p.text}</span>
                  <span className="muted small">{CLUBS[p.club!].name}</span>
                </button>
              ))}
            </div>
            <div className="sec-head">
              <h2>Fresh Listings</h2>
              <button className="see-all" onClick={onMarket}>
                See All
              </button>
            </div>
            <div className="move-row">
              {fresh.map((l) => (
                <button key={l.id} className="fresh" onClick={() => onOpenListing(l.id)}>
                  <img src={l.photo} alt="" />
                  <span>{money(l.price)}</span>
                </button>
              ))}
            </div>
            <div className="sec-head">
              <h2>My Fizzplore</h2>
            </div>
          </>
        )}
        <div className="feed">
          {(t || tag ? results : POSTS.filter((p) => p.tag !== 'EVENT')).map((p) => (
            <PostCard key={p.id} p={p} s={s} />
          ))}
          {(t || tag) && results.length === 0 && <p className="no-results nr-title">No results found</p>}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Profile ---------------- */

export function Profile({ savedCount, sellingCount, bookmarks, onMyMarket }: { savedCount: number; sellingCount: number; bookmarks: number; onMyMarket: () => void }) {
  const [alerts, setAlerts] = useState({ drops: true, matches: true, offers: true })
  return (
    <div className="screen glow">
      <Bubbles count={10} seed={8} />
      <div className="scroll">
        <header className="profile-head">
          <span className="me-bubble">
            <FizzMark size={46} />
          </span>
          <h2>Anonymous</h2>
          <p className="muted">Stanford · verified student</p>
          <div className="stats">
            <div>
              <strong>1,284</strong>
              <span>fizzes</span>
            </div>
            <div>
              <strong>{bookmarks}</strong>
              <span>bookmarks</span>
            </div>
            <button onClick={onMyMarket}>
              <strong>
                {sellingCount}/{savedCount}
              </strong>
              <span>selling/saved</span>
            </button>
          </div>
        </header>
        <section className="panel">
          <h4>Marketplace alerts</h4>
          {(
            [
              ['drops', 'Price drops on saved items'],
              ['matches', 'New listings for my searches'],
              ['offers', 'Offers and replies'],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="switch-row">
              <span>{label}</span>
              <input type="checkbox" checked={alerts[k]} onChange={(e) => setAlerts({ ...alerts, [k]: e.target.checked })} />
            </label>
          ))}
        </section>
        <button className="panel link-row" onClick={onMyMarket}>
          <Icon name="cart" size={20} /> My Marketplace
          <span className="chev">
            <Icon name="back" size={16} />
          </span>
        </button>
      </div>
    </div>
  )
}
