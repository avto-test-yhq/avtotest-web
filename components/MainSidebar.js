'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { useLanguage } from '@/context/LanguageContext'
import FeedbackModal from '@/components/FeedbackModal'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import {
  Home,
  BookOpen,
  Search,
  Settings as SettingsIcon,
  ClipboardCheck,
  LogOut,
  MessageSquare,
  Bookmark,
  Lightbulb,
  History,
  Target
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz/api/v1'

export default function MainSidebar() {
  const pathname = usePathname()
  const { lang } = useLanguage()
  const t = useI18n()
  const router = useRouter()
  const [showFeedback, setShowFeedback] = useState(false)
  const [topics, setTopics] = useState([])

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_URL}/rules/topics?lang=${lang || 'uzl'}`)
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
  const isExactActive = (path) => pathname === path

  const handleLogout = async () => {
    if (confirm('Hisobdan chiqishni xohlaysizmi?')) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Logout xatolik:", error);
      }
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('loginMethod');
      localStorage.removeItem('phoneNumber');
      router.push('/login');
    }
  }

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col z-50 transition-colors duration-200">
        <div className="p-6 h-full flex flex-col">
          <div className="flex flex-col gap-6 mb-6">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md rounded-xl overflow-hidden flex items-center justify-center">
                <Image
                  src="/imgage/avtotest-logo.png"
                  alt="AvtoTest Logo"
                  width={24}
                  height={24}
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                Pravachi<span className="text-blue-500 font-extrabold text-2xl leading-none">UZ</span>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isExactActive('/dashboard')
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Home className="w-5 h-5" />
                {t('sidebar.dashboard') || 'Dashboard'}
              </Link>
              
              <Link
                href="/biletlar"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/biletlar')
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <ClipboardCheck className="w-5 h-5" />
                {t('sidebar.tests') || 'Biletlar'}
              </Link>

              <Link
                href="/savollar"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/savollar')
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Search className="w-5 h-5" />
                {t('nav.questions') || 'Savollar'}
              </Link>

              <div className="pt-6 pb-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-4">Mashqlar</span>
              </div>
              
              <Link
                href="/favorites"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/favorites')
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Bookmark className="w-5 h-5" />
                Sevimlilar
              </Link>

              <Link
                href="/mistakes"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/mistakes')
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-500'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Lightbulb className="w-5 h-5" />
                Xatolarim
              </Link>
              
              <Link
                href="/tarix"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/tarix')
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <History className="w-5 h-5" />
                {t('dashboard.stats.history') || 'Tarix'}
              </Link>

              <div className="pt-6 pb-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-4">Qoidalar</span>
              </div>

              <Link
                href="/qoidalar/mavzu-testi"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors group ${isActive('/qoidalar/mavzu-testi')
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Target className="w-5 h-5" />
                Mavzu Testi
                <span className="ml-auto text-[9px] font-black bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-full uppercase">Yangi</span>
              </Link>

              <Link
                href="/qoidalar"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isExactActive('/qoidalar')
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <BookOpen className="w-5 h-5" />
                {t('sidebar.rules') || 'Qoidalar'}
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

              <div className="pt-6 pb-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-4">Tizim</span>
              </div>

              <Link
                href="/profil"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/profil')
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <SettingsIcon className="w-5 h-5" />
                {t('dashboard.system.settings') || 'Profil Sozlamalari'}
              </Link>

            </nav>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => setShowFeedback(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MessageSquare className="w-5 h-5" />
              {t('feedback.title') || 'Fikr bildirish'}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
            >
              <LogOut className="w-5 h-5" />
              {t('dashboard.logout') || 'Chiqish'}
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
