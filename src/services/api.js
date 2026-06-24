const API_ROOT = import.meta.env.VITE_API_URL || ''

async function request(path, options) {
  const response = await fetch(`${API_ROOT}${path}`, options)
  if (!response.ok) throw new Error(`Request failed (${response.status})`)
  return response.json()
}

export const getProducts = () => request('/api/products?limit=100')

export const getRecommendations = (payload) => request('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})

export const searchFromImage = (file, preferences) => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('preferences_json', JSON.stringify(preferences))
  return request('/api/image-search', { method: 'POST', body: formData })
}
