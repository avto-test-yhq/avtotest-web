/**
 * useAuth - Markaziy authentication hook
 *
 * Firebase (Google) va telefon+parol orqali kirgan foydalanuvchilarni
 * bir xil usulda boshqaradi.
 *
 * Qaytaradi:
 *   - isLoggedIn: Boolean - foydalanuvchi tizimga kirganmi
 *   - isLoading: Boolean - tekshirilmoqda
 *   - user: Object|null - foydalanuvchi ma'lumotlari
 *   - token: String|null - JWT token
 */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  const checkAuth = useCallback(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null
    const savedIsLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') : null
    const savedUserData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null

    if (savedToken && savedIsLoggedIn === 'true') {
      setToken(savedToken)
      setIsLoggedIn(true)
      if (savedUserData) {
        try {
          const parsed = JSON.parse(savedUserData)
          setUser(parsed)
        } catch {
          setUser(null)
        }
      }
      return true
    }
    return false
  }, [])

  useEffect(() => {
    // Avval localStorage dan tekshiramiz (tez, sinxron)
    const hasLocalAuth = checkAuth()

    // Firebase auth state ni kuzatamiz
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Firebase orqali kirgan (Google)
        const savedToken = localStorage.getItem('userToken')
        if (savedToken) {
          setToken(savedToken)
          setIsLoggedIn(true)
          // Firebase user + localStorage userData ni birlashtirish
          const savedUserData = localStorage.getItem('userData')
          if (savedUserData) {
            try {
              setUser(JSON.parse(savedUserData))
            } catch {
              setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName })
            }
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName })
          }
        } else if (!hasLocalAuth) {
          // Firebase user bor lekin token yo'q - login sahifasiga yo'naltiriladi (chaqiruvchi sahifa hal qiladi)
          setIsLoggedIn(false)
          setUser(null)
          setToken(null)
        }
      } else {
        // Firebase user yo'q - telefon login tekshiramiz
        checkAuth()
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [checkAuth])

  return { isLoggedIn, isLoading, user, token }
}
