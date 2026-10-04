export const DAYS = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'] as const
export const BLOCKS = ['Morning', 'Afternoon', 'Evening'] as const

/** A slot key is `${dayIndex}-${blockIndex}`, e.g. "0-2" = Monday evening. */
export type Slot = string

export const slot = (day: number, block: number): Slot => `${day}-${block}`

export const STORES = ['Alo', 'Aēsop', 'Walmart', 'Gap', 'Lovisa', 'Banana Republic', 'Vuori'] as const
export const ROLES = ['Floor Associate', 'Retail Associate', 'Service Desk', 'Stock & Inventory', 'Floor Manager'] as const

export const COURSES = [
  'Business 101',
  'Management 101',
  'Advertising 15',
  'HR 120',
  'Communication 110',
  'Accounting 101',
  'Intro to Coding',
  'Design Thinking 140',
] as const

export const INTERESTS = [
  'Yoga',
  'Hiking',
  'Fashion',
  'Theater',
  'Thrifting',
  'Motorcycles',
  'Architecture',
  'Music',
  'Cooking',
  'Engineering',
] as const

export const COURSE_COLORS: Record<string, string> = {
  'Business 101': 'var(--peach)',
  'Management 101': 'var(--mint)',
  'Advertising 15': 'var(--blush)',
  'HR 120': 'var(--sky)',
  'Communication 110': 'var(--lemon)',
  'Accounting 101': 'var(--sand)',
  'Intro to Coding': 'var(--sky)',
  'Design Thinking 140': 'var(--blush)',
}

export type Person = {
  id: string
  name: string
  store: string
  role: string
  bio: string
  courses: string[]
  interests: string[]
  availability: Slot[]
  color: string
}

const slots = (pairs: [number, number][]): Slot[] => pairs.map(([d, b]) => slot(d, b))

/** Learners across the Guild network, drawn from our interview personas. */
export const PEOPLE: Person[] = [
  {
    id: 'maria',
    name: 'Maria',
    store: 'Alo',
    role: 'Floor Associate',
    bio: "I love yoga, hiking, and meeting new people. This is my first retail job and I'm excited to work with others towards advancing!",
    courses: ['Business 101', 'Management 101'],
    interests: ['Yoga', 'Hiking'],
    availability: slots([[0, 2], [1, 0], [2, 2], [3, 1], [5, 2], [6, 0], [6, 1]]),
    color: 'var(--mint)',
  },
  {
    id: 'blessing',
    name: 'Blessing',
    store: 'Lovisa',
    role: 'Retail Associate',
    bio: "I'm in a transitional period and saving up for college. Business 101 is my first step back into school.",
    courses: ['Business 101', 'Accounting 101'],
    interests: ['Music', 'Cooking'],
    availability: slots([[0, 0], [1, 2], [3, 2], [4, 0], [5, 0], [6, 2]]),
    color: 'var(--peach)',
  },
  {
    id: 'june',
    name: 'June',
    store: 'Aēsop',
    role: 'Floor Associate',
    bio: 'I came to retail from UX and architecture studios. Our little store trainings make me feel cared for — I want more of that.',
    courses: ['Management 101', 'Design Thinking 140', 'Communication 110'],
    interests: ['Architecture', 'Theater', 'Fashion'],
    availability: slots([[0, 2], [2, 2], [3, 0], [4, 2], [6, 1]]),
    color: 'var(--sky)',
  },
  {
    id: 'joe',
    name: 'Joe',
    store: 'Walmart',
    role: 'Service Desk',
    bio: 'Mechanical engineering student, saving up for a motorcycle. My coworkers call me Captain Hook.',
    courses: ['Intro to Coding', 'Accounting 101', 'Business 101'],
    interests: ['Motorcycles', 'Engineering', 'Music'],
    availability: slots([[1, 2], [2, 2], [4, 2], [5, 1], [6, 1], [6, 2]]),
    color: 'var(--lemon)',
  },
  {
    id: 'brian',
    name: 'Brian',
    store: 'Gap',
    role: 'Floor Manager',
    bio: "Twenty years on the floor. I'd rather lift people up than watch over them — learning alongside my team is how I do it.",
    courses: ['Advertising 15', 'Management 101', 'HR 120'],
    interests: ['Cooking', 'Music'],
    availability: slots([[0, 0], [1, 0], [2, 0], [5, 0], [6, 0]]),
    color: 'var(--blush)',
  },
  {
    id: 'diego',
    name: 'Diego',
    store: 'Vuori',
    role: 'Stock & Inventory',
    bio: 'Vintage and thrifting are my whole personality. One day I want to run my own resale shop.',
    courses: ['Business 101', 'Advertising 15', 'Design Thinking 140'],
    interests: ['Thrifting', 'Fashion', 'Hiking'],
    availability: slots([[0, 2], [1, 1], [3, 2], [4, 1], [6, 0]]),
    color: 'var(--sand)',
  },
  {
    id: 'andy',
    name: 'Andy',
    store: 'Banana Republic',
    role: 'Retail Associate',
    bio: "Using what I've learned on the floor to become a product manager. Happy to swap notes on anything business.",
    courses: ['Intro to Coding', 'Communication 110', 'Management 101'],
    interests: ['Engineering', 'Hiking', 'Music'],
    availability: slots([[0, 2], [1, 2], [2, 2], [3, 2], [5, 1]]),
    color: 'var(--mint)',
  },
]

export type Profile = {
  name: string
  store: string
  role: string
  courses: string[]
  interests: string[]
  availability: Slot[]
}

export const DEFAULT_PROFILE: Profile = {
  name: '',
  store: 'Alo',
  role: 'Floor Associate',
  courses: ['Business 101', 'Management 101'],
  interests: ['Hiking', 'Music'],
  availability: slots([[0, 2], [2, 2], [3, 1], [6, 0], [6, 1]]),
}

export const SLOGANS = [
  'Grow in good company.',
  'We learn like we work: together.',
  'Support that feels like coworking, not corporate.',
  "We're here to uplift you, not talk down to you.",
]
