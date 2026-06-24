import { ChevronRight, Menu, Search, ShoppingBag, ShoppingCart, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ChatWidget from '../components/ChatWidget'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/api'
import { trackProductClick } from '../services/recommendationService'

export default function Storefront() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => { getProducts().then(data => setProducts(data.products)).catch(() => setError('The catalogue could not be loaded. Check that the FastAPI service is running, then retry.')).finally(() => setLoading(false)) }, [])
  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products])
  const visibleProducts = products.filter(p => (activeCategory === 'All' || p.category === activeCategory) && `${p.title} ${p.category}`.toLowerCase().includes(search.toLowerCase()))

  return <main className="min-h-screen overflow-x-hidden">
    <nav className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-5 lg:px-8">
      <a href="#top" className="flex shrink-0 items-center gap-2 text-lg font-black tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white"><ShoppingBag size={19}/></span> Eazy<span className="text-coral">Shop</span></a>
      <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex"><a href="#discover" className="hover:text-coral">Discover</a><a href="#catalogue" className="hover:text-coral">Shop</a><a href="#about" className="hover:text-coral">About</a></div>
      <label className="ml-auto hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex"><Search size={17} className="text-slate-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none"/></label>
      <button aria-label="Shopping cart" className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-ink transition hover:bg-sky"><ShoppingCart size={19}/><span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">0</span></button>
      <button aria-label="Menu" className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 md:hidden"><Menu size={19}/></button>
    </nav>
    <section id="top" className="soft-grid relative mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-sky px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
      <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-coral/20 blur-3xl" /><div className="absolute -bottom-24 left-1/2 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="relative max-w-2xl"><p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm"><Sparkles size={14}/> Shopping, conversationally</p><h1 className="text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl">Find the right thing, <span className="text-coral">without the hunt.</span></h1><p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">A demo storefront with MultiCart AI embedded. Ask by text, voice, or photo — the assistant remembers what catches your eye.</p>
        <a href="#catalogue" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-coral">Explore the edit <ChevronRight size={17}/></a></div>
    </section>
    <section id="discover" className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="grid gap-4 md:grid-cols-3"><Feature number="01" title="Just ask" text="Natural searches like “show black shoes” understand the intent, not just keywords."/><Feature number="02" title="Show, don’t tell" text="Speak in English, Hindi, or Arabic — or upload an image for visual discovery."/><Feature number="03" title="Learns lightly" text="Product clicks stay in this browser and gently tune the next recommendations."/></div></section>
    <section id="catalogue" className="mx-auto max-w-7xl px-5 pb-24 lg:px-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm font-bold text-coral">CURATED CATALOGUE</p><h2 className="mt-1 text-3xl font-black tracking-tight">A little something for everyone.</h2></div><label className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:hidden"><Search size={18} className="text-slate-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none"/></label></div>
      <div className="hide-scrollbar mt-7 flex gap-2 overflow-x-auto pb-2">{categories.map(category => <button key={category} onClick={() => setActiveCategory(category)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize transition ${activeCategory === category ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600 hover:bg-sky'}`}>{category.replaceAll('-', ' ')}</button>)}</div>
      {loading ? <div className="grid grid-cols-2 gap-4 pt-8 md:grid-cols-3 lg:grid-cols-4">{Array.from({length: 8}).map((_, i) => <div key={i} className="h-80 animate-pulse rounded-3xl bg-slate-100"/>)}</div> : error ? <div className="mt-8 rounded-3xl border border-red-100 bg-red-50 p-8 text-center"><p className="font-bold text-red-800">Catalogue unavailable</p><p className="mt-2 text-sm text-red-700">{error}</p><button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white">Retry</button></div> : <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{visibleProducts.map(product => <ProductCard key={product.id} product={product} onView={trackProductClick}/>)}</div>}
      {!loading && !error && !visibleProducts.length && <p className="py-20 text-center text-slate-500">No products found. Try a different search or let MultiCart AI explore for you.</p>}
    </section>
    <footer id="about" className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">MultiCart AI SDK prototype · Built for delightful product discovery</footer>
    <ChatWidget />
  </main>
}

function Feature({ number, title, text }) { return <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"><span className="text-xs font-black text-coral">{number}</span><h3 className="mt-6 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p></article> }
