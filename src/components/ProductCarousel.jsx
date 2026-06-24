import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import ProductCard from './ProductCard'

export default function ProductCarousel({ products, onView }) {
  const railRef = useRef(null)
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 })

  if (!products?.length) return null

  function move(direction) {
    railRef.current?.scrollBy({ left: direction * 190, behavior: 'smooth' })
  }

  function handleWheel(event) {
    const rail = railRef.current
    if (!rail || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    const canMove = event.deltaY < 0
      ? rail.scrollLeft > 0
      : rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 1
    if (!canMove) return
    rail.scrollLeft += event.deltaY
    event.preventDefault()
  }

  function startDrag(event) {
    if (event.pointerType === 'touch') return
    const rail = railRef.current
    if (!rail) return
    dragRef.current = { active: true, startX: event.clientX, startScroll: rail.scrollLeft }
    rail.setPointerCapture?.(event.pointerId)
  }

  function drag(event) {
    const rail = railRef.current
    if (!rail || !dragRef.current.active) return
    rail.scrollLeft = dragRef.current.startScroll - (event.clientX - dragRef.current.startX)
  }

  function endDrag(event) {
    dragRef.current.active = false
    railRef.current?.releasePointerCapture?.(event.pointerId)
  }

  return <div className="relative mt-2 min-w-0 overflow-hidden">
    <div
      ref={railRef}
      onWheel={handleWheel}
      onPointerDown={startDrag}
      onPointerMove={drag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="hide-scrollbar flex min-w-0 snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-1 pb-2 pt-1 touch-pan-x"
      style={{ cursor: dragRef.current.active ? 'grabbing' : 'grab' }}
    >
      {products.map(product => <ProductCard compact key={product.id} product={product} onView={onView} />)}
    </div>
    <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-9 bg-gradient-to-r from-[#fffdf9] to-transparent md:block" />
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-9 bg-gradient-to-l from-[#fffdf9] to-transparent md:block" />
    <button aria-label="Previous recommendations" onClick={() => move(-1)} className="absolute left-1 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-ink shadow-sm transition hover:bg-sky md:grid"><ChevronLeft size={16} /></button>
    <button aria-label="Next recommendations" onClick={() => move(1)} className="absolute right-1 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-ink shadow-sm transition hover:bg-sky md:grid"><ChevronRight size={16} /></button>
  </div>
}
