import { useState } from 'react'
import { CATEGORIES, MEETUPS, money, priceGuide, type Condition, type Listing } from '../data'
import { Icon } from './ui'

const SAMPLE_PHOTOS = ['/listings/headphones.jpg', '/listings/lavalamp.jpg', '/listings/table.jpg']

const KEYWORDS: [RegExp, string][] = [
  [/book|reader|textbook|cs ?\d|econ|math|chem|bio/i, 'Textbooks'],
  [/phone|laptop|ipad|airpods|monitor|switch|controller|camera|headphone|charger|lamp|speaker/i, 'Electronics'],
  [/bike|scooter|skateboard|car\b/i, 'Vehicles'],
  [/chair|desk|couch|futon|table|shelf|bed|rug|fridge/i, 'Furniture'],
  [/glass|plate|mug|pan|pot|jar|bowl|cup/i, 'Tableware'],
  [/shoe|sneaker|boot|slide/i, 'Shoes'],
  [/hat|cap|beanie/i, 'Hats'],
  [/pant|jogger|legging|jean|sweats|shorts/i, 'Pants'],
  [/shirt|tee|top|hoodie|sweater|jacket/i, 'Clothing'],
  [/ticket|concert|game/i, 'Tickets'],
  [/ring|necklace|bracelet|earring/i, 'Jewelry'],
]

const suggest = (title: string) => KEYWORDS.find(([re]) => re.test(title))?.[1] ?? null

export function Sell({ onPost, onCancel }: { onPost: (l: Listing) => void; onCancel: () => void }) {
  const [step, setStep] = useState(0)
  const [photo, setPhoto] = useState(SAMPLE_PHOTOS[0])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [condition, setCondition] = useState<Condition>('Used')
  const [size, setSize] = useState('n/a')
  const [amount, setAmount] = useState('')
  const [meetup, setMeetup] = useState(MEETUPS[0])
  const [description, setDescription] = useState('')

  const suggested = suggest(title)
  const cat = category ?? suggested
  const guide = cat ? priceGuide(cat, condition) : null
  const price = Number(amount) || 0
  const canNext = step === 0 ? title.trim().length >= 3 : step === 1 ? !!cat && price > 0 : true

  const listing: Listing = {
    id: `mine-${Date.now()}`,
    title: title.trim(),
    price,
    photo,
    categories: cat ? [cat] : ['Other'],
    condition,
    size,
    description: description.trim() || 'No description yet.',
    postedMin: 0,
    seller: 'you',
    meetup,
    saves: 0,
  }

  return (
    <div className="screen sell">
      <header className="d-header">
        <button className="back" onClick={step ? () => setStep(step - 1) : onCancel} aria-label={step ? 'Back' : 'Cancel'}>
          <Icon name={step ? 'back' : 'x'} size={24} stroke={2.6} />
        </button>
        <h2 className="h-title">Sell an item</h2>
        <span style={{ width: 34 }} />
      </header>
      <ol className="stepper">
        {['Photo', 'Details', 'Review'].map((s, i) => (
          <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''}>
            <span>{i < step ? '✓' : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <div className="scroll sell-body">
        {step === 0 && (
          <>
            <div className="photo-row">
              <label className="photo add">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setPhoto(URL.createObjectURL(f))
                  }}
                />
                <Icon name="camera" size={24} />
                <span>Add photo</span>
              </label>
              {[...(SAMPLE_PHOTOS.includes(photo) ? [] : [photo]), ...SAMPLE_PHOTOS].map((p) => (
                <button key={p} className={`photo ${photo === p ? 'on' : ''}`} onClick={() => setPhoto(p)} aria-label="Use this photo">
                  <img src={p} alt="" />
                </button>
              ))}
            </div>
            <label className="f-label" htmlFor="title">
              What are you selling?
            </label>
            <input id="title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. desk lamp" />
            {suggested && (
              <p className="hint red">
                ✨ Looks like <b>{suggested}</b>. We'll file it there.
              </p>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <label className="f-label">Category</label>
            <div className="opt-row">
              {CATEGORIES.map((c) => (
                <button key={c.name} className={`opt small ${cat === c.name ? 'on' : ''}`} onClick={() => setCategory(c.name)}>
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
            <label className="f-label">Condition</label>
            <div className="opt-grid">
              {(['New', 'Used'] as Condition[]).map((c) => (
                <button key={c} className={`opt ${condition === c ? 'on' : ''}`} onClick={() => setCondition(c)}>
                  {c}
                </button>
              ))}
            </div>
            <label className="f-label">Size</label>
            <div className="opt-row">
              {['n/a', 'XS', 'S', 'M', 'L', 'XL'].map((s) => (
                <button key={s} className={`opt small ${size === s ? 'on' : ''}`} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
            <label className="f-label" htmlFor="price">
              Price
            </label>
            <label className="amount">
              <span>$</span>
              <input id="price" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
            </label>
            {guide && (
              <button className="guide" onClick={() => setAmount(String(Math.round((guide[0] + guide[1]) / 2)))}>
                📊 Similar {cat!.toLowerCase()} ({condition.toLowerCase()}) sell for{' '}
                <b>
                  ${guide[0]}–${guide[1]}
                </b>
                . <u>Use ${Math.round((guide[0] + guide[1]) / 2)}</u>
              </button>
            )}
            <label className="f-label">Pickup spot</label>
            <div className="opt-row">
              {MEETUPS.map((m) => (
                <button key={m} className={`opt small ${meetup === m ? 'on' : ''}`} onClick={() => setMeetup(m)}>
                  📍 {m}
                </button>
              ))}
            </div>
            <label className="f-label" htmlFor="desc">
              Description
            </label>
            <textarea id="desc" className="field" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Condition details, what's included…" />
          </>
        )}

        {step === 2 && (
          <>
            <p className="muted center">How your listing will look to other Stanford students:</p>
            <div className="preview">
              <div className="l-card">
                <div className="l-photo">
                  <img src={listing.photo} alt="" />
                  <span className="l-badge new">New</span>
                </div>
                <div className="l-info">
                  <span className="l-price">{money(listing.price)}</span>
                  <span className="l-title">{listing.title}</span>
                </div>
              </div>
            </div>
            <ul className="checklist">
              <li>✓ Posted under your anonymous Fizz handle</li>
              <li>✓ Buyers see you're a verified Stanford student</li>
              <li>✓ Meetup at {meetup}</li>
              <li>✓ Offers arrive as cards you can accept or counter</li>
            </ul>
          </>
        )}
      </div>
      <div className="action-bar">
        <button className="red-btn full" disabled={!canNext} onClick={() => (step < 2 ? setStep(step + 1) : onPost(listing))}>
          {step < 2 ? 'Continue' : 'Post listing'}
        </button>
      </div>
    </div>
  )
}
