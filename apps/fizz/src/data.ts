/**
 * Listings, posts and clubs are taken from the team's Figma mockups
 * ("141 - fizz" page). Seller handles, ratings and offers are simulated.
 */

export const CATEGORIES: { name: string; emoji: string }[] = [
  { name: 'Textbooks', emoji: '📚' },
  { name: 'Electronics', emoji: '💻' },
  { name: 'Clothing', emoji: '👕' },
  { name: 'Vehicles', emoji: '🚲' },
  { name: 'Tableware', emoji: '🍽️' },
  { name: 'Furniture', emoji: '🛋️' },
  { name: 'Health', emoji: '🏋️' },
  { name: 'Jewelry', emoji: '💍' },
  { name: 'Shoes', emoji: '👟' },
  { name: 'Tickets', emoji: '🎫' },
  { name: 'Accessories', emoji: '🧷' },
  { name: 'Hats', emoji: '🧢' },
  { name: 'Shirts', emoji: '👚' },
  { name: 'Pants', emoji: '👖' },
  { name: 'Athletic', emoji: '🎽' },
  { name: 'Other', emoji: '❓' },
]

export type Condition = 'New' | 'Used'
export type Audience = 'Womens' | 'Mens'

/** Public, well-lit handoff spots (shown instead of dorm room numbers). */
export const MEETUPS = ['Tresidder Union', 'Green Library', 'Main Quad', 'Arrillaga Dining', 'EVGR Courtyard', 'Wilbur Hall lobby']

export type Seller = { handle: string; rating: number; sales: number; replies: string; color: string }

export const SELLERS: Record<string, Seller> = {
  otter: { handle: 'sleepy otter', rating: 4.9, sales: 14, replies: 'within an hour', color: '#5b5bd6' },
  cactus: { handle: 'cozy cactus', rating: 4.7, sales: 6, replies: 'same day', color: '#3fa76a' },
  comet: { handle: 'quiet comet', rating: 5.0, sales: 22, replies: 'within 15 min', color: '#e07b3a' },
  heron: { handle: 'brave heron', rating: 4.3, sales: 2, replies: 'within a day', color: '#3a9bd8' },
  maple: { handle: 'witty maple', rating: 4.8, sales: 9, replies: 'within an hour', color: '#d63a3a' },
}

export type Listing = {
  id: string
  title: string
  price: number
  photo: string
  categories: string[]
  condition: Condition
  size: string
  audience?: Audience
  description: string
  postedMin: number
  seller: string
  meetup: string
  saves: number
  /** Price before a drop, if the seller lowered it. */
  wasPrice?: number
}

const MO = 43200
export const LISTINGS: Listing[] = [
  { id: 'biology', title: 'Biology textbook', price: 30, photo: '/listings/biology.jpg', categories: ['Textbooks'], condition: 'New', size: 'n/a', description: 'Bought and never used!', postedMin: 20, seller: 'otter', meetup: 'Green Library', saves: 6 },
  { id: 'scooter', title: 'Scooter', price: 200, photo: '/listings/scooter.jpg', categories: ['Vehicles'], condition: 'New', size: 'n/a', description: 'Only used once and I fell off', postedMin: 30, seller: 'comet', meetup: 'Tresidder Union', saves: 18, wasPrice: 240 },
  { id: 'nikesweats', title: 'Nike sweats', price: 30, photo: '/listings/nikesweats.jpg', categories: ['Clothing', 'Pants'], condition: 'New', size: 'M', audience: 'Mens', description: 'Please buy this off of me.', postedMin: 120, seller: 'maple', meetup: 'Wilbur Hall lobby', saves: 4 },
  { id: 'leggings', title: 'Lulu lemon leggings', price: 20, photo: '/listings/leggings.jpg', categories: ['Clothing', 'Pants', 'Athletic'], condition: 'New', size: 'XS', audience: 'Womens', description: 'Brand new with tags!', postedMin: 120, seller: 'cactus', meetup: 'Arrillaga Dining', saves: 11 },
  { id: 'ebike', title: 'Pedal assist e-bike', price: 400, photo: '/listings/ebike.jpg', categories: ['Vehicles'], condition: 'New', size: 'MEDIUM', description: 'Bought but never used', postedMin: 2 * MO, seller: 'comet', meetup: 'EVGR Courtyard', saves: 27 },
  { id: 'charger', title: 'iPad charger no brick', price: 24, photo: '/listings/charger.jpg', categories: ['Electronics'], condition: 'New', size: 'n/a', description: 'normal lightning charger', postedMin: 2 * MO, seller: 'heron', meetup: 'Tresidder Union', saves: 2 },
  { id: 'wineglasses', title: 'Wine glasses', price: 15, photo: '/listings/wineglasses.jpg', categories: ['Tableware'], condition: 'New', size: 'n/a', description: '4 sets of wine glasses.', postedMin: 2 * MO, seller: 'cactus', meetup: 'EVGR Courtyard', saves: 5 },
  { id: 'headphones', title: 'wired headphones', price: 10, photo: '/listings/headphones.jpg', categories: ['Electronics'], condition: 'Used', size: 'n/a', description: 'Need to get rid of.', postedMin: 3 * MO, seller: 'otter', meetup: 'Green Library', saves: 3 },
  { id: 'lavalamp', title: 'Rose Gold Pink + Purple Lava Lamp', price: 20, photo: '/listings/lavalamp.jpg', categories: ['Electronics'], condition: 'Used', size: 'n/a', description: 'lit.', postedMin: 3 * MO, seller: 'maple', meetup: 'Main Quad', saves: 9 },
  { id: 'joggers', title: 'Lululemon ABC joggers', price: 69.99, photo: '/listings/joggers.jpg', categories: ['Clothing', 'Pants'], condition: 'Used', size: 'L', audience: 'Mens', description: 'Worn once.', postedMin: 3 * MO, seller: 'heron', meetup: 'Arrillaga Dining', saves: 7, wasPrice: 85 },
  { id: 'masonjars', title: 'mason jars', price: 5, photo: '/listings/masonjars.jpg', categories: ['Tableware'], condition: 'Used', size: 'n/a', description: '3 mason jars, gold plated lids', postedMin: 3 * MO, seller: 'cactus', meetup: 'EVGR Courtyard', saves: 1 },
  { id: 'middleeast', title: 'Modern Middle East', price: 45, photo: '/listings/middleeast.jpg', categories: ['Textbooks'], condition: 'Used', size: 'n/a', description: 'Used for one quarter', postedMin: 3 * MO, seller: 'otter', meetup: 'Green Library', saves: 2 },
  { id: 'pan', title: 'small pan', price: 16, photo: '/listings/pan.jpg', categories: ['Tableware', 'Other'], condition: 'Used', size: 'n/a', description: 'Works really well. I am moving out.', postedMin: 4 * MO, seller: 'maple', meetup: 'Wilbur Hall lobby', saves: 1 },
  { id: 'nikeshorts', title: 'black nike shorts', price: 25, photo: '/listings/nikeshorts.jpg', categories: ['Clothing', 'Pants', 'Athletic', 'Other'], condition: 'New', size: 'M', audience: 'Mens', description: "Brand new w/ tags! Got a duplicate from an event so I don't need it!", postedMin: 5 * MO, seller: 'comet', meetup: 'Arrillaga Dining', saves: 4 },
  { id: 'table', title: 'Table', price: 30, photo: '/listings/table.jpg', categories: ['Furniture', 'Other'], condition: 'New', size: 'n/a', description: 'Good for games.', postedMin: 6 * MO, seller: 'heron', meetup: 'Main Quad', saves: 3 },
]

export const RECENT_SEARCHES = ['glass plates', 'glassware', 'Rain boots', 'music stand', 'water bottles', 'Hydroflask']

export function ago(min: number, long = false) {
  if (min < 60) return long ? `${min} minute${min === 1 ? '' : 's'} ago` : `${min}m`
  if (min < 1440) {
    const h = Math.round(min / 60)
    return long ? `${h} hour${h === 1 ? '' : 's'} ago` : `${h}hr${h === 1 ? '' : 's'}`
  }
  if (min < MO) {
    const d = Math.round(min / 1440)
    return long ? `${d} day${d === 1 ? '' : 's'} ago` : `${d}d`
  }
  const m = Math.round(min / MO)
  return long ? `${m} month${m === 1 ? '' : 's'} ago` : `${m}mo`
}

export const money = (n: number) => (n === 0 ? 'Free' : `$${n.toFixed(2)}`)

/** Suggested price range from similar listings (used by the sell flow). */
export function priceGuide(category: string, condition: Condition): [number, number] | null {
  const similar = LISTINGS.filter((l) => l.categories.includes(category))
  if (!similar.length) return null
  const avg = similar.reduce((s, l) => s + l.price, 0) / similar.length
  const k = condition === 'New' ? 1.1 : 0.8
  return [Math.max(1, Math.round(avg * k * 0.75)), Math.round(avg * k * 1.2)]
}

/* ---------------- Feed ---------------- */

export type Tag = 'SHOUTOUT' | 'VIDEO' | 'EVENT' | 'RIP' | 'DUB' | 'DM ME'

export const TAG_COLOR: Record<Tag, string> = {
  SHOUTOUT: '#3fa0d6',
  VIDEO: '#e0445f',
  EVENT: '#e07b3a',
  RIP: '#5b5bd6',
  DUB: '#3b7be0',
  'DM ME': '#8bc34a',
}

export type Club = { id: string; name: string; color?: string; verified?: boolean }

export const CLUBS: Record<string, Club> = {
  arbor: { id: 'arbor', name: 'arbor', verified: true },
  ebf: { id: 'ebf', name: 'EBF', verified: true },
}

export type Post = {
  id: string
  tag: Tag
  text: string
  votes: number
  min: number
  image?: string
  video?: boolean
  club?: string
  when?: string
}

export const POSTS: Post[] = [
  { id: 'bed', tag: 'SHOUTOUT', text: 'how my bed feel after hitting that alarm clock', votes: 536, min: 60, image: '/posts/bed.jpg' },
  { id: 'arbor-dj', tag: 'EVENT', club: 'arbor', when: 'Tues 3/4 @ 10PM', text: 'dj risky fart at on call rn!!!!!!', votes: 312, min: 600, image: '/posts/arbor.jpg' },
  { id: 'video', tag: 'VIDEO', text: 'Me @ 3am choosing to get emotional over my stolen frosh bike and failed spring situationship as a productive excuse to delay working on my cs109 and cs107 pset be like:', votes: 536, min: 60, image: '/posts/video.jpg', video: true },
  { id: 'curis', tag: 'DM ME', text: "Still don't see anything for curis, how did y'all find out? Do they still send emails or some notification if you are rejected?", votes: 124, min: 60 },
  { id: 'ebf', tag: 'EVENT', club: 'ebf', when: 'Wed 3/5 @ 10PM', text: 'last happy hour of the quarter !', votes: 207, min: 540, image: '/posts/ebf.jpg' },
  { id: 'dating', tag: 'RIP', text: 'DATING IS SHIT ON THIS CAMPUS. WHY IS THIS SO HARD', votes: 1200, min: 1440 },
  { id: 'openmic', tag: 'EVENT', club: 'arbor', when: 'Wed 3/5 @ 8PM', text: 'Tomorrow!', votes: 34, min: 480, image: '/posts/openmic.jpg' },
  { id: 'raccoon', tag: 'DUB', text: 'finally made a friend on campus >.<', votes: 2700, min: 40320, image: '/posts/raccoon.jpg' },
  { id: 'cs109', tag: 'RIP', text: 'CS 109 midterm lfg', votes: 2700, min: 120 },
]

export const COMMENTS: Record<string, string[]> = {
  default: ['real', 'this is so me', 'the accuracy 😭'],
  curis: ['they email everyone eventually, give it a week', 'same boat, refreshing my inbox every 5 min', 'my friend heard back yesterday :/'],
  dating: ['the ratio is not ratio-ing', 'try joining a club fr', 'have you tried the raccoon'],
  raccoon: ['bestie behavior', 'name him', 'rabies speedrun'],
}

export const fmtVotes = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n))
