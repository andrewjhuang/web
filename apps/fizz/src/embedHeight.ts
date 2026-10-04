/**
 * When embedded (`?embed`), tell the parent page how tall the prototype is so
 * the iframe can size itself with no inner scrollbar. The snippet in EMBEDS.md
 * listens for these messages.
 */
export function reportEmbedHeight() {
  if (!new URLSearchParams(window.location.search).has('embed') || window.parent === window) return
  let last = 0
  const root = document.getElementById('root')!
  const send = () => {
    // Measure the app itself: the document's scrollHeight can never be smaller than the iframe, so it only grows.
    const h = Math.ceil(root.getBoundingClientRect().height)
    if (h === last) return
    last = h
    window.parent.postMessage({ type: 'prototype-height', height: h }, '*')
  }
  new ResizeObserver(send).observe(root)
  window.addEventListener('load', send)
  send()
}
