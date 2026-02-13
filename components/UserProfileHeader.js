'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'

export default function UserProfileHeader() {
    const [initials, setInitials] = useState('')

    useEffect(() => {
        const getUserData = () => {
            // 1. Try to get from localStorage (fastest)
            const localData = localStorage.getItem('userData')
            if (localData) {
                try {
                    const parsed = JSON.parse(localData)
                    const name = parsed.name || parsed.email || parsed.phone || ''
                    if (name) {
                        return name.charAt(0).toUpperCase()
                    }
                } catch (e) {
                    console.error('Error parsing userData:', e)
                }
            }

            // 2. Fallback to Firebase auth user
            const user = auth.currentUser
            if (user) {
                const name = user.displayName || user.email || user.phoneNumber || ''
                if (name) {
                    return name.charAt(0).toUpperCase()
                }
            }

            return ''
        }

        const userInitials = getUserData()
        setInitials(userInitials)

        // Optional: Listen for auth changes if needed, but for header simple mount check is usually enough
        // or we can add a listener if we expect changes while on the page
    }, [])

    if (!initials) {
        // Fallback UI if no user is found (or while loading)
        return (
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
        )
    }

    return (
        <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-sky-500/20 ring-2 ring-white dark:ring-slate-800">
            {initials}
        </div>
    )
}
