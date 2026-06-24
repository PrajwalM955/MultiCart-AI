import { MessageCircleMore, X } from 'lucide-react'
import { useState } from 'react'
import ChatWindow from './ChatWindow'

/** Embeddable assistant entry point — mount <ChatWidget /> anywhere in a host app. */
export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  return <>
    {open && <ChatWindow onClose={() => setOpen(false)} />}
    <button aria-label="Open MultiCart AI shopping assistant" onClick={() => setOpen(value => !value)} className="fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-2xl bg-coral text-white shadow-[0_12px_30px_rgba(255,114,94,.45)] transition hover:scale-105 sm:bottom-6 sm:right-6">
      {open ? <X size={24} /> : <MessageCircleMore size={25} />}
      {!open && <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />}
    </button>
  </>
}
