import { useMemo, useState } from 'react'
import { BLOCKS, COURSE_COLORS, PEOPLE, type Profile } from '../data'
import { rankMatches, type Match } from '../match'
import { Avatar, Chip, WeekGrid } from './ui'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function slotLabel(s: string) {
  const [d, b] = s.split('-').map(Number)
  return `${DAY_NAMES[d]} ${BLOCKS[b].toLowerCase()}`
}

function icebreaker(me: Profile, m: Match) {
  const who = me.name.trim() || 'a fellow Guild learner'
  const when = m.sharedSlots[0] ? ` Want to meet up ${slotLabel(m.sharedSlots[0])}?` : ''
  const interest = m.sharedInterests[0] ? ` Also — a fellow ${m.sharedInterests[0].toLowerCase()} fan!` : ''
  return `Hi ${m.person.name}! I'm ${who}, ${me.role.toLowerCase()} at ${me.store}. Looks like we're both taking ${m.sharedCourses[0]}.${when}${interest}`
}

export function Buddies({
  profile,
  circle,
  onConnect,
  onNext,
  onBack,
}: {
  profile: Profile
  circle: string[]
  onConnect: (id: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const matches = useMemo(() => rankMatches(profile, PEOPLE), [profile])
  const [openId, setOpenId] = useState<string | null>(matches[0]?.person.id ?? null)
  const open = matches.find((m) => m.person.id === openId) ?? null

  return (
    <section className="panel buddies">
      <div className="panel-body">
        <p className="eyebrow">Step 2 · Study Buddies</p>
        <h2 className="title">Your potential study buddies</h2>
        <p className="lede">
          Matched across the Guild network on shared courses, overlapping free time, and what you're into — no managers
          in the loop.
        </p>

        {matches.length === 0 ? (
          <div className="empty">
            <p>No one in the network shares your courses yet.</p>
            <button className="btn ghost" onClick={onBack}>
              ← Add more courses
            </button>
          </div>
        ) : (
          <div className="buddies-layout">
            <ul className="match-list">
              {matches.map((m) => {
                const connected = circle.includes(m.person.id)
                return (
                  <li key={m.person.id}>
                    <button
                      className={`match-card ${openId === m.person.id ? 'active' : ''}`}
                      onClick={() => setOpenId(m.person.id)}
                    >
                      <Avatar name={m.person.name} color={m.person.color} photo={m.person.photo} size={56} />
                      <div className="match-info">
                        <div className="match-name">
                          {m.person.name}
                          {connected && <span className="badge">In your circle</span>}
                        </div>
                        <div className="match-role">
                          {m.person.role} at {m.person.store}
                        </div>
                        <div className="reasons">
                          <span>
                            {m.sharedCourses.length} shared course{m.sharedCourses.length > 1 ? 's' : ''}
                          </span>
                          {m.sharedSlots.length > 0 && <span>{m.sharedSlots.length} overlapping times</span>}
                          {m.sharedInterests.length > 0 && <span>Both love {m.sharedInterests[0].toLowerCase()}</span>}
                        </div>
                      </div>
                      <div className="score" style={{ ['--pct' as string]: `${m.score}%` }}>
                        <span>{m.score}%</span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>

            {open && <BuddyDetail key={open.person.id} me={profile} match={open} connected={circle.includes(open.person.id)} onConnect={onConnect} />}
          </div>
        )}

        <div className="actions">
          <button className="btn ghost" onClick={onBack}>
            ← Edit my info
          </button>
          <button className="btn primary" onClick={onNext}>
            Next: bring a coworker →
          </button>
        </div>
      </div>
    </section>
  )
}

function BuddyDetail({
  me,
  match,
  connected,
  onConnect,
}: {
  me: Profile
  match: Match
  connected: boolean
  onConnect: (id: string) => void
}) {
  const [msg, setMsg] = useState(() => icebreaker(me, match))
  const p = match.person

  return (
    <aside className="detail">
      <div className="detail-head">
        <Avatar name={p.name} color={p.color} photo={p.photo} size={88} />
        <div>
          <p className="eyebrow">Your study buddy</p>
          <h3 className="name">{p.name}</h3>
          <p className="muted">
            {p.role} at {p.store}
          </p>
        </div>
      </div>
      <p className="bio">“{p.bio}”</p>

      <div className="detail-section">
        <h4>Shared classes</h4>
        <div className="chips">
          {match.sharedCourses.map((c) => (
            <Chip key={c} color={COURSE_COLORS[c]}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <h4>When you're both free</h4>
        <WeekGrid mine={me.availability} other={p.availability} otherName={p.name} />
      </div>

      <div className="detail-section">
        {connected ? (
          <div className="sent">
            <strong>Message sent.</strong> {p.name} is now in your learning circle.
          </div>
        ) : (
          <>
            <h4>Say hi</h4>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} />
            <button className="btn primary" onClick={() => onConnect(p.id)} disabled={!msg.trim()}>
              Send to {p.name}
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
