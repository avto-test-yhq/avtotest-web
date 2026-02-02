'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.classList.toggle('light-mode')
  }

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 glass-dark border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar - Language Selector */}
        <div className="flex justify-end items-center h-10 border-b border-white/5">
          <div className="flex items-center space-x-1 text-xs font-bold text-slate-500 bg-night-800/50 px-3 py-1.5 rounded-full border border-white/5 language-switcher">
            <span className="text-brand-cyan">UZ</span>
            <span className="w-px h-3 bg-slate-700 mx-2 language-divider"></span>
            <span className="hover:text-white cursor-pointer transition-colors language-option">RU</span>
          </div>
        </div>
        
        {/* Main Navbar */}
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer group" data-aos="fade-down">
            <Image 
              src="/imgage/avtotest-logo.png" 
              alt="Logo" 
              width={40}
              height={40}
              className="mr-3 object-contain group-hover:scale-110 transition-transform duration-300"
            />
            <span className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight">
              Pravachi<span className="text-brand-cyan">UZ</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
              Qanday ishlaydi
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-cyan transition-all group-hover:w-full"></span>
            </a>
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
              Mentorlar
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-cyan transition-all group-hover:w-full"></span>
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
              Tariflar
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-cyan transition-all group-hover:w-full"></span>
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Dark/Light Toggle */}
            <button 
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-night-800/50 hover:bg-night-800 border border-white/5 text-slate-400 hover:text-white transition-all" 
              title="Tema o'zgartirish"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              )}
            </button>
            
            <Link href="/login" className="hidden sm:block text-sm font-bold text-white hover:text-brand-cyan transition-colors">
              Kirish
            </Link>
            <Link href="/login" className="bg-white text-night-950 px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-brand-cyan transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
              <span className="hidden sm:inline">Boshlash</span>
              <span className="sm:hidden">Start</span>
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full bg-night-800/50 hover:bg-night-800 border border-white/5 text-slate-400 hover:text-white transition-all"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-night-900/95 backdrop-blur-xl" id="mobile-menu">
          <div className="px-4 py-6 space-y-4">
            <a href="#how-it-works" className="block text-base font-medium text-slate-400 hover:text-white transition-colors py-2 border-b border-white/5">Qanday ishlaydi</a>
            <a href="#features" className="block text-base font-medium text-slate-400 hover:text-white transition-colors py-2 border-b border-white/5">Mentorlar</a>
            <a href="#pricing" className="block text-base font-medium text-slate-400 hover:text-white transition-colors py-2 border-b border-white/5">Tariflar</a>
            <Link href="/login" className="block text-base font-bold text-white hover:text-brand-cyan transition-colors py-2 sm:hidden">Kirish</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
