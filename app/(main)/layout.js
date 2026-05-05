'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { usePathname } from 'next/navigation'
import MainSidebar from '@/components/MainSidebar'
import MobileBottomNav from '@/components/MobileBottomNav'

export default function MainLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Pages where we want to hide sidebar and bottom navigation
  const isTestPage = (pathname.startsWith('/biletlar/') && pathname !== '/biletlar') || 
                     pathname.startsWith('/exam') || 
                     (pathname.startsWith('/qoidalar/mavzu-testi/') && pathname !== '/qoidalar/mavzu-testi')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const currentToken = localStorage.getItem('userToken');
      const isLoggedIn = localStorage.getItem('isLoggedIn');

      if (!currentToken || isLoggedIn !== 'true') {
        localStorage.clear();
        router.push('/login');
        return;
      }
      setIsAuthorized(true)
    });

    return () => unsubscribe();
  }, [router])

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] flex items-center justify-center">
         <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 transition-colors duration-300 font-sans">
      {!isTestPage && <MainSidebar />}
      <div className={`flex-1 flex flex-col h-screen overflow-y-auto relative custom-scrollbar ${!isTestPage ? 'lg:ml-72 pb-16 lg:pb-0' : ''}`}>
        {children}
      </div>
      {!isTestPage && <MobileBottomNav />}
    </div>
  )
}
