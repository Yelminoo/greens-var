export interface Product {
  slug:        string
  name:        string
  variety:     string
  origin:      string
  description: string
  image:       string
  unit:        string
  seasons:     number[]
  tags:        string[]
}

export const variegataProducts: Product[] = [
  {
    slug:        'baby-corn',
    name:        'Baby Corn',
    variety:     'Super Sweet',
    origin:      'Lopburi, Thailand',
    description: 'Tender, young corn harvested before pollination. Mild sweetness with a satisfying crunch. Used fresh in Asian cuisine and widely exported for canned and frozen food processing.',
    image:       '/images/variegata/placeholder.svg',
    unit:        'carton (10 kg)',
    seasons:     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tags:        ['year-round', 'processing'],
  },
  {
    slug:        'galangal',
    name:        'Galangal',
    variety:     'Greater Galangal',
    origin:      'Chonburi, Thailand',
    description: 'An essential rhizome in Thai and Southeast Asian cooking. Sharper and more piney than ginger, galangal is in demand by specialty food producers and Asian supermarkets worldwide.',
    image:       '/images/variegata/placeholder.svg',
    unit:        'kg',
    seasons:     [1, 2, 3, 10, 11, 12],
    tags:        ['herb', 'specialty'],
  },
  {
    slug:        'lemongrass',
    name:        'Lemongrass',
    variety:     'Cymbopogon citratus',
    origin:      'Nakhon Ratchasima, Thailand',
    description: 'Citrus-fragrant stalks essential to Thai, Vietnamese, and Indonesian cuisine. Exported as fresh stalks, dried, or powdered. High and consistent essential oil content.',
    image:       '/images/variegata/placeholder.svg',
    unit:        'bundle (1 kg)',
    seasons:     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tags:        ['year-round', 'herb'],
  },
  {
    slug:        'kaffir-lime-leaf',
    name:        'Kaffir Lime Leaf',
    variety:     'Makrut Lime',
    origin:      'Central Thailand',
    description: 'Double-lobed aromatic leaves with an intense citrus perfume irreplaceable in Thai curries and soups. Available fresh or frozen to preserve fragrance during export.',
    image:       '/images/variegata/placeholder.svg',
    unit:        'pack (500 g)',
    seasons:     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tags:        ['year-round', 'herb', 'frozen-available'],
  },
  {
    slug:        'thai-chili',
    name:        'Thai Chili',
    variety:     'Bird\'s Eye / Prik Kee Noo',
    origin:      'Ubon Ratchathani, Thailand',
    description: 'Small, potent chilies with intense heat (100,000+ SHU) and bright, fruity flavour. A cornerstone of Thai cooking, exported fresh, dried, and as paste.',
    image:       '/images/variegata/placeholder.svg',
    unit:        'kg',
    seasons:     [2, 3, 4, 5, 6, 11, 12],
    tags:        ['specialty', 'dried-available'],
  },
  {
    slug:        'morning-glory',
    name:        'Morning Glory',
    variety:     'Water Spinach / Pak Boong',
    origin:      'Central Thailand',
    description: 'Hollow-stemmed aquatic green with tender leaves, essential in Southeast Asian stir-fries. Fast-growing, pesticide-minimal, and popular with Asian food retailers.',
    image:       '/images/variegata/placeholder.svg',
    unit:        'carton (5 kg)',
    seasons:     [4, 5, 6, 7, 8, 9, 10],
    tags:        ['fresh', 'export-grade'],
  },
]

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
