import { useEffect, useMemo, useState } from 'react'
import { distanceMi, enforced, formatHour, LOTS, spaceLabel, usableIndices, type Permit } from './data'
import { freeIn, useSensors } from './sensors'
import { CampusMap } from './components/CampusMap'
import { Icon } from './components/bits'
import { ListView, LotSheet, NavPanel, OpenParkingNote, ProfileView, SearchBar, type Ctx, type Parked } from './components/Screens'

type Tab = 'list' | 'map' | 'profile'
type Nav = { lotId: string; spot: number | null; notice: string | null }

const embed = new URLSearchParams(window.location.search).has('embed')

export default function App() {
  const [hour, setHour] = useState(8.5)
  const [weekend, setWeekend] = useState(false)
  const [running, setRunning] = useState(true)
  const [tab, setTab] = useState<Tab>('list')
  const [permit, setPermit] = useState<Permit>('C')
  const [favorites, setFavorites] = useState<string[]>(['wilbur-garage'])
  const [selected, setSelected] = useState<string | null>(null)
  const [nav, setNav] = useState<Nav | null>(null)
  const [parked, setParked] = useState<(Parked & { index: number }) | null>(null)
  const [mapQuery, setMapQuery] = useState('')
  const { spaces, events, fill } = useSensors(hour, weekend, running, parked && { lotId: parked.lotId, index: parked.index })

  const usable = useMemo(() => Object.fromEntries(LOTS.map((l) => [l.id, usableIndices(permit, l, hour, weekend)])), [permit, hour, weekend])
  const ctx: Ctx = { permit, hour, weekend, usable }
  const firstFree = (lotId: string) => usable[lotId].find((i) => !spaces[lotId][i]) ?? null

  // Keep the guided space honest: if someone takes it (or your permit stops covering it), move to the next closest one.
  useEffect(() => {
    if (!nav || nav.spot === null) return
    if (!spaces[nav.lotId][nav.spot] && usable[nav.lotId].includes(nav.spot)) return
    const lot = LOTS.find((l) => l.id === nav.lotId)!
    const next = firstFree(nav.lotId)
    setNav({
      ...nav,
      spot: next,
      notice: next === null ? null : `${spaceLabel(lot, nav.spot)} was just taken. Next closest: ${spaceLabel(lot, next)}.`,
    })
  }, [spaces, nav, usable])

  const startNav = (lotId: string) => {
    setNav({ lotId, spot: firstFree(lotId), notice: null })
    setSelected(null)
    setTab('map')
  }

  const open = (id: string) => {
    setSelected(id)
    setTab('map')
  }

  const toggleFav = (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

  const navLot = nav ? LOTS.find((l) => l.id === nav.lotId)! : null
  const alternative = navLot
    ? LOTS.filter((l) => l.id !== navLot.id)
        .map((l) => ({ lot: l, free: freeIn(spaces[l.id], usable[l.id]) }))
        .filter((a) => a.free > 0)
        .sort((a, b) => distanceMi(a.lot) - distanceMi(b.lot))[0] ?? null
    : null

  const selLot = selected ? LOTS.find((l) => l.id === selected)! : null
  const q = mapQuery.trim().toLowerCase()
  const mapMatch = q ? LOTS.find((l) => l.name.toLowerCase().includes(q)) : null

  return (
    <div className={`page ${embed ? 'embed' : ''}`}>
      <aside className="side">
        <div className="brand">
          <img src="/icon.svg" alt="" width={64} height={64} />
          <div>
            <h1>ParkCampus</h1>
            <p>University Parking App</p>
          </div>
        </div>
        <p className="intro">
          A campus parking concept that pairs a mobile app with parking-space sensors. Research with Stanford students and
          faculty informed the core interface and user flows. Try it: the sensors below are simulated live.
        </p>

        <div className="control">
          <div className="control-head">
            <span>Time of day</span>
            <strong>{formatHour(hour)}</strong>
          </div>
          <input type="range" min={6} max={22} step={0.25} value={hour} onChange={(e) => setHour(Number(e.target.value))} aria-label="Time of day" />
          <div className="ticks">
            <span>6 AM</span>
            <span>Noon</span>
            <span>10 PM</span>
          </div>
          <div className="seg" role="radiogroup" aria-label="Day">
            <button role="radio" aria-checked={!weekend} className={!weekend ? 'on' : ''} onClick={() => setWeekend(false)}>
              Weekday
            </button>
            <button role="radio" aria-checked={weekend} className={weekend ? 'on' : ''} onClick={() => setWeekend(true)}>
              Weekend
            </button>
          </div>
          <ul className="rules">
            <li className={enforced({}, 'C', hour, weekend) ? 'on' : ''}>
              <b>A / C</b> {enforced({}, 'C', hour, weekend) ? 'permit required (weekdays 6 AM–4 PM)' : 'open to everyone right now'}
            </li>
            <li className={enforced({}, 'P', hour, weekend) ? 'on' : ''}>
              <b>Visitor</b> {enforced({}, 'P', hour, weekend) ? 'pay in ParkMobile (weekdays 8 AM–4 PM)' : 'free right now'}
            </li>
            <li className="on">
              <b>Residential</b> enforced 24/7
            </li>
          </ul>
          <div className="row">
            <button className="ghost" onClick={() => setRunning(!running)}>
              {running ? '❚❚ Pause sensors' : '▶ Resume sensors'}
            </button>
            <button className="ghost" disabled={!nav || nav.spot === null} onClick={() => nav && fill(nav.lotId, usable[nav.lotId])} title="Start navigating to a lot first">
              Fill my destination
            </button>
          </div>
          <div className="legend">
            <span><i style={{ background: '#4cc05f' }} /> Open</span>
            <span><i style={{ background: '#f2c230' }} /> Almost full</span>
            <span><i style={{ background: '#e5534b' }} /> Full</span>
          </div>
        </div>

        <div className="feed">
          <div className="control-head">
            <span>Sensor feed</span>
            <span className={`dot ${running ? 'live' : ''}`}>{running ? 'live' : 'paused'}</span>
          </div>
          <ul>
            {events.slice(0, 7).map((e) => {
              const lot = LOTS.find((l) => l.id === e.lotId)!
              return (
                <li key={e.id}>
                  <i className={e.occupied ? 'occ' : 'free'} />
                  <span>
                    {lot.name} <b>{e.label}</b>
                  </span>
                  <em>{e.occupied ? 'car arrived' : 'now open'}</em>
                </li>
              )
            })}
            {events.length === 0 && <li className="muted">Waiting for sensors…</li>}
          </ul>
        </div>
      </aside>

      <div className="phone" aria-label="ParkCampus app prototype">
        <div className="statusbar">
          <span>{formatHour(hour).replace(/ (AM|PM)/, '')}</span>
          <span className="notch" />
          <span className="battery">100%</span>
        </div>

        <div className="viewport">
          {tab === 'list' && <ListView spaces={spaces} ctx={ctx} favorites={favorites} onOpen={open} onGo={startNav} />}

          {tab === 'map' && (
            <div className="screen map-screen">
              <CampusMap spaces={spaces} usable={usable} selected={selected ?? nav?.lotId ?? null} onSelect={(id) => !nav && setSelected(id)} route={navLot} />
              {!nav && (
                <div className="map-search">
                  <SearchBar value={mapQuery} onChange={setMapQuery} />
                  {!mapMatch && !selLot && <OpenParkingNote ctx={ctx} />}
                  {mapMatch && (
                    <button className="suggest" onClick={() => (setSelected(mapMatch.id), setMapQuery(''))}>
                      {mapMatch.name} · {freeIn(spaces[mapMatch.id], usable[mapMatch.id])} open for you
                    </button>
                  )}
                </div>
              )}
              {selLot && !nav && (
                <LotSheet
                  lot={selLot}
                  spaces={spaces[selLot.id]}
                  ctx={ctx}
                  fav={favorites.includes(selLot.id)}
                  onFav={() => toggleFav(selLot.id)}
                  onGo={() => startNav(selLot.id)}
                  onClose={() => setSelected(null)}
                />
              )}
              {nav && navLot && (
                <NavPanel
                  lot={navLot}
                  spaces={spaces[navLot.id]}
                  ctx={ctx}
                  spot={nav.spot}
                  notice={nav.notice}
                  alternative={alternative}
                  onReroute={() => alternative && startNav(alternative.lot.id)}
                  onParked={() => {
                    if (nav.spot === null) return
                    setParked({ lotId: navLot.id, index: nav.spot, label: spaceLabel(navLot, nav.spot), since: Date.now() })
                    setNav(null)
                    setTab('profile')
                  }}
                  onCancel={() => setNav(null)}
                />
              )}
            </div>
          )}

          {tab === 'profile' && (
            <ProfileView permit={permit} setPermit={setPermit} favorites={favorites} parked={parked} onEndParking={() => setParked(null)} onOpen={open} />
          )}
        </div>

        <nav className="tabbar">
          {(
            [
              ['list', 'home', 'Lots'],
              ['map', 'compass', 'Map'],
              ['profile', 'user', 'Profile'],
            ] as const
          ).map(([t, icon, label]) => (
            <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)} aria-label={label} aria-current={tab === t ? 'page' : undefined}>
              <Icon name={icon} />
              <span>{label}</span>
              {t === 'profile' && parked && <i className="badge" />}
            </button>
          ))}
        </nav>
      </div>

      {!embed && <footer className="credits">Concept prototype by Andrew · Permit rules and prices from Stanford Transportation (2026); map is approximate and occupancy is simulated.</footer>}
    </div>
  )
}
