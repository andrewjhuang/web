import { useEffect, useState } from 'react'
import { SLOGANS } from '../data'
import { Ribbon } from './ui'

/** Copy pairs taken from Guild's site, alongside our collaborative rewrite. */
const REWRITES = [
  {
    label: 'Headline',
    before: 'We remove financial barriers and help you turn new skills into career growth.',
    after: 'We remove financial barriers so you and your coworkers can grow — together.',
  },
  {
    label: 'Career advancement',
    stat: '3.5x',
    before: 'Guild learners are 3.5x more likely to change roles within their companies compared to their colleagues who do not participate.',
    after: 'Guild learners are 3.5x more likely to change roles within their companies — and every one of them had people cheering them on.',
  },
  {
    label: 'Better pay',
    stat: '2x',
    before: 'Wage increases earned by Guild learners are more than 2x larger than the increases earned by colleagues who do not participate.',
    after: 'Wage increases for Guild learners are more than 2x larger. Imagine what that looks like for a whole team.',
  },
  {
    label: 'Support',
    before: 'Talk to a Guild coach.',
    after: 'Meet your Learning Support partner.',
  },
]

export function Welcome({ onNext }: { onNext: () => void }) {
  const [collab, setCollab] = useState(true)
  const [slogan, setSlogan] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlogan((i) => (i + 1) % SLOGANS.length), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="panel welcome">
      <Ribbon color="var(--forest)" />
      <div className="panel-body">
        <p className="eyebrow">Concept · Marketing rebrand</p>
        <h1 className="display">Welcome to Guild</h1>
        <p className="slogan" key={slogan}>
          {SLOGANS[slogan]}
        </p>

        <div className="toggle" role="radiogroup" aria-label="Messaging style">
          <button role="radio" aria-checked={!collab} className={!collab ? 'on' : ''} onClick={() => setCollab(false)}>
            Today: competitive
          </button>
          <button role="radio" aria-checked={collab} className={collab ? 'on' : ''} onClick={() => setCollab(true)}>
            Proposed: collaborative
          </button>
        </div>

        <div className={`rewrites ${collab ? 'is-collab' : 'is-compete'}`}>
          {REWRITES.map((r) => (
            <article key={r.label} className="rewrite">
              <div className="rewrite-label">
                {r.stat && <span className="stat">{r.stat}</span>}
                {r.label}
              </div>
              <p className="rewrite-text" key={collab ? 'a' : 'b'}>
                {collab ? r.after : r.before}
              </p>
            </article>
          ))}
        </div>

        <p className="caption">
          {collab
            ? 'Retail workers told us coworkers are why they show up. The new framing treats learners like teammates, not runners in a race.'
            : 'Phrases like "compared to their colleagues" quietly set learners against the people they value most.'}
        </p>

        <button className="btn primary" onClick={onNext}>
          Start learning together →
        </button>
      </div>
    </section>
  )
}
