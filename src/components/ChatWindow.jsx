import { ArrowUp, ChevronDown, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getRecommendations, searchFromImage } from '../services/api'
import { getPreferences, trackProductClick } from '../services/recommendationService'
import ImageUploader from './ImageUploader'
import MessageBubble from './MessageBubble'
import VoiceInput from './VoiceInput'

const WELCOME = { role: 'assistant', text: 'Hi! I’m Mia, your shopping copilot. Try “show black shoes”, ask for “only Nike”, speak a search, or drop in a product photo.' }

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const context = useRef({})
  const scrollRef = useRef()

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, loading])

  async function send() {
    const query = input.trim()
    if ((!query && !image) || loading) return
    const preview = image ? URL.createObjectURL(image) : null
    setMessages(current => [...current, { role: 'user', text: query || 'Find products like this image', imagePreview: preview }])
    setInput('')
    setLoading(true)
    try {
      const result = image
        ? await searchFromImage(image, getPreferences())
        : await getRecommendations({ query, context: context.current, preferences: getPreferences() })
      context.current = result.context || context.current
      setMessages(current => [...current, { role: 'assistant', text: result.reply, products: result.products }])
    } catch {
      setMessages(current => [...current, { role: 'assistant', text: 'I hit a small snag reaching the catalogue. Please try that again in a moment.' }])
    } finally {
      setImage(null)
      setLoading(false)
    }
  }

  function viewProduct(product) {
    trackProductClick(product)
    setMessages(current => [...current, { role: 'assistant', text: `Great pick. I’ve noted your interest in ${product.category.replaceAll('-', ' ')} so future suggestions can get smarter.` }])
  }

  return <section className="fixed bottom-5 right-4 z-50 flex h-[min(600px,calc(100vh-40px))] w-[calc(100vw-32px)] max-w-[380px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(18,27,54,.28)] sm:right-6">
    <header className="flex items-center justify-between bg-ink px-5 py-4 text-white">
      <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-2xl bg-coral"><Sparkles size={18} /></span><div><h2 className="text-sm font-bold">Shopping Assistant</h2><p className="text-xs text-slate-300">Your multimodal shopping copilot</p></div></div>
      <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-slate-300 hover:bg-white/10"><ChevronDown size={20} /></button>
    </header>
    <div ref={scrollRef} className="hide-scrollbar flex-1 space-y-4 overflow-y-auto bg-[#fffdf9] px-4 py-5">
      {messages.map((message, index) => <MessageBubble key={index} message={message} onView={viewProduct} />)}
      {loading && <div className="flex gap-1 pl-10"><i className="h-2 w-2 animate-bounce rounded-full bg-coral [animation-delay:-.3s]" /><i className="h-2 w-2 animate-bounce rounded-full bg-coral [animation-delay:-.15s]" /><i className="h-2 w-2 animate-bounce rounded-full bg-coral" /></div>}
    </div>
    <div className="border-t border-slate-100 bg-white p-3">
      <div className="flex items-center rounded-2xl bg-slate-100 px-1.5 py-1">
        <ImageUploader file={image} onChange={setImage} disabled={loading} />
        <VoiceInput onTranscript={transcript => setInput(current => current ? `${current} ${transcript}` : transcript)} />
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={image ? 'Ask about this image…' : 'Ask for anything…'} className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400" />
        <button onClick={send} disabled={loading || (!input.trim() && !image)} className="grid h-9 w-9 place-items-center rounded-xl bg-coral text-white transition hover:scale-105 disabled:opacity-40"><ArrowUp size={17} strokeWidth={3} /></button>
      </div>
      <p className="pt-2 text-center text-[10px] text-slate-400">Voice · image · conversation-aware recommendations</p>
    </div>
  </section>
}
