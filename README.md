# web

Interactive project prototypes, each deployable as its own public Vercel site and embeddable on my portfolio.

```
apps/
  guild-together/   Guild concept: rebrand + study buddies + coworker nomination, as one flow
```

## Running an app locally

```bash
cd apps/<app>
npm install
npm run dev
```

## Deploying to Vercel

Each folder in `apps/` is a separate Vercel project:

1. In Vercel, **Add New → Project** and import this repo.
2. Set **Root Directory** to the app folder (e.g. `apps/guild-together`). Vercel detects Vite automatically.
3. Deploy. Every push to the production branch redeploys.

## Embedding

Add `?embed` to the URL to hide the footer credits and tighten padding:

```html
<iframe
  src="https://<your-project>.vercel.app/?embed"
  style="width:100%;height:900px;border:0;border-radius:16px"
  title="Guild: Grow in good company"
></iframe>
```
