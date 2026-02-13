'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'

export default function FeedbackModal({ isOpen, onClose }) {
    const [message, setMessage] = useState('')
    const [type, setType] = useState('suggestion')
    const [contact, setContact] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null) // success | error

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!message.trim()) return

        setLoading(true)
        setStatus(null)

        try {
            const user = auth.currentUser
            const uid = user ? user.uid : 'anonymous'

            const res = await fetch(`${API_URL}/api/feedback/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid,
                    message,
                    type,
                    contact
                })
            })

            if (res.ok) {
                setStatus('success')
                setTimeout(() => {
                    onClose()
                    setMessage('')
                    setContact('')
                    setStatus(null)
                }, 2000)
            } else {
                setStatus('error')
            }
        } catch (error) {
            console.error(error)
            setStatus('error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#1e2130] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#23263a]">
                    <h2 className="text-lg font-bold text-white">Fikr bildirish</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {status === 'success' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <p className="text-white text-lg font-medium">Rahmat! Fikringiz qabul qilindi.</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Xabar turi</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['suggestion', 'bug', 'other'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={`text-sm py-2 rounded-lg border transition-all ${type === t ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan font-bold' : 'bg-[#2a2d3e] border-white/5 text-slate-400 hover:bg-[#35394b]'}`}
                                        >
                                            {t === 'suggestion' ? 'Taklif' : t === 'bug' ? 'Xatolik' : 'Boshqa'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Xabar matni</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-[#2a2d3e] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan/50 resize-none h-32"
                                    placeholder="Fikringizni yozib qoldiring..."
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Aloqa uchun (ixtiyoriy)</label>
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    className="w-full bg-[#2a2d3e] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan/50"
                                    placeholder="Telegram yoki telefon raqam"
                                />
                            </div>

                            {status === 'error' && (
                                <p className="text-rose-400 text-sm text-center">Xatolik yuz berdi, qayta urinib ko'ring.</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-brand-cyan hover:bg-cyan-400 text-white font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? 'Yuborilmoqda...' : 'Yuborish'}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    )
}
