'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Firebase importlari
import { auth, googleProvider } from '@/lib/firebase'
import { signInWithPopup, signInWithCustomToken, onAuthStateChanged } from "firebase/auth"

export default function LoginPage() {
  const router = useRouter()
  
  // Rejimlar: 'login-pass' | 'phone-sms' | 'verify-sms' | 'complete-profile'
  const [viewMode, setViewMode] = useState('login-pass')
  const [phone, setPhone] = useState('') 
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

  // ==========================================
  // 0. AUTH STATE TEKSHIRISH (Avtomatik kirish)
  // ==========================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Tokenni yangilaymiz
          const token = await user.getIdToken();
          localStorage.setItem('userToken', token);
          
          // Agar foydalanuvchi allaqachon kirgan bo'lsa, dashboardga o'tkazamiz
          const isLoggedIn = localStorage.getItem('isLoggedIn');
          if (isLoggedIn === 'true') {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error("Token xatosi:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ==========================================
  // 1. GOOGLE ORQALI KIRISH (TUZATILDI)
  // ==========================================
  const loginWithGoogle = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Tokenni olamiz
      const idToken = await user.getIdToken();

      console.log("Google User:", user.email);
      
      // Backendga token yuboramiz
      await sendTokenToBackend(idToken);
      
    } catch (error) {
      console.error(error);
      setErrorMsg("Google bilan kirishda xatolik yuz berdi.");
      setLoading(false);
    }
  }

  // ==========================================
  // 1. PAROL BILAN KIRISH
  // ==========================================
  const handlePasswordLogin = async () => {
    setErrorMsg('')
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 9) {
      setErrorMsg("Telefon raqamni to'liq kiriting")
      return
    }
    if (!password.trim()) {
      setErrorMsg("Parolni kiriting")
      return
    }
    setLoading(true)
    const phoneNumber = `+998${cleanPhone}`
    try {
      const res = await fetch(`${API_URL}/api/auth/login-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, password })
      })
      const data = await res.json()
      if (data.success && data.token) {
        const userCredential = await signInWithCustomToken(auth, data.token)
        const firebaseToken = await userCredential.user.getIdToken()
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userToken', firebaseToken)
        localStorage.setItem('loginMethod', 'phone')
        localStorage.setItem('phoneNumber', phoneNumber)
        if (data.user) localStorage.setItem('userData', JSON.stringify(data.user))
        router.push('/dashboard')
      } else {
        setErrorMsg(data.message || "Telefon yoki parol noto'g'ri")
      }
    } catch (err) {
      setErrorMsg("Tizim xatosi")
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // 2. SMS KOD YUBORISH (Ro'yxatdan o'tish / Parolni unutdim)
  // ==========================================
  const sendSmsCode = async () => {
    setErrorMsg('')
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 9) {
      setErrorMsg("Telefon raqamni to'liq kiriting")
      return
    }
    setLoading(true)
    const phoneNumber = `+998${cleanPhone}`
    try {
      const res = await fetch(`${API_URL}/api/auth/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, type: 'signup' })
      })
      const data = await res.json()
      if (res.ok) {
        setViewMode('verify-sms')
        setOtp('')
      } else {
        setErrorMsg(data.message || "SMS yuborishda xatolik")
      }
    } catch (error) {
      setErrorMsg("Server bilan aloqa yo'q")
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // 3. SMS KODNI TEKSHIRISH (Yangi user bo'lsa -> Complete Profile)
  // ==========================================
  const verifyOtp = async () => {
    setErrorMsg('')
    const cleanPhone = phone.replace(/\D/g, '')
    const phoneNumber = `+998${cleanPhone}`
    if (otp.length !== 4) {
      setErrorMsg("Kod 4 xonali bo'lishi kerak")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, code: otp })
      })
      const data = await res.json()
      if (data.success) {
        if (data.isNewUser) {
          setViewMode('complete-profile')
        } else {
          if (data.token) {
            const userCredential = await signInWithCustomToken(auth, data.token)
            const firebaseToken = await userCredential.user.getIdToken()
            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('userToken', firebaseToken)
            localStorage.setItem('loginMethod', 'phone')
            localStorage.setItem('phoneNumber', phoneNumber)
            if (data.user) localStorage.setItem('userData', JSON.stringify(data.user))
            router.push('/dashboard')
          } else {
            setErrorMsg(data.message || "Kod noto'g'ri")
          }
        }
      } else {
        setErrorMsg(data.message || "Kod noto'g'ri")
      }
    } catch (error) {
      setErrorMsg("Tizim xatosi")
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // 4. PROFILNI TO'LDIRISH (Yangi user)
  // ==========================================
  const completeProfile = async () => {
    setErrorMsg('')
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Ism va familiyani kiriting")
      return
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setErrorMsg("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
      return
    }
    setLoading(true)
    const phoneNumber = `+998${phone.replace(/\D/g, '')}`
    try {
      const res = await fetch(`${API_URL}/api/auth/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password: newPassword
        })
      })
      const data = await res.json()
      if (data.success) {
        if (data.token) {
          const userCredential = await signInWithCustomToken(auth, data.token)
          const firebaseToken = await userCredential.user.getIdToken()
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('userToken', firebaseToken)
          localStorage.setItem('loginMethod', 'phone')
          localStorage.setItem('phoneNumber', phoneNumber)
          if (data.user) localStorage.setItem('userData', JSON.stringify(data.user))
        }
        router.push('/dashboard')
      } else {
        setErrorMsg(data.message || "Saqlashda xatolik")
      }
    } catch (err) {
      setErrorMsg("Saqlashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // 4. GOOGLE TOKENNI BAZAGA YUBORISH (TUZATILDI)
  // ==========================================
  const sendTokenToBackend = async (idToken) => {
    try {
      // MUHIM: Backend endi { token: ... } kutmoqda
      const res = await fetch(`${API_URL}/api/auth/verify-token`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }) 
      });

      const data = await res.json();
      
      if (res.ok) {
        // Muvaffaqiyatli saqlash
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userToken', idToken);
        localStorage.setItem('loginMethod', 'google');
        
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user));
        }
        
        router.push('/dashboard');
      } else {
        setErrorMsg(data.message || "Serverda xatolik yuz berdi");
        setLoading(false);
      }
    } catch (err) {
      console.error("Backend Error:", err);
      setErrorMsg("Serverga ulanib bo'lmadi.");
      setLoading(false);
    }
  }

  // Input formatlash (90 123 45 67)
  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    if (rawValue.length > 9) return
    
    let formattedValue = rawValue
    if (rawValue.length > 2) formattedValue = `${rawValue.slice(0, 2)} ${rawValue.slice(2)}`
    if (rawValue.length > 5) formattedValue = `${rawValue.slice(0, 2)} ${rawValue.slice(2, 5)} ${rawValue.slice(5)}`
    if (rawValue.length > 7) formattedValue = `${rawValue.slice(0, 2)} ${rawValue.slice(2, 5)} ${rawValue.slice(5, 7)} ${rawValue.slice(7)}`
    
    setPhone(formattedValue)
  }

  return (
    <>
      <div className="fixed inset-0 bg-night-950 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-[128px] animate-pulse"></div>
         <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10 font-sans text-slate-200">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-col items-center cursor-pointer group mb-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-brand-blue to-brand-cyan rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/20 mb-3 group-hover:scale-110 transition-transform">
                 <span className="text-3xl">🚗</span> 
              </div>
              <span className="font-heading font-bold text-3xl text-white tracking-tight">
                AvtoTest <span className="text-brand-cyan">AI</span>
              </span>
            </Link>
            <h1 className="font-medium text-lg text-slate-300">Haydovchilik guvohnomasi imtihoniga tayyorgarlik</h1>
          </div>

          <div className="glass-card bg-night-900/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              {viewMode === 'complete-profile' ? "Ma'lumotlaringiz" : "Tizimga kirish"}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {errorMsg}
              </div>
            )}

            {/* 1. LOGIN: Telefon + Parol → Kirish → yoki → Google → Parolni unutdim */}
            {viewMode === 'login-pass' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">TELEFON RAQAM</label>
                <div className="flex bg-night-800 rounded-xl border border-white/10 overflow-hidden mb-4 focus-within:border-brand-blue/50 transition-colors">
                  <span className="py-3.5 pl-4 pr-2 text-slate-400 bg-night-900/50 border-r border-white/5 flex items-center select-none w-[120px]">🇺🇿 +998</span>
                  <input type="tel" value={phone} onChange={handlePhoneChange} placeholder="90 123 45 67" disabled={loading} className="bg-transparent text-white w-full py-3 px-3 outline-none font-medium placeholder:text-slate-600" />
                </div>
                <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">PAROL</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parol" disabled={loading} className="w-full bg-night-800 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-blue/50 mb-4 placeholder:text-slate-600" />
                <button onClick={handlePasswordLogin} disabled={loading || phone.replace(/\D/g, '').length < 9 || !password.trim()} className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-blue/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-4">
                  {loading ? 'Kirilmoqda...' : 'Kirish'}
                </button>
                <div className="flex items-center mb-6">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="px-3 text-xs text-slate-500 uppercase">yoki</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
                <button type="button" onClick={loginWithGoogle} disabled={loading} className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center mb-4 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <span className="animate-pulse">Bog'lanmoqda...</span> : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google orqali davom etish
                    </>
                  )}
                </button>
                <div className="text-center">
                  <button type="button" onClick={() => { setViewMode('phone-sms'); setErrorMsg(''); }} className="text-xs text-brand-cyan hover:text-white transition-colors">
                    Parolni unutdingizmi?
                  </button>
                </div>
              </div>
            )}

            {/* 2. SIGNUP: Google → yoki → Telefon → Kodni olish → Ortga */}
            {viewMode === 'phone-sms' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <p className="text-slate-400 text-sm text-center mb-4">Do&apos;stlaringiz bilan testlarni yechish uchun ro&apos;yxatdan o&apos;ting.</p>
                <button type="button" onClick={loginWithGoogle} disabled={loading} className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center mb-4 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#fff"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                  </svg>
                  {loading ? 'Bog\'lanmoqda...' : 'Google orqali kirish'}
                </button>
                <div className="flex items-center mb-6">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="px-3 text-xs text-slate-500 uppercase">yoki</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
                <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">TELEFON RAQAMINGIZ</label>
                <div className="flex bg-night-800 rounded-xl border border-white/10 overflow-hidden mb-4 focus-within:border-brand-blue/50 transition-colors">
                  <span className="py-3.5 pl-4 pr-2 text-slate-400 bg-night-900/50 border-r border-white/5 flex items-center select-none w-[120px]">🇺🇿 +998</span>
                  <input type="tel" value={phone} onChange={handlePhoneChange} placeholder="90 123 45 67" disabled={loading} className="bg-transparent text-white w-full py-3 px-3 outline-none font-medium placeholder:text-slate-600" />
                </div>
                <button onClick={sendSmsCode} disabled={loading || phone.replace(/\D/g, '').length < 9} className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-blue/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-4">
                  {loading ? 'SMS yuborilmoqda...' : "Ro'yxatdan o'tish"}
                </button>
                <div className="text-center">
                  <button type="button" onClick={() => { setViewMode('login-pass'); setErrorMsg(''); }} className="text-xs text-slate-400 hover:text-white transition-colors">
                    Ortga (Kirish sahifasiga)
                  </button>
                </div>
              </div>
            )}

            {/* 3. KODNI KIRITISH (Signup step 2) */}
            {viewMode === 'verify-sms' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                <p className="text-slate-400 text-xs mb-2">+998 {phone} raqamiga kod yuborildi</p>
                <label className="block text-xs font-bold text-slate-400 mb-2">SMS Kod (4 xonali)</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} disabled={loading} placeholder="0000" maxLength={4} autoFocus className="w-full bg-night-800 border border-white/10 rounded-xl py-3 text-center text-2xl tracking-[0.4em] mb-4 font-mono text-white outline-none focus:border-brand-cyan/50 transition-all placeholder:text-slate-600" />
                <button onClick={verifyOtp} disabled={loading || otp.length < 4} className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-blue/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-4">
                  {loading ? 'Tasdiqlanmoqda...' : 'Tasdiqlash'}
                </button>
                <button type="button" onClick={() => { setViewMode('phone-sms'); setOtp(''); setErrorMsg(''); }} className="text-xs text-brand-cyan hover:text-white transition-colors">
                  Raqamni o&apos;zgartirish
                </button>
              </div>
            )}

            {/* 4. PROFIL TO'LDIRISH (Yangi user) */}
            {viewMode === 'complete-profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <p className="text-slate-400 text-sm mb-4">Iltimos, ismingiz va yangi parol yarating.</p>
                <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">ISM</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ism" disabled={loading} className="w-full bg-night-800 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-blue/50 mb-4 placeholder:text-slate-600" />
                <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">FAMILIYA</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Familiya" disabled={loading} className="w-full bg-night-800 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-blue/50 mb-4 placeholder:text-slate-600" />
                <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">YANGI PAROL</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Kamida 6 ta belgi" disabled={loading} className="w-full bg-night-800 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-blue/50 mb-6 placeholder:text-slate-600" />
                <button onClick={completeProfile} disabled={loading || !firstName.trim() || !lastName.trim() || newPassword.length < 6} className="w-full bg-brand-cyan hover:bg-cyan-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-cyan/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Saqlanmoqda...' : 'Saqlash va Kirish'}
                </button>
              </div>
            )}
          </div>

          {/* Switcher: Login ⟷ Ro'yxatdan o'tish */}
          <div className="glass-card bg-night-900/60 backdrop-blur-xl rounded-3xl p-5 border border-white/10 flex items-center justify-center mt-4">
            <p className="text-sm text-slate-300">
              {viewMode === 'login-pass' ? "Hisobingiz yo'qmi?" : "Hisobingiz bormi?"}
              <button
                type="button"
                onClick={() => {
                  setViewMode(viewMode === 'login-pass' ? 'phone-sms' : 'login-pass')
                  setOtp('')
                  setErrorMsg('')
                }}
                className="text-brand-cyan font-semibold ml-1 hover:text-white transition-colors"
              >
                {viewMode === 'login-pass' ? "Ro'yxatdan o'tish" : 'Kirish'}
              </button>
            </p>
          </div>
          
          <div className="text-center mt-6 text-xs text-slate-500">
             &copy; 2026 AvtoTest AI. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </div>
    </>
  )
}