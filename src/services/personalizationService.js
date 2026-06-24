const INTERACTIONS_KEY = 'multicart.product-interactions'
const PREFERENCES_KEY = 'multicart.category-preferences'
const MAX_INTERACTIONS = 100

// Keep all preference data in the shopper's browser; no account or server state is required.
export function getUserPreferences() {
  try {
    return JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}')
  } catch {
    return {}
  }
}

/** Records a product view/click locally and increments its category affinity. */
export function trackInteraction(product) {
  if (!product?.category || !product?.title) return

  const interaction = { category: product.category, title: product.title, timestamp: new Date().toISOString() }
  let interactions = []
  try { interactions = JSON.parse(localStorage.getItem(INTERACTIONS_KEY) || '[]') } catch { interactions = [] }
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify([interaction, ...interactions].slice(0, MAX_INTERACTIONS)))

  const preferences = getUserPreferences()
  preferences[product.category] = (preferences[product.category] || 0) + 1
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
}

/**
 * Applies finalScore = searchScore + personalizationScore and returns products
 * in descending relevance. Accepts product objects or { product, searchScore } entries.
 */
export function personalizeResults(products = [], preferences = getUserPreferences()) {
  return products
    .map((item, index) => {
      const product = item.product || item
      const searchScore = Number(item.searchScore ?? item.score ?? 0)
      const personalizationScore = Number(preferences[product.category] || 0)
      return { product, finalScore: searchScore + personalizationScore, index }
    })
    .sort((left, right) => right.finalScore - left.finalScore || left.index - right.index)
    .map(result => result.product)
}
