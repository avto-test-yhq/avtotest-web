'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const DEFAULT_SETTINGS = {
  questionCount: 10,
  showCorrect: true,
  showExplanation: true,
  autoNext: true,
  shuffleOptions: true,
  promoUnlocked: false,
}

const QUESTION_OPTIONS = [10, 20, 50, 100, 500]

export default function ExamSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [promoMessage, setPromoMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const raw = localStorage.getItem('examSettings')
      if (raw) {
        const parsed = JSON.parse(raw)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true)
    }
  }, [])

  const update = (patch) => setSettings((prev) => ({ ...prev, ...patch }))

  const handleSaveAndStart = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('examSettings', JSON.stringify(settings))
      }
    } catch {
      // ignore
    }
    const count = settings.questionCount || 10
    router.push(`/exam?mode=standard&count=${count}`)
  }

  const handleBack = () => {
    router.back()
  }

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    if (code === 'JAVA') {
      setSettings((prev) => ({ ...prev, promoUnlocked: true }))
      setPromoMessage("Promo kod faollashtirildi. Barcha biletlar ochiq.")
    } else {
      setPromoMessage("Promo kod noto'g'ri.")
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400 text-sm">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-semibold tracking-wide text-slate-600 dark:text-slate-300">
            Imtihon sozlamalari
          </h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-8">
        {/* Savollar soni */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-1">Savollar</p>
            <p className="text-sm font-medium text-slate-200 dark:text-slate-200">
              Biletdagi savollar soni
            </p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 border border-slate-700/70 px-1 py-1">
            {QUESTION_OPTIONS.map((n) => {
              const active = settings.questionCount === n
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => update({ questionCount: n })}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    active
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                >
                  {n}
                </button>
              )
            })}
          </div>
        </section>

        {/* Toggles */}
        <section className="space-y-4">
          <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest">Xatti-harakatlar</p>

          <ToggleRow
            label="To'g'ri javobni ko'rsatish"
            description="Noto'g'ri javob berganda to'g'ri javobni ko'rsatish"
            value={settings.showCorrect}
            onChange={(v) => update({ showCorrect: v })}
          />

          <ToggleRow
            label="Izohni ko'rsatish"
            description="Savolga izohni darhol ko'rish imkoniyati"
            value={settings.showExplanation}
            onChange={(v) => update({ showExplanation: v })}
          />

          <ToggleRow
            label="Avtomatik keyingisiga o'tish"
            description="Javob tanlagandan keyin avtomatik keyingi savolga o'tish"
            value={settings.autoNext}
            onChange={(v) => update({ autoNext: v })}
          />

          <ToggleRow
            label="Variantlarni aralashtirish"
            description="Har bir testda javob variantlari tartibini aralashtirish"
            value={settings.shuffleOptions}
            onChange={(v) => update({ shuffleOptions: v })}
          />
        </section>

        {/* Promo kod */}
        <section className="space-y-3">
          <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest">Promo kod</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Promo kodni kiriting"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-400"
            >
              Tasdiqlash
            </button>
          </div>
          {settings.promoUnlocked && (
            <p className="text-[11px] text-emerald-400">
              Promo aktiv: Barcha biletlar ochiq holatda.
            </p>
          )}
          {promoMessage && !settings.promoUnlocked && (
            <p className="text-[11px] text-rose-400">
              {promoMessage}
            </p>
          )}
        </section>

        <p className="text-[11px] text-slate-500 dark:text-slate-500">
          Real imtihon rejimida bu sozlamalar qo&apos;llanilmaydi. U yerda umumiy standartlar ishlaydi.
        </p>

      </main>

      {/* Boshlash button */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-800/70 bg-slate-950/90 backdrop-blur px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={handleSaveAndStart}
            className="w-full py-3 rounded-2xl bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/30 hover:bg-sky-400 transition-colors"
          >
            Boshlash
          </button>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-100">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-sky-500' : 'bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white transform transition-transform ${
            value ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

