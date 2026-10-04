import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { setMuted } from './audio'
import type { WallTheme } from './data'
import { Behind } from './components/Behind'
import { H, Room, W } from './components/Room'
import { Exit, Lobby, Title } from './components/Scenes'

export type Stats = { screams: number; loudest: number; pops: number; kicks: number; notes: number; notesRead: number }
type Scene = 'title' | 'lobby' | 'room' | 'exit'

const embed = new URLSearchParams(window.location.search).has('embed')
const NO_STATS: Stats = { screams: 0, loudest: 0, pops: 0, kicks: 0, notes: 0, notesRead: 0 }
const FACES = ['😌', '🙂', '😐', '😣', '😫']

export default function App() {
  const [scene, setScene] = useState<Scene>('title')
  const [stress, setStressRaw] = useState(30)
  const [peak, setPeak] = useState(30)
  const [stats, setStats] = useState<Stats>(NO_STATS)
  const [theme, setTheme] = useState<WallTheme>('park')
  const [locked, setLocked] = useState(false)
  const [notes, setNotes] = useState<string[]>([])
  const [behind, setBehind] = useState(false)
  const [muted, setMute] = useState(false)
  const [shake, setShake] = useState(0)
  const [floaters, setFloaters] = useState<{ id: number; text: string }[]>([])
  const [scale, setScale] = useState(1)
  const wrap = useRef<HTMLDivElement>(null)
  const fid = useRef(0)

  // Scale the fixed 960×600 stage to fit the available space.
  useEffect(() => {
    const el = wrap.current!
    const ro = new ResizeObserver(([e]) => setScale(Math.min(e.contentRect.width / W, (window.innerHeight - (embed ? 16 : 150)) / H, 1.4)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => setMuted(muted), [muted])

  const setStress = useCallback((fn: (s: number) => number) => {
    setStressRaw((s) => {
      const n = Math.max(0, Math.min(100, fn(s)))
      setPeak((p) => Math.max(p, n))
      return n
    })
  }, [])

  const relieve = (amount: number, label: string) => {
    setStress((s) => s - amount)
    const id = ++fid.current
    setFloaters((f) => [...f.slice(-4), { id, text: `−${amount} ${label}` }])
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1200)
  }

  const bump = (k: keyof Stats, v = 1) => setStats((s) => ({ ...s, [k]: s[k] + v }))

  const toggleLock = (l: boolean) => {
    setLocked(l)
    if (l && !locked) relieve(5, 'privacy')
  }

  const restart = () => {
    setStats(NO_STATS)
    setNotes([])
    setLocked(false)
    setStressRaw(30)
    setPeak(30)
    setScene('lobby')
  }

  const face = FACES[Math.min(4, Math.floor(stress / 20.01))]
  const calm = stress < 25

  return (
    <div className={`page ${embed ? 'embed' : ''}`}>
      <div className="stage-wrap" ref={wrap}>
        <div className="stage-box" style={{ width: W * scale, height: H * scale }}>
          <div className={`stage ${shake > 0.15 ? 'shaking' : ''}`} style={{ transform: `scale(${scale})`, '--shake': `${shake * 6}px` } as CSSProperties}>
            {scene === 'title' && <Title onStart={() => setScene('lobby')} onBehind={() => setBehind(true)} />}
            {scene === 'lobby' && <Lobby stress={stress} setStress={setStress} onEnter={() => setScene('room')} />}
            {scene === 'room' && (
              <Room
                theme={theme}
                setTheme={setTheme}
                locked={locked}
                setLocked={toggleLock}
                stats={stats}
                bump={bump}
                relieve={relieve}
                myNotes={notes}
                addNote={(n) => setNotes((x) => [n, ...x])}
                setShake={setShake}
              />
            )}
            {scene === 'exit' && <Exit before={peak} after={stress} stats={stats} onReplay={restart} onBehind={() => setBehind(true)} />}

            {(scene === 'lobby' || scene === 'room') && (
              <div className="hud">
                <div className="stress" aria-label={`Stress ${Math.round(stress)} percent`}>
                  <span className="face">{face}</span>
                  <div className="stress-bar">
                    <div style={{ width: `${stress}%` }} className={stress > 60 ? 'hot' : stress > 30 ? 'warm' : 'cool'} />
                  </div>
                  <span className="stress-num">{Math.round(stress)}%</span>
                  {floaters.map((f) => (
                    <span key={f.id} className="floater">
                      {f.text}
                    </span>
                  ))}
                </div>
                <div className="hud-right">
                  <button className="hud-btn" onClick={() => setMute(!muted)} aria-label={muted ? 'Unmute' : 'Mute'}>
                    {muted ? '🔇' : '🔊'}
                  </button>
                  <button className="hud-btn" onClick={() => setBehind(true)}>
                    Behind the design
                  </button>
                  {scene === 'room' && (
                    <button className={`hud-btn leave ${calm ? 'ready' : ''}`} onClick={() => setScene('exit')}>
                      {calm ? 'Feeling lighter. Leave ▸' : 'Leave room'}
                    </button>
                  )}
                </div>
              </div>
            )}
            {scene === 'room' && stats.screams + stats.pops + stats.kicks + stats.notes === 0 && (
              <div className="tutorial">Tap things in the room. Scream, pop, kick, write. Hold the space bar to scream anytime.</div>
            )}
            {behind && <Behind onClose={() => setBehind(false)} />}
          </div>
        </div>
      </div>
      {!embed && (
        <footer className="credits">
          <b>I Scream Room</b> · a team project for StartX and Stanford Research Park (2025). Andrew: needfinding, experience design, prototyping and user
          testing.
          <br />A playable simulation of a physical prototype; notes are paraphrased from our interviews. Not affiliated with StartX or Stanford Research Park.
        </footer>
      )}
    </div>
  )
}
