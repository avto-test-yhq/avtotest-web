'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import UserProfileHeader from '@/components/UserProfileHeader'

export default function QoidalarHeader({ title, backUrl, showDashboard = true }) {
    const router = useRouter()

    const handleBack = () => {
        if (backUrl) {
            router.push(backUrl)
        } else {
            router.back()
        }
    }

    return (
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
            <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center text-slate-600 dark:text-slate-400"
                        aria-label="Orqaga"
                    >
                        <span className="material-icons-round">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white capitalize">{title}</h1>
                </div>

                <div className="flex items-center gap-3">
                    {showDashboard && (
                        <Link
                            href="/dashboard"
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                        >
                            <span className="material-icons-round text-lg">dashboard</span>
                            <span>Dashboard</span>
                        </Link>
                    )}

                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                        <div className="hidden md:block">
                            <LanguageSwitcher size="sm" />
                        </div>
                        <ThemeToggle />
                        <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-sky-500/20 ring-2 ring-white dark:ring-slate-800">
                            <UserProfileHeader />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
