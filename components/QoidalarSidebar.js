'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import FeedbackModal from '@/components/FeedbackModal'

export default function QoidalarSidebar() {
    const pathname = usePathname()
    const t = useI18n()
    const [showFeedback, setShowFeedback] = useState(false)

    const isActive = (path) => pathname === path || pathname.startsWith(path + '/')

    return (
        <>
            <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col z-50 transition-colors duration-200">
                <div className="p-6">
                    <div className="flex flex-col gap-6 mb-10">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/imgage/avtotest-logo.png"
                                    alt="AvtoTest Logo"
                                    fill
                                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <span className="font-heading text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                                PravachiUZ
                            </span>
                        </Link>
                    </div>
                    <nav className="space-y-1">
                        <Link
                            href="/qoidalar"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/qoidalar')
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="material-icons-round">menu_book</span>
                            {t('sidebar.rules')}
                        </Link>
                        <Link
                            href="/biletlar"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/biletlar')
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="material-icons-round">quiz</span>
                            {t('sidebar.tests')}
                        </Link>
                        <Link
                            href="/qoidalar/yol-belgilari"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/qoidalar/yol-belgilari')
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="material-icons-round">warning</span>
                            {t('rules.signs.title')}
                        </Link>
                        <Link
                            href="/dashboard"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${pathname === '/dashboard'
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="material-icons-round">dashboard</span>
                            {t('sidebar.dashboard')}
                        </Link>
                        <button
                            onClick={() => setShowFeedback(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <span className="material-icons-round">feedback</span>
                            {t('feedback.title')}
                        </button>
                    </nav>
                </div>
            </aside>
            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        </>
    )
}
