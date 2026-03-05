'use client'

import { useState, useEffect, useRef } from 'react'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings, LogOut, User } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

export default function UserProfileHeader() {
    const router = useRouter()
    const [userData, setUserData] = useState({ name: '', email: '', picture: '' })
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const fetchUserData = async () => {
            // First check local storage for immediate render
            const localData = localStorage.getItem('userData')
            let localName = ''
            if (localData) {
                try {
                    const parsed = JSON.parse(localData)
                    localName = parsed.fullName || parsed.name || parsed.email || parsed.phone || ''
                    setUserData(prev => ({
                        ...prev,
                        name: localName,
                        email: parsed.email || '',
                        picture: parsed.picture ? (parsed.picture.startsWith('http') ? parsed.picture : `${API_URL}${parsed.picture}`) : ''
                    }))
                } catch (e) {
                    console.error('Error parsing userData:', e)
                }
            }

            // Then fetch from backend if authenticated
            const unsubscribe = auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const res = await fetch(`${API_URL}/api/users/profile/`)
                        if (res.ok) {
                            const data = await res.json()
                            setUserData({
                                name: data.fullName || user.displayName || localName || '',
                                email: data.email || user.email || '',
                                picture: data.picture ? (data.picture.startsWith('http') ? data.picture : `${API_URL}${data.picture}`) : ''
                            })
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }
            })

            return () => unsubscribe()
        }

        fetchUserData()

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        if (confirm('Hisobdan chiqishni xohlaysizmi?')) {
            await signOut(auth)
            localStorage.clear()
            router.push('/login')
        }
    }

    const initials = userData.name ? userData.name.charAt(0).toUpperCase() : '?'

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
            >
                {userData.picture ? (
                    <img src={userData.picture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    initials
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#1e2029] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-[60] animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-4 border-b border-slate-100 dark:border-white/5">
                        <p className="font-bold text-slate-800 dark:text-white truncate">
                            {userData.name || 'Foydalanuvchi'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {userData.email}
                        </p>
                    </div>

                    <div className="p-2">
                        <Link
                            href="/profil"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Profil Sozlamalari
                        </Link>

                        <button
                            onClick={() => {
                                setIsOpen(false)
                                handleLogout()
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1"
                        >
                            <LogOut className="w-4 h-4" />
                            Tizimdan chiqish
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
