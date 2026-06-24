import { ArrowUpRight, Star } from 'lucide-react'

export default function ProductCard({ product, onView, compact = false, anchorId, highlighted = false }) {
  return (
    <article id={anchorId} className={`group overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 shadow-[0_10px_30px_rgba(18,27,54,.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(18,27,54,.12)] ${compact ? 'w-44 shrink-0 snap-start rounded-2xl p-2' : ''} ${highlighted ? 'ring-2 ring-coral ring-offset-4 animate-[pulse_1s_ease-in-out_2]' : ''}`}>
      <div className={`relative overflow-hidden rounded-2xl bg-slate-50 ${compact ? 'h-28 rounded-xl' : 'h-56'}`}>
        <img src={product.thumbnail} alt={product.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{product.category.replaceAll('-', ' ')}</span>
      </div>
      <div className={`${compact ? 'px-0 pt-2' : 'px-1 pt-3'}`}>
        <h3 className={`${compact ? 'text-xs' : 'text-sm'} line-clamp-1 font-bold text-ink`}>{product.title}</h3>
        <div className={`flex items-center justify-between ${compact ? 'mt-0.5' : 'mt-1'}`}>
          <span className={`${compact ? 'text-sm' : 'text-base'} font-black text-ink`}>${Number(product.price).toFixed(2)}</span>
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-500"><Star size={compact ? 11 : 13} fill="currentColor" /> {product.rating}</span>
        </div>
        <button onClick={() => onView?.(product)} className={`${compact ? 'mt-2 rounded-lg py-1.5 text-[10px]' : 'mt-3 rounded-xl py-2 text-xs'} flex w-full items-center justify-center gap-1.5 bg-ink font-bold text-white transition hover:bg-coral`}>
          View product <ArrowUpRight size={compact ? 12 : 14} />
        </button>
      </div>
    </article>
  )
}
