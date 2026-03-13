'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { useI18n } from '@/lib/i18n'
import { apiFetch } from '@/lib/apiClient'

export default function FeedbackModal({ isOpen, onClose, context = null }) {
    const t = useI18n()
    const [type, setType] = useState('suggestion')
    const [message, setMessage] = useState('')
    const [contact, setContact] = useState('')
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(false)

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

            const res = await apiFetch(`/feedback/send`, {
                method: 'POST',
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
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-[#1e2532] sm:bg-[#1e2130] border-t sm:border border-[#2d3748] sm:border-white/10 rounded-t-[24px] sm:rounded-2xl w-full sm:max-w-sm shadow-2xl scale-100 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 overflow-hidden pb-6 sm:pb-0 font-display sm:font-sans relative">
                
                {/* Mobile Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-12 h-1.5 bg-[#334155] rounded-full"></div>
                </div>

                <div className="px-6 py-3 sm:py-4 sm:border-b sm:border-white/5 flex items-center justify-between sm:bg-[#23263a]">
                    <h2 className="text-[18px] sm:text-lg font-bold text-white flex-1 text-center sm:text-left pr-6 sm:pr-0">
                        {context ? t('feedback.questionTitle') : t('feedback.title')}
                    </h2>
                    <button onClick={onClose} className="absolute right-4 top-4 sm:static text-slate-400 hover:text-white transition-colors bg-[#2a2d3e] sm:bg-transparent p-1.5 sm:p-0 rounded-full sm:rounded-none">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
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
                                <div className="bg-[#161c24] sm:bg-brand-cyan/10 border border-[#2d3748] sm:border-brand-cyan/20 rounded-[14px] sm:rounded-xl p-4 sm:p-3 mb-2">
                                    <p className="text-[#60a5fa] sm:text-brand-cyan text-[13px] sm:text-xs font-bold mb-1.5 sm:mb-1">
                                        Savol ID: {context.questionId} {context.ticketId ? `(Bilet: ${context.ticketId})` : ''}
                                    </p>
                                    <p className="text-slate-300 text-[14px] sm:text-sm line-clamp-2 leading-relaxed">
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
                                <label className="hidden sm:block text-xs text-slate-400 mb-1.5 font-medium">{t('feedback.label.message')}</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-[#161c24] sm:bg-[#2a2d3e] border border-[#2d3748] sm:border-white/5 rounded-[14px] sm:rounded-xl px-4 py-4 text-[15px] sm:text-white placeholder-[#94a3b8] sm:placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none h-[120px] sm:h-32 shadow-inner sm:shadow-none"
                                    placeholder={context ? t('feedback.placeholders.question') : t(`feedback.placeholders.${type}`)}
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="hidden sm:block text-xs text-slate-400 mb-1.5 font-medium">{t('feedback.label.contact')}</label>
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    className="w-full bg-[#161c24] sm:bg-[#2a2d3e] border border-[#2d3748] sm:border-white/5 rounded-[14px] sm:rounded-xl px-4 py-4 sm:py-3 text-[15px] sm:text-white placeholder-[#94a3b8] sm:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                                    placeholder={t('feedback.contactPlaceholder')}
                                />
                            </div>

                            {status === 'error' && (
                                <p className="text-rose-400 text-sm text-center">{t('feedback.status.error')}</p>
                            )}

                            <div className="pt-2 sm:pt-0">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 sm:py-3 rounded-[14px] sm:rounded-xl bg-[#2563eb] sm:bg-brand-cyan sm:hover:bg-cyan-400 text-white font-bold text-[16px] sm:text-base transition-all shadow-lg sm:shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? t('feedback.status.sending') : t('feedback.send')}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    )
}
