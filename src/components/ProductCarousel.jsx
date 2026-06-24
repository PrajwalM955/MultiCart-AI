import ProductCard from './ProductCard'

export default function ProductCarousel({ products, onView }) {
  if (!products?.length) return null
  return <div className="hide-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 pt-1">{products.map(product => <ProductCard compact key={product.id} product={product} onView={onView} />)}</div>
}
