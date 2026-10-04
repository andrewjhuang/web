import { useEffect, useRef, useState } from 'react'
import { money, type Listing } from '../data'
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
    <div className="screen glow">
      <div className="scroll">
        <header className="d-header">
          <h2 className="h-title left">Messages</h2>
        </header>
        {threads.length === 0 && (
          <div className="no-results">
            <p className="nr-title">No messages yet</p>
            <p className="muted">Message a seller or make an offer in Marketplace.</p>
          </div>
        )}
        {threads.map((t) => {
          const l = listings.find((x) => x.id === t.listingId)!
          const s = sellerOf(t.seller)
          const last = t.messages[t.messages.length - 1]
          const preview = !last
            ? 'Say hi 👋'
            : last.kind === 'text'
              ? last.text
              : last.kind === 'offer'
                ? `${last.from === 'me' ? 'You' : 'They'} offered ${money(last.amount)} · ${last.status}`
                : `Meetup at ${last.spot}`
          return (
            <button key={t.id} className={`thread-row ${t.unread ? 'unread' : ''}`} onClick={() => onOpen(t.id)}>
              <img src={l.photo} alt="" />
              <span className="thread-info">
                <strong>{s === 'you' ? 'You' : s.handle}</strong>
                <span className="muted">{l.title}</span>
                <span className="preview">{preview}</span>
              </span>
              {t.unread && <i className="dot" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ThreadView({
  thread,
  listing,
  back,
  onSend,
  onRespond,
  onPickTime,
  onOpenListing,
}: {
  thread: Thread
  listing: Listing
  back: () => void
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
      <header className="d-header thread-head">
        <button className="back" onClick={back} aria-label="Back">
          <Icon name="back" size={26} stroke={2.6} />
        </button>
        <SellerAvatar seller={s} size={34} />
        <span className="th-who">
          <strong>
            {s === 'you' ? 'You' : s.handle} <Verified size={12} />
          </strong>
          {s !== 'you' && <span className="muted small">replies {s.replies}</span>}
        </span>
      </header>
      <button className="listing-pin" onClick={onOpenListing}>
        <img src={listing.photo} alt="" />
        <span>{listing.title}</span>
        <strong>{money(listing.price)}</strong>
      </button>

      <div className="messages" ref={list}>
        {thread.messages.map((m, i) => {
          if (m.kind === 'text') {
            return (
              <div key={i} className={`msg ${m.from}`}>
                {m.text}
              </div>
            )
          }
          if (m.kind === 'offer') {
            return (
              <div key={i} className={`offer-card ${m.from} ${m.status}`}>
                <span className="muted small">{m.from === 'me' ? 'Your offer' : 'Counter-offer'}</span>
                <strong>{money(m.amount)}</strong>
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
                    <button className="outline small" onClick={() => onRespond(i, false)}>
                      Decline
                    </button>
                    <button className="red-btn small" onClick={() => onRespond(i, true)}>
                      Accept {money(m.amount)}
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
                    <div className="opt-row">
                      {TIMES.map((t) => (
                        <button key={t} className="opt small" onClick={() => onPickTime(i, t)}>
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
          <button key={q} className="opt small" onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>
      <form
        className="comment-bar"
        onSubmit={(e) => {
          e.preventDefault()
          send(text)
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message…" aria-label="Message" />
        <button type="submit" aria-label="Send" disabled={!text.trim()}>
          <Icon name="arrowUp" size={18} stroke={2.6} />
        </button>
      </form>
    </div>
  )
}
