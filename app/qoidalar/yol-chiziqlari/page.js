'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import UserProfileHeader from '@/components/UserProfileHeader'
import QoidalarHeader from '@/components/QoidalarHeader'

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
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <QoidalarHeader title="Yo'l chiziqlari" />

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
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/qoidalar/yol-chiziqlari/${cat.id}`}
                className="group flex flex-col items-center justify-center text-center p-6 md:p-8 rounded-[24px] md:rounded-3xl bg-[#212936] md:bg-white md:dark:bg-[#1e293b] border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 hover:shadow-lg dark:hover:shadow-none hover:border-blue-500/30 md:hover:border-sky-500/30 transition-all duration-300 active:scale-[0.98]"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[16px] md:rounded-2xl mb-4 md:mb-6 flex items-center justify-center ${cat.iconBg}`}>
                  {cat.id === 'horizontal' ? (
                    <span className="material-icons-round text-3xl md:text-4xl">horizontal_rule</span>
                  ) : (
                    <span className="material-icons-round text-3xl md:text-4xl transform rotate-90">horizontal_rule</span>
                  )}
                </div>
                <h3 className="text-[18px] md:text-xl font-bold text-white md:text-slate-900 md:dark:text-white group-hover:text-blue-500 md:group-hover:text-sky-500 transition-colors mb-2">{cat.name}</h3>
                <p className="text-[13px] md:text-sm text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400">{cat.count} ta chiziq namunasi</p>

                <div className="mt-4 md:mt-8 flex items-center text-[13px] md:text-sm font-bold text-blue-500 md:text-sky-500 gap-1 md:opacity-0 group-hover:opacity-100 transition-all md:transform md:translate-y-2 md:group-hover:translate-y-0">
                  Ko'rish <span className="material-icons-round text-[16px] md:text-sm relative top-[1px]">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
