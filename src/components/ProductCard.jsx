import { ArrowUpRight, Star } from 'lucide-react'

export default function ProductCard({ product, onView, compact = false }) {
  return (
    <article className={`group rounded-3xl border border-slate-100 bg-white p-3 shadow-[0_10px_30px_rgba(18,27,54,.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(18,27,54,.12)] ${compact ? 'w-52 shrink-0' : ''}`}>
      <div className={`relative overflow-hidden rounded-2xl bg-slate-50 ${compact ? 'h-36' : 'h-56'}`}>
        <img src={product.thumbnail} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{product.category.replaceAll('-', ' ')}</span>
      </div>
      <div className="px-1 pt-3">
        <h3 className="line-clamp-1 text-sm font-bold text-ink">{product.title}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-base font-black text-ink">${Number(product.price).toFixed(2)}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-500"><Star size={13} fill="currentColor" /> {product.rating}</span>
        </div>
        <button onClick={() => onView?.(product)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink py-2 text-xs font-bold text-white transition hover:bg-coral">
          View product <ArrowUpRight size={14} />
        </button>
      </div>
    </article>
  )
}
