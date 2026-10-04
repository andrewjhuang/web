import { useState, type ReactNode } from 'react'
import { useStore } from '../App'
import { availableAt, itemById, locById, MENU, money, TAG_NAMES, type Item, type Tag } from '../data'
import { starPath } from './art'

/** Photo treated like a hand-tinted postcard: cream border, warm tint and a caption. */
export function Postcard({ src, caption, className = '' }: { src: string; caption?: string; className?: string }) {
  return (
    <figure className={`postcard ${className}`}>
      <div className="pc-img">
        <img src={src} alt={caption ?? ''} loading="lazy" />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export function Tags({ tags }: { tags?: Tag[] }) {
  if (!tags?.length) return null
  return (
    <span className="tags">
      {tags.map((t) => (
        <abbr key={t} title={TAG_NAMES[t]}>
          {t}
        </abbr>
      ))}
    </span>
  )
}

export function Star({ size = 10, color = 'var(--marigold)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden className="star">
      <path d={starPath(10, 10, 10)} fill={color} />
    </svg>
  )
}

export function SectionTitle({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <div className="section-title">
      {kicker && (
        <p className="kicker">
          <Star /> {kicker} <Star />
        </p>
      )}
      <h2>{children}</h2>
    </div>
  )
}

const FILTERS: (Tag | 'all')[] = ['all', 'V', 'VG', 'GF', 'DF']

/** The full menu as a 1939-style souvenir menu: dotted leaders, two columns. */
export function MenuBoard({ ordering = false }: { ordering?: boolean }) {
  const { location, openItem, add } = useStore()
  const [filter, setFilter] = useState<Tag | 'all'>('all')
  const [section, setSection] = useState('all')
  const loc = locById(location)

  const sections = MENU.filter((s) => section === 'all' || s.id === section)
    .map((s) => ({ ...s, items: s.items.filter((i) => filter === 'all' || i.tags?.includes(filter)) }))
    .filter((s) => s.items.length)

  return (
    <div className={`board ${ordering ? 'ordering' : ''}`}>
      <div className="board-tools">
        <div className="chips" role="tablist" aria-label="Menu sections">
          <button className={section === 'all' ? 'on' : ''} onClick={() => setSection('all')}>
            Everything
          </button>
          {MENU.map((s) => (
            <button key={s.id} className={section === s.id ? 'on' : ''} onClick={() => setSection(s.id)}>
              {s.title}
            </button>
          ))}
        </div>
        <div className="chips small" aria-label="Dietary filter">
          {FILTERS.map((f) => (
            <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)} title={f === 'all' ? 'All' : TAG_NAMES[f]}>
              {f === 'all' ? 'All diets' : TAG_NAMES[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="board-cols">
        {sections.map((s) => (
          <section key={s.id} className="board-section">
            <h3>
              <span>{s.title}</span>
            </h3>
            <p className="board-note">{s.note}</p>
            <ul>
              {s.items.map((i) => {
                const here = availableAt(i, location)
                return (
                  <li key={i.id} className={here ? '' : 'away'}>
                    <button className="line" onClick={() => openItem(i.id)}>
                      <span className="name">
                        {i.name}
                        {i.photo && <Star size={9} color="var(--pacific)" />}
                      </span>
                      <span className="dots" />
                      <span className="price">{money(i.price)}</span>
                    </button>
                    <p className="desc">
                      {i.blurb} <Tags tags={i.tags} />
                      {i.seasonal && <em className="season">{i.seasonal}</em>}
                      {!here && <em className="coast">Coast cafes only</em>}
                    </p>
                    {ordering && here && (
                      <button className="add" onClick={() => (i.options?.length ? openItem(i.id) : add(i.id))} aria-label={`Add ${i.name}`}>
                        + Add
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
      <p className="board-foot">
        <Star size={9} color="var(--pacific)" /> pictured dishes · prices at {loc.name} · V vegetarian · VG vegan · GF gluten-free · DF dairy-free
      </p>
    </div>
  )
}

export function ItemSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const { add, location } = useStore()
  const i: Item = itemById(id)
  const [option, setOption] = useState(i.options?.[0])
  const [note, setNote] = useState('')
  const here = availableAt(i, location)
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={i.name} onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        {i.photo ? <Postcard src={i.photo} caption={i.name} className="sheet-photo" /> : <div className="sheet-plate" aria-hidden><Star size={46} /></div>}
        <div className="sheet-body">
          <p className="kicker">{MENU.find((s) => s.items.includes(i))!.title}</p>
          <h3>{i.name}</h3>
          <p className="sheet-price">{money(i.price)}</p>
          <p>{i.blurb}</p>
          <dl>
            <dt>Ingredients</dt>
            <dd>{i.ingredients}</dd>
            <dt>Vendors</dt>
            <dd>{i.vendors}</dd>
            <dt>Allergens</dt>
            <dd>{i.allergens}</dd>
          </dl>
          {i.options && (
            <div className="opts">
              {i.options.map((o) => (
                <button key={o} className={option === o ? 'on' : ''} onClick={() => setOption(o)}>
                  {o}
                </button>
              ))}
            </div>
          )}
          <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes or substitutions" aria-label="Notes or substitutions" />
          <button
            className="btn"
            disabled={!here}
            onClick={() => {
              add(i.id, option, note.trim() || undefined)
              onClose()
            }}
          >
            {here ? `Add to order · ${money(i.price)}` : `Only at our coast cafes`}
          </button>
        </div>
      </div>
    </div>
  )
}
