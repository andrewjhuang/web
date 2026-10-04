export type Category = 'Textbooks' | 'Furniture' | 'Electronics' | 'Clothing' | 'Tickets' | 'Sublets' | 'Free'
export type Condition = 'New' | 'Like new' | 'Good' | 'Fair'

export const CATEGORIES: { name: Category; emoji: string }[] = [
  { name: 'Textbooks', emoji: '📚' },
  { name: 'Furniture', emoji: '🛋️' },
  { name: 'Electronics', emoji: '🎧' },
  { name: 'Clothing', emoji: '🧥' },
  { name: 'Tickets', emoji: '🎟️' },
  { name: 'Sublets', emoji: '🏠' },
  { name: 'Free', emoji: '🎁' },
]

/** Public, well-lit handoff spots (shown instead of dorm room numbers). */
export const MEETUPS = ['Tresidder Union', 'Green Library', 'Main Quad', 'Arrillaga Dining', 'EVGR Courtyard', 'Wilbur Hall lobby']

export type Seller = { handle: string; verified: boolean; rating: number; sales: number; replies: string; color: string }

export const SELLERS: Record<string, Seller> = {
  otter: { handle: 'sleepy otter', verified: true, rating: 4.9, sales: 14, replies: 'usually within an hour', color: '#8b5cf6' },
  cactus: { handle: 'cozy cactus', verified: true, rating: 4.7, sales: 6, replies: 'usually same day', color: '#22c55e' },
  comet: { handle: 'quiet comet', verified: true, rating: 5.0, sales: 22, replies: 'usually within 15 min', color: '#f59e0b' },
  heron: { handle: 'brave heron', verified: false, rating: 4.2, sales: 2, replies: 'usually within a day', color: '#06b6d4' },
  maple: { handle: 'witty maple', verified: true, rating: 4.8, sales: 9, replies: 'usually within an hour', color: '#ef4444' },
}

export type Listing = {
  id: string
  title: string
  price: number
  /** Original retail price, to show the deal. */
  retail?: number
  category: Category
  condition: Condition
  emoji: string
  bg: string
  seller: keyof typeof SELLERS | 'you'
  meetup: string
  postedMin: number
  description: string
  saves: number
  /** Price dropped since you saved it. */
  dropFrom?: number
  /** Other courses or tags that help search. */
  tags?: string[]
}

export const LISTINGS: Listing[] = [
  { id: 'cs106b', title: 'CS 106B course reader + Programming Abstractions', price: 25, retail: 89, category: 'Textbooks', condition: 'Good', emoji: '📘', bg: 'linear-gradient(135deg,#c7d2fe,#a5b4fc)', seller: 'otter', meetup: 'Green Library', postedMin: 12, description: 'Some highlighting in chapters 1–6, otherwise clean. Used for CS 106B last quarter.', saves: 8, tags: ['cs106b', 'programming'] },
  { id: 'futon', title: 'Gray futon (folds flat)', price: 60, retail: 220, category: 'Furniture', condition: 'Good', emoji: '🛋️', bg: 'linear-gradient(135deg,#e9d5ff,#c4b5fd)', seller: 'cactus', meetup: 'EVGR Courtyard', postedMin: 45, description: 'Moving out of EV. You pick up — I can help carry it to a car.', saves: 15 },
  { id: 'airpods', title: 'AirPods Pro (2nd gen)', price: 120, retail: 249, category: 'Electronics', condition: 'Like new', emoji: '🎧', bg: 'linear-gradient(135deg,#bae6fd,#93c5fd)', seller: 'comet', meetup: 'Tresidder Union', postedMin: 5, description: 'Barely used, comes with case and all tips. Receipt available.', saves: 21 },
  { id: 'bigGame', title: 'Big Game ticket — student section', price: 45, category: 'Tickets', condition: 'New', emoji: '🏈', bg: 'linear-gradient(135deg,#fecaca,#fca5a5)', seller: 'maple', meetup: 'Main Quad', postedMin: 90, description: "Can't make it anymore. Transfer through the ticket app.", saves: 31 },
  { id: 'lamp', title: 'Desk lamp + extension cord', price: 0, category: 'Free', condition: 'Good', emoji: '💡', bg: 'linear-gradient(135deg,#fef08a,#fde047)', seller: 'heron', meetup: 'Wilbur Hall lobby', postedMin: 30, description: 'Free to whoever grabs it first this week.', saves: 4 },
  { id: 'patagonia', title: 'Patagonia fleece, size M', price: 40, retail: 139, category: 'Clothing', condition: 'Like new', emoji: '🧥', bg: 'linear-gradient(135deg,#bbf7d0,#86efac)', seller: 'cactus', meetup: 'Arrillaga Dining', postedMin: 180, description: 'Worn a handful of times. Too warm for Palo Alto, honestly.', saves: 9, dropFrom: 55 },
  { id: 'monitor', title: '27" Dell monitor', price: 90, retail: 260, category: 'Electronics', condition: 'Good', emoji: '🖥️', bg: 'linear-gradient(135deg,#ddd6fe,#a78bfa)', seller: 'otter', meetup: 'Tresidder Union', postedMin: 240, description: '1440p, includes HDMI cable. Small scuff on the stand.', saves: 12 },
  { id: 'sublet', title: 'Summer sublet — 1BR near campus', price: 1450, category: 'Sublets', condition: 'Good', emoji: '🏠', bg: 'linear-gradient(135deg,#fed7aa,#fdba74)', seller: 'maple', meetup: 'Main Quad', postedMin: 600, description: 'June–Aug, furnished, 10 min bike to the Quad. Price is per month.', saves: 27 },
  { id: 'econ1', title: 'ECON 1 textbook (Mankiw)', price: 30, retail: 120, category: 'Textbooks', condition: 'Fair', emoji: '📗', bg: 'linear-gradient(135deg,#a7f3d0,#6ee7b7)', seller: 'heron', meetup: 'Green Library', postedMin: 1440, description: 'Notes in margins, cover is worn. All pages intact.', saves: 3, tags: ['econ1', 'mankiw'] },
  { id: 'minifridge', title: 'Mini fridge', price: 50, retail: 150, category: 'Furniture', condition: 'Good', emoji: '🧊', bg: 'linear-gradient(135deg,#cffafe,#67e8f9)', seller: 'comet', meetup: 'Wilbur Hall lobby', postedMin: 75, description: 'Works great, freezer section included. Cleaned and defrosted.', saves: 18, dropFrom: 65 },
  { id: 'calc', title: 'TI-84 Plus calculator', price: 35, retail: 120, category: 'Electronics', condition: 'Good', emoji: '🧮', bg: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', seller: 'otter', meetup: 'Green Library', postedMin: 300, description: 'Fresh batteries. Fine for MATH 19–21.', saves: 5, tags: ['math19', 'math20', 'math21'] },
  { id: 'hangers', title: 'Box of hangers + shower caddy', price: 0, category: 'Free', condition: 'Good', emoji: '🧺', bg: 'linear-gradient(135deg,#fbcfe8,#f9a8d4)', seller: 'maple', meetup: 'EVGR Courtyard', postedMin: 20, description: 'Leaving campus, everything must go!', saves: 2 },
]

export function ago(min: number) {
  if (min < 60) return `${min}m`
  if (min < 1440) return `${Math.round(min / 60)}h`
  return `${Math.round(min / 1440)}d`
}

export const price = (n: number) => (n === 0 ? 'Free' : `$${n.toLocaleString()}`)

/** Suggested price range from similar listings in a category (used by the sell flow). */
export function priceGuide(category: Category, condition: Condition): [number, number] | null {
  const similar = LISTINGS.filter((l) => l.category === category && l.price > 0)
  if (!similar.length) return null
  const avg = similar.reduce((s, l) => s + l.price, 0) / similar.length
  const k = { New: 1.15, 'Like new': 1, Good: 0.85, Fair: 0.65 }[condition]
  return [Math.round(avg * k * 0.8), Math.round(avg * k * 1.15)]
}

/* ---------------- Other parts of Fizz ---------------- */

export type Post = { id: string; text: string; votes: number; comments: number; min: number; tag?: string; poll?: { options: string[]; votes: number[] } }

export const POSTS: Post[] = [
  { id: 'p1', text: 'whoever plays piano in the Toyon lounge at 1am… you are the reason I passed my midterm', votes: 412, comments: 38, min: 25 },
  { id: 'p2', text: 'Best late night food on campus?', votes: 188, comments: 96, min: 60, poll: { options: ['TAP', 'Late Nite @ Arrillaga', 'CoHo', 'DoorDash to my door'], votes: [41, 33, 12, 58] } },
  { id: 'p3', text: 'PSA: the bike thief near Meyer is back. lock both wheels 🔒', votes: 276, comments: 21, min: 140, tag: 'PSA' },
  { id: 'p4', text: 'is it normal to have 3 midterms in one day or is CS just like this', votes: 334, comments: 57, min: 200 },
  { id: 'p5', text: 'the ducks at Lake Lag have more of a social life than me', votes: 521, comments: 44, min: 320 },
]

export const NOTIFICATIONS = [
  { icon: '💸', text: 'Price drop: Mini fridge is now $50 (was $65)', min: 8 },
  { icon: '🔥', text: 'Your post hit 100 upvotes', min: 40 },
  { icon: '💬', text: 'quiet comet replied to your offer', min: 52 },
  { icon: '📚', text: 'New listing matches “cs106b”', min: 120 },
]
