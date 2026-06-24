import { ImagePlus, X } from 'lucide-react'
import { useRef } from 'react'

export default function ImageUploader({ file, onChange, disabled }) {
  const input = useRef()
  return <>
    <input ref={input} className="hidden" type="file" accept="image/*" onChange={e => onChange(e.target.files?.[0] || null)} />
    {file ? (
      <div className="relative ml-1 h-9 w-9 overflow-hidden rounded-xl border border-slate-200">
        <img src={URL.createObjectURL(file)} alt="Selected" className="h-full w-full object-cover" />
        <button type="button" onClick={() => onChange(null)} className="absolute inset-0 grid place-items-center bg-ink/65 text-white"><X size={14} /></button>
      </div>
    ) : (
      <button type="button" disabled={disabled} onClick={() => input.current?.click()} title="Upload a product image" className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"><ImagePlus size={18} /></button>
    )}
  </>
}
