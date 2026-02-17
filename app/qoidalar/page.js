'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import QoidalarSidebar from '@/components/QoidalarSidebar'
import { useI18n } from '@/lib/i18n'

const categoryConfig = [
  { id: 'yol-harakati', href: '/qoidalar/yol-harakati', icon: 'menu_book', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', titleKey: 'rules.traffic.title', descKey: 'rules.traffic.desc', badgeKey: 'rules.traffic.badge' },
  { id: 'yol-belgilari', href: '/qoidalar/yol-belgilari', icon: 'warning', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', titleKey: 'rules.signs.title', descKey: 'rules.signs.desc', badgeKey: 'rules.signs.badge' },
  { id: 'yol-chiziqlari', href: '/qoidalar/yol-chiziqlari', icon: 'edit_road', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', titleKey: 'rules.lines.title', descKey: 'rules.lines.desc', badgeKey: 'rules.lines.badge' },
  { id: 'tezlik-chegaralari', href: '/qoidalar/tezlik-chegaralari', icon: 'speed', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', titleKey: 'rules.speed.title', descKey: 'rules.speed.desc', badgeKey: 'rules.speed.badge' },
  { id: 'kerakli-hujjatlar', href: '/qoidalar/kerakli-hujjatlar', icon: 'description', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', titleKey: 'rules.documents.title', descKey: 'rules.documents.desc', badgeKey: 'rules.documents.badge' },
]

export default function QoidalarPage() {
  const router = useRouter()
  const t = useI18n()

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200 font-sans">

      {/* DESKTOP SIDEBAR */}
      <QoidalarSidebar />

      <main className="lg:ml-72 min-h-screen pb-10">
        <header className="sticky top-0 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
            <div className="flex-1 max-w-xl relative">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white lg:hidden">{t('sidebar.rules')}</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button - Visible only on mobile */}
              <button onClick={() => router.back()} className="lg:hidden p-2 text-slate-500">
                <span className="material-icons-round">arrow_back</span>
              </button>
              <div className="hidden md:block">
                <LanguageSwitcher size="sm" />
              </div>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('rules.page.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400">{t('rules.page.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categoryConfig.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
                    <span className="material-icons-round text-2xl">{item.icon}</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">{t(item.badgeKey)}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors mb-2">{t(item.titleKey)}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{t(item.descKey)}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">{t('rules.page.detail')}</span>
                  <span className="material-icons-round text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
