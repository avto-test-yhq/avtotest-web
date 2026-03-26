'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { apiFetch } from '@/lib/apiClient'

const defaultSettings = {
    autoNext: true,
    showCorrect: true,
    showExplanation: false,
    shuffleOptions: false,
    questionCount: 10,
    promoUnlocked: false, // Promo kod orqali barcha biletlarni ochish
}

const ExamSettingsContext = createContext({
    settings: defaultSettings,
    updateSettings: () => { },
    loading: true
})

export const useExamSettings = () => useContext(ExamSettingsContext)

export function ExamSettingsProvider({ children }) {
    const [settings, setSettings] = useState(defaultSettings)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

    // 1. Load initial settings from localStorage on mount
    useEffect(() => {
        try {
            const local = localStorage.getItem('examSettings')
            if (local) {
                setSettings(prev => ({ ...prev, ...JSON.parse(local) }))
            }
        } catch (e) {
            console.error('Error loading settings from localStorage', e)
        } finally {
            setLoading(false)
        }
    }, [])

    // 2. Sync with backend when user logs in
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser)
            const loginMethod = localStorage.getItem('loginMethod');
      if (currentUser || loginMethod === 'phone') {
                try {
                    const res = await apiFetch(`/users/settings`)
                    if (res.ok) {
                        const serverSettings = await res.json()
                        // Merge server settings with current (server takes precedence if valid)
                        setSettings(prev => {
                            const merged = { ...prev, ...serverSettings }
                            localStorage.setItem('examSettings', JSON.stringify(merged))
                            return merged
                        })
                    }
                } catch (e) {
                    console.error('Error fetching settings from backend', e)
                }
            }
        })
        return () => unsub()
    }, [])

    // 3. Update settings function
    const updateSettings = async (newSettings) => {
        const updated = { ...settings, ...newSettings }
        setSettings(updated)

        // Save to localStorage
        try {
            localStorage.setItem('examSettings', JSON.stringify(updated))
        } catch (error) {
            console.error('Error saving to localStorage', error)
        }

        // Save to Backend if logged in
        if (user) {
            try {
                await apiFetch(`/users/settings`, {
                    method: 'PUT',
                    body: JSON.stringify(newSettings)
                })
            } catch (e) {
                console.error('Error saving settings to backend', e)
            }
        }
    }

    return (
        <ExamSettingsContext.Provider value={{ settings, updateSettings, loading }}>
            {children}
        </ExamSettingsContext.Provider>
    )
}
