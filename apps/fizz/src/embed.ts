/**
 * Embed mode (`?embed`), for iframes on the portfolio site.
 *
 * - Fit: if the iframe is shorter than the prototype (e.g. a fixed-height
 *   Framer embed), scale the whole prototype down so it fits without scrolling.
 * - Compact: in narrow iframes, show just the phone (side panel hidden).
 * - Auto-height: report the natural height to the parent page, so hosts that
 *   run the snippet in EMBEDS.md can size the iframe exactly instead.
 */
const MIN_SCALE = 0.55 // below this, text gets too small; scroll instead.
const COMPACT_BELOW = 760

export function setupEmbed({ compact = false }: { compact?: boolean } = {}) {
  if (!new URLSearchParams(window.location.search).has('embed')) return
  const html = document.documentElement
  const root = document.getElementById('root')!
  root.style.transformOrigin = 'top center'
  let reported = 0

  const update = () => {
    html.classList.toggle('embed-compact', compact && window.innerWidth < COMPACT_BELOW)
    // offsetHeight ignores transforms, so this is the unscaled height.
    const natural = root.offsetHeight
    const s = Math.min(1, window.innerHeight / natural)
    const fit = s < 0.999 && s >= MIN_SCALE
    root.style.transform = fit ? `scale(${s})` : ''
    html.style.overflow = fit ? 'hidden' : ''
    if (window.parent !== window && natural !== reported) {
      reported = natural
      window.parent.postMessage({ type: 'prototype-height', height: natural }, '*')
    }
  }

  new ResizeObserver(update).observe(root)
  window.addEventListener('resize', update)
  window.addEventListener('load', update)
  update()
}
