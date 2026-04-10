'use client'

import Script from 'next/script'

export default function AosInit() {
    return (
        <Script
            src="https://unpkg.com/aos@2.3.1/dist/aos.js"
            strategy="afterInteractive"
            onLoad={() => {
                if (typeof window !== 'undefined' && window.AOS) {
                    window.AOS.init({ duration: 650, once: true, offset: 60, easing: 'ease-out-cubic' });
                }
            }}
        />
    )
}
