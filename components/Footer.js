'use client'

import { useState } from 'react'
import Link from 'next/link'
import FeedbackModal from './FeedbackModal'

export default function Footer() {
    const [showFeedback, setShowFeedback] = useState(false)

    return (
        <>
            <footer className="bg-[#1e2130] border-t border-white/5 py-8 mt-auto">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                        <div className="text-center md:text-left">
                            <h3 className="text-white font-bold text-lg mb-1">Pravachi<span className="text-brand-cyan">UZ</span></h3>
                            <p className="text-slate-500 text-sm">Avtomaktab o'quvchilari uchun maxsus.</p>
                        </div>

                        <div className="flex gap-6 text-sm font-medium text-slate-400">
                            <a href="https://t.me/javohir_ok" target="_blank" rel="noopener noreferrer" className="hover:text-brand-cyan transition-colors flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                Telegram
                            </a>
                            <a href="#" className="hover:text-brand-cyan transition-colors flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                                Instagram
                            </a>
                        </div>

                        <div className="flex gap-4">
                            <Link href="/faq" className="px-4 py-2 rounded-lg bg-[#2a2d3e] text-slate-300 hover:text-white hover:bg-[#35394b] text-sm transition-colors">
                                Savol-Javob
                            </Link>
                            <button
                                onClick={() => setShowFeedback(true)}
                                className="px-4 py-2 rounded-lg bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20 text-sm font-bold transition-colors"
                            >
                                Fikr qoldirish
                            </button>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-xs text-slate-600 border-t border-white/5 pt-6">
                        &copy; {new Date().getFullYear()} PravachiUZ. Barcha huquqlar himoyalangan.
                    </div>
                </div>
            </footer>
            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        </>
    )
}
