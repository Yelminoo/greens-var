export interface BasketItem {
  slug:     string
  name:     string
  unit:     string
  quantity: number
  brand:    string
}

const KEY = 'quoteBasket'

export function getBasket(): BasketItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function addToBasket(item: BasketItem) {
  const basket = getBasket()
  const existing = basket.find(i => i.slug === item.slug)
  if (existing) {
    existing.quantity += 1
  } else {
    basket.push(item)
  }
  localStorage.setItem(KEY, JSON.stringify(basket))
  window.dispatchEvent(new Event('quoteUpdated'))
}

export function updateQuantity(slug: string, quantity: number) {
  const basket = getBasket().map(i => i.slug === slug ? { ...i, quantity } : i)
  localStorage.setItem(KEY, JSON.stringify(basket))
  window.dispatchEvent(new Event('quoteUpdated'))
}

export function removeFromBasket(slug: string) {
  const basket = getBasket().filter(i => i.slug !== slug)
  localStorage.setItem(KEY, JSON.stringify(basket))
  window.dispatchEvent(new Event('quoteUpdated'))
}

export function clearBasket() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event('quoteUpdated'))
}
