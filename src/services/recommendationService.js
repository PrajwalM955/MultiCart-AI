const PREFERENCES_KEY = 'multicart.category-preferences'

export function getPreferences() {
  try { return JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}') } catch { return {} }
}

export function trackProductClick(product) {
  const preferences = getPreferences()
  preferences[product.category] = (preferences[product.category] || 0) + 1
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  localStorage.setItem('multicart.last-viewed', JSON.stringify(product))
  window.dispatchEvent(new CustomEvent('multicart:product-clicked', { detail: product }))
}

export function preferenceLabel() {
  const entries = Object.entries(getPreferences()).sort((a, b) => b[1] - a[1])
  return entries.length ? entries[0][0].replaceAll('-', ' ') : null
}
