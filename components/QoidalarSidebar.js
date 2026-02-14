'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function QoidalarSidebar() {
    const pathname = usePathname()

    const isActive = (path) => pathname === path || pathname.startsWith(path + '/')

    return (
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
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                            PravachiUZ
                        </span>
                    </Link>

                    <div className="flex items-center gap-3 text-sky-500 px-2">
                        <span className="material-icons-round text-2xl">traffic</span>
                        <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white leading-tight">Yo'l Harakati</span>
                    </div>
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
                        Qoidalar
                    </Link>
                    <Link
                        href="/biletlar"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/biletlar')
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="material-icons-round">quiz</span>
                        Testlar
                    </Link>
                    <Link
                        href="/qoidalar/yol-belgilari"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/qoidalar/yol-belgilari')
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="material-icons-round">warning</span>
                        Belgilar
                    </Link>
                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${pathname === '/dashboard'
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="material-icons-round">dashboard</span>
                        Dashboard
                    </Link>
                </nav>
            </div>
        </aside>
    )
}
