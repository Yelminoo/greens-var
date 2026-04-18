export interface Product {
  slug:        string
  name:        string
  variety:     string
  origin:      string
  description: string
  image:       string
  unit:        string
  seasons:     number[]  // months available (1=Jan … 12=Dec)
  tags:        string[]
}

export const fruithaiProducts: Product[] = [
  {
    slug:        'mango',
    name:        'Mango',
    variety:     'Nam Dok Mai / Mahachanok',
    origin:      'Chiang Mai & Phetchabun, Thailand',
    description: 'Thailand\'s finest export mango, prized for its golden skin, fibre-free flesh, and rich honey-sweet flavour. Nam Dok Mai is the premium choice for fresh consumption; Mahachanok is excellent for processing.',
    image:       '/images/fruithai/placeholder.svg',
    unit:        'carton (5 kg)',
    seasons:     [3, 4, 5, 6, 7],
    tags:        ['bestseller', 'export-grade'],
  },
  {
    slug:        'durian',
    name:        'Durian',
    variety:     'Monthong / Chanee',
    origin:      'Chanthaburi & Rayong, Thailand',
    description: 'The king of fruits. Monthong offers a creamy, mildly sweet flesh with low odour — the preferred variety for international markets. Supplied fresh or frozen.',
    image:       '/images/fruithai/placeholder.svg',
    unit:        'kg',
    seasons:     [5, 6, 7, 8],
    tags:        ['premium', 'seasonal'],
  },
  {
    slug:        'longan',
    name:        'Longan',
    variety:     'Daw / Biew Kiew',
    origin:      'Lamphun, Thailand',
    description: 'Small, translucent pearls of sweetness. Thai longan is celebrated for its delicate floral aroma and high sugar content. Available fresh and dried.',
    image:       '/images/fruithai/placeholder.svg',
    unit:        'carton (10 kg)',
    seasons:     [7, 8, 9],
    tags:        ['dried-available'],
  },
  {
    slug:        'rambutan',
    name:        'Rambutan',
    variety:     'Rongrien / See Chompoo',
    origin:      'Surat Thani, Thailand',
    description: 'Bright red hairy shells reveal juicy, translucent flesh. Rongrien is the most widely exported Thai rambutan for its firm texture and balanced sweetness.',
    image:       '/images/fruithai/placeholder.svg',
    unit:        'carton (10 kg)',
    seasons:     [5, 6, 7, 8, 9],
    tags:        ['export-grade'],
  },
  {
    slug:        'mangosteen',
    name:        'Mangosteen',
    variety:     'Queen of Fruits',
    origin:      'Chanthaburi, Thailand',
    description: 'Deep purple rind concealing snow-white segments of extraordinary sweetness with a hint of citrus. Revered across Asia and increasingly sought in Western markets.',
    image:       '/images/fruithai/placeholder.svg',
    unit:        'carton (5 kg)',
    seasons:     [5, 6, 7, 8],
    tags:        ['premium'],
  },
  {
    slug:        'papaya',
    name:        'Papaya',
    variety:     'Holland / Red Lady',
    origin:      'Central Thailand',
    description: 'Buttery orange flesh with natural enzyme richness. Thailand\'s Red Lady papaya ships well and arrives with consistent quality — ideal for fresh markets and food service.',
    image:       '/images/fruithai/placeholder.svg',
    unit:        'carton (10 kg)',
    seasons:     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tags:        ['year-round'],
  },
]

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
