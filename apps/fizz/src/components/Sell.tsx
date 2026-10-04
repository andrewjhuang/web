import { useState } from 'react'
import { CATEGORIES, MEETUPS, price, priceGuide, type Category, type Condition, type Listing } from '../data'
import { Bubbles, Icon } from './ui'

const PHOTOS = [
  { emoji: '📕', bg: 'linear-gradient(135deg,#fecaca,#f87171)' },
  { emoji: '🪑', bg: 'linear-gradient(135deg,#fde68a,#fbbf24)' },
  { emoji: '🎮', bg: 'linear-gradient(135deg,#c7d2fe,#818cf8)' },
  { emoji: '👟', bg: 'linear-gradient(135deg,#bbf7d0,#4ade80)' },
  { emoji: '🚲', bg: 'linear-gradient(135deg,#bae6fd,#38bdf8)' },
  { emoji: '🪴', bg: 'linear-gradient(135deg,#d9f99d,#a3e635)' },
]

const KEYWORDS: [RegExp, Category][] = [
  [/book|reader|textbook|cs ?\d|econ|math|chem|notes/i, 'Textbooks'],
  [/chair|desk|couch|futon|lamp|fridge|table|shelf|bed|rug|plant/i, 'Furniture'],
  [/phone|laptop|ipad|airpods|monitor|switch|xbox|ps5|controller|camera|headphone|calculator/i, 'Electronics'],
  [/jacket|shirt|shoe|sneaker|hoodie|dress|fleece|jeans/i, 'Clothing'],
  [/ticket|game|concert|show/i, 'Tickets'],
  [/sublet|room|apartment|lease/i, 'Sublets'],
]

const suggestCategory = (title: string) => KEYWORDS.find(([re]) => re.test(title))?.[1] ?? null

export function Sell({ onPost, onCancel }: { onPost: (l: Listing) => void; onCancel: () => void }) {
  const [step, setStep] = useState(0)
  const [photo, setPhoto] = useState(2)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [condition, setCondition] = useState<Condition>('Good')
  const [free, setFree] = useState(false)
  const [amount, setAmount] = useState('')
  const [meetup, setMeetup] = useState(MEETUPS[0])
  const [description, setDescription] = useState('')

  const suggested = suggestCategory(title)
  const cat = category ?? suggested
  const guide = cat && !free ? priceGuide(cat, condition) : null
  const value = free ? 0 : Number(amount) || 0

  const steps = ['Photos', 'Details', 'Review']
  const canNext = step === 0 ? title.trim().length >= 3 : step === 1 ? !!cat && (free || value > 0) : true

  const listing: Listing = {
    id: `mine-${Date.now()}`,
    title: title.trim() || 'Untitled item',
    price: value,
    category: cat ?? 'Free',
    condition,
    emoji: PHOTOS[photo].emoji,
    bg: PHOTOS[photo].bg,
    seller: 'you',
    meetup,
    postedMin: 0,
    description: description.trim() || 'No description yet.',
    saves: 0,
  }

  return (
    <div className="screen split sell">
      <header className="hero slim">
        <Bubbles count={10} seed={7} />
        <div className="hero-top">
          <button className="icon-btn light" onClick={step ? () => setStep(step - 1) : onCancel} aria-label={step ? 'Back' : 'Cancel'}>
            <Icon name={step ? 'back' : 'x'} size={20} />
          </button>
          <h1>Sell an item</h1>
          <span />
        </div>
        <ol className="stepper">
          {steps.map((s, i) => (
            <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''}>
              <span>{i < step ? '✓' : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </header>

      <div className="sell-body scroll">
        {step === 0 && (
          <>
            <label className="field-label">Add photos</label>
            <div className="photo-picker">
              {PHOTOS.map((p, i) => (
                <button
                  key={i}
                  className={`photo ${photo === i ? 'on' : ''}`}
                  style={{ background: p.bg }}
                  onClick={() => setPhoto(i)}
                  aria-label={`Photo ${i + 1}`}
                >
                  {p.emoji}
                </button>
              ))}
            </div>
            <p className="hint">Tip: listings with a clear photo of the actual item get more messages.</p>
            <label className="field-label" htmlFor="title">
              What are you selling?
            </label>
            <input
              id="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nintendo Switch controller"
            />
            {suggested && (
              <p className="suggest">
                ✨ Looks like <b>{suggested}</b>. We'll file it there.
              </p>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <label className="field-label">Category</label>
            <div className="chips">
              {CATEGORIES.filter((c) => c.name !== 'Free').map((c) => (
                <button key={c.name} className={`chip ${cat === c.name ? 'on' : ''}`} onClick={() => setCategory(c.name)}>
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
            <label className="field-label">Condition</label>
            <div className="seg light">
              {(['New', 'Like new', 'Good', 'Fair'] as Condition[]).map((c) => (
                <button key={c} className={condition === c ? 'on' : ''} onClick={() => setCondition(c)}>
                  {c}
                </button>
              ))}
            </div>
            <label className="field-label" htmlFor="price">
              Price
            </label>
            <div className="price-input">
              <div className={`amount ${free ? 'disabled' : ''}`}>
                <span>$</span>
                <input
                  id="price"
                  type="number"
                  min={1}
                  disabled={free}
                  value={free ? '' : amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <label className="free-toggle">
                <input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} /> Give it away
              </label>
            </div>
            {guide && (
              <button className="guide" onClick={() => setAmount(String(Math.round((guide[0] + guide[1]) / 2)))}>
                📊 Similar {cat!.toLowerCase()} in {condition.toLowerCase()} condition sell for{' '}
                <b>
                  ${guide[0]}–${guide[1]}
                </b>
                . <u>Use ${Math.round((guide[0] + guide[1]) / 2)}</u>
              </button>
            )}
            <label className="field-label">Pickup spot</label>
            <div className="chips">
              {MEETUPS.map((m) => (
                <button key={m} className={`chip ${meetup === m ? 'on' : ''}`} onClick={() => setMeetup(m)}>
                  📍 {m}
                </button>
              ))}
            </div>
            <label className="field-label" htmlFor="desc">
              Description <span className="muted">(optional)</span>
            </label>
            <textarea
              id="desc"
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Condition details, why you're selling, what's included…"
            />
          </>
        )}

        {step === 2 && (
          <>
            <p className="muted small">This is how your listing will look to other students.</p>
            <div className="preview">
              <div className="tile" style={{ background: listing.bg }}>
                <span className="tile-emoji">{listing.emoji}</span>
              </div>
              <div className="card-body">
                <div className="price-row">
                  <strong className={listing.price === 0 ? 'free' : ''}>{price(listing.price)}</strong>
                </div>
                <p className="title">{listing.title}</p>
                <p className="meta">
                  {listing.condition} · {listing.category} · 📍 {listing.meetup}
                </p>
              </div>
            </div>
            <ul className="checklist">
              <li>✓ Posted under your anonymous Fizz handle</li>
              <li>✓ Buyers see your .edu verified badge</li>
              <li>✓ Offers arrive as cards you can accept or counter</li>
            </ul>
          </>
        )}
      </div>

      <div className="action-bar">
        <button className="primary full" disabled={!canNext} onClick={() => (step < 2 ? setStep(step + 1) : onPost(listing))}>
          {step < 2 ? 'Continue' : 'Post listing'}
        </button>
      </div>
    </div>
  )
}
