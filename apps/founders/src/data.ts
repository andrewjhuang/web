/**
 * Founders Farmstand: a concept farm-to-table cafe for Stanford's O'Donohue
 * Family Educational Farm. Stanford and Menlo Park come from the team's mockup;
 * Half Moon Bay and Pacifica are new coastal locations (addresses are fictional).
 */

export type LocationId = 'stanford' | 'menlo' | 'hmb' | 'pacifica'

export type Location = {
  id: LocationId
  name: string
  tagline: string
  address: string[]
  hours: [string, string][]
  photo?: string
  postcard: string
  note: string
  coastal?: boolean
}

export const LOCATIONS: Location[] = [
  {
    id: 'stanford',
    name: 'Stanford',
    tagline: 'The original, on the farm',
    address: ["O'Donohue Family Stanford Educational Farm", '555 Fremont Rd, Stanford, CA'],
    hours: [
      ['Weekdays', '9 am – 3 pm'],
      ['Weekends', '7 am – 3 pm'],
    ],
    photo: '/photos/stanford.jpg',
    postcard: 'Greetings from the Farm',
    note: 'Steps from the greenhouses. Saturday farm tours leave from the front porch.',
  },
  {
    id: 'menlo',
    name: 'Menlo Park',
    tagline: 'Downtown, by the train',
    address: ['Downtown Menlo Park', '1151 Chestnut St, Menlo Park, CA'],
    hours: [
      ['Weekdays', '9 am – 3 pm'],
      ['Weekends', '7 am – 3 pm'],
    ],
    photo: '/photos/menlo.jpg',
    postcard: 'Greetings from Menlo Park',
    note: 'A sunny corner for laptops, long lunches and the 3 pm cortado.',
  },
  {
    id: 'hmb',
    name: 'Half Moon Bay',
    tagline: 'On the harbor at Princeton',
    address: ['Princeton-by-the-Sea', '12 Harbor Row, Half Moon Bay, CA'],
    hours: [
      ['Weekdays', '8 am – 4 pm'],
      ['Weekends', '7 am – 5 pm'],
    ],
    postcard: 'Greetings from Half Moon Bay',
    note: 'Fog in the morning, sun by noon. Crab toast in season, straight off the boats.',
    coastal: true,
  },
  {
    id: 'pacifica',
    name: 'Pacifica',
    tagline: 'Across from Rockaway Beach',
    address: ['Rockaway Beach', '220 Rockaway Beach Ave, Pacifica, CA'],
    hours: [
      ['Weekdays', '7 am – 3 pm'],
      ['Weekends', '7 am – 4 pm'],
    ],
    postcard: 'Greetings from Pacifica',
    note: 'Surfer hours: coffee from 7, chowder by 11, and a window seat facing the waves.',
    coastal: true,
  },
]

export type Tag = 'V' | 'VG' | 'GF' | 'DF'
export const TAG_NAMES: Record<Tag, string> = { V: 'Vegetarian', VG: 'Vegan', GF: 'Gluten-free', DF: 'Dairy-free' }

export type Item = {
  id: string
  name: string
  price: number
  blurb: string
  ingredients: string
  vendors: string
  allergens: string
  tags?: Tag[]
  photo?: string
  /** Only at these locations (defaults to all). */
  only?: LocationId[]
  seasonal?: string
  /** Offered modifications, e.g. milk swaps. */
  options?: string[]
  feature?: boolean
}

export type Section = { id: string; title: string; note: string; items: Item[] }

const MILKS = ['Whole milk', 'Oat milk', 'Almond milk']
const BREAD = ['Manresa sourdough', 'Gluten-free seeded loaf']

export const MENU: Section[] = [
  {
    id: 'breakfast',
    title: 'Breakfast',
    note: 'Served until 11, or all day on weekends',
    items: [
      { id: 'preserves', name: 'Toast with Preserves', price: 9, blurb: 'Thick-cut sourdough, cultured butter and this week’s farm jam.', ingredients: 'sourdough, butter, seasonal preserves', vendors: 'Manresa Bread, O’Donohue Stanford Farm', allergens: 'gluten, dairy', tags: ['V'], options: BREAD },
      { id: 'roll', name: 'Breakfast Roll', price: 15, blurb: 'Soft-scrambled farm eggs, aged cheddar and greens on a toasted brioche roll.', ingredients: 'eggs, cheddar, arugula, brioche, aioli', vendors: 'Deer Hollow Farm', allergens: 'eggs, dairy, gluten', tags: ['V'], options: ['Add bacon', 'Add avocado'] },
      { id: 'yogurt', name: 'Yogurt & Granola', price: 16, blurb: 'Whole-milk yogurt, honey-oat granola, berries and Stanford hive honey.', ingredients: 'yogurt, oats, almonds, berries, honey', vendors: 'Deer Hollow Farm, Stanford Farm apiary', allergens: 'dairy, tree nuts', tags: ['V', 'GF'] },
      { id: 'porridge', name: 'Apple Pie Porridge', price: 18, blurb: 'Steel-cut oats with roasted apples, cinnamon brown butter and toasted pecans.', ingredients: 'oats, apples, butter, cinnamon, pecans', vendors: 'Peninsula orchards', allergens: 'dairy, tree nuts', tags: ['V'], options: ['Oat milk instead'] },
      { id: 'waffle', name: 'Peanut Butter Waffle', price: 20, blurb: 'Buttermilk waffle, whipped peanut butter, bananas and a drizzle of honey.', ingredients: 'flour, buttermilk, eggs, peanut butter, banana, honey', vendors: 'Deer Hollow Farm', allergens: 'peanuts, gluten, eggs, dairy', tags: ['V'] },
      { id: 'eggs', name: 'Farm Eggs & Greens', price: 17, blurb: 'Two eggs your way, garlicky greens, crispy potatoes and toast.', ingredients: 'eggs, chard, kale, potatoes, sourdough', vendors: 'O’Donohue Stanford Farm', allergens: 'eggs, gluten', tags: ['V'], options: ['Scrambled', 'Over easy', 'Poached'] },
    ],
  },
  {
    id: 'toasts',
    title: 'Toasts',
    note: 'On Manresa sourdough',
    items: [
      { id: 'berry', name: 'Berry Toast', price: 11.99, blurb: 'Whipped ricotta, farm-grown strawberries, citrus zest and fresh herbs.', ingredients: 'strawberries, mascarpone, sourdough toast, lemon', vendors: 'Deer Hollow Farm, Manresa Bread', allergens: 'dairy, gluten', tags: ['V'], photo: '/photos/berry-plate.jpg', options: BREAD, feature: true },
      { id: 'avocado', name: 'Avocado Toast', price: 11.99, blurb: 'Smashed avocado, heirloom tomatoes, cracked pepper and lemon.', ingredients: 'avocados, sourdough toast, tomatoes, black pepper, salt, lemon, red pepper', vendors: 'O’Donohue Stanford Farm, Manresa Bread', allergens: 'gluten', tags: ['VG', 'DF'], photo: '/photos/avocado-toast.jpg', options: BREAD, feature: true },
      { id: 'ricotta', name: 'Heirloom Tomato & Ricotta', price: 12.5, blurb: 'Sun-warm tomatoes over lemony ricotta with basil oil.', ingredients: 'tomatoes, ricotta, basil, olive oil, sourdough', vendors: 'O’Donohue Stanford Farm, Deer Hollow Farm', allergens: 'dairy, gluten', tags: ['V'], seasonal: 'Summer', options: BREAD },
      { id: 'crab', name: 'Dungeness Crab Toast', price: 19, blurb: 'Half Moon Bay crab, Meyer lemon aioli, celery leaf and chili.', ingredients: 'Dungeness crab, aioli, celery, chili, sourdough', vendors: 'Pillar Point Harbor boats', allergens: 'shellfish, eggs, gluten', only: ['hmb', 'pacifica'], seasonal: 'Nov – Jun', options: BREAD },
    ],
  },
  {
    id: 'bowls',
    title: 'Salads & Bowls',
    note: 'Greens picked the morning they’re served',
    items: [
      { id: 'caprese', name: 'Caprese', price: 11.99, blurb: 'Farm tomatoes and creamy mozzarella with basil from our backyard and a crack of black pepper.', ingredients: 'tomatoes, mozzarella, basil, black pepper, lemon', vendors: 'Deer Hollow Farm, O’Donohue Stanford Farm', allergens: 'dairy', tags: ['V', 'GF'], photo: '/photos/caprese.jpg', feature: true },
      { id: 'seasonal', name: 'Seasonal Salad', price: 18, blurb: 'Whatever’s best in the beds this week, with a shallot vinaigrette.', ingredients: 'mixed greens, seasonal vegetables, seeds, vinaigrette', vendors: 'O’Donohue Stanford Farm', allergens: 'none', tags: ['VG', 'GF', 'DF'] },
      { id: 'grain', name: 'Farm Grain Bowl', price: 17, blurb: 'Farro, roasted roots, soft egg, pickled onions and green goddess.', ingredients: 'farro, carrots, beets, egg, herbs, yogurt', vendors: 'O’Donohue Stanford Farm', allergens: 'gluten, eggs, dairy', tags: ['V'], options: ['Add chicken', 'Make it vegan'] },
      { id: 'mushroom', name: 'Smoked Mushroom Bowl', price: 22, blurb: 'Wood-smoked mushrooms, wild rice, charred greens and miso tahini.', ingredients: 'mushrooms, wild rice, kale, miso, tahini', vendors: 'Peninsula mushroom growers', allergens: 'sesame, soy', tags: ['VG', 'GF', 'DF'] },
    ],
  },
  {
    id: 'plates',
    title: 'Sandwiches & Plates',
    note: 'From 11 am',
    items: [
      { id: 'chicken', name: 'Chicken Sandwich', price: 24, blurb: 'Herb-roasted chicken, pickled peppers and aioli on a seeded roll, with a side salad.', ingredients: 'chicken, peppers, aioli, seeded roll, greens', vendors: 'Peninsula ranches, Manresa Bread', allergens: 'eggs, gluten, sesame', options: ['Side of soup instead'] },
      { id: 'artichoke', name: 'Artichoke Melt', price: 16, blurb: 'Pescadero artichokes, fontina and lemon on griddled sourdough.', ingredients: 'artichokes, fontina, lemon, sourdough', vendors: 'Pescadero growers, Manresa Bread', allergens: 'dairy, gluten', tags: ['V'] },
      { id: 'rockfish', name: 'Pacific Rockfish Plate', price: 26, blurb: 'Pan-seared local rockfish, potatoes, charred lemon and salsa verde.', ingredients: 'rockfish, potatoes, lemon, herbs', vendors: 'Pillar Point Harbor boats', allergens: 'fish', tags: ['GF', 'DF'], only: ['hmb', 'pacifica'] },
    ],
  },
  {
    id: 'soups',
    title: 'Soups',
    note: 'Cup or bowl, with bread',
    items: [
      { id: 'artichoke-soup', name: 'Pescadero Artichoke Soup', price: 9, blurb: 'Silky, lemony and a coast-road classic.', ingredients: 'artichokes, leeks, cream, lemon', vendors: 'Pescadero growers', allergens: 'dairy', tags: ['V', 'GF'] },
      { id: 'pumpkin', name: 'Half Moon Bay Pumpkin Bisque', price: 9, blurb: 'Roasted pumpkin, sage and toasted pepitas.', ingredients: 'pumpkin, sage, coconut milk, pepitas', vendors: 'Half Moon Bay pumpkin patches', allergens: 'none', tags: ['VG', 'GF', 'DF'], seasonal: 'Fall' },
      { id: 'chowder', name: 'Foggy Morning Clam Chowder', price: 12, blurb: 'Clams, potatoes and bacon in a light, peppery broth.', ingredients: 'clams, potatoes, bacon, cream, thyme', vendors: 'Pillar Point Harbor boats', allergens: 'shellfish, dairy', tags: ['GF'], only: ['hmb', 'pacifica'] },
    ],
  },
  {
    id: 'bakery',
    title: 'Bakery',
    note: 'Baked each morning, gone by afternoon',
    items: [
      { id: 'olallieberry', name: 'Olallieberry Hand Pie', price: 6, blurb: 'The berry of the San Mateo coast in a flaky, sugared crust.', ingredients: 'olallieberries, butter, flour, sugar', vendors: 'Pescadero growers', allergens: 'gluten, dairy', tags: ['V'] },
      { id: 'cake', name: 'Lemon Olive Oil Cake', price: 5, blurb: 'Meyer lemons from the farm’s orchard row.', ingredients: 'lemon, olive oil, eggs, flour', vendors: 'O’Donohue Stanford Farm', allergens: 'gluten, eggs', tags: ['V', 'DF'] },
      { id: 'bun', name: 'Morning Bun', price: 4.5, blurb: 'Orange-cardamom sugar and a crackly top.', ingredients: 'flour, butter, orange, cardamom', vendors: 'Manresa Bread', allergens: 'gluten, dairy', tags: ['V'] },
    ],
  },
  {
    id: 'coffee',
    title: 'Coffee & Tea',
    note: 'Hot or iced',
    items: [
      { id: 'iced-latte', name: 'Iced Latte', price: 4.5, blurb: 'Espresso over cold farm milk.', ingredients: 'coffee, milk, sugar', vendors: 'Deer Hollow Farm', allergens: 'dairy', tags: ['V', 'GF'], photo: '/photos/iced-latte.jpg', options: MILKS, feature: true },
      { id: 'matcha', name: 'Matcha Latte', price: 5.5, blurb: 'Ceremonial matcha whisked to order.', ingredients: 'matcha, milk, sugar', vendors: 'Deer Hollow Farm', allergens: 'dairy', tags: ['V', 'GF'], photo: '/photos/matcha.jpg', options: MILKS },
      { id: 'chai', name: 'Chai Latte', price: 5.5, blurb: 'House chai with cinnamon, cardamom, ginger and black pepper.', ingredients: 'cinnamon, cardamom, ginger, cloves, black pepper, black tea, sugar, milk', vendors: 'Deer Hollow Farm, O’Donohue Stanford Farm', allergens: 'dairy', tags: ['V', 'GF'], photo: '/photos/chai.jpg', options: MILKS },
      { id: 'lavender', name: 'Honey Lavender Cortado', price: 5.25, blurb: 'Farm lavender and Stanford hive honey with a short pour of milk.', ingredients: 'espresso, milk, honey, lavender', vendors: 'Stanford Farm apiary', allergens: 'dairy', tags: ['V', 'GF'], options: MILKS },
      { id: 'drip', name: 'Drip Coffee', price: 3.25, blurb: 'Bottomless refills when you stay.', ingredients: 'coffee', vendors: 'Bay Area roaster', allergens: 'none', tags: ['VG', 'GF', 'DF'] },
      { id: 'fog', name: 'Fog Lifter', price: 5, blurb: 'Cold brew and sparkling tonic over ice with an orange twist.', ingredients: 'cold brew, tonic, orange', vendors: 'Bay Area roaster', allergens: 'none', tags: ['VG', 'GF', 'DF'] },
    ],
  },
  {
    id: 'sodas',
    title: 'Farm Sodas & Tonics',
    note: 'Made in house',
    items: [
      { id: 'shrub', name: 'Strawberry Shrub Soda', price: 5, blurb: 'Farm strawberries, apple cider vinegar and bubbles.', ingredients: 'strawberries, vinegar, sugar, soda', vendors: 'O’Donohue Stanford Farm', allergens: 'none', tags: ['VG', 'GF', 'DF'] },
      { id: 'lemonade', name: 'Meyer Lemonade', price: 4.5, blurb: 'Tart, sweet and very yellow.', ingredients: 'Meyer lemons, sugar, water', vendors: 'O’Donohue Stanford Farm', allergens: 'none', tags: ['VG', 'GF', 'DF'] },
      { id: 'tonic', name: 'Ginger Beet Tonic', price: 6, blurb: 'Pressed beet, ginger and lime.', ingredients: 'beets, ginger, lime', vendors: 'O’Donohue Stanford Farm', allergens: 'none', tags: ['VG', 'GF', 'DF'] },
    ],
  },
  {
    id: 'kids',
    title: 'Little Farmers',
    note: 'For ages 10 and under',
    items: [
      { id: 'kid-toast', name: 'Little Farmer Toast', price: 7, blurb: 'Butter, honey and sliced strawberries.', ingredients: 'sourdough, butter, honey, strawberries', vendors: 'Manresa Bread', allergens: 'gluten, dairy', tags: ['V'] },
      { id: 'kid-waffle', name: 'Waffle Bites', price: 8, blurb: 'Mini waffles with berries and yogurt dip.', ingredients: 'waffle, berries, yogurt', vendors: 'Deer Hollow Farm', allergens: 'gluten, eggs, dairy', tags: ['V'] },
    ],
  },
  {
    id: 'market',
    title: 'Farmstand Market',
    note: 'To take home',
    items: [
      { id: 'jam', name: 'Strawberry Preserves', price: 12, blurb: 'The jam from our toast, by the jar.', ingredients: 'strawberries, sugar, lemon', vendors: 'O’Donohue Stanford Farm', allergens: 'none', tags: ['VG', 'GF', 'DF'] },
      { id: 'honey', name: 'Stanford Hive Honey', price: 14, blurb: 'Raw wildflower honey from the farm’s apiary.', ingredients: 'honey', vendors: 'Stanford Farm apiary', allergens: 'none', tags: ['V', 'GF', 'DF'] },
      { id: 'granola', name: 'House Granola', price: 10, blurb: 'A pound of our honey-oat granola.', ingredients: 'oats, almonds, honey, coconut', vendors: 'Stanford Farm apiary', allergens: 'tree nuts', tags: ['V', 'DF'] },
      { id: 'box', name: 'Weekly Farm Box', price: 32, blurb: 'A crate of whatever’s best this week. Pick up Fridays.', ingredients: 'seasonal produce', vendors: 'O’Donohue Stanford Farm, Pescadero growers', allergens: 'none', tags: ['VG', 'GF', 'DF'] },
    ],
  },
]

export const ALL_ITEMS = MENU.flatMap((s) => s.items)
export const itemById = (id: string) => ALL_ITEMS.find((i) => i.id === id)!
export const availableAt = (item: Item, loc: LocationId) => !item.only || item.only.includes(loc)

export const money = (n: number) => `$${n.toFixed(2)}`

export const PARTNERS: { match: string; name: string; place: string; grows: string; photo?: string }[] = [
  { match: 'O’Donohue', name: 'O’Donohue Family Stanford Educational Farm', place: 'Stanford', grows: 'Greens, tomatoes, herbs, Meyer lemons, strawberries', photo: '/photos/tomatoes.jpg' },
  { match: 'Deer Hollow', name: 'Deer Hollow Farm', place: 'Cupertino', grows: 'Milk, mozzarella, ricotta, eggs', photo: '/photos/dairy.jpg' },
  { match: 'Manresa', name: 'Manresa Bread', place: 'Los Gatos', grows: 'Sourdough and seeded loaves', photo: '/photos/berry-toast.jpg' },
  { match: 'Pescadero', name: 'Pescadero growers', place: 'Pescadero', grows: 'Artichokes, olallieberries, squash' },
  { match: 'Half Moon Bay pumpkin', name: 'Half Moon Bay pumpkin patches', place: 'Half Moon Bay', grows: 'Pumpkins and winter squash every fall' },
  { match: 'Pillar Point', name: 'Pillar Point Harbor boats', place: 'Princeton-by-the-Sea', grows: 'Dungeness crab, rockfish, clams' },
]

export type Event = { id: string; title: string; when: string; where: LocationId; body: string; spots: number; kind: 'Tour' | 'Workshop' | 'Supper' | 'Outing' }

export const EVENTS: Event[] = [
  { id: 'tour', title: 'Saturday Farm Tour', when: 'Saturdays · 10 am', where: 'stanford', body: 'Walk the beds and greenhouses with a student farmer, then a tasting on the porch.', spots: 12, kind: 'Tour' },
  { id: 'compost', title: 'Composting 101', when: 'Thu, Apr 16 · 5:30 pm', where: 'stanford', body: 'Turn cafe scraps into soil. Bring gloves; we bring the worms.', spots: 8, kind: 'Workshop' },
  { id: 'canning', title: 'Jam & Canning Night', when: 'Wed, May 6 · 6 pm', where: 'menlo', body: 'Make a jar of strawberry preserves to take home.', spots: 16, kind: 'Workshop' },
  { id: 'tidepool', title: 'Tide Pools & Tea', when: 'Sun, May 17 · 8 am', where: 'hmb', body: 'A low-tide walk at the marine reserve, then chai and hand pies at the harbor.', spots: 20, kind: 'Outing' },
  { id: 'supper', title: 'Harvest Supper on the Harbor', when: 'Sat, Jun 13 · 6:30 pm', where: 'hmb', body: 'A long-table dinner of crab, artichokes and olallieberry pie as the fog rolls in.', spots: 40, kind: 'Supper' },
  { id: 'sunrise', title: 'Sunrise Surf & Coffee', when: 'Every Sunday · 6:30 am', where: 'pacifica', body: 'Dawn patrol at Rockaway, then free drip coffee for anyone with sandy feet.', spots: 30, kind: 'Outing' },
]

export const locById = (id: LocationId) => LOCATIONS.find((l) => l.id === id)!
