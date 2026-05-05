'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardCheck, Search, Settings as SettingsIcon } from 'lucide-react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  
  const isActive = (path) => pathname === path || pathname.startsWith(path + '/')
  const isExactActive = (path) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#212936]/95 dark:bg-[#1e293b]/95 backdrop-blur-xl border-t border-[#313C50] dark:border-slate-800 z-50 flex items-center justify-around py-2 pb-safe lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.4)] transition-colors duration-200">
      <Link 
        href="/dashboard" 
        className={`p-2 flex flex-col items-center gap-1 transition-all ${
          isExactActive('/dashboard') 
          ? 'text-blue-500 scale-110 pb-1 border-b-2 border-blue-500' 
          : 'text-[#9AA4B2] hover:text-white active:scale-95'
        }`}
      >
        <Home className="w-[22px] h-[22px]" />
      </Link>
      
      <Link 
        href="/biletlar" 
        className={`p-2 flex flex-col items-center gap-1 transition-all ${
          isActive('/biletlar') 
          ? 'text-blue-500 scale-110 pb-1 border-b-2 border-blue-500' 
          : 'text-[#9AA4B2] hover:text-white active:scale-95'
        }`}
      >
        <ClipboardCheck className="w-[22px] h-[22px]" />
      </Link>
      
      <Link 
        href="/savollar" 
        className={`p-2 flex flex-col items-center gap-1 transition-all ${
          isActive('/savollar') 
          ? 'text-blue-500 scale-110 pb-1 border-b-2 border-blue-500' 
          : 'text-[#9AA4B2] hover:text-white active:scale-95'
        }`}
      >
        <Search className="w-[22px] h-[22px]" />
      </Link>
      
      <Link 
        href="/profil" 
        className={`p-2 flex flex-col items-center gap-1 transition-all ${
          isActive('/profil') 
          ? 'text-blue-500 scale-110 pb-1 border-b-2 border-blue-500' 
          : 'text-[#9AA4B2] hover:text-white active:scale-95'
        }`}
      >
        <SettingsIcon className="w-[22px] h-[22px]" />
      </Link>
    </nav>
  )
}
