import { PEOPLE, type Profile } from '../data'
import { scoreMatch } from '../match'
import type { Coworker } from './Coworker'

type Node = { id: string; name: string; color: string; photo?: string; sub: string; courses: string[]; hours: number }

export function Circle({
  profile,
  circle,
  coworker,
  onRestart,
  goTo,
}: {
  profile: Profile
  circle: string[]
  coworker: Coworker
  onRestart: () => void
  goTo: (step: number) => void
}) {
  const nodes: Node[] = PEOPLE.filter((p) => circle.includes(p.id)).map((p) => {
    const m = scoreMatch(profile, p)
    return { id: p.id, name: p.name, color: p.color, photo: p.photo, sub: `Study buddy · ${p.store}`, courses: m.sharedCourses, hours: m.sharedSlots.length }
  })
  if (coworker.stage === 'joined') {
    const courses = coworker.together.length
      ? coworker.together
      : profile.courses.filter((c) => coworker.courses.includes(c))
    nodes.push({ id: 'coworker', name: coworker.name, color: 'var(--blush)', photo: coworker.photo, sub: `Coworker · ${profile.store}`, courses, hours: 0 })
  }

  const courseCount = new Set(nodes.flatMap((n) => n.courses)).size
  const sessions = nodes.reduce((sum, n) => sum + n.hours, 0)
  const me = profile.name.trim() || 'You'

  const W = 900
  const H = 520
  const cx = W / 2
  const cy = H / 2
  const RX = 310
  const RY = 175
  const placed = nodes.map((n, i) => {
    // Start at the top for odd counts, offset by half a step for even counts so nobody sits directly on the axis labels.
    const a = -Math.PI / 2 + ((i + (nodes.length % 2 ? 0 : 0.5)) * 2 * Math.PI) / nodes.length
    const x = cx + RX * Math.cos(a)
    const y = cy + RY * Math.sin(a)
    return { ...n, x, y, above: y < cy - 1, label: n.courses.length > 1 ? `${n.courses[0]} +${n.courses.length - 1}` : (n.courses[0] ?? '') }
  })

  return (
    <section className="panel circle">
      <div className="panel-body">
        <p className="eyebrow">Step 4 · Grow in good company</p>
        <h2 className="title">Your learning circle</h2>

        {nodes.length === 0 ? (
          <div className="empty">
            <p>Your circle is empty for now. Say hi to a study buddy or invite a coworker to start it.</p>
            <div className="actions center">
              <button className="btn ghost" onClick={() => goTo(2)}>
                Find study buddies
              </button>
              <button className="btn ghost" onClick={() => goTo(3)}>
                Invite a coworker
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="reframe">
              <div className="reframe-old">
                <span className="tag">Instead of</span>
                <s>“You're ahead of 62% of your colleagues.”</s>
              </div>
              <div className="reframe-new">
                <span className="tag">We say</span>
                “Your circle of {nodes.length + 1} is learning {courseCount} course{courseCount === 1 ? '' : 's'} together.”
              </div>
            </div>

            <svg className="constellation" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${me} connected to ${nodes.map((n) => n.name).join(', ')}`}>
              {placed.map((n) => (
                <line key={n.id} x1={cx} y1={cy} x2={n.x} y2={n.y} className="edge" />
              ))}
              {placed.map((n, i) => {
                // Course label sits just past the midpoint, clear of both nodes.
                const lx = cx + (n.x - cx) * 0.55
                const ly = cy + (n.y - cy) * 0.55
                const w = n.label.length * 6.8 + 24
                const nameY = n.above ? n.y - 58 : n.y + 58
                return (
                  <g key={n.id} className="orbit" style={{ animationDelay: `${i * 120}ms` }}>
                    {n.label && (
                      <g transform={`translate(${lx} ${ly})`}>
                        <rect x={-w / 2} y={-13} width={w} height={26} rx={13} className="edge-label-bg" />
                        <text className="edge-label" textAnchor="middle" dy="4">
                          {n.label}
                        </text>
                      </g>
                    )}
                    {n.photo ? (
                      <>
                        <clipPath id={`clip-${n.id}`}>
                          <circle cx={n.x} cy={n.y} r={38} />
                        </clipPath>
                        <image href={n.photo} x={n.x - 38} y={n.y - 38} width={76} height={76} clipPath={`url(#clip-${n.id})`} preserveAspectRatio="xMidYMid slice" />
                        <circle cx={n.x} cy={n.y} r={38} fill="none" className="node" />
                      </>
                    ) : (
                      <>
                        <circle cx={n.x} cy={n.y} r={38} fill={n.color} className="node" />
                        <text x={n.x} y={n.y + 10} textAnchor="middle" className="node-initial">
                          {n.name.charAt(0).toUpperCase()}
                        </text>
                      </>
                    )}
                    <text x={n.x} y={n.above ? nameY - 14 : nameY} textAnchor="middle" className="node-name">
                      {n.name}
                    </text>
                    <text x={n.x} y={n.above ? nameY + 2 : nameY + 16} textAnchor="middle" className="node-sub">
                      {n.sub}
                    </text>
                  </g>
                )
              })}
              <circle cx={cx} cy={cy} r={52} className="node me" />
              <text x={cx} y={cy + 8} textAnchor="middle" className="node-me">
                {me}
              </text>
            </svg>

            <div className="stats">
              <div>
                <span className="stat-num">{nodes.length + 1}</span>
                <span>people learning together</span>
              </div>
              <div>
                <span className="stat-num">{courseCount}</span>
                <span>shared courses</span>
              </div>
              <div>
                <span className="stat-num">{sessions}</span>
                <span>overlapping study times each week</span>
              </div>
            </div>
          </>
        )}

        <div className="actions center">
          <button className="btn ghost" onClick={onRestart}>
            ↺ Start over
          </button>
        </div>
      </div>
    </section>
  )
}
