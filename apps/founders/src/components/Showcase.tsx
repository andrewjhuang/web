import { useEffect, useState } from 'react'

/**
 * `?showcase`: the live site in a desktop browser and a phone, side by side,
 * scaled to fit whatever box it's in (e.g. a portfolio embed).
 */
const DESK = { w: 1280, h: 820 }
const PHONE = { w: 390, h: 844 }

export function Showcase() {
  const [vw, setVw] = useState(window.innerWidth)
  const [vh, setVh] = useState(window.innerHeight)
  useEffect(() => {
    const on = () => {
      setVw(window.innerWidth)
      setVh(window.innerHeight)
    }
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  const narrow = vw < 700
  // Fit desktop (+26px chrome) and phone (+24px bezel) in one row with gaps, or the phone alone on narrow screens.
  const availW = vw * 0.94 - (narrow ? 0 : vw * 0.03)
  const availH = vh * 0.94 - 40
  const s = narrow
    ? Math.min(availW / (PHONE.w + 24), availH / (PHONE.h + 24))
    : Math.min(availW / (DESK.w + PHONE.w + 28), availH / (DESK.h + 26), availH / (PHONE.h + 24))

  const src = window.location.pathname
  return (
    <div className="showcase">
      {!narrow && (
        <div className="sc-device desktop" style={{ width: DESK.w * s + 4, height: (DESK.h + 26) * s + 4, paddingTop: 26 * s }}>
          <iframe src={src} title="Founders Farmstand on desktop" style={{ width: DESK.w, height: DESK.h, transform: `scale(${s})` }} />
          <span className="sc-label">Desktop</span>
        </div>
      )}
      <div className="sc-device phone" style={{ width: (PHONE.w + 24) * s + 4, height: (PHONE.h + 24) * s + 4, padding: 12 * s, borderRadius: 38 * s }}>
        <iframe src={`${src}#/menu`} title="Founders Farmstand on a phone" style={{ width: PHONE.w, height: PHONE.h, transform: `scale(${s})`, borderRadius: 28 }} />
        <span className="sc-label">Mobile</span>
      </div>
    </div>
  )
}
