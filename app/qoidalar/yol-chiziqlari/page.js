'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import UserProfileHeader from '@/components/UserProfileHeader'

const categories = [
  {
    id: 'horizontal',
    name: 'Yotiq chiziqlar',
    count: 40,
    icon: 'horizontal',
    iconBg: 'bg-orange-500/10 text-orange-500',
  },
  {
    id: 'vertical',
    name: 'Tik chiziqlar',
    count: 9,
    icon: 'vertical',
    iconBg: 'bg-purple-500/10 text-purple-500',
  },
]

export default function YolChiziqlariPage() {
  const router = useRouter()

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center text-slate-600 dark:text-slate-400"
            >
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Yo&apos;l chiziqlari</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-sky-500/20">
              <UserProfileHeader />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800 p-6 h-[calc(100vh-64px)] sticky top-16 bg-white dark:bg-[#1e293b]/50">
          <nav className="space-y-1">
            <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Turlar</span>
            </div>
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/qoidalar/yol-chiziqlari/${cat.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
              >
                <span className="material-icons-round text-[20px] text-slate-400 group-hover:text-slate-500">
                  {cat.id === 'horizontal' ? 'more_horiz' : 'more_vert'}
                </span>
                <span className="line-clamp-1">{cat.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/qoidalar/yol-chiziqlari/${cat.id}`}
                className="group flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-none hover:border-sky-500/30 transition-all duration-300"
              >
                <div className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center ${cat.iconBg}`}>
                  {cat.id === 'horizontal' ? (
                    <span className="material-icons-round text-4xl">horizontal_rule</span>
                  ) : (
                    <span className="material-icons-round text-4xl transform rotate-90">horizontal_rule</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors mb-2">{cat.name}</h3>
                <p className="text-slate-500 dark:text-slate-400">{cat.count} ta chiziq namunasi</p>

                <div className="mt-8 flex items-center text-sm font-semibold text-sky-500 gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Ko&apos;rish <span className="material-icons-round text-sm">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
