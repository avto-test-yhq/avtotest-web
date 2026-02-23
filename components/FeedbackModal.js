'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { useI18n } from '@/lib/i18n'

export default function FeedbackModal({ isOpen, onClose, context = null }) {
    const [message, setMessage] = useState('')
    const [type, setType] = useState('suggestion')
    const [contact, setContact] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null) // success | error
    const t = useI18n()

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

    // Automatically set type to question if context exists when opening
    useEffect(() => {
        if (isOpen) {
            setType(context ? 'question' : 'suggestion')
            setMessage('')
            setContact('')
            setStatus(null)
        }
    }, [isOpen, context?.questionId]) // Only depend on modal open state and the specific question ID

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
                    contact,
                    questionId: context?.questionId,
                    ticketId: context?.ticketId,
                    questionText: context?.questionText
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
                    <h2 className="text-lg font-bold text-white">
                        {context ? t('feedback.questionTitle') : t('feedback.title')}
                    </h2>
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
                            <p className="text-white text-lg font-medium">{t('feedback.status.success')}</p>
                        </div>
                    ) : (
                        <>
                            {context && (
                                <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl p-3 mb-2">
                                    <p className="text-brand-cyan text-xs font-bold mb-1">
                                        Savol ID: {context.questionId} {context.ticketId ? `(Bilet: ${context.ticketId})` : ''}
                                    </p>
                                    <p className="text-slate-300 text-sm line-clamp-2">
                                        {context.questionText}
                                    </p>
                                </div>
                            )}

                            {!context && (
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">{t('feedback.label.type')}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['suggestion', 'bug', 'other'].map(tType => (
                                            <button
                                                key={tType}
                                                type="button"
                                                onClick={() => setType(tType)}
                                                className={`text-sm py-2 rounded-lg border transition-all ${type === tType ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan font-bold' : 'bg-[#2a2d3e] border-white/5 text-slate-400 hover:bg-[#35394b]'}`}
                                            >
                                                {tType === 'suggestion' ? t('feedback.type.suggestion') : tType === 'bug' ? t('feedback.type.bug') : t('feedback.type.other')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5 font-medium">{t('feedback.label.message')}</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-[#2a2d3e] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan/50 resize-none h-32"
                                    placeholder={context ? t('feedback.placeholders.question') : t(`feedback.placeholders.${type}`)}
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5 font-medium">{t('feedback.label.contact')}</label>
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    className="w-full bg-[#2a2d3e] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan/50"
                                    placeholder={t('feedback.contactPlaceholder')}
                                />
                            </div>

                            {status === 'error' && (
                                <p className="text-rose-400 text-sm text-center">{t('feedback.status.error')}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-brand-cyan hover:bg-cyan-400 text-white font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? t('feedback.status.sending') : t('feedback.send')}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    )
}
