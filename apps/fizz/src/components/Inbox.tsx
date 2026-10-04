import { useEffect, useRef, useState } from 'react'
import { price, type Listing } from '../data'
import { Icon, SellerAvatar, sellerOf, Verified } from './ui'

export type Msg =
  | { from: 'me' | 'them'; kind: 'text'; text: string }
  | { from: 'me' | 'them'; kind: 'offer'; amount: number; status: 'pending' | 'accepted' | 'declined' | 'countered' }
  | { from: 'them'; kind: 'meetup'; spot: string; time?: string }

export type Thread = { id: string; listingId: string; seller: string; messages: Msg[]; unread?: boolean }

const TIMES = ['Today 4 PM', 'Today 7 PM', 'Tomorrow 12 PM']
const QUICK = ['Is this still available?', 'Can you hold it until tomorrow?', 'Can we meet somewhere else?']

export function Inbox({ threads, listings, onOpen }: { threads: Thread[]; listings: Listing[]; onOpen: (id: string) => void }) {
  return (
    <div className="screen inbox">
      <header className="plain-head">
        <h1>Messages</h1>
      </header>
      {threads.length === 0 && <p className="empty">No messages yet. Make an offer on something!</p>}
      {threads.map((t) => {
        const l = listings.find((x) => x.id === t.listingId)!
        const s = sellerOf(t.seller)
        const last = t.messages[t.messages.length - 1]
        const preview =
          last.kind === 'text'
            ? last.text
            : last.kind === 'offer'
              ? `${last.from === 'me' ? 'You' : 'They'} offered ${price(last.amount)} · ${last.status}`
              : `Meetup at ${last.spot}`
        return (
          <button key={t.id} className={`thread-row ${t.unread ? 'unread' : ''}`} onClick={() => onOpen(t.id)}>
            <div className="thumb" style={{ background: l.bg }}>
              {l.emoji}
            </div>
            <div className="thread-info">
              <strong>{s === 'you' ? 'You' : s.handle}</strong>
              <span className="muted">{l.title}</span>
              <span className="preview">{preview}</span>
            </div>
            {t.unread && <i className="dot" />}
          </button>
        )
      })}
    </div>
  )
}

export function ThreadView({
  thread,
  listing,
  onBack,
  onSend,
  onRespond,
  onPickTime,
  onOpenListing,
}: {
  thread: Thread
  listing: Listing
  onBack: () => void
  onSend: (text: string) => void
  onRespond: (index: number, accept: boolean) => void
  onPickTime: (index: number, time: string) => void
  onOpenListing: () => void
}) {
  const [text, setText] = useState('')
  const s = sellerOf(thread.seller)
  const list = useRef<HTMLDivElement>(null)
  // Scroll the message list itself; scrollIntoView would also scroll a host page when embedded.
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [thread.messages.length])

  const send = (t: string) => {
    if (!t.trim()) return
    onSend(t.trim())
    setText('')
  }

  return (
    <div className="screen thread">
      <header className="thread-head">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <Icon name="back" size={20} />
        </button>
        <SellerAvatar seller={s} size={34} />
        <div>
          <strong>
            {s === 'you' ? 'You' : s.handle} {s !== 'you' && s.verified && <Verified />}
          </strong>
          {s !== 'you' && <span className="muted">replies {s.replies}</span>}
        </div>
      </header>
      <button className="listing-pin" onClick={onOpenListing}>
        <div className="thumb" style={{ background: listing.bg }}>
          {listing.emoji}
        </div>
        <span>{listing.title}</span>
        <strong>{price(listing.price)}</strong>
      </button>

      <div className="messages" ref={list}>
        {thread.messages.map((m, i) => {
          if (m.kind === 'text') {
            return (
              <div key={i} className={`bubble ${m.from}`}>
                {m.text}
              </div>
            )
          }
          if (m.kind === 'offer') {
            return (
              <div key={i} className={`offer-card ${m.from} ${m.status}`}>
                <span className="muted small">{m.from === 'me' ? 'Your offer' : 'Counter-offer'}</span>
                <strong>{price(m.amount)}</strong>
                <span className={`status ${m.status}`}>
                  {m.status === 'pending'
                    ? m.from === 'them'
                      ? 'Your move'
                      : 'Waiting for reply…'
                    : m.status === 'accepted'
                      ? 'Accepted 🎉'
                      : m.status === 'countered'
                        ? 'Countered'
                        : 'Declined'}
                </span>
                {m.from === 'them' && m.status === 'pending' && (
                  <div className="offer-actions">
                    <button className="ghost small" onClick={() => onRespond(i, false)}>
                      Decline
                    </button>
                    <button className="primary small" onClick={() => onRespond(i, true)}>
                      Accept {price(m.amount)}
                    </button>
                  </div>
                )}
              </div>
            )
          }
          return (
            <div key={i} className="meetup-card">
              <Icon name="pin" size={18} />
              <div>
                <strong>Meet at {m.spot}</strong>
                {m.time ? (
                  <span className="confirmed">✓ {m.time}. Added to your calendar.</span>
                ) : (
                  <>
                    <span className="muted small">Pick a time that works:</span>
                    <div className="chips">
                      {TIMES.map((t) => (
                        <button key={t} className="chip" onClick={() => onPickTime(i, t)}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="quick-replies">
        {QUICK.map((q) => (
          <button key={q} className="chip" onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          send(text)
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message…" aria-label="Message" />
        <button type="submit" className="send" aria-label="Send" disabled={!text.trim()}>
          <Icon name="send" size={18} />
        </button>
      </form>
    </div>
  )
}
