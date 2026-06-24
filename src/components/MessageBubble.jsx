import { Bot, UserRound } from 'lucide-react'
import ProductCarousel from './ProductCarousel'

export default function MessageBubble({ message, onView }) {
  const fromUser = message.role === 'user'
  return <div className={`flex gap-2.5 ${fromUser ? 'flex-row-reverse' : ''}`}>
    <div className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full ${fromUser ? 'bg-sky text-blue-700' : 'bg-mint text-emerald-700'}`}>
      {fromUser ? <UserRound size={14} /> : <Bot size={15} />}
    </div>
    <div className={`min-w-0 max-w-[calc(100%-40px)] ${fromUser ? 'text-right' : ''}`}>
      {message.imagePreview && <img src={message.imagePreview} alt="Uploaded query" className="mb-2 ml-auto h-20 w-20 rounded-2xl object-cover" />}
      {message.text && <p className={`inline-block rounded-2xl px-3 py-2 text-sm leading-relaxed ${fromUser ? 'rounded-tr-md bg-ink text-white' : 'rounded-tl-md bg-slate-100 text-slate-700'}`}>{message.text}</p>}
      {message.products && <ProductCarousel products={message.products} onView={onView} />}
    </div>
  </div>
}
