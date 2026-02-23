'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function ExamResult({
    questions = [],
    answers = {},
    stats = { correct: 0, incorrect: 0 },
    timeSpent = 0,
    mode = 'standard',
    onRetry,
    onNextTicket,
    title,
    subtitle,
    ticketNumber = null
}) {
    const t = useI18n();
    const [filter, setFilter] = useState('all'); // 'all' or 'incorrect'

    const displayTitle = title || t('exam.results');
    const displaySubtitle = subtitle || t('exam.drivingTest');

    // Calculation for progress circle
    const total = questions.length;
    const answeredCount = Object.keys(answers).length;
    const unanswered = Math.max(0, total - answeredCount);
    const percent = total > 0 ? Math.round((stats.correct / total) * 100) : 0;

    // Circle properties
    const strokeDasharray = 263.89; // 2 * PI * 42 = ~263.89
    const strokeDashoffset = strokeDasharray - (percent / 100) * strokeDasharray;

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const isHaqiqiy = mode === 'real';

    return (
        <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display relative z-50 animate-in fade-in zoom-in-95 duration-500 fill-mode-both">
            <header className="sticky top-0 z-50 bg-slate-50/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={mode === 'bilet' ? '/biletlar' : '/dashboard'} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center">
                            <span className="material-icons-round block">arrow_back</span>
                        </Link>
                        <h1 className="text-xl font-bold">{displayTitle}</h1>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <span className="text-sm font-medium opacity-70 uppercase tracking-wider">{displaySubtitle}</span>
                        {(ticketNumber || total > 0) && (
                            <>
                                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                <span className="text-sm font-semibold">{ticketNumber ? `№ ${ticketNumber}` : `${total} ${t('common.count') || 'TA'}`}</span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
                {/* Stats Sidebar */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-[#1e293b] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                        <div className="relative w-48 h-48 mb-6">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle className="text-slate-200 dark:text-slate-800 stroke-current" cx="50" cy="50" fill="transparent" r="42" strokeWidth="8" />
                                <circle
                                    className={`${percent >= 85 ? 'text-green-500' : 'text-primary'} stroke-current transition-all duration-1000 ease-out`}
                                    cx="50" cy="50" fill="transparent" r="42"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round" strokeWidth="8"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-extrabold">{percent}%</span>
                                <span className="text-slate-500 dark:text-slate-400 font-semibold mt-1">{stats.correct} / {total}</span>
                            </div>
                        </div>

                        <h2 className="text-lg font-bold mb-8">{t('stats.title') || 'Statistika'}</h2>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl flex flex-col items-center text-center">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-2">
                                    <span className="material-icons-round text-xl">check_circle</span>
                                </div>
                                <span className="text-2xl font-bold text-green-500">{stats.correct}</span>
                                <span className="text-xs text-slate-500 font-medium">{t('tarix.correct') || "To'g'ri"}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl flex flex-col items-center text-center">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
                                    <span className="material-icons-round text-xl">cancel</span>
                                </div>
                                <span className="text-2xl font-bold text-red-500">{stats.incorrect}</span>
                                <span className="text-xs text-slate-500 font-medium">{t('tarix.incorrect') || "Noto'g'ri"}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl flex flex-col items-center text-center">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-2">
                                    <span className="material-icons-round text-xl">help</span>
                                </div>
                                <span className="text-2xl font-bold">{unanswered}</span>
                                <span className="text-xs text-slate-500 font-medium">{t('tarix.skipped') || "Javobsiz"}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl flex flex-col items-center text-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center mb-2">
                                    <span className="material-icons-round text-xl">schedule</span>
                                </div>
                                <span className="text-2xl font-bold">{formatTime(timeSpent)}</span>
                                <span className="text-xs text-slate-500 font-medium">{t('tarix.time') || "Vaqt"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Answers List */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                    {isHaqiqiy ? (
                        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 text-center h-full flex flex-col items-center justify-center">
                            <span className="material-icons-round text-6xl text-slate-300 dark:text-slate-600 mb-4 block">visibility_off</span>
                            <h2 className="text-xl font-bold mb-2">Batafsil javoblar yashirilgan</h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                Siz "Haqiqiy imtihon" rejimida test topshirdingiz. Haqiqiy imtihonda test tugagach batafsil to'g'ri va noto'g'ri javoblar ko'rsatilmaydi, faqatgina umumiy natijangiz e'lon qilinadi.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">{t('tarix.viewAnswers') || "Javoblarni ko'rish"}</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`px-4 py-2 ${filter === 'all' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} text-sm font-semibold rounded-full transition-colors`}
                                    >
                                        {(t('tarix.filterAllCount') || 'Barchasi')} ({total})
                                    </button>
                                    <button
                                        onClick={() => setFilter('incorrect')}
                                        className={`px-4 py-2 ${filter === 'incorrect' ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} text-sm font-semibold rounded-full transition-colors`}
                                    >
                                        {(t('tarix.filterIncorrect') || 'Xato')} ({stats.incorrect})
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {questions.map((q, qIndex) => {
                                    const userAnswerIdx = answers[q.id];
                                    const isCorrect = userAnswerIdx !== undefined && q.options[userAnswerIdx]?.is_correct;
                                    const isUnanswered = userAnswerIdx === undefined;

                                    if (filter === 'incorrect' && (isCorrect || isUnanswered)) return null;

                                    return (
                                        <div key={q.id} className={`bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border-l-4 ${isCorrect ? 'border-l-green-500' : isUnanswered ? 'border-l-slate-400' : 'border-l-red-500'} border-y border-r border-slate-200 dark:border-slate-800 overflow-hidden`}>
                                            <div className="p-4 sm:p-6">
                                                <div className="flex items-start justify-between mb-4 sm:mb-6">
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <div className={`w-10 h-10 shrink-0 rounded-full ${isCorrect ? 'bg-green-500/10 text-green-500' : isUnanswered ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : 'bg-red-500/10 text-red-500'} flex items-center justify-center font-bold`}>
                                                            {qIndex + 1}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold">{t('exam.question') || 'Savol'} #{q.numeric_id || q.id}</h3>
                                                            <p className={`text-sm font-medium flex items-center gap-1 ${isCorrect ? 'text-green-500' : isUnanswered ? 'text-slate-500' : 'text-red-500'}`}>
                                                                <span className="material-icons-round text-base">{isCorrect ? 'check' : isUnanswered ? 'help' : 'close'}</span>
                                                                {isCorrect ? (t('tarix.correct') || "To'g'ri") : isUnanswered ? (t('tarix.skipped') || "Javobsiz") : (t('tarix.incorrect') || "Noto'g'ri")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 sm:space-y-6">
                                                    {q.image && (
                                                        <div className="bg-slate-50 dark:bg-slate-900 p-2 sm:p-4 rounded-xl flex justify-center border border-slate-100 dark:border-slate-800">
                                                            <img alt={`Savol rasm ${q.numeric_id}`} className="max-h-48 object-contain rounded" src={q.image} />
                                                        </div>
                                                    )}

                                                    <p className="text-base sm:text-lg font-semibold leading-relaxed">
                                                        {q.question}
                                                    </p>

                                                    <div className="space-y-2 sm:space-y-3">
                                                        {q.options.map((opt, oIndex) => {
                                                            const isThisSelected = userAnswerIdx === oIndex;
                                                            const isThisCorrect = opt.is_correct;

                                                            let optClass = "p-3 sm:p-4 rounded-xl border flex items-center justify-between ";
                                                            if (isThisCorrect) {
                                                                optClass += "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 font-bold";
                                                            } else if (isThisSelected && !isThisCorrect) {
                                                                optClass += "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 font-bold";
                                                            } else {
                                                                optClass += "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium";
                                                            }

                                                            return (
                                                                <div key={oIndex} className={optClass}>
                                                                    <span className="flex items-center gap-3">
                                                                        <span className={`w-8 h-8 shrink-0 rounded-full text-xs flex items-center justify-center font-bold ${isThisCorrect ? 'bg-green-500 text-white' :
                                                                            (isThisSelected && !isThisCorrect) ? 'bg-red-500 text-white' :
                                                                                'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                                            }`}>
                                                                            F{oIndex + 1}
                                                                        </span>
                                                                        <span className="text-sm sm:text-base">{opt.option}</span>
                                                                    </span>
                                                                    {isThisCorrect && <span className="material-icons-round shrink-0 text-green-500">check_circle</span>}
                                                                    {(isThisSelected && !isThisCorrect) && <span className="material-icons-round shrink-0 text-red-500">cancel</span>}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {filter === 'incorrect' && stats.incorrect === 0 && (
                                    <div className="p-8 text-center text-slate-500">
                                        Sizda hato javoblar yo'q! 🎉
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-slate-50/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 z-50">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:flex md:flex-row gap-3 sm:gap-4">
                    <Link
                        href="/dashboard"
                        className="flex-1 h-12 sm:h-14 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all text-slate-800 dark:text-white"
                    >
                        <span className="material-icons-round">home</span>
                        <span className="text-sm sm:text-base">{t('nav.dashboard') || 'Dashboard'}</span>
                    </Link>
                    <button
                        onClick={onRetry}
                        className="flex-1 h-12 sm:h-14 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all text-slate-800 dark:text-white"
                    >
                        <span className="material-icons-round">refresh</span>
                        <span className="text-sm sm:text-base">{t('exam.retryWork') || 'Qaytadan'}</span>
                    </button>
                    {mode === 'bilet' && (
                        <Link
                            href="/biletlar"
                            className={`flex-1 h-12 sm:h-14 ${onNextTicket ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white' : 'bg-primary hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg shadow-primary/20'} rounded-2xl font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all`}
                        >
                            <span className="material-icons-round">view_module</span>
                            <span className="text-sm sm:text-base">{t('nav.tickets') || 'Biletlar'}</span>
                        </Link>
                    )}
                    {onNextTicket && (
                        <button
                            onClick={onNextTicket}
                            className={`flex-1 h-12 sm:h-14 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-primary/20 transition-all ${mode !== 'bilet' ? 'col-span-2 md:col-span-1' : ''}`}
                        >
                            <span className="text-sm sm:text-base">{t('exam.next') || 'Keyingisi'}</span>
                            <span className="material-icons-round">arrow_forward</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
