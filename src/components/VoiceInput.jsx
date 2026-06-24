import { Mic, MicOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const languages = [
  { value: 'en-IN', label: 'English', shortLabel: 'EN' },
  { value: 'hi-IN', label: 'Hindi', shortLabel: 'HI' },
  { value: 'ar-SA', label: 'Arabic', shortLabel: 'AR' }
]

export default function VoiceInput({ onTranscript, onStatusChange }) {
  const [listening, setListening] = useState(false)
  const [language, setLanguage] = useState('en-IN')
  const recognitionRef = useRef(null)
  const hadErrorRef = useRef(false)
  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  const languageName = languages.find(item => item.value === language)?.label || 'English'

  useEffect(() => {
    onStatusChange?.(supported ? `Voice ready (${languageName})` : 'Voice search is unavailable in this browser')
  }, [supported, languageName, onStatusChange])

  useEffect(() => () => recognitionRef.current?.stop(), [])

  function listen() {
    if (!supported) return
    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new Recognition()
    recognitionRef.current = recognition
    recognition.lang = language
    recognition.interimResults = true
    recognition.continuous = false
    recognition.onstart = () => {
      hadErrorRef.current = false
      setListening(true)
      onStatusChange?.(`Listening in ${languageName}...`)
    }
    recognition.onresult = event => {
      const transcript = Array.from(event.results).map(result => result[0].transcript).join('').trim()
      if (transcript) onTranscript(transcript)
    }
    recognition.onerror = event => {
      hadErrorRef.current = true
      const message = event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone permission was not granted'
        : 'Voice search could not understand that. Try again.'
      onStatusChange?.(message)
    }
    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
      if (!hadErrorRef.current) onStatusChange?.(`Voice ready (${languageName})`)
    }
    try {
      recognition.start()
    } catch {
      setListening(false)
      onStatusChange?.('Voice search is busy. Please try again.')
    }
  }

  return <div className="flex shrink-0 items-center gap-0.5">
    <select aria-label="Voice language" value={language} onChange={event => setLanguage(event.target.value)} disabled={listening} className="w-9 cursor-pointer border-0 bg-transparent p-0 text-[10px] font-bold text-slate-500 outline-none disabled:opacity-50">
      {languages.map(item => <option key={item.value} value={item.value}>{item.shortLabel}</option>)}
    </select>
    <button type="button" aria-label={listening ? 'Stop voice search' : `Search by voice in ${languageName}`} title={supported ? (listening ? 'Stop listening' : `Search by voice (${languageName})`) : 'Voice search is not supported in this browser'} disabled={!supported} onClick={listen} className={`grid h-9 w-9 place-items-center rounded-xl transition ${listening ? 'animate-pulse bg-coral text-white' : 'text-slate-500 hover:bg-slate-100'} disabled:cursor-not-allowed disabled:opacity-40`}>
      {listening ? <MicOff size={17} /> : <Mic size={17} />}
    </button>
  </div>
}
