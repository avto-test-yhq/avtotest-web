import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { useLanguage } from '@/context/LanguageContext'
import FeedbackModal from '@/components/FeedbackModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz/api/v1';

export default function QoidalarSidebar() {
    const pathname = usePathname()
    const { lang } = useLanguage()
    const t = useI18n()
    const [showFeedback, setShowFeedback] = useState(false)
    const [topics, setTopics] = useState([])

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await fetch(`${API_URL}/api/v1/rules/topics?lang=${lang || 'uzl'}`)
                if (res.ok) {
                    const data = await res.json()
                    setTopics(data.topics || [])
                }
            } catch (e) {
                console.error('Sidebar topics error:', e)
            }
        }
        fetchTopics()
    }, [lang])

    const isActive = (path) => pathname === path || pathname.startsWith(path + '/')

    return (
        <>
            <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col z-50 transition-colors duration-200">
                <div className="p-6 h-full flex flex-col">
                    <div className="flex flex-col gap-6 mb-8">
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

                    <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 pb-6">
                        <nav className="space-y-1">
                            <div className="pb-2 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-4">Asosiy</span>
                            </div>
                            <Link
                                href="/dashboard"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${pathname === '/dashboard'
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="material-icons-round">dashboard</span>
                                {t('sidebar.dashboard')}
                            </Link>
                            <Link
                                href="/biletlar"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/biletlar')
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="material-icons-round">quiz</span>
                                {t('sidebar.tests')}
                            </Link>

                            <div className="pt-6 pb-2 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-4">Qoidalar</span>
                            </div>
                            <Link
                                href="/qoidalar"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${pathname === '/qoidalar'
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="material-icons-round">apps</span>
                                {t('sidebar.rules')}
                            </Link>

                            {topics.map(topic => (
                                <Link
                                    key={topic.id}
                                    href={`/qoidalar/${topic.id}`}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive(`/qoidalar/${topic.id}`)
                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className={`material-icons-round text-[20px] ${isActive(`/qoidalar/${topic.id}`) ? 'text-blue-500' : 'text-slate-400'}`}>
                                        {topic.icon || 'label'}
                                    </span>
                                    <span className="truncate">{topic.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => setShowFeedback(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <span className="material-icons-round">feedback</span>
                            {t('feedback.title')}
                        </button>
                    </div>
                </div>
            </aside>
            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
            `}</style>
        </>
    )
}
