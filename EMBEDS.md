# Embedding the prototypes on your portfolio

Put each block at the top of its project page, right after the header. Every embed:

- loads the app with `?embed`, which hides the credits footer and tightens the padding;
- fills the page's content width;
- **sizes its own height** (Guild, CampusPark and Fizz tell the page how tall they are, so there's no inner scrollbar or empty gap). If your site builder blocks scripts, the iframe keeps the fallback height in its `style`.

## Where to paste it

| Builder | How |
| --- | --- |
| **Webflow** | Drag in an **Embed** element (Add panel → Components → Embed) directly under the page header, paste the code, Save. Custom code embeds need a paid site plan. |
| **Squarespace** | Add a **Code** block under the header, set it to HTML, paste. If your plan doesn't run scripts in code blocks, the embed still works at the fallback height. |
| **Framer** | See the Framer section below: use the Embed's **URL** type, not the HTML snippets. |

## How the embeds fit any box

- **Shorter than the prototype?** It scales down to fit, so nothing is cut off and there's no inner scrolling. Good down to roughly 55% size; below that it scrolls instead so text stays readable.
- **Narrow box (under 760px wide, e.g. Framer's phone breakpoint)?** CampusPark and Fizz show just the phone and hide the side panel.
- **Guild** is a fixed-size card that fills the box; every step is the same size and longer steps scroll inside the card.
- **I Scream Room** always scales and centers the game in whatever box it gets.

## Framer (Container → Stack → Embed)

The snippets further down have a fixed `height` written inside them, which overrides Framer's box. In Framer, use the Embed's **URL** type instead so the prototype fills exactly the box you size.

| Layer | Width | Height | Notes |
| --- | --- | --- | --- |
| Container (section) | Fill | Fit | Grows around the stack. |
| Stack | Fill | Fit | Optional Max Width ~1200. Vertical, so the header sits above the embed. |
| **Embed** | **Fill** | **Fixed** | The only number that matters (see below). Type: **URL**. |

URLs to paste:

- Guild: `https://web-guild-together.vercel.app/?embed`
- CampusPark: `https://web-campus-park.vercel.app/?embed`
- Fizz: `https://web-fizz.vercel.app/?embed`
- I Scream Room: `https://scream-room.vercel.app/?embed`

Embed heights:

| Project | Desktop | Phone breakpoint |
| --- | --- | --- |
| Guild | 600–700 | 640 |
| CampusPark | 600–700 | 700 |
| Fizz | 600–700 | 700 |
| I Scream Room | 560–620 | 260 |

For I Scream Room's “use my real voice” mic option, use **HTML** type instead with:

```html
<iframe src="https://scream-room.vercel.app/?embed" allow="microphone" style="width:100%;height:100%;border:0;border-radius:16px"></iframe>
```


---

## Guild — “Grow in good company”

```html
<iframe class="proto-embed" src="https://web-guild-together.vercel.app/?embed" title="Guild: Grow in good company, interactive prototype" loading="lazy" allow="clipboard-write" style="display:block;width:100%;height:680px;border:0;border-radius:16px;overflow:hidden"></iframe>
<script>
window.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'prototype-height') return;
  document.querySelectorAll('iframe.proto-embed').forEach(function (f) {
    if (f.contentWindow === e.source) f.style.height = e.data.height + 'px';
  });
});
</script>
```

## CampusPark

```html
<iframe class="proto-embed" src="https://web-campus-park.vercel.app/?embed" title="CampusPark, interactive prototype" loading="lazy" style="display:block;width:100%;height:810px;border:0;border-radius:16px;overflow:hidden"></iframe>
<script>
window.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'prototype-height') return;
  document.querySelectorAll('iframe.proto-embed').forEach(function (f) {
    if (f.contentWindow === e.source) f.style.height = e.data.height + 'px';
  });
});
</script>
```

## Fizz Marketplace

```html
<iframe class="proto-embed" src="https://web-fizz.vercel.app/?embed" title="Fizz Marketplace redesign, interactive prototype" loading="lazy" allow="clipboard-write" style="display:block;width:100%;height:830px;border:0;border-radius:16px;overflow:hidden;background:#0b0b0c"></iframe>
<script>
window.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'prototype-height') return;
  document.querySelectorAll('iframe.proto-embed').forEach(function (f) {
    if (f.contentWindow === e.source) f.style.height = e.data.height + 'px';
  });
});
</script>
```

## I Scream Room

The game is a fixed 16:10 stage, so it uses `aspect-ratio` instead of the height script. `allow="microphone"` enables the “use my real voice” option. On phones the stage gets small, so there's a full-screen link underneath.

```html
<iframe src="https://scream-room.vercel.app/?embed" title="I Scream Room, a playable mini game" loading="lazy" allow="microphone" style="display:block;width:100%;aspect-ratio:960/616;border:0;border-radius:16px;background:#111"></iframe>
<p style="margin:8px 0 0;font-size:14px;text-align:right"><a href="https://scream-room.vercel.app/" target="_blank" rel="noopener">Play full screen ↗</a></p>
```

---

**Tip:** if a page ever embeds more than one prototype, the `<script>` only needs to appear once.
