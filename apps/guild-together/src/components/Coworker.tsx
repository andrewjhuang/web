import { useState } from 'react'
import { COURSES, COURSE_COLORS, INTERESTS, type Profile } from '../data'
import { Avatar, Chip, Ribbon } from './ui'

export type Coworker = {
  name: string
  courses: string[]
  interests: string[]
  stage: 'draft' | 'invited' | 'joined'
  together: string[]
  photo?: string
}

export const DEFAULT_COWORKER: Coworker = {
  name: 'Layla',
  courses: ['Management 101', 'HR 120'],
  interests: ['Yoga', 'Music'],
  stage: 'draft',
  together: [],
  photo: '/people/layla.jpg',
}

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

export function CoworkerStep({
  profile,
  coworker,
  setCoworker,
  onNext,
  onBack,
}: {
  profile: Profile
  coworker: Coworker
  setCoworker: (c: Coworker) => void
  onNext: () => void
  onBack: () => void
}) {
  const set = <K extends keyof Coworker>(key: K, value: Coworker[K]) => setCoworker({ ...coworker, [key]: value })
  const name = coworker.name.trim() || 'your coworker'
  const me = profile.name.trim() || 'You'

  return (
    <section className="panel coworker">
      <Ribbon color="var(--blush)" />
      <div className="panel-body">
        {coworker.stage === 'draft' && (
          <>
            <p className="eyebrow">Step 3 · Coworker nomination</p>
            <h2 className="title">Who do you already love working with?</h2>
            <p className="lede">
              The people on your shift are the best part of the job. Invite one to Guild and you'll each get a bundle of
              school supplies (notebooks, pens, binders). Level up together.
            </p>

            <div className="form-grid single">
              <label>
                <span>Coworker's first name</span>
                <input value={coworker.name} onChange={(e) => setCoworker({ ...coworker, name: e.target.value, photo: undefined })} />
              </label>
            </div>
            <fieldset>
              <legend>What might {name} want to learn?</legend>
              <div className="chips">
                {COURSES.map((c) => (
                  <Chip key={c} selected={coworker.courses.includes(c)} onClick={() => set('courses', toggle(coworker.courses, c))}>
                    {c}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>What are they into?</legend>
              <div className="chips">
                {INTERESTS.map((i) => (
                  <Chip key={i} selected={coworker.interests.includes(i)} onClick={() => set('interests', toggle(coworker.interests, i))}>
                    {i}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <div className="actions">
              <button className="btn ghost" onClick={onBack}>
                ← Study buddies
              </button>
              <button className="btn primary" disabled={!coworker.name.trim()} onClick={() => set('stage', 'invited')}>
                Create {coworker.name.trim() ? `${coworker.name.trim()}'s` : 'an'} invite →
              </button>
            </div>
          </>
        )}

        {coworker.stage === 'invited' && (
          <Invite me={me} profile={profile} coworker={coworker} onEdit={() => set('stage', 'draft')} onJoin={() => set('stage', 'joined')} />
        )}

        {coworker.stage === 'joined' && <Joined profile={profile} coworker={coworker} setCoworker={setCoworker} onNext={onNext} />}
      </div>
    </section>
  )
}

function Invite({
  me,
  profile,
  coworker,
  onEdit,
  onJoin,
}: {
  me: string
  profile: Profile
  coworker: Coworker
  onEdit: () => void
  onJoin: () => void
}) {
  const [copied, setCopied] = useState(false)
  const slug = `${(profile.name.trim() || 'friend').toLowerCase().replace(/[^a-z0-9]+/g, '')}-${profile.store.toLowerCase().replace(/[^a-z0-9]+/g, '')}`
  const link = `guild.com/join/${slug}`
  const sharedInterests = profile.interests.filter((i) => coworker.interests.includes(i))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${link}`)
    } catch {
      // Clipboard can be blocked inside iframes; the confirmation is still useful for the demo.
    }
    setCopied(true)
  }

  return (
    <>
      <p className="eyebrow">You're enrolled! Welcome to Guild</p>
      <h2 className="title">Here's what {coworker.name} will see.</h2>

      <div className="invite-card">
        <div className="invite-from">
          <Avatar name={me} color="var(--peach)" size={48} />
          <p>
            <strong>{me}</strong> from {profile.store} thinks you'd be a great study partner.
          </p>
        </div>
        <h3>Learn with someone who already has your back.</h3>
        <p>
          Guild covers tuition for courses through {profile.store}. Join with {me}'s link and you'll both get a bundle of
          school supplies.
        </p>
        {sharedInterests.length > 0 && (
          <p className="muted">
            P.S. You two both love {sharedInterests.map((s) => s.toLowerCase()).join(' and ')}.
          </p>
        )}
      </div>

      <div className="copy-row">
        <code>{link}</code>
        <button className="btn dark" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy link'}
        </button>
      </div>

      <div className="actions">
        <button className="btn ghost" onClick={onEdit}>
          ← Edit
        </button>
        <button className="btn primary" onClick={onJoin}>
          Fast-forward: {coworker.name} joins →
        </button>
      </div>
    </>
  )
}

function Joined({
  profile,
  coworker,
  setCoworker,
  onNext,
}: {
  profile: Profile
  coworker: Coworker
  setCoworker: (c: Coworker) => void
  onNext: () => void
}) {
  const all = COURSES.filter((c) => profile.courses.includes(c) || coworker.courses.includes(c))
  const both = (c: string) => profile.courses.includes(c) && coworker.courses.includes(c)
  const ranked = [...all].sort((a, b) => Number(both(b)) - Number(both(a)))
  const sharedInterests = profile.interests.filter((i) => coworker.interests.includes(i))

  const tag = (c: string) => (both(c) ? 'You both picked' : profile.courses.includes(c) ? 'Your pick' : `${coworker.name}'s pick`)

  return (
    <>
      <p className="eyebrow">Let's unlock opportunity together</p>
      <div className="joined-head">
        <Avatar name={coworker.name} color="var(--blush)" photo={coworker.photo} size={72} />
        <h2 className="title">{coworker.name} joined Guild!</h2>
      </div>
      <p className="lede">
        Here are courses you're both interested in. Explore them together.
        {sharedInterests.length > 0 && <> You also share a love of {sharedInterests.map((s) => s.toLowerCase()).join(' & ')}.</>}
      </p>

      <div className="course-grid">
        {ranked.map((c) => {
          const enrolled = coworker.together.includes(c)
          return (
            <div key={c} className="course-card">
              <div className="course-art" style={{ background: COURSE_COLORS[c] }}>
                <span>{c.split(' ')[0]}</span>
              </div>
              <div className="course-name">{c}</div>
              <div className={`course-tag ${both(c) ? 'both' : ''}`}>{tag(c)}</div>
              <button
                className={`btn small ${enrolled ? 'enrolled' : 'dark'}`}
                onClick={() => setCoworker({ ...coworker, together: toggle(coworker.together, c) })}
              >
                {enrolled ? 'Enrolled together ✓' : 'Enroll together'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="actions">
        <span />
        <button className="btn primary" onClick={onNext}>
          See your circle →
        </button>
      </div>
    </>
  )
}
