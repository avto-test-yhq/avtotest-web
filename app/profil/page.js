'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Cropper from 'react-easy-crop'
import { useI18n } from '@/lib/i18n'
import { apiFetch } from '@/lib/apiClient'
import {
    LayoutDashboard,
    User,
    Shield,
    Bell,
    CreditCard,
    Settings,
    LogOut,
    ChevronDown,
    BadgeInfo,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Map,
    Building2,
    Save,
    Edit2,
    Loader2,
    Home,
    Search,
    ClipboardCheck,
    BookOpen,
    X,
    Check
} from 'lucide-react'

const VILOYATLAR = [
    "Andijon viloyati",
    "Buxoro viloyati",
    "Farg'ona viloyati",
    "Jizzax viloyati",
    "Xorazm viloyati",
    "Namangan viloyati",
    "Navoiy viloyati",
    "Qashqadaryo viloyati",
    "Qoraqalpog'iston Respublikasi",
    "Samarqand viloyati",
    "Sirdaryo viloyati",
    "Surxondaryo viloyati",
    "Toshkent viloyati",
    "Toshkent shahri"
]

const TUMANLAR = {
    "Toshkent shahri": ["Olmazor", "Mirobod", "Shayxontohur", "Yashnobod", "Yunusobod", "Yakkasaroy", "Chilonzor", "Mirzo Ulug'bek", "Uchtepa", "Sirg'ali", "Bektemir", "Yangihayot"],
    "Toshkent viloyati": ["Zangiota", "Qibray", "Bo'stonliq", "Parkent", "O'rta Chirchiq", "Quyi Chirchiq", "Chinoz", "Yangiyo'l", "Toshkent", "Yuqori Chirchiq", "Quyichirchiq", "Nurafshon", "Olmaliq", "Angren", "Chirchiq"],
    "Samarqand viloyati": ["Samarqand shahri", "Urgut", "Paxtachi", "Kattaqo'rg'on", "Ishtixon", "Oqdaryo", "Jomboy", "Toyloq", "Pasdarg'om", "Narpay", "Payariq", "Qo'shrabot", "Bulung'ur", "Samarqand"],
    "Andijon viloyati": ["Andijon shahri", "Asaka", "Shahrixon", "Marhamat", "Buloqboshi", "Xo'jaobod", "Jalaquduq", "Qo'rg'ontepa", "Baliqchi", "Oltinko'l", "Bo'z", "Ulug'nor", "Izboskan", "Paxtaobod", "Andijon"],
    "Buxoro viloyati": ["Buxoro shahri", "G'ijduvon", "Vobkent", "Shofirkon", "Peshku", "Romitan", "Jondor", "Kogon", "Qorovulbozor", "Olot", "Qorako'l"],
    "Boshqa": []
}

export default function ProfilPage() {
    const router = useRouter()
    const t = useI18n()

    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Form fields
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [hasPhoneFromDB, setHasPhoneFromDB] = useState(false)
    const [avatar, setAvatar] = useState(null)
    const [originalAvatar, setOriginalAvatar] = useState(null)

    // Crop states
    const [imageSrc, setImageSrc] = useState(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)

    // New fields
    const [dobDay, setDobDay] = useState('')
    const [dobMonth, setDobMonth] = useState('')
    const [dobYear, setDobYear] = useState('')
    const [region, setRegion] = useState('')
    const [district, setDistrict] = useState('')

    const [message, setMessage] = useState({ text: '', type: '' })
    const fileInputRef = useRef(null)

    // Helper functions for dates
    const days = Array.from({ length: 31 }, (_, i) => i + 1)
    const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"]
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

    const availableDistricts = TUMANLAR[region] || TUMANLAR["Boshqa"]

    useEffect(() => {
        const fetchUserData = async (user) => {
            try {
                // 1. Dastlab LocalStorage dan olamiz (tezkor ko'rsatish uchun)
                const localData = localStorage.getItem('userData')
                if (localData) {
                    try {
                        const parsed = JSON.parse(localData)
                        setFullName(parsed.fullName || parsed.name || user.displayName || '')
                        setEmail(parsed.email || user.email || '')

                        const p = parsed.phoneNumber || parsed.phone || user.phoneNumber || '';
                        setPhoneNumber(p)
                        if (p) {
                            setHasPhoneFromDB(true)
                        }

                        if (parsed.picture) {
                            const picUrl = parsed.picture.startsWith('http') ? parsed.picture : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'}${parsed.picture}`
                            setAvatar(picUrl)
                            setOriginalAvatar(picUrl)
                        }
                    } catch (e) { console.error('LocalStorage parse error:', e) }
                }

                // 2. Keyin API dan eng oxirgi ma'lumotni tortamiz (agar kiritilgan bo'lsa)
                const res = await apiFetch(`/users/profile`)
                if (res.ok) {
                    const data = await res.json()

                    if (data.fullName || data.name) setFullName(data.fullName || data.name)
                    if (data.email) setEmail(data.email)
                    if (data.phoneNumber) {
                        setPhoneNumber(data.phoneNumber)
                        setHasPhoneFromDB(true)
                    }

                    if (data.picture) {
                        const picUrl = data.picture.startsWith('http') ? data.picture : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'}${data.picture}`
                        setAvatar(picUrl)
                        setOriginalAvatar(picUrl)
                    }

                    if (data.region) setRegion(data.region)
                    if (data.district) setDistrict(data.district)

                    if (data.dob) {
                        const parts = data.dob.split('-')
                        if (parts.length === 3) {
                            setDobDay(parts[0])
                            setDobMonth(parts[1])
                            setDobYear(parts[2])
                        }
                    }
                } else if (!localData) {
                    setFullName(user.displayName || '')
                    setEmail(user.email || '')
                    const p = user.phoneNumber || '';
                    setPhoneNumber(p)
                    if (p) setHasPhoneFromDB(true)
                }
            } catch (error) {
                console.error("Profil ma'lumotlarini olishda xato:", error)
            } finally {
                setLoading(false)
            }
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            const userToken = localStorage.getItem('userToken');
            if (!userToken) {
                router.push('/login')
                return
            }
            setCurrentUser(user)
            await fetchUserData(user)
        })

        return () => unsubscribe()
    }, [router])

    const handleLogout = async () => {
        if (confirm('Hisobdan chiqishni xohlaysizmi?')) {
            await signOut(auth)
            localStorage.clear()
            router.push('/login')
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !currentUser) return

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ text: 'Rasm hajmi 5MB dan oshmasligi kerak', type: 'error' })
            return
        }

        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            setImageSrc(reader.result)
            setIsCropModalOpen(true)
        }

        // Reset input so choosing the same file again triggers onChange
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    // Helper to generate a Blob from the cropped area
    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = new window.Image()
        image.src = imageSrc
        await new Promise((resolve) => {
            image.onload = resolve
        })

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/jpeg')
        })
    }

    const handleUploadCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels || !currentUser) return

        setUploading(true)
        setMessage({ text: '', type: '' })

        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
            // Create a File from the Blob
            const file = new File([croppedBlob], `avatar-${currentUser.uid}.jpg`, { type: 'image/jpeg' })

            const formData = new FormData()
            formData.append('avatar', file)

            // apiFetch ni rasm uchun ishlatsak (multipart/form-data): Headerlarni avto qoldirish uchun content-type berilmaydi
            const res = await apiFetch(`/users/upload-avatar`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': undefined
                }
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ text: 'Rasm muvaffaqiyatli yuklandi', type: 'success' })
                const actAvatar = data.picture.startsWith('http') ? data.picture : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'}${data.picture}`
                setAvatar(actAvatar)
                setOriginalAvatar(actAvatar)

                const lpData = localStorage.getItem('userData')
                if (lpData) {
                    try {
                        const parsed = JSON.parse(lpData)
                        parsed.picture = data.picture
                        localStorage.setItem('userData', JSON.stringify(parsed))
                    } catch (e) { }
                }

                setIsCropModalOpen(false)
                setImageSrc(null)
            } else {
                setMessage({ text: data.message || 'Rasm yuklashda xatolik', type: 'error' })
            }
        } catch (err) {
            console.error(err)
            setMessage({ text: 'Tarmoq xatosi (rasm yuklanmadi)', type: 'error' })
        } finally {
            setUploading(false)
        }
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        if (!currentUser) return

        if (!fullName.trim()) {
            setMessage({ text: 'Iltimos, ismingizni kiriting', type: 'error' })
            return
        }

        setSaving(true)
        setMessage({ text: '', type: '' })

        const dobString = (dobDay && dobMonth && dobYear) ? `${dobDay}-${dobMonth}-${dobYear}` : ''

        try {
            const res = await apiFetch(`/users/profile`, {
                method: 'PUT',
                body: JSON.stringify({
                    fullName,
                    dob: dobString,
                    region,
                    district,
                    phoneNumber: Number(phoneNumber) ? `+998${phoneNumber.replace('+998', '')}` : phoneNumber
                })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ text: 'Profil muvaffaqiyatli yangilandi!', type: 'success' })
                const lpData = localStorage.getItem('userData')
                if (lpData) {
                    try {
                        const parsed = JSON.parse(lpData)
                        parsed.name = fullName
                        parsed.fullName = fullName
                        localStorage.setItem('userData', JSON.stringify(parsed))
                    } catch (e) { }
                }
            } else {
                setMessage({ text: data.message || 'Xatolik yuz berdi', type: 'error' })
            }
        } catch (err) {
            console.error(err)
            setMessage({ text: 'Tarmoq xatosi', type: 'error' })
        } finally {
            setSaving(false)
            setTimeout(() => setMessage({ text: '', type: '' }), 5000)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="font-display bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen overflow-hidden flex flex-col md:flex-row relative z-0">
            {/* Custom Styles Injected */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .glass-panel {
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                }
                .dark .glass-panel {
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.9);
                }
                .dark .glass-card {
                    background: rgba(30, 41, 59, 0.4);
                }
                .blob {
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0) 70%);
                    filter: blur(60px);
                    z-index: -1;
                }
                input:focus, select:focus {
                    outline: none;
                    border-color: #2563eb !important;
                    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
                }
                /* Hide scrollbar for cleaner look */
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.5);
                    border-radius: 10px;
                }
            `}} />

            <div className="blob top-[-10%] left-[-10%] pointer-events-none"></div>
            <div className="blob bottom-[-10%] right-[-10%] pointer-events-none"></div>

            <div className="flex h-screen w-full p-0 md:p-4 gap-4 z-10 w-full flex-col md:flex-row pb-20 md:pb-4">

                {/* Desktop Sidebar Based on HTML Structure */}
                <aside className="w-72 glass-panel rounded-3xl hidden md:flex flex-col p-6 space-y-8 h-full flex-shrink-0">
                    <div className="flex items-center gap-3 px-2">
                        <Link href="/dashboard" className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden">
                                <Image src="/imgage/avtotest-logo.png" alt="Logo" width={32} height={32} className="object-contain" />
                            </div>
                            <h1 className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">PravachiUZ</h1>
                        </Link>
                    </div>

                    <nav className="flex-1 space-y-2">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                            <LayoutDashboard className="w-5 h-5" />
                            <span>{t('nav.dashboard') || 'Bosh sahifa'}</span>
                        </Link>

                        <Link href="/qoidalar" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                            <BookOpen className="w-5 h-5" />
                            <span>{t('nav.rules') || 'Qoidalar'}</span>
                        </Link>

                        <Link href="/biletlar" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                            <ClipboardCheck className="w-5 h-5" />
                            <span>{t('nav.tickets') || 'Biletlar'}</span>
                        </Link>

                        <Link href="/savollar" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                            <Search className="w-5 h-5" />
                            <span>{t('nav.questions') || 'Savollar'}</span>
                        </Link>

                        <div className="my-4 pt-4 border-t border-slate-200 dark:border-white/10"></div>

                        <Link href="/profil" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white transition-all shadow-lg shadow-primary/20 font-medium">
                            <User className="w-5 h-5" />
                            <span>Profil</span>
                        </Link>
                    </nav>

                    <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all font-medium">
                            <LogOut className="w-5 h-5" />
                            <span>Chiqish</span>
                        </button>
                    </div>
                </aside>

                <main className="flex-1 md:glass-panel md:rounded-3xl overflow-y-auto relative flex flex-col h-full w-full">
                    {/* Header */}
                    <header className="flex items-center justify-between p-6 sm:p-8 border-b border-[#313C50] md:border-slate-200 md:dark:border-white/5 sticky top-0 z-20 bg-[#161c24]/90 md:backdrop-blur-xl md:bg-white/40 md:dark:bg-slate-900/60 transition-colors">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white md:text-slate-900 md:dark:text-white">Foydalanuvchi ma'lumotlari</h2>
                            <p className="text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 text-xs sm:text-sm mt-1">Shaxsiy ma'lumotlaringizni shu yerda boshqaring</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="hidden sm:block">
                                <LanguageSwitcher size="sm" />
                            </div>
                            <div className="hidden sm:block">
                                <ThemeToggle size="sm" />
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#212936] md:bg-slate-200 md:dark:bg-white/10 flex items-center justify-center border border-[#313C50] md:border-white/5 text-white md:text-slate-600 md:dark:text-slate-300">
                                <Bell className="w-5 h-5" />
                            </div>
                        </div>
                    </header>

                    <div className="p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-8 flex-1">

                        {/* Profile Summary Card */}
                        <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-[#212936] md:glass-card rounded-[24px] border border-[#313C50] md:border-none">
                            <div className="relative group flex-shrink-0">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#161c24] md:bg-slate-200 md:dark:bg-slate-800 border-4 border-[#313C50] md:border-white md:dark:border-slate-700/50 flex items-center justify-center overflow-hidden shadow-lg">
                                    {avatar ? (
                                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-[#9AA4B2] md:text-slate-400" />
                                    )}
                                </div>

                                <button onClick={handleAvatarClick} disabled={uploading} className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform disabled:opacity-50">
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                                </button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/png, image/jpeg, image/webp"
                                    className="hidden"
                                />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white md:text-slate-800 md:dark:text-white truncate">
                                    {fullName || 'Foydalanuvchi'}
                                </h3>
                                <p className="text-sm sm:text-base text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 truncate">
                                    {email || phoneNumber || 'Email/Raqam kiritilmagan'}
                                </p>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'error' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20' : 'bg-green-50 dark:bg-green-500/10 text-green-600 border-green-200 dark:border-green-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSaveProfile} className="space-y-8 pb-10">
                            {/* Personal Information Section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <BadgeInfo className="w-5 h-5" />
                                    <h4 className="font-semibold uppercase tracking-wider text-xs">Shaxsiy ma'lumotlar</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white md:text-slate-600 md:dark:text-slate-400">
                                            <User className="w-4 h-4 text-[#9AA4B2]" />
                                            To'liq ism <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-[#212936] md:bg-white md:dark:bg-white/5 border border-[#313C50] md:border-slate-200 md:dark:border-white/10 rounded-[16px] px-5 py-3 text-white md:text-slate-900 md:dark:text-slate-100 placeholder:text-[#9AA4B2] md:placeholder:text-slate-400 md:dark:placeholder:text-slate-600 focus:ring-blue-500/20 transition-all shadow-sm"
                                            placeholder="Ism va Familya"
                                            type="text"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white md:text-slate-600 md:dark:text-slate-400">
                                            <Mail className="w-4 h-4 text-[#9AA4B2]" />
                                            Email
                                        </label>
                                        <input
                                            value={email}
                                            disabled
                                            className="w-full bg-[#161c24] md:bg-slate-100 md:dark:bg-white/5 border border-[#313C50] md:border-slate-200 md:dark:border-white/10 rounded-[16px] px-5 py-3 text-[#9AA4B2] md:text-slate-500 placeholder:text-[#9AA4B2] md:placeholder:text-slate-400 md:dark:placeholder:text-slate-600 focus:ring-blue-500/20 transition-all cursor-not-allowed shadow-sm"
                                            placeholder="email@example.com"
                                            type="email"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white md:text-slate-600 md:dark:text-slate-400">
                                            <Phone className="w-4 h-4 text-[#9AA4B2]" />
                                            Telefon raqami <span className="text-xs opacity-60 ml-1 text-[#9AA4B2]">(ixtiyoriy)</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="w-20 bg-[#212936] md:bg-slate-100 md:dark:bg-white/5 border border-[#313C50] md:border-slate-200 md:dark:border-white/10 rounded-[16px] px-4 py-3 text-white md:text-slate-500 md:dark:text-slate-100 text-center flex items-center justify-center font-medium shadow-sm">
                                                +998
                                            </div>
                                            <input
                                                value={(phoneNumber || '').replace('+998', '')}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                disabled={hasPhoneFromDB}
                                                className={`flex-1 w-full bg-[#212936] md:bg-slate-100 md:dark:bg-white/5 border border-[#313C50] md:border-slate-200 md:dark:border-white/10 rounded-[16px] px-5 py-3 text-white md:text-slate-500 placeholder:text-[#9AA4B2] md:placeholder:text-slate-400 md:dark:placeholder:text-slate-600 focus:ring-blue-500/20 transition-all shadow-sm ${hasPhoneFromDB ? 'cursor-not-allowed' : ''}`}
                                                placeholder="901234567"
                                                type="tel"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white md:text-slate-600 md:dark:text-slate-400">
                                            <Calendar className="w-4 h-4 text-[#9AA4B2]" />
                                            Tug'ilgan sana <span className="text-xs opacity-60 ml-1 text-[#9AA4B2]">(ixtiyoriy)</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                            <select
                                                value={dobDay}
                                                onChange={(e) => setDobDay(e.target.value)}
                                                className="bg-[#212936] md:bg-white md:dark:bg-white/5 border border-[#313C50] md:border-slate-200 md:dark:border-white/10 rounded-[16px] px-3 sm:px-4 py-3 text-white md:text-slate-900 md:dark:text-slate-100 focus:ring-blue-500/20 transition-all appearance-none shadow-sm text-sm sm:text-base text-center"
                                            >
                                                <option disabled value="">Kun</option>
                                                {days.map(d => <option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>)}
                                            </select>
                                            <select
                                                value={dobMonth}
                                                onChange={(e) => setDobMonth(e.target.value)}
                                                className="bg-[#212936] md:bg-white md:dark:bg-white/5 border border-[#313C50] md:border-slate-200 md:dark:border-white/10 rounded-[16px] px-3 sm:px-4 py-3 text-white md:text-slate-900 md:dark:text-slate-100 focus:ring-blue-500/20 transition-all appearance-none shadow-sm text-sm sm:text-base text-center"
                                            >
                                                <option disabled value="">Oy</option>
                                                {months.map((m, i) => {
                                                    const val = i + 1;
                                                    return <option key={m} value={val < 10 ? `0${val}` : val}>{m}</option>
                                                })}
                                            </select>
                                            <select
                                                value={dobYear}
                                                onChange={(e) => setDobYear(e.target.value)}
                                                className="bg-[#212936] md:bg-white md:dark:bg-white/5 border border-[#313C50] md:border-slate-200 md:dark:border-white/10 rounded-[16px] px-3 sm:px-4 py-3 text-white md:text-slate-900 md:dark:text-slate-100 focus:ring-blue-500/20 transition-all appearance-none shadow-sm text-sm sm:text-base text-center"
                                            >
                                                <option disabled value="">Yil</option>
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Location Section */}
                            <section className="space-y-4 pt-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <MapPin className="w-5 h-5" />
                                    <h4 className="font-semibold uppercase tracking-wider text-xs">Manzil</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white md:text-slate-600 md:dark:text-slate-400">
                                            <Map className="w-4 h-4 text-[#9AA4B2]" />
                                            Viloyat <span className="text-xs opacity-60 ml-1 text-[#9AA4B2]">(ixtiyoriy)</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={region}
                                                onChange={(e) => {
                                                    setRegion(e.target.value)
                                                    setDistrict('')
                                                }}
                                                className="w-full bg-[#212936] md:bg-white md:dark:bg-white/5 border border-[#313C50] md:border-slate-200 md:dark:border-white/10 rounded-[16px] px-5 py-3 text-white md:text-slate-900 md:dark:text-slate-100 focus:ring-blue-500/20 transition-all appearance-none shadow-sm"
                                            >
                                                <option value="">Viloyatni tanlang</option>
                                                {VILOYATLAR.map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9AA4B2] md:text-slate-400 w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white md:text-slate-600 md:dark:text-slate-400">
                                            <Building2 className="w-4 h-4 text-[#9AA4B2]" />
                                            Tuman <span className="text-xs opacity-60 ml-1 text-[#9AA4B2]">(ixtiyoriy)</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={district}
                                                onChange={(e) => setDistrict(e.target.value)}
                                                disabled={!region}
                                                className="w-full bg-[#212936] md:bg-white md:dark:bg-white/5 border border-[#313C50] md:border-slate-200 md:dark:border-white/10 rounded-[16px] px-5 py-3 text-white md:text-slate-900 md:dark:text-slate-100 focus:ring-blue-500/20 transition-all appearance-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="">Tumanni tanlang</option>
                                                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9AA4B2] md:text-slate-400 w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="flex justify-end pt-8 border-t border-[#313C50] md:border-slate-200 md:dark:border-white/5">
                                <button
                                    disabled={saving || uploading}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-[20px] shadow-lg shadow-blue-500/30 flex items-center gap-3 transition-all active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                                    type="submit"
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    )}
                                    Saqlash
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {/* CROP MODAL */}
            {isCropModalOpen && imageSrc && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#1e2029] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h3 className="text-white font-bold text-lg">Rasmni kesish</h3>
                            <button
                                onClick={() => {
                                    setIsCropModalOpen(false)
                                    setImageSrc(null)
                                }}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative w-full h-80 bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // Square aspect ratio 1:1
                                cropShape="round" // Show circular crop guide
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-4 text-white">
                                <span className="text-sm font-medium">Kattalashtirish</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => {
                                        setZoom(Number(e.target.value))
                                    }}
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="flex justify-end pt-2 border-t border-white/5">
                                <button
                                    onClick={handleUploadCroppedImage}
                                    disabled={uploading}
                                    className="bg-primary hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    Kesish va Saqlash
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Navigation */}
            <nav className="fixed bottom-0 left-0 w-full bg-[#212936]/90 md:bg-white/80 md:dark:bg-slate-900/80 backdrop-blur-lg border-t border-[#313C50] md:border-slate-200 md:dark:border-white/5 z-[60] flex items-center justify-around py-3 pb-safe md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
                <Link href="/dashboard" className="p-2 text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 hover:text-blue-500 md:hover:text-primary dark:hover:text-white transition-colors flex flex-col items-center gap-1">
                    <Home className="w-6 h-6" />
                </Link>
                <Link href="/biletlar" className="p-2 text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 hover:text-blue-500 md:hover:text-primary dark:hover:text-white transition-colors flex flex-col items-center gap-1">
                    <ClipboardCheck className="w-6 h-6" />
                </Link>
                <Link href="/savollar" className="p-2 text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 hover:text-blue-500 md:hover:text-primary dark:hover:text-white transition-colors flex flex-col items-center gap-1">
                    <Search className="w-6 h-6" />
                </Link>
                <Link href="/profil" className="p-2 text-blue-500 flex flex-col items-center gap-1 scale-110 pb-1 border-b-2 border-blue-500">
                    <Settings className="w-6 h-6" />
                </Link>
            </nav>
        </div>
    )
}
