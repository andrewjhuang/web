import { useEffect, useRef, useState } from 'react'
import { ding } from '../audio'
import { QUOTES, STRESSORS } from '../data'
import type { Stats } from '../App'

/* ---------------- Title ---------------- */

export function Title({ onStart, onBehind }: { onStart: () => void; onBehind: () => void }) {
  return (
    <div className="scene title">
      <div className="title-blocks" aria-hidden>
        <span className="blk lime">Box</span>
        <span className="blk gold">Room</span>
        <span className="blk coral">Booth</span>
      </div>
      <div className="cones" aria-hidden>
        {['#ff8a6b', '#9bd94a', '#f6efe2', '#f2b33d'].map((c, i) => (
          <svg key={c} className="cone" style={{ animationDelay: `${i * -0.7}s`, left: `${12 + i * 24}%` }} viewBox="0 0 40 60" width="46">
            <path d="M8 22h24L20 58z" fill="#e2a85a" />
            <path d="M12 26l14 0M10 32l18 0M14 40l12 0" stroke="#b87a35" strokeWidth="1.5" />
            <circle cx="20" cy="16" r="13" fill={c} />
          </svg>
        ))}
      </div>
      <p className="kicker">StartX · Stanford Research Park · 2025</p>
      <h1 className="big">
        I Scream
        <br />
        Room
      </h1>
      <p className="sub">
        A soundproof room and scream kit for early-stage solo founders.
        <br />
        Release the pressure. You don’t have to perform in here.
      </p>
      <div className="title-actions">
        <button className="btn primary" onClick={onStart}>
          Start your day ▸
        </button>
        <button className="btn ghost" onClick={onBehind}>
          Behind the design
        </button>
      </div>
      <p className="hint">Sound on 🔊 · works with a mic, a mouse, or the space bar</p>
    </div>
  )
}

/* ---------------- Lobby: sensory overload + storefront signage ---------------- */

export function Lobby({ stress, setStress, onEnter }: { stress: number; setStress: (fn: (s: number) => number) => void; onEnter: () => void }) {
  const [shown, setShown] = useState<number[]>([])
  const [dismissed, setDismissed] = useState<number[]>([])
  const [sign, setSign] = useState(false)
  const n = useRef(0)

  useEffect(() => {
    const t = setInterval(() => {
      if (n.current >= STRESSORS.length) {
        clearInterval(t)
        setTimeout(() => setSign(true), 500)
        return
      }
      const i = n.current++
      setShown((s) => [...s, i])
      setStress((s) => Math.min(94, s + 7))
      ding()
    }, 750)
    return () => clearInterval(t)
  }, [setStress])

  const visible = shown.filter((i) => !dismissed.includes(i))

  return (
    <div className="scene lobby">
      <div className="window" aria-hidden>
        <div className="hills" />
        <div className="oak o1" />
        <div className="oak o2" />
        <div className="oak o3" />
        <span className="window-label">Stanford Research Park</span>
      </div>
      <div className="office-sign">startX</div>
      <div className="desk" aria-hidden>
        <div className="laptop">
          <div className="screen-glow">
            <span>pitch_deck_v37_FINAL_final.key</span>
          </div>
        </div>
        <div className="coffee">☕</div>
        <div className="coffee c2">☕</div>
      </div>

      <div className="notifs" aria-live="polite">
        {visible.slice(-6).map((i) => {
          const s = STRESSORS[i]
          return (
            <button
              key={i}
              className="notif"
              onClick={() => {
                setDismissed((d) => [...d, i])
                setStress((v) => Math.max(0, v - 1))
              }}
              title="Dismiss"
            >
              <span className="n-icon">{s.icon}</span>
              <span className="n-body">
                <b>{s.from}</b>
                {s.text}
              </span>
            </button>
          )
        })}
      </div>

      <p className="lobby-caption">
        {sign ? 'Somewhere down the hall…' : stress > 60 ? 'It’s 4:47pm. You haven’t talked to a human all day.' : 'Just another day as a solo founder.'}
      </p>

      <div className={`storefront ${sign ? 'in' : ''}`}>
        <div className="marquee">
          <span>I SCREAM ROOM</span>
        </div>
        <div className="sign-card">
          <p className="hand">
            I scream,
            <br />
            you scream,
            <br />
            we all scream 🍦🍦🍦
          </p>
        </div>
        <div className="sign-card small">
          <p className="hand">
            Side effects may include
            <br />
            peace &amp; love ☮ ♡
          </p>
        </div>
        <button className="btn primary door-btn" onClick={onEnter}>
          Step inside ▸
        </button>
      </div>
      {!sign && (
        <button className="skip" onClick={() => setSign(true)}>
          skip ▸▸
        </button>
      )}
    </div>
  )
}

/* ---------------- Exit: before / after bins ---------------- */

export function Exit({
  before,
  after,
  stats,
  onReplay,
  onBehind,
}: {
  before: number
  after: number
  stats: Stats
  onReplay: () => void
  onBehind: () => void
}) {
  const drop = Math.max(0, before - after)
  const quote = drop > 50 ? QUOTES[2] : stats.notesRead ? QUOTES[1] : QUOTES[0]
  return (
    <div className="scene exit">
      <h2 className="big small-big">You feel {drop > 50 ? 'way' : drop > 25 ? 'a lot' : 'a little'} lighter.</h2>
      <div className="bins">
        <div className="bin">
          <span className="bin-label">BEFORE</span>
          <div className="bar">
            <div style={{ height: `${before}%` }} className="fill hot" />
          </div>
          <strong>{Math.round(before)}%</strong>
          <span>stress</span>
        </div>
        <div className="arrow">→</div>
        <div className="bin">
          <span className="bin-label">AFTER</span>
          <div className="bar">
            <div style={{ height: `${after}%` }} className="fill calm" />
          </div>
          <strong>{Math.round(after)}%</strong>
          <span>stress</span>
        </div>
        <ul className="tally">
          <li>
            <b>{stats.screams}</b> scream{stats.screams === 1 ? '' : 's'}
            {stats.loudest > 0 && <em> · loudest {stats.loudest} dB</em>}
          </li>
          <li>
            <b>{stats.pops}</b> balloon{stats.pops === 1 ? '' : 's'} popped
          </li>
          <li>
            <b>{stats.kicks}</b> kick{stats.kicks === 1 ? '' : 's'}
          </li>
          <li>
            <b>{stats.notes}</b> anonymous note{stats.notes === 1 ? '' : 's'} left
          </li>
        </ul>
      </div>
      <blockquote>“{quote}”</blockquote>
      <p className="attrib">— a StartX founder, testing our room</p>
      <div className="title-actions">
        <button className="btn primary" onClick={onReplay}>
          Play again
        </button>
        <button className="btn ghost" onClick={onBehind}>
          Behind the design
        </button>
      </div>
    </div>
  )
}
