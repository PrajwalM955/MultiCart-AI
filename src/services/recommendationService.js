import { personalizeResults } from './personalizationService'

const STOP_WORDS = new Set(['a', 'an', 'the', 'for', 'me', 'show', 'find', 'get', 'some', 'products', 'product', 'items', 'item', 'please', 'with', 'and', 'only'])
const KEYWORD_ALIASES = {
  shoe: ['shoe', 'sneaker', 'footwear'],
  sneaker: ['shoe', 'sneaker', 'footwear'],
  smartphone: ['smartphone', 'phone', 'mobile'],
  phone: ['smartphone', 'phone', 'mobile'],
  laptop: ['laptop', 'notebook'],
  sport: ['sport', 'sports', 'fitness', 'athletic'],
  perfume: ['perfume', 'fragrance', 'scent'],
  watch: ['watch', 'wristwatch'],
  beauty: ['beauty', 'makeup', 'cosmetic']
}

/** Normalizes free-form shopping queries into searchable word fragments. */
export function normalizeProductText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function queryKeywords(query) {
  const words = normalizeProductText(query)
    .split(' ')
    .filter(word => word.length > 1 && !STOP_WORDS.has(word))
    .map(word => word.endsWith('s') && word.length > 3 ? word.slice(0, -1) : word)

  return [...new Set(words.flatMap(word => KEYWORD_ALIASES[word] || [word]))]
}

/**
 * Ranks products for a natural-language request.
 *
 * Base scoring is intentionally simple and explainable: title +3, category +2,
 * description +1 for every keyword match. Preference score is added afterward.
 */
export function recommendProducts(query, products = [], userHistory = {}) {
  const keywords = queryKeywords(query)
  const wantsCheap = /\b(cheap|budget|affordable|low price)\b/.test(normalizeProductText(query))

  const ranked = products.map(product => {
    const title = normalizeProductText(product.title)
    const category = normalizeProductText(product.category)
    const description = normalizeProductText(product.description)
    let score = 0

    for (const keyword of keywords) {
      if (title.includes(keyword)) score += 3
      if (category.includes(keyword)) score += 2
      if (description.includes(keyword)) score += 1
    }

    return { product, searchScore: score }
  })

  const matches = ranked.filter(result => result.searchScore > 0)
  const source = matches.length ? matches : ranked

  const ordered = source
    .sort((left, right) => {
      if (matches.length && right.searchScore !== left.searchScore) return right.searchScore - left.searchScore
      if (wantsCheap && Number(left.product.price) !== Number(right.product.price)) return Number(left.product.price) - Number(right.product.price)
      return Number(right.product.rating || 0) - Number(left.product.rating || 0)
    })
  return personalizeResults(ordered, userHistory)
}
