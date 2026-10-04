/** Stressors that pile up in the lobby: the "sensory overload" motivation we tested. */
export const STRESSORS = [
  { icon: '💸', from: 'Runway', text: '4.2 months of runway left' },
  { icon: '📅', from: 'Calendar', text: 'Demo Day in 9 days' },
  { icon: '💬', from: 'Slack', text: '47 unread messages' },
  { icon: '📧', from: 'Investor', text: '"Quick sync? Have some concerns"' },
  { icon: '🐛', from: 'Prod', text: 'Checkout is down (again)' },
  { icon: '🧑‍💻', from: 'LinkedIn', text: 'Your competitor just raised $20M' },
  { icon: '📉', from: 'Metrics', text: 'Weekly actives down 12%' },
  { icon: '☎️', from: 'Mom', text: 'Are you eating?? Call me' },
  { icon: '🧾', from: 'AWS', text: 'Your bill is 3x higher than usual' },
  { icon: '🤝', from: 'Cofounder search', text: '0 matches this week' },
]

/**
 * Anonymous notes on the sticky-note wall. Paraphrased from our empathy map
 * and the kinds of notes founders left in the physical room.
 */
export const NOTES = [
  "It's almost like we need permission to be visibly feeling.",
  'Every space here is a meeting space.',
  "I'm the CEO, CTO, and the intern.",
  'Nobody tells you how lonely solo founding is.',
  'Pretending to be fine on every investor call.',
  'Shipped at 3am. Nobody noticed. I noticed.',
  'Where do I put all of this?',
  "I want a space that feels cozy, not sterile.",
  "Burn rate? I'm the thing burning.",
  "Today was hard and that's okay.",
  "There's nowhere to go that isn't a meeting room.",
  'Proud of myself for asking for help this week.',
]

export const NOTE_COLORS = ['#ffd84d', '#ff9a7a', '#9be26a', '#7fd3f0', '#ff8fc8', '#ffb347']

export type WallTheme = 'park' | 'sunset' | 'original'

/**
 * Wall finishes. The tested prototype used blue moving blankets (and testers
 * called the black box "Halloween-y"); the redesign borrows Stanford Research
 * Park's sandstone, oak-and-eucalyptus greens and terracotta roofs, with the
 * deck's lime / marigold / coral accents.
 */
export const THEMES: Record<WallTheme, { name: string; note: string; wall: string; wallDark: string; felt: string; accent: string; woodA: string; woodB: string; floorA: string; floorB: string; trim: string; glow: string }> = {
  park: {
    name: 'Research Park',
    note: 'Sandstone, eucalyptus sage and terracotta: the colors of Stanford Research Park.',
    wall: '#efe4d0',
    wallDark: '#e2d3b9',
    felt: '#8fae8b',
    accent: '#c96f4a',
    woodA: '#e8cfa4',
    woodB: '#a9784a',
    floorA: '#f6efe2',
    floorB: '#d9c4a3',
    trim: '#2f3a32',
    glow: '#ffb86b',
  },
  sunset: {
    name: 'Golden hour',
    note: 'Peach and marigold with coral acoustic panels, like the Bay at 6pm when the meetings finally stop.',
    wall: '#ffe2c8',
    wallDark: '#f8cfac',
    felt: '#ff8a6b',
    accent: '#9bd94a',
    woodA: '#ffe0b2',
    woodB: '#d08a4f',
    floorA: '#fff3e6',
    floorB: '#f0b98e',
    trim: '#5a2f24',
    glow: '#ff7a59',
  },
  original: {
    name: 'Original prototype',
    note: 'The tested room used blue moving blankets for soundproofing. Founders loved it, but called the all-black version "very Halloween-y".',
    wall: '#2f5fb8',
    wallDark: '#244c96',
    felt: '#2a56a8',
    accent: '#3567c4',
    woodA: '#3567c4',
    woodB: '#244c96',
    floorA: '#3a3a3a',
    floorB: '#2c2c2c',
    trim: '#1b2f5c',
    glow: '#e8f0ff',
  },
}

export const KIT = [
  { icon: '🎈', name: 'Balloons', body: 'Sensory play. Pop them, punch them, draw a face on your problem first.' },
  { icon: '⚽', name: 'Soccer ball', body: 'For kicking. The walls are padded; the ball is not judging you.' },
  { icon: '🗒️', name: 'Sticky notes', body: 'Leave an anonymous note about your stress. Read everyone else’s.' },
  { icon: '🎧', name: 'Ear muffs', body: 'Turn it up inside your own head. Soundproofing handles the rest.' },
  { icon: '🔒', name: 'Occupied lock', body: 'Privacy first: “I don’t feel safe enough to scream” was our top feedback.' },
]

export const QUOTES = [
  'I didn’t realize how much I needed to scream until I actually did it.',
  'Reading other people’s sticky notes reminded me I’m not the only one struggling.',
  'I thought it was just a gimmick, but it actually worked. I felt more grounded afterwards.',
]
