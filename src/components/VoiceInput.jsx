import { Mic, MicOff } from 'lucide-react'
import { useState } from 'react'

const languages = [
  { value: 'en-IN', label: 'EN' },
  { value: 'hi-IN', label: 'हि' },
  { value: 'ar-SA', label: 'ع' }
]

export default function VoiceInput({ onTranscript }) {
  const [listening, setListening] = useState(false)
  const [language, setLanguage] = useState('en-IN')
  const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  function listen() {
    if (!supported) return
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new Recognition()
    recognition.lang = language
    recognition.interimResults = false
    recognition.continuous = false
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.onresult = event => onTranscript(event.results[0][0].transcript)
    recognition.start()
  }

  return <div className="flex items-center gap-1">
    <select aria-label="Voice language" value={language} onChange={e => setLanguage(e.target.value)} className="w-9 cursor-pointer border-0 bg-transparent p-0 text-[10px] font-bold text-slate-500 outline-none">
      {languages.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
    </select>
    <button type="button" title={supported ? 'Search by voice' : 'Voice search is not supported in this browser'} disabled={!supported} onClick={listen} className={`grid h-9 w-9 place-items-center rounded-xl transition ${listening ? 'bg-coral text-white animate-pulse' : 'text-slate-500 hover:bg-slate-100'} disabled:opacity-40`}>
      {listening ? <MicOff size={17} /> : <Mic size={17} />}
    </button>
  </div>
}
