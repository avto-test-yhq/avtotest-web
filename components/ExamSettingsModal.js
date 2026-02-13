'use client'

import { useEffect, useState } from 'react'
import { useExamSettings } from '@/context/ExamSettingsContext'
import Link from 'next/link'
import FeedbackModal from './FeedbackModal'

export default function ExamSettingsModal({ isOpen, onClose }) {
    const { settings, updateSettings, loading } = useExamSettings()
    const [localSettings, setLocalSettings] = useState(settings)
    const [showFeedback, setShowFeedback] = useState(false)

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings)
        }
    }, [settings])

    if (!isOpen) return null

    const handleToggle = (key) => {
        setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSave = () => {
        updateSettings(localSettings)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#1e2130] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#23263a] shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Sozlamalar
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-4 text-slate-400">Yuklanmoqda...</div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Imtihon</h3>
                                <ToggleRow
                                    label="Avtomatik o'tish"
                                    desc="Javobdan so'ng keyingi savolga o'tish"
                                    value={localSettings.autoNext}
                                    onChange={() => handleToggle('autoNext')}
                                />
                                <ToggleRow
                                    label="Izohni ko'rsatish"
                                    desc="Har bir savolga izohni darhol ochish"
                                    value={localSettings.showExplanation}
                                    onChange={() => handleToggle('showExplanation')}
                                />
                                <ToggleRow
                                    label="Variantlarni aralashtirish"
                                    desc="Javob variantlari o'rnini almashtirish"
                                    value={localSettings.shuffleOptions}
                                    onChange={() => handleToggle('shuffleOptions')}
                                />
                                <ToggleRow
                                    label="To'g'ri javobni ko'rsatish"
                                    desc="Xato qilganda to'g'ri javobni ko'rsatish"
                                    value={localSettings.showCorrect}
                                    onChange={() => handleToggle('showCorrect')}
                                />
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aloqa va Ilova</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <a href="https://t.me/javohir_ok" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-[#2a2d3e] hover:bg-[#35394b] flex flex-col items-center justify-center gap-2 transition-colors border border-white/5 hover:border-brand-cyan/20 group">
                                        <svg className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        <span className="text-xs font-medium text-slate-300">Telegram</span>
                                    </a>
                                    <Link href="/faq" className="p-3 rounded-xl bg-[#2a2d3e] hover:bg-[#35394b] flex flex-col items-center justify-center gap-2 transition-colors border border-white/5 hover:border-brand-cyan/20 group">
                                        <svg className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="text-xs font-medium text-slate-300">Savol-Javob</span>
                                    </Link>
                                </div>
                                <button
                                    onClick={() => setShowFeedback(true)}
                                    className="w-full p-3 rounded-xl bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-between gap-3 transition-colors border border-white/5 hover:border-brand-cyan/20 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                        </div>
                                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">Fikr qoldirish / Xatolik</span>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-[#161821]/50 flex gap-3 shrink-0">
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 rounded-xl bg-brand-cyan hover:bg-cyan-400 text-white font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                    >
                        Saqlash
                    </button>
                </div>
            </div>
            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        </div>
    )
}

function ToggleRow({ label, desc, value, onChange }) {
    return (
        <div onClick={onChange} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 hover:bg-white/5 rounded-lg transition-colors">
            <div>
                <div className="text-white font-medium text-sm group-hover:text-brand-cyan transition-colors">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
            </div>
            <div className={`w-11 h-6 shrink-0 rounded-full relative transition-colors ${value ? 'bg-brand-cyan' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-1'}`} />
            </div>
        </div>
    )
}
