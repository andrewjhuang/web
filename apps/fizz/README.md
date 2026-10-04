# Fizz Marketplace — redesign prototype

A research-led redesign of Fizz's campus marketplace, from task analysis and usability testing to a high-fidelity interface. By Pierre, Candace & Andrew (marketplace by Andrew).

The phone is fully clickable. The side panel lists each marketplace design change and jumps straight to it.

**Marketplace**
- Browse by category, sort by newest / price / biggest deal, and filter by max price, condition, pickup spot and verified sellers. Search matches course codes with or without a space (`cs 106b`).
- Listings show % below retail, price drops, and "New" badges. Save with ♡ (bubble burst) and see price-drop alerts under Saved.
- Listing detail: photo carousel, seller trust signals (.edu verified, rating, sales, reply time), a safe public meetup spot, and a report link.
- Structured offers: quick amounts (asking, −10%, −20%) or custom, with a note. The simulated seller accepts offers ≥ 85% of asking and counters lower ones; accept a counter and a meetup card lets you pick a time.
- Sell in three steps: photo + title (category auto-suggested), details with a price guide from similar listings, then a preview before posting.
- My listings: views tick up live, saves, and "Mark sold".

**Rest of Fizz:** anonymous feed with up/down votes and a poll, a "Fresh on Marketplace" strip, messages, and a profile with notifications and alert settings.

Everything (listings, handles, posts) is made up; not affiliated with Fizz.

```bash
npm install
npm run dev
npm run build
```
